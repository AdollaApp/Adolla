import { NotFoundError } from '@/utils/error';
import { DONT_REPLY, handle } from '@/utils/handle';
import { verifyProxySignature } from '@/utils/proxy';
import { makeRouter } from '@/utils/router';
import { z } from 'zod';

export const proxyRouter = makeRouter((app) => {
  app.get(
    '/api/v1/proxy/image',
    {
      schema: {
        description: 'Proxy an image',
        querystring: z.object({
          url: z.string().min(3),
          sig: z.string().min(3),
        }),
      },
    },
    handle(async ({ query, res }) => {
      const isCorrectSig = verifyProxySignature(query.url, query.sig);
      if (!isCorrectSig) throw new NotFoundError();
      const proxiedRequest = await fetch(query.url, {
        method: 'GET',
      });
      const body = proxiedRequest.body;
      if (!body) throw new Error('No body on proxied request');
      res.header('Content-Type', proxiedRequest.headers.get('Content-Type') ?? 'application/octet-stream');
      res.send(body);
      return DONT_REPLY;
    }),
  );
});
