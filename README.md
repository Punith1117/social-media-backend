# Social Media Backend API

A RESTful API for social media applications built with Node.js, Express, PostgreSQL, and Prisma. This API provides user authentication functionality with JWT tokens.

## Project Overview

This backend API serves as the foundation for a social media application, providing secure user authentication and a scalable architecture for future features.

## Tech Stack

- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcrypt for password hashing
- **Development**: Prisma Studio for database management

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
```

- **PORT**: Server port number (default: 3000)
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT token signing (use a strong, random string in production)

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Authentication
Include Bearer token in Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### User Registration
**POST** `/auth/signup`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "Password123"
}
```

**Response (201 Created):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 1,
    "username": "john_doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### User Login
**POST** `/auth/login`

**Request Body:**
```json
{
  "username": "john_doe",
  "password": "Password123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "john_doe",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation Rules:**
- Username: 3-20 characters, alphanumeric and underscores only
- Password: Minimum 5 characters, must contain uppercase, lowercase, and number

## Authentication Flow

1. User registers via `/auth/signup`
2. User logs in via `/auth/login` with credentials
3. Server validates credentials and returns JWT token
4. Token expires after 10 minutes
5. User must login again to get new token

## Error Format

All error responses follow this structure:

```json
{
  "error": "Error message description",
  "field": "field_name" // Optional, for validation errors
}
```

**Common Status Codes:**
- **400**: Invalid input data
- **401**: Invalid credentials or token
- **409**: Resource already exists
- **500**: Server error

## Project Structure

```
social-media-backend/
├── controllers/           # Route handlers
├── middleware/           # Custom middleware
├── prisma/              # Database configuration
├── routes/              # API routes
├── .env.example         # Environment variables template
├── databaseQueries.js   # Database operations
├── server.js           # Server entry point
└── utils.js            # Utility functions
```
