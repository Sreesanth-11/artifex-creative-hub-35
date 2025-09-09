import mongoose, { Schema } from "mongoose";
import { IOrder } from "../types";

const OrderSchema = new Schema<IOrder>(
  {
    buyer: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    seller: {
      type: Schema.Types.ObjectId as any,
      ref: "User",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId as any,
      ref: "Product",
      required: true,
    },
    amount: {
      type: Number,
      required: [true, "Order amount is required"],
      min: [0, "Amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      required: true,
      unique: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    maxDownloads: {
      type: Number,
      default: 5,
    },
    expiresAt: {
      type: Date,
      default: function () {
        // Downloads expire after 1 year
        return new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual to check if downloads are available
OrderSchema.virtual("downloadsAvailable").get(function (this: IOrder) {
  return (
    this.downloadCount < this.maxDownloads &&
    new Date() < (this.expiresAt || new Date())
  );
});

// Virtual to check if order is expired
OrderSchema.virtual("isExpired").get(function (this: IOrder) {
  return new Date() > (this.expiresAt || new Date());
});

// Index for efficient queries
OrderSchema.index({ buyer: 1, createdAt: -1 });
OrderSchema.index({ seller: 1, createdAt: -1 });
OrderSchema.index({ product: 1 });
OrderSchema.index({ paymentIntentId: 1 });
OrderSchema.index({ status: 1 });

// Method to increment download count
OrderSchema.methods.incrementDownload = function () {
  if (this.downloadCount < this.maxDownloads) {
    this.downloadCount += 1;
    return this.save();
  }
  throw new Error("Maximum downloads reached");
};

// Method to check if user can download
OrderSchema.methods.canDownload = function () {
  return (
    this.status === "completed" &&
    this.downloadCount < this.maxDownloads &&
    new Date() < this.expiresAt
  );
};

export default mongoose.model<IOrder>("Order", OrderSchema);
