import mongoose, { Schema } from "mongoose";
import { IDownload } from "../types";

const DownloadSchema = new Schema<IDownload>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false, // Make it optional for now to fix existing issues
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: false, // Make it optional for now to fix existing issues
    },
    userAgent: {
      type: String,
      required: false, // Make it optional for now to fix existing issues
    },
  },
  {
    timestamps: false, // We're using downloadedAt instead
  }
);

// Index for efficient queries
DownloadSchema.index({ user: 1, downloadedAt: -1 });
DownloadSchema.index({ product: 1, downloadedAt: -1 });
DownloadSchema.index({ order: 1 });

export default mongoose.model<IDownload>("Download", DownloadSchema);
