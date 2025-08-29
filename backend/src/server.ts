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
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// Serve static files from uploads directory
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

  // Generate a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#${color}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="14"
            fill="#${textColor}" text-anchor="middle" dy=".3em">
        ${width}×${height}
      </text>
    </svg>
  `;

  res.setHeader("Content-Type", "image/svg+xml");
  res.setHeader("Cache-Control", "public, max-age=31536000");
  res.send(svg);
});

// Test endpoint to create simple test users (development only)
app.post("/api/test/create-test-users", async (req, res): Promise<void> => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Only available in development" });
    return;
  }

  try {
    const { User } = await import("./models");

    // Delete existing test users first
    await User.deleteMany({
      email: { $in: ["testuser1@example.com", "testuser2@example.com"] },
    });

    // Create Test User 1
    const user1 = await User.create({
      name: "Test User 1",
      email: "testuser1@example.com",
      password: "password123",
      isActive: true,
      isOnline: true,
    });

    // Create Test User 2
    const user2 = await User.create({
      name: "Test User 2",
      email: "testuser2@example.com",
      password: "password123",
      isActive: true,
      isOnline: false,
    });

    res.json({
      success: true,
      message: "Test users created successfully",
      users: [
        {
          id: user1._id,
          name: user1.name,
          email: user1.email,
        },
        {
          id: user2._id,
          name: user2.name,
          email: user2.email,
        },
      ],
      credentials: {
        user1: { email: "testuser1@example.com", password: "password123" },
        user2: { email: "testuser2@example.com", password: "password123" },
      },
    });
  } catch (error) {
    console.error("Error creating test users:", error);
    res.status(500).json({ error: "Failed to create test users" });
  }
});

// Test endpoint to create working test users (development only)
app.post("/api/test/create-working-users", async (req, res): Promise<void> => {
  if (process.env.NODE_ENV !== "development") {
    res.status(403).json({ error: "Only available in development" });
    return;
  }

  try {
    const { User, Message } = await import("./models");

    // Delete existing test users completely
    await User.deleteMany({
      email: { $in: ["testuser1@example.com", "testuser2@example.com"] },
    });

    // Delete any existing messages between test users
    await Message.deleteMany({
      $or: [{ sender: { $exists: true }, receiver: { $exists: true } }],
    });

    console.log("Creating Test User 1...");
    // Create Test User 1 using the same method as registration
    const user1 = new User({
      name: "Test User 1",
      email: "testuser1@example.com",
      password: "Password123!", // Will be hashed by pre-save hook
      isActive: true,
      isOnline: true,
    });
    await user1.save();
    console.log("Test User 1 created:", user1._id);

    console.log("Creating Test User 2...");
    // Create Test User 2 using the same method as registration
    const user2 = new User({
      name: "Test User 2",
      email: "testuser2@example.com",
      password: "Password123!", // Will be hashed by pre-save hook
      isActive: true,
      isOnline: false,
    });
    await user2.save();
    console.log("Test User 2 created:", user2._id);

    // Create some sample messages between them
    const conversationId = `${user1._id}_${user2._id}`;
    const sampleMessages = [
      {
        sender: user1._id,
        receiver: user2._id,
        conversationId,
        content: "Hey! How are you doing?",
        type: "text",
        isRead: false,
        createdAt: new Date(Date.now() - 60000), // 1 minute ago
      },
      {
        sender: user2._id,
        receiver: user1._id,
        conversationId,
        content: "Hi there! I'm doing great, thanks for asking!",
        type: "text",
        isRead: false,
        createdAt: new Date(Date.now() - 30000), // 30 seconds ago
      },
    ];

    await Message.insertMany(sampleMessages);

    res.json({
      success: true,
      message: "Working test users created successfully",
      users: [
        {
          id: user1._id,
          name: user1.name,
          email: user1.email,
        },
        {
          id: user2._id,
          name: user2.name,
          email: user2.email,
        },
      ],
      credentials: {
        user1: { email: "testuser1@example.com", password: "Password123!" },
        user2: { email: "testuser2@example.com", password: "Password123!" },
      },
      instructions: "You can now login with these credentials at /login",
    });
  } catch (error) {
    console.error("Error creating working test users:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create working test users",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Test endpoint to create sample chat data (development only)
app.post("/api/test/create-sample-chat", async (req, res): Promise<void> => {
  if (process.env.NODE_ENV !== "development") {
    res
      .status(403)
      .json({ error: "This endpoint is only available in development" });
    return;
  }

  try {
    const { User, Message } = await import("./models");

    // Create two test users if they don't exist
    let user1 = await User.findOne({ email: "testuser1@example.com" });
    if (!user1) {
      user1 = new User({
        name: "Test User 1",
        email: "testuser1@example.com",
        password: "password123", // Will be hashed by pre-save hook
        isOnline: true,
      });
      await user1.save();
    }

    let user2 = await User.findOne({ email: "testuser2@example.com" });
    if (!user2) {
      user2 = new User({
        name: "Test User 2",
        email: "testuser2@example.com",
        password: "password123", // Will be hashed by pre-save hook
        isOnline: false,
        lastSeen: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      });
      await user2.save();
    }

    // Create sample messages
    const conversationId = Message.generateConversationId(
      user1._id.toString(),
      user2._id.toString()
    );

    const sampleMessages = [
      {
        sender: user1._id,
        receiver: user2._id,
        content: "Hi! How are you doing?",
        conversationId,
        type: "text",
      },
      {
        sender: user2._id,
        receiver: user1._id,
        content: "I'm doing great! Thanks for asking. How about you?",
        conversationId,
        type: "text",
      },
      {
        sender: user1._id,
        receiver: user2._id,
        content: "I'm good too! Working on some exciting projects.",
        conversationId,
        type: "text",
      },
    ];

    // Delete existing messages for this conversation
    await Message.deleteMany({ conversationId });

    // Create new messages
    await Message.insertMany(sampleMessages);

    // Generate JWT tokens for testing
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

    const token1 = jwt.sign({ id: user1._id, email: user1.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    const token2 = jwt.sign({ id: user2._id, email: user2.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      message: "Sample chat data created",
      users: [
        {
          id: user1._id,
          name: user1.name,
          email: user1.email,
          token: token1,
          loginUrl: `http://localhost:8081/chat?testLogin=${token1}&userId=${user1._id}`,
        },
        {
          id: user2._id,
          name: user2.name,
          email: user2.email,
          token: token2,
          loginUrl: `http://localhost:8081/chat?testLogin=${token2}&userId=${user2._id}`,
        },
      ],
      conversationId,
      instructions:
        "Use the loginUrl to automatically log in as a test user and access chat",
    });
  } catch (error) {
    console.error("Error creating sample data:", error);
    res.status(500).json({ error: "Failed to create sample data" });
  }
});

// Test endpoint to create sample products (development only)
app.post(
  "/api/test/create-sample-products",
  async (_req, res): Promise<void> => {
    if (process.env.NODE_ENV !== "development") {
      res.status(403).json({ error: "Only available in development" });
      return;
    }

    try {
      const { User, Product } = await import("./models");

      // Find or create a test user to be the seller
      let seller = await User.findOne({ email: "testuser1@example.com" });
      if (!seller) {
        seller = await User.create({
          name: "Test Seller",
          email: "testuser1@example.com",
          password: "password123",
          isActive: true,
        });
      }

      // Delete existing test products
      await Product.deleteMany({ seller: seller._id });

      // Sample products data
      const sampleProducts = [
        {
          title: "Modern Logo Pack",
          description:
            "A collection of 50 modern and minimalist logos perfect for startups and tech companies.",
          price: 29.99,
          originalPrice: 49.99,
          discount: 40,
          category: "logos",
          subcategory: "modern",
          tags: ["modern", "minimalist", "startup", "tech", "logo"],
          images: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
            "https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600&h=400&fit=crop",
          ],
          files: [
            {
              name: "logo-pack.zip",
              url: "https://example.com/files/logo-pack.zip",
              size: "15.2 MB",
              type: "application/zip",
            },
          ],
          seller: seller._id,
          isActive: true,
          isFeatured: true,
          downloads: 127,
          views: 1543,
          rating: 4.8,
          reviewCount: 23,
        },
        {
          title: "Icon Set - Business",
          description:
            "Professional business icons in multiple formats. Perfect for web and mobile applications.",
          price: 19.99,
          category: "icons",
          subcategory: "business",
          tags: ["business", "professional", "icons", "web", "mobile"],
          images: [
            "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600&h=400&fit=crop",
          ],
          files: [
            {
              name: "business-icons.zip",
              url: "https://example.com/files/business-icons.zip",
              size: "8.7 MB",
              type: "application/zip",
            },
          ],
          seller: seller._id,
          isActive: true,
          downloads: 89,
          views: 892,
          rating: 4.5,
          reviewCount: 12,
        },
        {
          title: "Website Template - Portfolio",
          description:
            "Clean and responsive portfolio template for creative professionals.",
          price: 39.99,
          category: "templates",
          subcategory: "portfolio",
          tags: ["template", "portfolio", "responsive", "creative"],
          images: [
            "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&h=400&fit=crop",
          ],
          files: [
            {
              name: "portfolio-template.zip",
              url: "https://example.com/files/portfolio-template.zip",
              size: "25.1 MB",
              type: "application/zip",
            },
          ],
          seller: seller._id,
          isActive: true,
          downloads: 45,
          views: 567,
          rating: 4.9,
          reviewCount: 8,
        },
      ];

      const createdProducts = await Product.insertMany(sampleProducts);

      res.json({
        success: true,
        message: "Sample products created successfully",
        data: {
          products: createdProducts,
          count: createdProducts.length,
        },
      });
    } catch (error) {
      console.error("Error creating sample products:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create sample products",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

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

// Socket.io for real-time chat
io.on("connection", (socket) => {
  console.log("👤 User connected:", socket.id);

  // Join user to their personal room
  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, content, type = "text" } = data;

      // Generate conversation ID
      const Message = (await import("./models/Message")).default;
      const conversationId = Message.generateConversationId(
        senderId,
        receiverId
      );

      // Create and save message
      const message = new Message({
        sender: senderId,
        receiver: receiverId,
        content,
        type,
        conversationId,
      });

      await message.save();
      await message.populate("sender", "name avatar");

      // Transform message for real-time delivery
      const transformedMessage = {
        id: message._id,
        senderId: (message.sender as any)._id,
        content: message.content,
        timestamp: new Date(message.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isMe: false, // Will be determined by the client
        isRead: message.isRead,
        type: message.type,
      };

      // Send to receiver
      socket.to(receiverId).emit("newMessage", transformedMessage);

      // Send confirmation to sender
      socket.emit("messageSent", { ...transformedMessage, isMe: true });
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  // Handle typing indicators
  socket.on("typing", (data) => {
    socket.to(data.receiverId).emit("userTyping", {
      senderId: data.senderId,
      isTyping: true,
    });
  });

  socket.on("stopTyping", (data) => {
    socket.to(data.receiverId).emit("userTyping", {
      senderId: data.senderId,
      isTyping: false,
    });
  });

  // Handle marking messages as read
  socket.on("markAsRead", async (data) => {
    try {
      const { userId, otherUserId } = data;
      const Message = (await import("./models/Message")).default;
      const conversationId = Message.generateConversationId(
        userId,
        otherUserId
      );

      await Message.markConversationAsRead(conversationId, userId);

      // Notify the other user that messages were read
      socket.to(otherUserId).emit("messagesRead", { userId });
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("👤 User disconnected:", socket.id);
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
