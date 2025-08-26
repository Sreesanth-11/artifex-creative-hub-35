import mongoose, { Schema } from "mongoose";
import { IMessage } from "../types";

const MessageSchema = new Schema<IMessage>(
  {
    sender: {
      type: String,
      ref: "User",
      required: true,
    },
    receiver: {
      type: String,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: [true, "Message content is required"],
      trim: true,
      maxlength: [2000, "Message cannot be more than 2000 characters"],
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    conversationId: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient queries
MessageSchema.index({ conversationId: 1, createdAt: -1 });
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, isRead: 1 });

// Method to mark as read
MessageSchema.methods.markAsRead = function () {
  this.isRead = true;
  return this.save();
};

// Static method to generate conversation ID
MessageSchema.statics.generateConversationId = function (
  userId1: string,
  userId2: string
) {
  // Sort IDs to ensure consistent conversation ID regardless of order
  const sortedIds = [userId1, userId2].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Static method to mark all messages as read in a conversation
MessageSchema.statics.markConversationAsRead = function (
  conversationId: string,
  userId: string
) {
  return this.updateMany(
    {
      conversationId,
      receiver: userId,
      isRead: false,
    },
    { isRead: true }
  );
};

export default mongoose.model<IMessage>("Message", MessageSchema);
