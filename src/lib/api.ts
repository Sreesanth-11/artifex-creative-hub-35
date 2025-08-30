import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  isVerified: boolean;
  followers: string[];
  following: string[];
  totalSales: number;
  rating: number;
  isActive: boolean;
  joinDate: string;
  lastActive: string;
  followerCount: number;
  followingCount: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    user: User;
  };
}

export interface ApiError {
  success: false;
  error: string;
  details?: any[];
}

// Auth API functions
export const authAPI = {
  // Register new user
  register: async (userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  // Login user
  login: async (credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  // Get current user
  getMe: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Logout user
  logout: async (): Promise<{ success: boolean; message: string }> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  // Update user details
  updateDetails: async (userData: {
    name?: string;
    email?: string;
  }): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.put("/auth/updatedetails", userData);
    return response.data;
  },

  // Update password
  updatePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put("/auth/updatepassword", passwordData);
    return response.data;
  },
};

// Product types
export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  subcategory?: string;
  tags: string[];
  images: string[];
  files: Array<{
    url: string;
    filename: string;
    size: number;
    format: string;
  }>;
  seller: {
    _id: string;
    name: string;
    avatar?: string;
    rating: number;
    totalSales: number;
    joinDate: string;
  };
  isActive: boolean;
  isFeatured: boolean;
  isExclusive: boolean;
  downloads: number;
  views: number;
  likes: string[];
  likeCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Product API functions
export const productAPI = {
  // Get all products with filtering
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
  }): Promise<ProductsResponse> => {
    const response = await api.get("/products", { params });
    return response.data;
  },

  // Get single product
  getProduct: async (
    id: string
  ): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (productData: {
    title: string;
    description: string;
    price: number;
    category: string;
    subcategory?: string;
    tags?: string[];
    images: string[];
    files: Array<{
      url: string;
      filename: string;
      size: number;
      format: string;
    }>;
  }): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.post("/products", productData);
    return response.data;
  },

  // Update product
  updateProduct: async (
    id: string,
    productData: Partial<Product>
  ): Promise<{ success: boolean; data: { product: Product } }> => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (
    id: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get seller products
  getSellerProducts: async (
    sellerId?: string,
    params?: {
      page?: number;
      limit?: number;
    }
  ): Promise<ProductsResponse> => {
    const url = sellerId
      ? `/products/seller/${sellerId}`
      : "/products/my/products";
    const response = await api.get(url, { params });
    return response.data;
  },

  // Toggle like
  toggleLike: async (
    id: string
  ): Promise<{
    success: boolean;
    data: { isLiked: boolean; likeCount: number };
  }> => {
    const response = await api.post(`/products/${id}/like`);
    return response.data;
  },

  // Get categories
  getCategories: async (): Promise<{
    success: boolean;
    data: { categories: Array<{ name: string; count: number }> };
  }> => {
    const response = await api.get("/products/categories");
    return response.data;
  },

  // Toggle like
  toggleProductLike: async (
    id: string
  ): Promise<{
    success: boolean;
    data: { isLiked: boolean; likeCount: number };
  }> => {
    const response = await api.post(`/products/${id}/like`);
    return response.data;
  },

  // Convenience methods for compatibility
  getAll: (params?: any) => productAPI.getProducts(params),
  getById: (id: string) => productAPI.getProduct(id),
  create: (data: any) => productAPI.createProduct(data),
  update: (id: string, data: any) => productAPI.updateProduct(id, data),
  delete: (id: string) => productAPI.deleteProduct(id),
};

// Downloads API
export const downloadsAPI = {
  getUserDownloads: async (params?: { page?: number; limit?: number }) => {
    const response = await api.get("/downloads", { params });
    return response.data;
  },

  recordDownload: async (productId: string) => {
    const response = await api.post(`/downloads/${productId}`);
    return response.data;
  },

  getUserDownloadStats: async () => {
    const response = await api.get("/downloads/stats");
    return response.data;
  },

  getProductDownloadStats: async (productId: string) => {
    const response = await api.get(`/downloads/product/${productId}/stats`);
    return response.data;
  },

  // Download a file by order ID
  downloadFile: async (orderId: string) => {
    const response = await api.get(`/downloads/file/${orderId}`, {
      responseType: "blob",
    });
    return response;
  },
};

// Community API
export const communityAPI = {
  getPosts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    sort?: string;
  }) => {
    const response = await api.get("/community", { params });
    return response.data;
  },

  getPost: async (postId: string) => {
    const response = await api.get(`/community/${postId}`);
    return response.data;
  },

  createPost: async (data: {
    title: string;
    content: string;
    category: string;
    tags?: string[];
    images?: string[];
  }) => {
    const response = await api.post("/community", data);
    return response.data;
  },

  updatePost: async (
    postId: string,
    data: {
      title?: string;
      content?: string;
      category?: string;
      tags?: string[];
      images?: string[];
    }
  ) => {
    const response = await api.put(`/community/${postId}`, data);
    return response.data;
  },

  deletePost: async (postId: string) => {
    const response = await api.delete(`/community/${postId}`);
    return response.data;
  },

  togglePostLike: async (postId: string) => {
    const response = await api.post(`/community/${postId}/like`);
    return response.data;
  },

  addComment: async (
    postId: string,
    data: { content: string; parentComment?: string }
  ) => {
    const response = await api.post(`/community/${postId}/comments`, data);
    return response.data;
  },

  toggleCommentLike: async (commentId: string) => {
    const response = await api.post(`/community/comments/${commentId}/like`);
    return response.data;
  },

  getTrendingTopics: async (limit?: number) => {
    const response = await api.get("/community/trending/topics", {
      params: { limit },
    });
    return response.data;
  },

  getFeaturedUsers: async (limit?: number) => {
    const response = await api.get("/community/featured/users", {
      params: { limit },
    });
    return response.data;
  },
};

// Health check
export const healthCheck = async (): Promise<{
  success: boolean;
  message: string;
  timestamp: string;
  environment: string;
}> => {
  const response = await api.get("/health");
  return response.data;
};

// Chat API
export const chatAPI = {
  // Get all conversations for the authenticated user
  getConversations: async () => {
    const response = await api.get("/chat/conversations");
    return response.data;
  },

  // Get messages for a specific conversation
  getMessages: async (
    otherUserId: string,
    params?: { page?: number; limit?: number }
  ) => {
    const response = await api.get(`/chat/messages/${otherUserId}`, { params });
    return response.data;
  },

  // Send a new message
  sendMessage: async (data: {
    receiverId: string;
    content: string;
    type?: "text" | "image" | "file";
  }) => {
    const response = await api.post("/chat/messages", data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (otherUserId: string) => {
    const response = await api.put(`/chat/messages/${otherUserId}/read`);
    return response.data;
  },

  // Search users for chat
  searchUsers: async (query: string, limit?: number) => {
    const response = await api.get("/chat/search", {
      params: { query, limit },
    });
    return response.data;
  },

  // Get user by ID for chat
  getUserById: async (userId: string) => {
    const response = await api.get(`/chat/user/${userId}`);
    return response.data;
  },
};

// Review API functions
export const reviewAPI = {
  // Create review
  createReview: async (
    productId: string,
    data: { rating: number; comment: string }
  ): Promise<{ success: boolean; data: { review: any } }> => {
    const response = await api.post(`/reviews/product/${productId}`, data);
    return response.data;
  },

  // Get product reviews
  getProductReviews: async (
    productId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    success: boolean;
    data: { reviews: any[]; pagination: any };
  }> => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // Update review
  updateReview: async (
    reviewId: string,
    data: { rating?: number; comment?: string }
  ): Promise<{ success: boolean; data: { review: any } }> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Delete review
  deleteReview: async (
    reviewId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },

  // Toggle helpful vote
  toggleHelpfulVote: async (
    reviewId: string
  ): Promise<{
    success: boolean;
    data: { isHelpful: boolean; helpfulCount: number };
  }> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },
};

// Order API functions
export const orderAPI = {
  // Create order
  createOrder: async (data: {
    productId: string;
  }): Promise<{
    success: boolean;
    data: {
      orderId: string;
      clientSecret: string;
      amount: number;
      testMode?: boolean;
    };
  }> => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  // Confirm order
  confirmOrder: async (data: {
    paymentIntentId: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { orderId: string; downloadUrl: string };
  }> => {
    const response = await api.post("/orders/confirm", data);
    return response.data;
  },

  // Get user orders
  getUserOrders: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: { orders: any[]; pagination: any };
  }> => {
    const response = await api.get("/orders", { params });
    return response.data;
  },

  // Get seller sales
  getSellerSales: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    data: { sales: any[]; pagination: any };
  }> => {
    const response = await api.get("/orders/sales", { params });
    return response.data;
  },

  // Get order by ID
  getOrder: async (
    orderId: string
  ): Promise<{ success: boolean; data: { order: any } }> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },
};

// Cart API functions
export const cartAPI = {
  // Get user's cart
  getCart: async (): Promise<{
    success: boolean;
    data: {
      items: any[];
      cart: any[];
      totalItems: number;
      totalAmount: number;
    };
  }> => {
    const response = await api.get("/cart");
    return response.data;
  },

  // Add item to cart
  addToCart: async (data: {
    productId: string;
    quantity?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: { cart: any[]; totalItems: number };
  }> => {
    const response = await api.post("/cart", data);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (
    productId: string,
    quantity: number
  ): Promise<{
    success: boolean;
    message: string;
    data: { cart: any[] };
  }> => {
    const response = await api.put(`/cart/${productId}`, { quantity });
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (
    productId: string
  ): Promise<{
    success: boolean;
    message: string;
    data: { cart: any[]; totalItems: number };
  }> => {
    const response = await api.delete(`/cart/${productId}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<{
    success: boolean;
    message: string;
    data: { cart: any[]; totalItems: number };
  }> => {
    const response = await api.delete("/cart");
    return response.data;
  },
};

// User API functions
export const userAPI = {
  // Get user profile
  getUserProfile: async (
    userId?: string
  ): Promise<{ success: boolean; data: { user: any } }> => {
    const url = userId ? `/users/${userId}` : "/users";
    const response = await api.get(url);
    return response.data;
  },

  // Update user profile
  updateUserProfile: async (data: {
    name?: string;
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
  }): Promise<{ success: boolean; message: string; data: { user: any } }> => {
    const response = await api.put("/users", data);
    return response.data;
  },

  // Upload avatar
  uploadAvatar: async (
    formData: FormData
  ): Promise<{
    success: boolean;
    message: string;
    data: { avatarUrl: string };
  }> => {
    const response = await api.post("/users/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Upload banner
  uploadBanner: async (
    formData: FormData
  ): Promise<{
    success: boolean;
    message: string;
    data: { bannerUrl: string };
  }> => {
    const response = await api.post("/users/upload-banner", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ success: boolean; message: string }> => {
    const response = await api.put("/users/password", data);
    return response.data;
  },

  // Toggle follow
  toggleFollow: async (
    targetUserId: string
  ): Promise<{
    success: boolean;
    data: { isFollowing: boolean; followerCount: number };
  }> => {
    const response = await api.post(`/users/${targetUserId}/follow`);
    return response.data;
  },

  // Get user products
  getUserProducts: async (
    userId: string,
    params?: { page?: number; limit?: number }
  ): Promise<{
    success: boolean;
    data: { products: any[]; pagination: any };
  }> => {
    const response = await api.get(`/users/${userId}/products`, { params });
    return response.data;
  },

  // Get user stats
  getUserStats: async (): Promise<{
    success: boolean;
    data: any;
  }> => {
    const response = await api.get("/users/dashboard/stats");
    return response.data;
  },
};

export default api;
