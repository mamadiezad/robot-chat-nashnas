import mongoose, { Schema, Document } from 'mongoose';
import { IChat } from '../../types';

const ChatSchema = new Schema<IChat>({
  users: [{ type: Number, required: true }],
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  isActive: { type: Boolean, default: true },
  endedBy: { type: Number },
  messagesCount: { type: Number, default: 0 },
  likes: [{ type: Number }],
});

ChatSchema.index({ users: 1 });
ChatSchema.index({ isActive: 1 });
ChatSchema.index({ startedAt: -1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
