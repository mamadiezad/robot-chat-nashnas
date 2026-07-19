import mongoose, { Schema } from 'mongoose';
import { IAdminLog } from '../../types';

const AdminLogSchema = new Schema<IAdminLog>({
  adminId: { type: Number, required: true },
  action: { type: String, required: true },
  targetId: { type: Number },
  details: { type: String },
  createdAt: { type: Date, default: Date.now },
});

AdminLogSchema.index({ createdAt: -1 });

export const AdminLog = mongoose.model<IAdminLog>('AdminLog', AdminLogSchema);
