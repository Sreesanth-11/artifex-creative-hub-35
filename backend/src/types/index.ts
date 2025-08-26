import { Document } from "mongoose";

// User Types
export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  isVerified: boolean;
  role: "user" | "admin";
  followers: string[];
  following: string[];
  totalSales: number;
  rating: number;
  joinDate: Date;
  lastActive: Date;
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
  price: number;
  category: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  files: {
    url: string;
    filename: string;
    size: number;
    format: string;
  }[];
  seller: string;
  isActive: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  downloads: number;
  views: number;
  likes: string[];
  rating: number;
  reviewCount: number;
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
  product: string;
  user: string;
  rating: number;
  comment: string;
  isVerified: boolean;
  helpfulVotes: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Message Types
export interface IMessage extends Document {
  _id: string;
  sender: string;
  receiver: string;
  content: string;
  type: "text" | "image" | "file";
  isRead: boolean;
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
  user: string;
  product: string;
  order: string;
  downloadedAt: Date;
  ipAddress: string;
  userAgent: string;
}

// Follower Types
export interface IFollower extends Document {
  _id: string;
  follower: string;
  following: string;
  createdAt: Date;
}
