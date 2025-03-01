import { Command, program } from 'commander';
import { version } from './config';
import { logDivide, logger, logIntro } from './modules/log';
import execSh from 'exec-sh';
import { cancel, confirm, isCancel, log, spinner, text } from '@clack/prompts';
import { db } from './modules/db';
import { users } from './modules/db/schema';
import { eq } from 'drizzle-orm';
import { roles } from './utils/auth/roles';

const initCmd = new Command('init')
  .description('Initialize Adolla')
  .action(async () => {
    logIntro(true);
    logger.info('Initialising database...');
    await execSh.promise('node node_modules/drizzle-kit/bin.cjs migrate');
    console.log('');
    logDivide();
    logger.info('Initialisation complete!');
  });

const promoteCmd = new Command('promote')
  .description('Promote a user to Super')
  .action(async () => {
    logIntro(true);
    const username = await text({
      message: 'What user do you want to promote to Super?',
      placeholder: 'my-cool-username',
    });
    if (isCancel(username)) {
      cancel('Operation cancelled.');
      process.exit(1);
    }

    const [user] = await db.select().from(users).where(eq(users.username, username));
    if (!user) {
      log.error('Could not find user with that username!');
      process.exit(1);
    }

    const shouldContinue = await confirm({
      message: `You are about to promote '${username}' to Super. Want to proceed?`,
      initialValue: false,
    });
    if (isCancel(shouldContinue)) {
      cancel('Operation cancelled.');
      process.exit(1);
    }

    const s = spinner();
    s.start('Promoting user');
    await db.update(users).set({
      roles: [...(user.roles ?? []), roles.super],
    });
    s.stop('Promoted user!');

    log.success('User has successfully been promoted!');
    process.exit(0);
  });

const migrateCmd = new Command('migrate')
  .description('Run pending database migrations')
  .action(async () => {
    logIntro(true);
    logger.info('Running migrations...');
    await execSh.promise('node node_modules/drizzle-kit/bin.cjs migrate');
    console.log('');
    logDivide();
    logger.info('Migrations completed!');
  });

export function createProgram(run: () => Promise<void>) {
  return program
    .name('adolla')
    .description('CLI to run or manage the Adolla server')
    .version(version)
    .action(run)
    .addCommand(initCmd)
    .addCommand(promoteCmd)
    .addCommand(migrateCmd);
}
