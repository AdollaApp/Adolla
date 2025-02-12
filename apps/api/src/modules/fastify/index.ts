import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { ZodError } from 'zod';
import { fastifySwagger } from '@fastify/swagger';
import { conf, version } from '@/config';
import { isApiError } from '@/utils/error';
import { logger } from '../log';
import { setupRoutes } from './routes';

const log = logger.child({ svc: 'fastify' });

export async function setupFastify(): Promise<FastifyInstance> {
  log.info(`setting up fastify...`);

  const app = Fastify({
    loggerInstance: log.child({ type: 'req' }) as any,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(fastifySwagger, {
    openapi: {
      info: {
        title: 'Locali',
        description: 'API server of locali',
        version,
      },
      servers: [
        {
          url: 'http://localhost:' + conf.server.port,
          description: 'Development server',
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ZodError) {
      void reply.status(400).send({
        errorType: 'validation',
        errors: err.errors,
      });
      return;
    }

    if (isApiError(err)) {
      if (err.errorCode) {
        void reply.status(err.errorStatusCode).send({
          errorType: 'code',
          code: err.errorCode,
        });
      } else {
        void reply.status(err.errorStatusCode).send({
          errorType: 'message',
          message: err.message,
        });
      }
      return;
    }

    log.error('unhandled exception on server:', err);
    log.error(err.stack);
    void reply.status(500).send({
      errorType: 'message',
      message: 'Internal server error',
      ...(conf.logging.debug
        ? {
            trace: err.stack,

            errorMessage: err.toString(),
          }
        : {}),
    });
  });

  // plugins
  log.info(`setting up plugins`);
  const corsDomains = conf.server.cors.split(' ').filter(v => v.length > 0);
  await app.register(cors, {
    origin: corsDomains,
    credentials: true,
  });

  return app;
}

export function startFastify(app: FastifyInstance) {
  // listen to port
  log.info(`listening to port`);
  return new Promise<void>((resolve) => {
    app.listen(
      {
        port: conf.server.port,
        host: '0.0.0.0',
      },
      (err: any) => {
        if (err) {
          app.log.error(err);
          log.error(`Failed to setup fastify`);
          process.exit(1);
        }
        log.info(`fastify setup successfully`);
        resolve();
      },
    );
  });
}

export async function setupFastifyRoutes(app: FastifyInstance) {
  log.info(`setting up routes`);
  await app.register(
    async (api) => {
      await setupRoutes(api);
      app.route({
        url: '/swagger',
        method: 'GET',
        handler: (req, res) => {
          return res.send(app.swagger());
        },
      });
    },
    {
      prefix: conf.server.basePath,
    },
  );
}
