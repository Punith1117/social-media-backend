# Social Media Backend API | Node.js Express REST API

A scalable RESTful API for social media applications built with Node.js, Express, PostgreSQL, and Prisma. Features JWT authentication, user profiles, file uploads, and social networking functionality. This project serves as the backend for a full-stack social media clone developed as the final capstone project for The Odin Project's curriculum.

## 🚀 Features

- **Secure Authentication** with JWT tokens and bcrypt password hashing
- **User Profiles** with customizable details and profile photos
- **Social Networking** with follow/unfollow system
- **Posts System** with create, read, update, delete functionality and pagination
- **Comments System** with create, read, delete functionality and pagination
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

### 📝 Post Routes
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/posts` | Yes | Create a new post |
| GET | `/posts/:id` | No | Get post by ID |
| PUT | `/posts/:id` | Yes | Update post (author only) |
| DELETE | `/posts/:id` | Yes | Delete post (author only) |
| POST | `/posts/:postId/like` | Yes | Like a post |
| DELETE | `/posts/:postId/like` | Yes | Unlike a post |
| GET | `/users/:username/posts` | No | Get posts by username (paginated) |
| GET | `/users/me/posts` | Yes | Get current user's posts (paginated) |

### 💬 Comment Routes
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/posts/:postId/comments` | Yes | Create comment on post |
| GET | `/posts/:postId/comments` | No | Get comments for post (paginated) |
| DELETE | `/comments/:commentId` | Yes | Delete comment (author only) |

### 🏥 Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status check |

## 🔐 Authentication Flow

1. Register via `POST /auth/signup`
2. Login via `POST /auth/login` to get JWT token
3. Include token in Authorization header for protected routes
4. Token expires after 10 minutes - re-login required

## 📝 Comment System

### Comment Data Model
```json
{
  "id": 1,
  "content": "This is a comment",
  "postId": 123,
  "authorId": 456,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": 456,
    "username": "johndoe",
    "displayName": "John Doe"
  }
}
```

### Create Comment
```http
POST /posts/:postId/comments
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "content": "This is a great post!"
}
```

**Success Response (201):**
```json
{
  "id": 789,
  "content": "This is a great post!",
  "postId": 123,
  "authorId": 456,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": 456,
    "username": "johndoe",
    "displayName": "John Doe"
  }
}
```

### Get Comments
```http
GET /posts/:postId/comments?page=1&limit=10
```

**Success Response (200):**
```json
{
  "comments": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### Delete Comment
```http
DELETE /comments/:commentId
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Comment deleted successfully",
  "deletedCommentId": 789
}
```

**Comment Rules:**
- Comments limited to 100 characters
- Newest comments appear first
- Only comment authors can delete their comments
- Public read access to comments
- Pagination supported

## 📝 Post System

### Post Data Model
```json
{
  "id": 1,
  "content": "This is the post content",
  "authorId": 123,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "author": {
    "id": 123,
    "username": "johndoe",
    "displayName": "John Doe",
    "profilePhotoUrl": "https://example.com/photo.jpg"
  },
  "likesCount": 42,
  "isLikedByCurrentUser": true
}
```

### Like Endpoints

#### Like a Post
```http
POST /posts/:postId/like
Authorization: Bearer <jwt-token>
```

**Success Response (201):**
```json
{
  "message": "Post liked successfully",
  "likeId": 123
}
```

**Error Responses:**
```json
// 409 - Already liked
{ "error": "Post already liked", "field": "postId" }

// 404 - Post not found
{ "error": "Post not found", "field": "postId" }

// 401 - Unauthorized
{ "error": "Invalid or expired token" }

// 400 - Invalid post ID
{ "error": "Invalid post ID", "field": "postId" }
```

#### Unlike a Post
```http
DELETE /posts/:postId/like
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
{
  "message": "Post unliked successfully", 
  "likeId": 123
}
```

**Error Responses:**
```json
// 404 - Like not found
{ "error": "Like not found", "field": "postId" }

// 401 - Unauthorized
{ "error": "Invalid or expired token" }

// 400 - Invalid post ID
{ "error": "Invalid post ID", "field": "postId" }
```

### Pagination
For paginated endpoints, use query parameters:
- `page`: Page number (default: 1, min: 1)
- `limit`: Items per page (default: 10, min: 1, max: 50)

Response format:
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

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
├── controllers/         # Route handlers (auth, posts, users, follows)
├── middleware/          # Custom middleware (auth, upload)
├── prisma/             # Database schema, migrations, and client
├── routes/             # API routes (auth, posts, users, follows)
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore patterns
├── databaseQueries.js  # Database operations
├── package.json        # Dependencies and scripts
├── prisma.config.ts    # Prisma configuration
├── server.js          # Server entry point
├── utils.js           # Utility functions
└── README.md          # This file
```

## 🗄 Database Schema

The application uses PostgreSQL with following main models:
- **User**: User profiles with authentication and details
- **Post**: Social media posts with content and timestamps
- **Follow**: Many-to-many relationship for following system
- **Comment**: User comments on posts with author information
- **Like**: User likes on posts and comments

All models include proper indexing, cascading deletes, and constraints for data integrity.
