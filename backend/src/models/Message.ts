import mongoose, { Schema } from "mongoose";

// Simplified Message interface
interface ISimpleMessage extends mongoose.Document {
  sender: mongoose.Types.ObjectId;
  receiver: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simplified Message Schema - following reference project approach
const MessageSchema = new Schema<ISimpleMessage>(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Simple indexes for basic queries
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ receiver: 1, createdAt: -1 });

// Export simplified model
export default mongoose.model<ISimpleMessage>("Message", MessageSchema);
