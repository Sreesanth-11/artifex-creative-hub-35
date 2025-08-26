import mongoose, { Schema } from "mongoose";
import { IDownload } from "../types";

const DownloadSchema = new Schema<IDownload>(
  {
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    product: {
      type: String,
      ref: "Product",
      required: true,
    },
    order: {
      type: String,
      ref: "Order",
      required: true,
    },
    downloadedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
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
