import mongoose, { Schema } from 'mongoose';
import { ICampaign } from '../../types';

const CampaignSchema = new Schema<ICampaign>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  targetGender: { type: String, enum: ['male', 'female', undefined] },
  targetMinAge: { type: Number },
  targetMaxAge: { type: Number },
  targetProvince: { type: String },
  targetMinCoins: { type: Number },
  targetMaxCoins: { type: Number },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  isActive: { type: Boolean, default: true },
  sentCount: { type: Number, default: 0 },
  viewedCount: { type: Number, default: 0 },
  enteredCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

export const Campaign = mongoose.model<ICampaign>('Campaign', CampaignSchema);
