import { User } from '../models/User';
import { Transaction } from '../models/Transaction';

export class WalletService {
  static coinPackages = [
    { id: 'bronze', name: 'برنز', coins: 100, price: '۱۰,۰۰۰ تومان' },
    { id: 'silver', name: 'نقره‌ای', coins: 300, price: '۲۵,۰۰۰ تومان' },
    { id: 'gold', name: 'طلایی', coins: 700, price: '۵۰,۰۰۰ تومان' },
    { id: 'platinum', name: 'پلاتینیوم', coins: 1500, price: '۹۰,۰۰۰ تومان' },
    { id: 'vip', name: 'VIP ماهانه', coins: 5000, price: '۲۵۰,۰۰۰ تومان', isVip: true },
  ];

  static async purchaseCoins(userId: number, packageId: string): Promise<boolean> {
    const pkg = this.coinPackages.find(p => p.id === packageId);
    if (!pkg) return false;

    const user = await User.findOne({ telegramId: userId });
    if (!user) return false;

    user.coins += pkg.coins;
    user.totalCoinsEarned += pkg.coins;

    if (pkg.isVip) {
      user.isVip = true;
      user.vipExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }

    await user.save();

    await Transaction.create({
      userId,
      type: 'purchase',
      amount: pkg.coins,
      balance: user.coins,
      description: `خرید بسته ${pkg.name}`,
    });

    return true;
  }

  static async getTransactionHistory(userId: number, limit = 10): Promise<any[]> {
    return Transaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }
}
