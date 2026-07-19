import { Context } from 'grammy';
import { UserService } from '../../database/services/userService';
import { ChatService } from '../../database/services/chatService';
import { User } from '../../database/models/User';
import { Chat } from '../../database/models/Chat';
import { chatKeyboard, endChatKeyboard, reportReasonKeyboard } from '../utils/keyboards';
import { t } from '../utils/i18n';
import { config } from '../../config';

export async function startChatHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const user = await UserService.getById(telegramId);
  if (!user) return;

  if (!user.profile.isComplete) {
    await ctx.reply(t.profileIncomplete, { parse_mode: 'HTML' });
    return;
  }

  await User.updateOne({ telegramId }, { chatStatus: 'waiting', isOnline: true });
  await ctx.reply(t.findingPartner, { parse_mode: 'HTML' });

  const partner = await UserService.searchForPartner(telegramId);

  if (partner) {
    const chat = await ChatService.createChat(telegramId, partner.telegramId);

    await ctx.reply(
      t.partnerFound(
        partner.profile.name || 'ناشناس',
        partner.profile.age || 0,
        partner.profile.province || 'ایران'
      ),
      { reply_markup: chatKeyboard(), parse_mode: 'HTML' }
    );

    try {
      await ctx.api.sendMessage(
        partner.telegramId,
        t.partnerFound(
          user.profile.name || 'ناشناس',
          user.profile.age || 0,
          user.profile.province || 'ایران'
        ),
        { reply_markup: chatKeyboard(), parse_mode: 'HTML' } as any
      );
    } catch {
      await ChatService.endChat(chat._id.toString(), telegramId);
      await ctx.reply('❌ هم‌صحبت شما ربات را مسدود کرده است.');
    }
  } else {
    setTimeout(async () => {
      const stillWaiting = await User.findOne({ telegramId, chatStatus: 'waiting' });
      if (stillWaiting) {
        await User.updateOne({ telegramId }, { chatStatus: 'idle' });
        try { await ctx.reply(t.noChatPartner, { parse_mode: 'HTML' }); } catch {}
      }
    }, config.limits.waitingTimeout);
  }
}

export async function endChatHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const chat = await ChatService.getActiveChat(telegramId);
  if (!chat) { await ctx.reply('شما در حال حاضر چت فعالی ندارید.'); return; }
  await ctx.reply('آیا مطمئن هستید؟', { reply_markup: endChatKeyboard() });
}

export async function confirmEndChat(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const chat = await ChatService.getActiveChat(telegramId);
  if (!chat) return;

  const partnerId = chat.users.find(u => u !== telegramId);
  await ChatService.endChat(chat._id.toString(), telegramId);
  await ctx.reply(t.chatEnded, { parse_mode: 'HTML' });

  if (partnerId) {
    try {
      await ctx.api.sendMessage(partnerId, t.partnerDisconnected, { parse_mode: 'HTML' } as any);
      await User.updateOne({ telegramId: partnerId }, { chatStatus: 'idle', currentPartner: null });
    } catch {}
  }
}

export async function nextChatHandler(ctx: Context) {
  await confirmEndChat(ctx);
  setTimeout(() => startChatHandler(ctx), 500);
}

export async function likeUserHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const chat = await ChatService.getActiveChat(telegramId);
  if (!chat) { await ctx.reply('چت فعالی وجود ندارد.'); return; }
  await ChatService.likeUser(chat._id.toString(), telegramId);
  await ctx.answerCallbackQuery?.({ text: '❤️ لایک شد!' });
}

export async function reportUserHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const chat = await ChatService.getActiveChat(telegramId);
  if (!chat) { await ctx.reply('چت فعالی وجود ندارد.'); return; }
  await ctx.reply(t.reportReason, { reply_markup: reportReasonKeyboard(chat._id.toString()), parse_mode: 'HTML' });
}

export async function blockUserHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const chat = await ChatService.getActiveChat(telegramId);
  if (!chat) { await ctx.reply('چت فعالی وجود ندارد.'); return; }
  const partnerId = chat.users.find(u => u !== telegramId);
  if (partnerId) {
    await User.updateOne({ telegramId }, { $addToSet: { blockedUsers: partnerId } });
    await ctx.reply(t.blocked, { parse_mode: 'HTML' });
    await confirmEndChat(ctx);
  }
}

export async function chatMessageHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const chat = await ChatService.getActiveChat(telegramId);
  if (!chat) return;
  const partnerId = chat.users.find(u => u !== telegramId);
  if (!partnerId) return;
  const text = ctx.message?.text;
  if (!text) return;

  try {
    await ctx.api.sendMessage(partnerId, text, { parse_mode: 'HTML' } as any);
    await Chat.updateOne({ _id: chat._id }, { $inc: { messagesCount: 1 } });
  } catch {
    await ctx.reply('❌ هم‌صحبت شما قادر به دریافت پیام نیست.');
    await ChatService.endChat(chat._id.toString(), telegramId);
  }
}
