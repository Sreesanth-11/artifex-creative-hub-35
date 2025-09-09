import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    // MongoDB connection options
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    };

    console.log("🔄 Connecting to MongoDB...");
    const conn = await mongoose.connect(mongoURI, options);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("❌ MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("⚠️  MongoDB disconnected");
    });

    mongoose.connection.on("reconnected", () => {
      console.log("🔄 MongoDB reconnected");
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      try {
        await mongoose.connection.close();
        console.log("🔌 MongoDB connection closed through app termination");
        process.exit(0);
      } catch (error) {
        console.error("❌ Error closing MongoDB connection:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    console.log("💡 Possible solutions:");
    console.log("   1. Check if MongoDB is running (for local)");
    console.log("   2. Verify your IP is whitelisted in MongoDB Atlas");
    console.log("   3. Check your internet connection");
    console.log("   4. Verify MongoDB URI in .env file");

    // Don't exit in development, let the app continue
    if (process.env.NODE_ENV === "production") {
      process.exit(1);
    } else {
      console.log(
        "⚠️  Continuing without database connection in development mode"
      );
    }
  }
};

export default connectDB;
