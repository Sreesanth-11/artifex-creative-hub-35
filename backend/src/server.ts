import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";

// Import configurations
import connectDB from "./config/database";

// Import middleware
import { errorHandler } from "./middleware/errorHandler";
import { notFound } from "./middleware/notFound";

// Import routes
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import downloadRoutes from "./routes/downloads";
import communityRoutes from "./routes/community";
import chatRoutes from "./routes/chat";
import reviewRoutes from "./routes/reviews";
import orderRoutes from "./routes/orders";
import userRoutes from "./routes/users";
import cartRoutes from "./routes/cart";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
    ],
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"), // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(morgan("combined")); // Logging
app.use(limiter); // Rate limiting
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://localhost:8080",
      "http://localhost:8081",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  // Serve frontend files
  app.use(express.static(path.join(__dirname, "../../dist")));

  // For any other route, serve the index.html
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../dist", "index.html"));
  });
} else {
  // Serve static files from uploads directory in development
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Artifex API is running!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
  });

  // Placeholder image service
  app.get("/api/placeholder/:width/:height", (req, res) => {
    const { width, height } = req.params;
    const color = req.query.color || "cccccc";
    const textColor = req.query.text || "666666";
    const url = `https://via.placeholder.com/${width}x${height}/${color}/${textColor}`;
    res.redirect(url);
  });
}

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/downloads", downloadRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);

// Socket.io for real-time chat - Simplified approach
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join user to their personal room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  // Handle sending messages - Simplified
  socket.on("sendMessage", async (messageData) => {
    try {
      const { senderId, receiverId, content, senderName, senderAvatar } =
        messageData;

      // Create simple message object
      const messageToSave = {
        sender: senderId,
        receiver: receiverId,
        content: content,
        createdAt: new Date(),
      };

      // Save to database (simplified)
      const Message = (await import("./models/Message")).default;
      const savedMessage = await new Message(messageToSave).save();

      // Send to receiver with sender info
      const messageToSend = {
        id: savedMessage._id,
        senderId: senderId,
        senderName: senderName,
        senderAvatar: senderAvatar,
        content: content,
        createdAt: savedMessage.createdAt,
        tempId: messageData.tempId, // For client-side message matching
      };

      // Emit to receiver
      socket.to(receiverId).emit("newMessage", messageToSend);

      // Confirm to sender
      socket.emit("messageSent", messageToSend);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle disconnect - simplified
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export { io };
