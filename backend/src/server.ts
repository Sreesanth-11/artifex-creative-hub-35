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
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
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
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "blob:"],
        connectSrc: [
          "'self'",
          process.env.FRONTEND_URL || "http://localhost:5173",
        ],
        imgSrc: ["'self'", "data:", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(compression());
app.use(morgan("combined"));
app.use(limiter);
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "http://localhost:5173"],
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
  app.use(express.static(path.join(__dirname, "../../dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../../dist", "index.html"));
  });
} else {
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  app.get("/api/health", (req, res) => {
    res.status(200).json({
      success: true,
      message: "Artifex API is running!",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    });
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

// Socket.io
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room`);
  });

  socket.on("sendMessage", async (messageData) => {
    try {
      const { senderId, receiverId, content, senderName, senderAvatar } =
        messageData;

      const messageToSave = {
        sender: senderId,
        receiver: receiverId,
        content: content,
        createdAt: new Date(),
      };

      const Message = (await import("./models/Message")).default;
      const savedMessage = await new Message(messageToSave).save();

      const messageToSend = {
        id: savedMessage._id,
        senderId,
        senderName,
        senderAvatar,
        content,
        createdAt: savedMessage.createdAt,
        tempId: messageData.tempId,
      };

      socket.to(receiverId).emit("newMessage", messageToSend);
      socket.emit("messageSent", messageToSend);
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: "Failed to send message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
});

export { io };
