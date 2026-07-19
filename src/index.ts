import dotenv from 'dotenv';
dotenv.config();

import { startBot } from './bot/bot';
import chalk from 'chalk';

console.log(chalk.cyan(`
╔═══════════════════════════════════════════╗
║     🤖 Persian Anonymous Chat Bot        ║
║        چت ناشناس فارسی تلگرام              ║
╚═══════════════════════════════════════════╝
`));

startBot().catch((err) => {
  console.error(chalk.red('❌ Failed to start bot:'), err);
  process.exit(1);
});
