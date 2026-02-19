# Social Media Backend API | Node.js Express REST API

A scalable RESTful API for social media applications built with Node.js, Express, PostgreSQL, and Prisma. Features JWT authentication, user profiles, file uploads, and social networking functionality. This project serves as the backend for a full-stack social media clone developed as the final capstone project for The Odin Project's curriculum.

## 🚀 Features

- **Secure Authentication** with JWT tokens and bcrypt password hashing
- **User Profiles** with customizable details and profile photos
- **Social Networking** with follow/unfollow system
- **File Uploads** via Cloudinary integration
- **RESTful Design** following best practices
- **Database Management** with Prisma ORM

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js
- **File Storage**: Cloudinary + Multer
- **Security**: bcrypt, CORS, input validation
- **Development**: Prisma Studio, hot reload

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd social-media-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` file with your configuration.

4. **Set up the database**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```
   Database schema is defined in prisma/schema.prisma and managed via Prisma migrations.

5. **Start the server**
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/social_media_db?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Required Variables:**
- **PORT**: Server port (default: 3000)
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT tokens (use strong string in production)
- **CLOUDINARY_CLOUD_NAME**: Get from Cloudinary dashboard
- **CLOUDINARY_API_KEY**: Get from Cloudinary dashboard  
- **CLOUDINARY_API_SECRET**: Get from Cloudinary dashboard

## 📡 API Endpoints

### Base URL
```
http://localhost:3000
```

### Authentication Header
```
Authorization: Bearer <your-jwt-token>
```

### 🔐 Auth Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | User registration |
| POST | `/auth/login` | User login |

### 👤 User Routes
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/users/me` | Yes | Get current user profile |
| PUT | `/users/me` | Yes | Update user profile |
| POST | `/users/me/photo` | Yes | Upload profile photo |
| DELETE | `/users/me/photo` | Yes | Delete profile photo |
| GET | `/users/:username` | No | Get public user profile |

### 🤝 Follow Routes
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/follow/:followingId` | Yes | Follow a user |
| DELETE | `/follow/:followingId` | Yes | Unfollow a user |
| GET | `/follow/followers/:userId` | No | Get followers list |
| GET | `/follow/following/:userId` | No | Get following list |
| GET | `/follow/stats/:userId` | No | Get follow statistics |

### 🏥 Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status check |

## 🔐 Authentication Flow

1. Register via `POST /auth/signup`
2. Login via `POST /auth/login` to get JWT token
3. Include token in Authorization header for protected routes
4. Token expires after 10 minutes - re-login required

## ❌ Error Handling

All errors follow this format:
```json
{
  "error": "Error message description",
  "field": "field_name" // Optional for validation errors
}
```

**Common Status Codes:**
- `400` - Invalid input data
- `401` - Invalid credentials/token
- `409` - Resource already exists
- `500` - Server error

## 📁 Project Structure

```
social-media-backend/
├── config/              # Cloudinary configuration
├── controllers/         # Route handlers
├── middleware/          # Custom middleware (auth, upload)
├── prisma/             # Database schema and migrations
├── routes/             # API routes
├── .env.example        # Environment variables template
├── databaseQueries.js  # Database operations
├── server.js          # Server entry point
└── utils.js           # Utility functions
```

