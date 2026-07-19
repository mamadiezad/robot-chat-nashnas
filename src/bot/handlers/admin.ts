import { Context } from 'grammy';
import { UserService } from '../../database/services/userService';
import { ChatService } from '../../database/services/chatService';
import { Report } from '../../database/models/Report';
import { Transaction } from '../../database/models/Transaction';
import { AdminLog } from '../../database/models/AdminLog';
import { User } from '../../database/models/User';
import { Campaign } from '../../database/models/Campaign';
import { adminKeyboard } from '../utils/keyboards';
import { t } from '../utils/i18n';
import { config } from '../../config';

export async function adminStatsHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;

  const userStats = await UserService.getStats();
  const chatStats = await ChatService.getChatStats();

  const msg =
    `${t.statsText(userStats)}\n\n` +
    `💬 آمار چت‌ها:\n` +
    `  • کل چت‌ها: ${chatStats.total}\n` +
    `  • فعال: ${chatStats.active}\n` +
    `  • امروز: ${chatStats.today}\n` +
    `  • میانگین مدت: ${chatStats.avgDuration} دقیقه`;

  await ctx.reply(msg, { parse_mode: 'HTML' });
}

export async function adminBroadcastHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;
  (ctx.session as any).awaitingBroadcastMessage = true;
  await ctx.reply('📣 لطفاً پیام خود را ارسال کنید:\n\n⚠️ این پیام برای همه کاربران ارسال خواهد شد.');
}

export async function sendBroadcast(ctx: Context, messageText: string) {
  const telegramId = ctx.from?.id!;
  const users = await User.find({ status: 'active', isOnline: true });
  let sent = 0;

  for (const user of users) {
    try {
      await ctx.api.sendMessage(user.telegramId, messageText, { parse_mode: 'HTML' } as any);
      sent++;
    } catch {}
  }

  await ctx.reply(`✅ پیام به ${sent} کاربر ارسال شد.`);
  await AdminLog.create({ adminId: telegramId, action: 'broadcast', details: `Sent to ${sent} users` });
}

export async function adminTargetedBroadcastHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;
  (ctx.session as any).awaitingTargetedBroadcast = true;
  await ctx.reply(
    '🎯 ارسال هدفمند\n\n' +
    'لطفاً فیلترها را به این فرمت وارد کنید:\n' +
    '`gender=male, minAge=18, maxAge=25, province=تهران`\n\n' +
    'بعد از آن پیام را ارسال کنید.'
  );
}

export async function adminManageCoinsHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;
  (ctx.session as any).awaitingCoinManagement = true;
  await ctx.reply('💰 مدیریت سکه\n\nفرمت: `userId amount reason`\nمثال: `123456789 50 برای فعالیت خوب`');
}

export async function adminReportsHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;

  const reports = await Report.find({ resolved: false }).sort({ createdAt: -1 }).limit(10);

  if (reports.length === 0) {
    await ctx.reply('✅ هیچ گزارش جدیدی وجود ندارد.');
    return;
  }

  let msg = '🚨 گزارشات جدید:\n\n';
  for (const r of reports) {
    msg += `🆔 گزارش: ${r._id.toString().slice(-6)}\n`;
    msg += `📝 گزارش‌دهنده: ${r.reporterId}\n`;
    msg += `👤 متخلف: ${r.reportedId}\n`;
    msg += `🔴 دلیل: ${r.reason}\n`;
    msg += `📅 ${r.createdAt.toLocaleDateString('fa-IR')}\n\n`;
  }

  await ctx.reply(msg + 'برای مدیریت از دستورات زیر استفاده کنید:\n/ban userId\n/unban userId\n/resolve reportId');
}

export async function adminCampaignHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;

  const campaigns = await Campaign.find().sort({ createdAt: -1 }).limit(5);

  let msg = '📢 کمپین‌ها:\n\n';
  if (campaigns.length === 0) {
    msg += 'هنوز کمپینی ساخته نشده.\n';
  } else {
    for (const c of campaigns) {
      msg += `• ${c.title} — ${c.isActive ? '✅ فعال' : '❌ غیرفعال'}\n`;
      msg += `  ارسال: ${c.sentCount} | بازدید: ${c.viewedCount} | ورود: ${c.enteredCount}\n\n`;
    }
  }

  msg += 'برای ساخت کمپین جدید:\n/campaign_new title | message | gender | minAge-maxAge | province';

  await ctx.reply(msg);
}

export async function adminSettingsHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  if (!config.admins.includes(telegramId)) return;

  await ctx.reply(
    '⚙️ تنظیمات ربات\n\n' +
    '۱. تعیین قیمت سکه\n' +
    '۲. کانال‌های اجباری\n' +
    '۳. متن‌های ربات\n' +
    '۴. روشن/خاموش کردن بخش‌ها\n\n' +
    'برای تغییر:\n' +
    '/set_coin_price مقدار\n' +
    '/add_required_channel @channel\n' +
    '/remove_required_channel @channel\n' +
    '/toggle_section section_name\n' +
    'بخش‌ها: radar, advanced_search, daily_bonus, referral'
  );
}
