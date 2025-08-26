import mongoose, { Schema } from "mongoose";
import { IReview } from "../types";

const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: String,
      ref: "Product",
      required: true,
    },
    user: {
      type: String,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot be more than 5"],
    },
    comment: {
      type: String,
      required: [true, "Review comment is required"],
      trim: true,
      maxlength: [1000, "Review comment cannot be more than 1000 characters"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    helpfulVotes: [
      {
        type: String,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for helpful votes count
ReviewSchema.virtual("helpfulCount").get(function (this: IReview) {
  return this.helpfulVotes.length;
});

// Compound index to ensure one review per user per product
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });
ReviewSchema.index({ product: 1, createdAt: -1 });
ReviewSchema.index({ user: 1, createdAt: -1 });
ReviewSchema.index({ rating: -1 });

// Method to add helpful vote
ReviewSchema.methods.addHelpfulVote = function (userId: string) {
  if (!this.helpfulVotes.includes(userId)) {
    this.helpfulVotes.push(userId);
    return this.save();
  }
  throw new Error("User has already voted this review as helpful");
};

// Method to remove helpful vote
ReviewSchema.methods.removeHelpfulVote = function (userId: string) {
  const index = this.helpfulVotes.indexOf(userId);
  if (index > -1) {
    this.helpfulVotes.splice(index, 1);
    return this.save();
  }
  throw new Error("User has not voted this review as helpful");
};

export default mongoose.model<IReview>("Review", ReviewSchema);
