import mongoose, { Document, Schema } from "mongoose";

export interface IPost extends Document {
  author: mongoose.Types.ObjectId;
  title: string;
  content: string;
  images?: string[];
  category: "discussion" | "showcase" | "feedback" | "tutorial" | "question";
  tags: string[];
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  views: number;
  isActive: boolean;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: mongoose.Types.ObjectId;
  content: string;
  parentComment?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const PostSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    category: {
      type: String,
      enum: ["discussion", "showcase", "feedback", "tutorial", "question"],
      required: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    likes: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for like count
PostSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

PostSchema.virtual("commentCount").get(function () {
  return this.comments?.length || 0;
});

CommentSchema.virtual("likeCount").get(function () {
  return this.likes?.length || 0;
});

CommentSchema.virtual("replyCount").get(function () {
  return this.replies?.length || 0;
});

// Ensure virtual fields are serialized
PostSchema.set("toJSON", { virtuals: true });
PostSchema.set("toObject", { virtuals: true });
CommentSchema.set("toJSON", { virtuals: true });
CommentSchema.set("toObject", { virtuals: true });

// Indexes
PostSchema.index({ author: 1 });
PostSchema.index({ category: 1 });
PostSchema.index({ createdAt: -1 });
PostSchema.index({ isPinned: -1, createdAt: -1 });
PostSchema.index({ tags: 1 });

CommentSchema.index({ post: 1, createdAt: 1 });
CommentSchema.index({ author: 1 });
CommentSchema.index({ parentComment: 1 });

export const Post = mongoose.model<IPost>("Post", PostSchema);
export const Comment = mongoose.model<IComment>("Comment", CommentSchema);

export default { Post, Comment };
