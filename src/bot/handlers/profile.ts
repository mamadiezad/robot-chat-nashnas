import { Context } from 'grammy';
import { UserService } from '../../database/services/userService';
import { profileKeyboard, genderKeyboard } from '../utils/keyboards';
import { t } from '../utils/i18n';

export async function profileHandler(ctx: Context) {
  const telegramId = ctx.from?.id!;
  const user = await UserService.getById(telegramId);
  if (!user) return;

  await ctx.reply(
    t.profileInfo(
      user.profile.name,
      user.profile.gender,
      user.profile.age,
      user.profile.province,
      user.profile.city,
      user.coins
    ),
    { reply_markup: profileKeyboard(), parse_mode: 'HTML' }
  );
}

export async function editProfileHandler(ctx: Context) {
  await ctx.reply(t.enterName, { parse_mode: 'HTML' });
  // Set session state to await name input
  (ctx.session as any).awaitingProfileInput = 'name';
}

// These will be triggered by callback queries and text responses
export const profileStates = {
  async handleNameInput(ctx: Context) {
    const name = ctx.message?.text;
    if (!name || name.length > 50) {
      await ctx.reply('⚠️ لطفاً یک نام معتبر (حداکثر ۵۰ حرف) وارد کنید:');
      return;
    }
    const telegramId = ctx.from?.id!;
    await UserService.updateProfile(telegramId, { name } as any);
    (ctx.session as any).awaitingProfileInput = 'gender';
    await ctx.reply(t.enterGender, { reply_markup: genderKeyboard() });
  },

  async handleGenderSelection(ctx: Context, gender: 'male' | 'female') {
    const telegramId = ctx.from?.id!;
    await UserService.updateProfile(telegramId, { gender } as any);
    (ctx.session as any).awaitingProfileInput = 'age';
    await ctx.reply(t.enterAge);
  },

  async handleAgeInput(ctx: Context) {
    const ageText = ctx.message?.text;
    const age = parseInt(ageText || '');
    if (isNaN(age) || age < 10 || age > 100) {
      await ctx.reply('⚠️ لطفاً یک سن معتبر بین ۱۰ تا ۱۰۰ وارد کنید:');
      return;
    }
    const telegramId = ctx.from?.id!;
    await UserService.updateProfile(telegramId, { age } as any);
    (ctx.session as any).awaitingProfileInput = 'province';
    await ctx.reply(t.enterProvince);
  },

  async handleProvinceInput(ctx: Context) {
    const province = ctx.message?.text;
    if (!province || province.length > 50) {
      await ctx.reply('⚠️ لطفاً نام استان را وارد کنید:');
      return;
    }
    const telegramId = ctx.from?.id!;
    await UserService.updateProfile(telegramId, { province } as any);
    (ctx.session as any).awaitingProfileInput = 'city';
    await ctx.reply(t.enterCity);
  },

  async handleCityInput(ctx: Context) {
    const city = ctx.message?.text;
    if (!city || city.length > 50) {
      await ctx.reply('⚠️ لطفاً نام شهر را وارد کنید:');
      return;
    }
    const telegramId = ctx.from?.id!;
    await UserService.updateProfile(telegramId, { city } as any);
    (ctx.session as any).awaitingProfileInput = null;
    await ctx.reply('✅ پروفایل شما با موفقیت تکمیل شد! +۳۰ سکه جایزه گرفتید.', {
      reply_markup: { remove_keyboard: true },
      parse_mode: 'HTML',
    });
    await profileHandler(ctx);
  },
};
