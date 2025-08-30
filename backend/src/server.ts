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

    // Create sample messages - simplified approach
    const conversationId = [user1._id.toString(), user2._id.toString()]
      .sort()
      .join("_");

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

// Test endpoint to create sample downloads (development only)
app.post(
  "/api/test/create-sample-downloads",
  async (_req, res): Promise<void> => {
    if (process.env.NODE_ENV !== "development") {
      res.status(403).json({ error: "Only available in development" });
      return;
    }

    try {
      const { User, Product, Download, Order } = await import("./models");

      // Find a test user
      const user = await User.findOne({ email: "testuser1@example.com" });
      if (!user) {
        res.status(404).json({ error: "Test user not found. Create sample users first." });
        return;
      }

      // Find some products
      const products = await Product.find().limit(4);
      if (products.length === 0) {
        res.status(404).json({ error: "No products found. Create sample products first." });
        return;
      }

      // Create a test order
      let order = await Order.findOne({ user: user._id });
      if (!order) {
        order = await Order.create({
          user: user._id,
          products: products.map(product => ({
            product: product._id,
            quantity: 1,
            price: product.price
          })),
          totalAmount: products.reduce((sum, product) => sum + product.price, 0),
          status: "completed",
          paymentMethod: "credit_card",
          paymentStatus: "paid"
        });
      }

      // Delete existing downloads for this user
      await Download.deleteMany({ user: user._id });

      // Create sample downloads
      const downloads = [];
      for (const product of products) {
        downloads.push({
          user: user._id,
          product: product._id,
          order: order._id,
          downloadedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date within last 30 days
          ipAddress: "127.0.0.1",
          userAgent: "Mozilla/5.0 (Test Browser)"
        });
      }

      const createdDownloads = await Download.insertMany(downloads);

      res.json({
        success: true,
        message: "Sample downloads created successfully",
        data: {
          downloads: createdDownloads,
          count: createdDownloads.length,
          user: user.email
        },
      });
    } catch (error) {
      console.error("Error creating sample downloads:", error);
      res.status(500).json({
        success: false,
        error: "Failed to create sample downloads",
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
