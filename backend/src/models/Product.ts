import mongoose, { Schema } from "mongoose";
import { IProduct } from "../types";

const ProductSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      required: [true, "Product title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "logos",
        "icons",
        "templates",
        "fonts",
        "illustrations",
        "ui-kits",
      ],
    },
    subcategory: {
      type: String,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    files: [
      {
        url: {
          type: String,
          required: true,
        },
        filename: {
          type: String,
          required: true,
        },
        size: {
          type: Number,
          required: true,
        },
        format: {
          type: String,
          required: true,
        },
      },
    ],
    seller: {
      type: String,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isExclusive: {
      type: Boolean,
      default: false,
    },
    downloads: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: String,
        ref: "User",
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
ProductSchema.virtual("likeCount").get(function (this: IProduct) {
  return this.likes.length;
});

// Virtual for average rating calculation
ProductSchema.virtual("averageRating").get(function (this: IProduct) {
  return this.reviewCount > 0 ? this.rating / this.reviewCount : 0;
});

// Index for search functionality
ProductSchema.index({ title: "text", description: "text", tags: "text" });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ seller: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ rating: -1 });
ProductSchema.index({ downloads: -1 });

// Method to increment views
ProductSchema.methods.incrementViews = function () {
  this.views += 1;
  return this.save();
};

// Method to increment downloads
ProductSchema.methods.incrementDownloads = function () {
  this.downloads += 1;
  return this.save();
};

export default mongoose.model<IProduct>("Product", ProductSchema);
