import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "/api",
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

export default api;
