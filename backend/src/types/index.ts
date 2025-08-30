import { Document, Schema } from "mongoose";

// User Types
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  banner?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  role: "user" | "admin";
  followers: string[];
  following: string[];
  cart: {
    product: Schema.Types.ObjectId;
    quantity: number;
    addedAt: Date;
  }[];
  totalSales: number;
  rating: number;
  joinDate: Date;
  lastActive: Date;
  isOnline: boolean;
  lastSeen: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(enteredPassword: string): Promise<boolean>;
  updateLastActive(): Promise<IUser>;
}

// Product Types
export interface IProduct extends Document {
  _id: string;
  title: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  discount: number;
  category: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  files: {
    name: string;
    url: string;
    size: string;
    type: string;
  }[];
  seller: Schema.Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  downloads: number;
  views: number;
  likes: Schema.Types.ObjectId[];
  rating: number;
  reviewCount: number;
  license: string;
  publishDate: Date;
  lastUpdate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Category Types
export interface ICategory extends Document {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentCategory?: string;
  isActive: boolean;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Order Types
export interface IOrder extends Document {
  _id: string;
  buyer: string;
  seller: string;
  product: string;
  amount: number;
  status: "pending" | "completed" | "failed" | "refunded";
  paymentIntentId: string;
  downloadCount: number;
  maxDownloads: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Review Types
export interface IReview extends Document {
  _id: string;
  product: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  rating: number;
  comment: string;
  isVerified: boolean;
  helpfulVotes: Schema.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface IMessage extends Document {
  _id: string;
  sender: Schema.Types.ObjectId;
  receiver: Schema.Types.ObjectId;
  content: string;
  type: "text" | "image" | "file";
  isRead: boolean;
  readAt?: Date;
  conversationId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Conversation Types
export interface IConversation extends Document {
  _id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Download Types
export interface IDownload extends Document {
  _id: string;
  user: Schema.Types.ObjectId;
  product: Schema.Types.ObjectId;
  order?: Schema.Types.ObjectId;
  downloadedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Follower Types
export interface IFollower extends Document {
  _id: string;
  follower: string;
  following: string;
  createdAt: Date;
}
