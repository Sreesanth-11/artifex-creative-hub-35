# Artifex Creative Hub - Backend API

A comprehensive backend API for the Artifex Creative Marketplace built with Node.js, Express, TypeScript, and MongoDB Atlas.

## 🚀 Features

- **Authentication & Authorization** - JWT-based auth system
- **User Management** - Profile management, followers/following
- **Product Management** - CRUD operations for digital assets
- **File Upload** - Cloudinary integration for asset storage
- **Payment Processing** - Stripe integration
- **Real-time Chat** - Socket.io for buyer-seller communication
- **Search & Filtering** - Advanced product search capabilities
- **Review System** - Product reviews and ratings
- **Order Management** - Purchase tracking and digital delivery

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Authentication**: JWT
- **File Storage**: Cloudinary
- **Payments**: Stripe
- **Real-time**: Socket.io
- **Security**: Helmet, CORS, Rate Limiting

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Environment Variables

```env
# Database
MONGODB_URI=your_mongodb_connection_string
DB_NAME=artifex_db

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASS=your_password

# CORS
FRONTEND_URL=http://localhost:5173
```

## 📚 API Documentation

### Health Check
- `GET /api/health` - API health status

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Password reset

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/:id` - Get public profile

### Products
- `GET /api/products` - Get products with filters
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details

## 🚀 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   ├── types/           # TypeScript types
│   └── server.ts        # Main server file
├── dist/                # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Security Features

- Helmet for security headers
- CORS configuration
- Rate limiting
- JWT authentication
- Input validation
- Error handling

## 📝 License

MIT License
