import { conf } from '@/config';
import { pino } from 'pino';
import pretty from 'pino-pretty';
import figlet from 'figlet';

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

export function logIntro(withDivide = false) {
  if (conf.logging.format === 'pretty')
    console.log(figlet.textSync('Adolla', { font: 'Small' }));
  if (withDivide)
    logDivide();
}

export function logDivide() {
  if (conf.logging.format === 'pretty')
    loggerInstance.info(`--------------------------------------`);
}

export const logger = loggerInstance;
