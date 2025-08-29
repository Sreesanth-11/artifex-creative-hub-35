import { Request, Response } from "express";
import { Post, Comment } from "../models/Community";
import mongoose from "mongoose";

// Get all posts with filtering and pagination
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const sort = (req.query.sort as string) || "newest";

    // Build query
    const query: any = { isActive: true };

    if (category && category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Build sort
    let sortQuery: any = {};
    switch (sort) {
      case "popular":
        sortQuery = { likeCount: -1, createdAt: -1 };
        break;
      case "discussed":
        sortQuery = { commentCount: -1, createdAt: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      default: // newest
        sortQuery = { isPinned: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
      .populate("author", "name avatar")
      .sort(sortQuery)
      .limit(limit * page)
      .skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments(query);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page,
          limit,
          total: totalPosts,
          pages: Math.ceil(totalPosts / limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Error fetching posts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch posts",
    });
  }
};

// Get single post with comments
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await Post.findById(postId).populate("author", "name avatar");

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    // Increment view count
    await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });

    // Get comments
    const comments = await Comment.find({ post: postId, isActive: true })
      .populate("author", "name avatar")
      .populate({
        path: "replies",
        populate: {
          path: "author",
          select: "name avatar",
        },
      })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: { post, comments },
    });
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch post",
    });
  }
};

// Create new post
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { title, content, category, tags, images } = req.body;

    const post = new Post({
      author: userId,
      title,
      content,
      category,
      tags: tags || [],
      images: images || [],
    });

    await post.save();
    await post.populate("author", "name avatar");

    res.status(201).json({
      success: true,
      data: { post },
      message: "Post created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create post",
    });
  }
};

// Update post
export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;
    const { title, content, category, tags, images } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found or access denied",
      });
      return;
    }

    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.tags = tags || post.tags;
    post.images = images || post.images;

    await post.save();
    await post.populate("author", "name avatar");

    res.json({
      success: true,
      data: { post },
      message: "Post updated successfully",
    });
  } catch (error) {
    console.error("❌ Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update post",
    });
  }
};

// Delete post
export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await Post.findOne({ _id: postId, author: userId });

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found or access denied",
      });
      return;
    }

    post.isActive = false;
    await post.save();

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete post",
    });
  }
};

// Toggle like on post
export const togglePostLike = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const isLiked = post.likes.includes(new mongoose.Types.ObjectId(userId));

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId);
    } else {
      post.likes.push(new mongoose.Types.ObjectId(userId));
    }

    await post.save();

    res.json({
      success: true,
      data: {
        isLiked: !isLiked,
        likeCount: post.likes.length,
      },
    });
  } catch (error) {
    console.error("❌ Error toggling post like:", error);
    res.status(500).json({
      success: false,
      message: "Failed to toggle like",
    });
  }
};

// Add comment to post
export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { postId } = req.params;
    const { content, parentComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      res.status(400).json({
        success: false,
        message: "Invalid post ID",
      });
      return;
    }

    const post = await Post.findById(postId);

    if (!post) {
      res.status(404).json({
        success: false,
        message: "Post not found",
      });
      return;
    }

    const comment = new Comment({
      post: postId,
      author: userId,
      content,
      parentComment: parentComment || undefined,
    });

    await comment.save();
    await comment.populate("author", "name avatar");

    // Add comment to post
    post.comments.push(comment._id as any);
    await post.save();

    // If it's a reply, add to parent comment
    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id },
      });
    }

    res.status(201).json({
      success: true,
      data: { comment },
      message: "Comment added successfully",
    });
  } catch (error) {
    console.error("❌ Error adding comment:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add comment",
    });
  }
};
