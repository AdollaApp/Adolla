import { conf } from '@/config';
import { pino } from 'pino';
import pretty from 'pino-pretty';

const prettyStream =
  conf.logging.format === 'pretty'
    ? pretty({
        colorize: true,
        translateTime: true,
        ignore: 'pid,hostname,reqId,responseTime,req,res,svc,type',
        messageFormat: '{msg}{if req} [{req.method} {req.url}]{end}',
      })
    : undefined;

const loggerInstance = pino(
  {
    level: conf.logging.debug ? 'debug' : 'info',
  },
  prettyStream,
);

export const logger = loggerInstance;
