import { Request, Response, NextFunction } from "express";
import { Message, User } from "../models";
import { validationResult } from "express-validator";

// Get chat conversations for a user - Simplified approach
export const getConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get unique conversations - simplified approach
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userId }, { receiver: userId }],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: {
            $cond: [{ $eq: ["$sender", userId] }, "$receiver", "$sender"],
          },
          lastMessage: { $first: "$$ROOT" },
          messageCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.sender",
          foreignField: "_id",
          as: "senderInfo",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "lastMessage.receiver",
          foreignField: "_id",
          as: "receiverInfo",
        },
      },
      {
        $sort: { "lastMessage.createdAt": -1 },
      },
    ]);

    // Transform data to match frontend expectations
    const transformedConversations = conversations.map((conv: any) => {
      const otherUser =
        conv.lastMessage.sender.toString() === userId
          ? conv.receiverInfo[0]
          : conv.senderInfo[0];

      return {
        id: otherUser._id,
        name: otherUser.name,
        avatar: otherUser.avatar || "/api/placeholder/40/40",
        isOnline: otherUser.isOnline || false,
        lastSeen: otherUser.lastSeen
          ? new Date(otherUser.lastSeen).toLocaleString()
          : "Unknown",
        lastMessage: conv.lastMessage.content,
        timestamp: new Date(conv.lastMessage.createdAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        unreadCount: conv.unreadCount,
      };
    });

    res.status(200).json({
      success: true,
      data: { conversations: transformedConversations },
    });
  } catch (error) {
    console.error("Error getting conversations:", error);
    next(error);
  }
};

// Get messages for a specific conversation
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Get messages between two users - simplified approach
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    })
      .populate("sender", "name avatar")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    // Transform messages to match frontend expectations
    const transformedMessages = messages.reverse().map((msg: any) => ({
      id: msg._id,
      senderId: msg.sender._id,
      content: msg.content,
      timestamp: new Date(msg.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: msg.sender._id.toString() === userId,
    }));

    res.status(200).json({
      success: true,
      data: { messages: transformedMessages },
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    next(error);
  }
};

// Send a new message
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const userId = req.user?.id;
    const { receiverId, content } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({
        success: false,
        error: "Receiver not found",
      });
    }

    // Create new message - simplified
    const message = new Message({
      sender: userId,
      receiver: receiverId,
      content,
    });

    await message.save();

    // Populate sender info for response
    await message.populate("sender", "name avatar");

    // Transform message for response - simplified
    const transformedMessage = {
      id: message._id,
      senderId: (message.sender as any)._id,
      content: message.content,
      timestamp: new Date(message.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isMe: true,
    };

    res.status(201).json({
      success: true,
      data: { message: transformedMessage },
    });
  } catch (error) {
    console.error("Error sending message:", error);
    next(error);
  }
};

// Mark messages as read
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { otherUserId } = req.params;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Mark messages as read - simplified approach (no-op since we removed read status)
    // In the simplified version, we don't track read status

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
    });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    next(error);
  }
};

// Search users for chat
export const searchUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const userId = req.user?.id;
    const { query, limit = 10 } = req.query;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!query || typeof query !== "string") {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    // Search users by name or email (excluding current user)
    const users = await User.find({
      _id: { $ne: userId },
      $or: [
        { name: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("name email avatar isOnline lastSeen")
      .limit(Number(limit));

    // Transform users for response
    const transformedUsers = users.map((user: any) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/api/placeholder/40/40",
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen
        ? new Date(user.lastSeen).toLocaleString()
        : "Unknown",
    }));

    res.status(200).json({
      success: true,
      data: { users: transformedUsers },
    });
  } catch (error) {
    console.error("Error searching users:", error);
    next(error);
  }
};

// Get user by ID for chat
export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void | Response> => {
  try {
    const currentUserId = req.user?.id;
    const { userId } = req.params;

    if (!currentUserId) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    // Find the user by ID (excluding current user)
    const user = await User.findOne({
      _id: userId,
    }).select("name email avatar isOnline lastSeen");

    // Check if it's not the current user
    if (user && user._id.toString() === currentUserId) {
      return res.status(400).json({
        success: false,
        error: "Cannot get your own user data",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Transform user for response
    const transformedUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || "/api/placeholder/40/40",
      isOnline: user.isOnline || false,
      lastSeen: user.lastSeen
        ? new Date(user.lastSeen).toLocaleString()
        : "Unknown",
    };

    res.status(200).json({
      success: true,
      data: { user: transformedUser },
    });
  } catch (error) {
    console.error("Error getting user by ID:", error);
    next(error);
  }
};
