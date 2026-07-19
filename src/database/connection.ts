import mongoose from 'mongoose';
import { config } from '../config';
import chalk from 'chalk';

export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.database.mongodbUri);
    console.log(chalk.green('✅ MongoDB connected successfully'));

    mongoose.connection.on('error', (err) => {
      console.error(chalk.red('❌ MongoDB error:'), err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(chalk.yellow('⚠️ MongoDB disconnected'));
    });
  } catch (error) {
    console.error(chalk.red('❌ Failed to connect to MongoDB:'), error);
    process.exit(1);
  }
}
