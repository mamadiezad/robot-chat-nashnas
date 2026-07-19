import mongoose, { Schema } from 'mongoose';
import { ITransaction } from '../../types';

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Number, required: true, index: true },
  type: { type: String, enum: ['earn', 'spend', 'purchase', 'bonus', 'referral', 'admin'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true },
  description: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

TransactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
