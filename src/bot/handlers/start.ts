import { Context } from 'grammy';
import { UserService } from '../../database/services/userService';
import { mainKeyboard, adminKeyboard } from '../utils/keyboards';
import { t } from '../utils/i18n';
import { config } from '../../config';

export async function startHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const username = ctx.from?.username;
  const firstName = ctx.from?.first_name;
  const lastName = ctx.from?.last_name;

  // Check for referral
  const text = ctx.message?.text || '';
  const referralMatch = text.match(/ref_(\w+)/);
  if (referralMatch) {
    await UserService.handleReferral(telegramId, referralMatch[1]);
  }

  const user = await UserService.findOrCreate(telegramId, username, firstName, lastName);

  await ctx.reply(t.welcome, {
    parse_mode: 'HTML',
    reply_markup: config.admins.includes(telegramId)
      ? adminKeyboard()
      : mainKeyboard(),
  });

  // Check required channels
  if (config.channels.required.length > 0) {
    // Will implement channel check middleware
  }
}
