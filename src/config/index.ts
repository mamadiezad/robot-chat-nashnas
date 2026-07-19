import dotenv from 'dotenv';
dotenv.config();

export const config = {
  bot: {
    token: process.env.BOT_TOKEN!,
    username: process.env.BOT_USERNAME || 'AnonymousBot',
  },

  admins: (process.env.ADMINS || '').split(',').map(Number).filter(Boolean),

  database: {
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/anonymous-chat',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  },

  coins: {
    default: Number(process.env.COIN_DEFAULT) || 50,
    referralBonus: Number(process.env.COIN_REFERRAL_BONUS) || 20,
    profileCompleteBonus: Number(process.env.COIN_PROFILE_COMPLETE_BONUS) || 30,
    advancedSearchCost: Number(process.env.COIN_ADVANCED_SEARCH_COST) || 10,
    radarCost: Number(process.env.COIN_RADAR_COST) || 15,
    dailyBonus: Number(process.env.COIN_DAILY_BONUS) || 5,
  },

  channels: {
    required: (process.env.REQUIRED_CHANNELS || '').split(',').filter(Boolean),
    tempPromoChannel: undefined as { channel: string; until: Date } | undefined,
  },

  limits: {
    reportThreshold: 5, // Auto-ban after 5 reports
    waitingTimeout: 120000, // 2 minutes in queue
    messageRateLimit: 20, // messages per minute
  },
};
