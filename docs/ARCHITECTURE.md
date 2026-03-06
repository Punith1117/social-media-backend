# Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client App    │───▶│   Express API   │───▶│  PostgreSQL DB  │
│                 │    │                 │    │                 │
│ - Frontend      │    │ - JWT Auth      │    │ - Users         │
│ - File Uploads  │    │ - Rate Limiting │    │ - Posts         │
│ - API Calls     │    │ - Validation    │    │ - Comments      │
└─────────────────┘    └─────────────────┘    │ - Likes         │
                                │              │ - Follows       │
                                ▼              └─────────────────┘
                       ┌─────────────────┐
                       │   Cloudinary    │
                       │                 │
                       │ - Profile Photos│
                       │ - File Storage  │
                       └─────────────────┘
```

### Component Breakdown

#### API Layer (Express.js)
- **Routing**: RESTful endpoint design with proper HTTP methods
- **Middleware**: Authentication, validation, rate limiting
- **Controllers**: Business logic and request/response handling
- **Security**: Basic CORS, input validation, JWT verification

#### Database Layer (PostgreSQL + Prisma)
- **ORM**: Prisma for type-safe database operations
- **Schema**: Normalized design with proper relationships
- **Migrations**: Version-controlled database schema changes
- **Connection Management**: Basic connection pooling

#### External Services
- **Cloudinary**: Cloud-based file storage for profile photos
- **JWT**: Stateless authentication with 10-minute token expiration

## Database Schema

### Actual Prisma Models

#### User Model
```prisma
model User {
  id              Int      @id @default(autoincrement())
  username        String   @unique
  password        String
  displayName     String?  // Optional display name
  bio             String?  // Optional bio (max 500 chars)
  profilePhotoUrl String?  // Optional profile photo URL
  createdAt       DateTime @default(now())

  // Relations
  followerRelations  Follow[] @relation("UserFollowers")
  followingRelations Follow[] @relation("UserFollowing")
  posts      Post[]
  likes      Like[]
  comments   Comment[]

  @@map("users")
}
```

#### Post Model
```prisma
model Post {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  comments  Comment[]
  likes     Like[]

  @@index([authorId, createdAt, id])
  @@index([createdAt, id])
  @@map("posts")
}
```

#### Comment Model
```prisma
model Comment {
  id        Int      @id @default(autoincrement())
  content   String   @db.Text
  postId    Int
  authorId  Int
  createdAt DateTime @default(now())

  // Relations
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)
  post   Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@index([postId, createdAt])
  @@index([authorId])
  @@map("comments")
}
```

#### Like Model
```prisma
model Like {
  id        Int      @id @default(autoincrement())
  userId    Int
  postId    Int
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  post Post @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([userId, postId]) // Prevent duplicate likes
  @@index([postId])
  @@index([userId])
  @@map("likes")
}
```

#### Follow Model
```prisma
model Follow {
  id         Int       @id @default(autoincrement())
  followerId Int
  followingId Int
  createdAt  DateTime  @default(now())

  // Relations
  follower  User @relation("UserFollowers", fields: [followerId], references: [id], onDelete: Cascade)
  following User @relation("UserFollowing", fields: [followingId], references: [id], onDelete: Cascade)

  @@unique([followerId, followingId])
  @@index([followingId])
  @@index([followerId])
  @@map("follows")
}
```

## API Design Patterns

### RESTful Implementation

1. **Resource-Based URLs**
   - `/users/{username}` - User resource
   - `/posts/{id}` - Post resource
   - `/posts/{postId}/comments` - Nested comments resource

2. **HTTP Methods**
   - `GET` - Retrieve resources
   - `POST` - Create resources
   - `PUT` - Update resources
   - `DELETE` - Remove resources

3. **Status Codes**
   - `200` - Success
   - `201` - Created
   - `400` - Bad Request
   - `401` - Unauthorized
   - `404` - Not Found
   - `409` - Conflict
   - `500` - Server Error

### Authentication Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Auth Service  │    │   Database      │
│                 │    │                 │    │                 │
│ 1. Login Req    │───▶│ 2. Validate     │───▶│ 3. Check User   │
│ 4. JWT Token    │◀───│ 5. Generate JWT │◀───│ 6. User Data    │
│ 7. Store Token  │    │ 8. Sign Token   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Pagination Implementation

#### Offset-Based Pagination
```javascript
// Used for user posts and comments
GET /posts?page=1&limit=10

Response:
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

#### Cursor-Based Pagination
```javascript
// Used for feeds
GET /feed/home?cursor=abc123&limit=10

Response:
{
  "posts": [...],
  "nextCursor": "def456",
  "hasMore": true
}
```

## Security Implementation

### Authentication Security

1. **Password Hashing**
   - bcrypt with salt rounds (12)
   - Plain text passwords never stored
   - Unique salt per password hash

2. **JWT Implementation**
   - 10-minute token expiration
   - HS256 algorithm

3. **Rate Limiting**
   - Login attempts: 3 per username per 2 minutes
   - Comments: 5 per post per IP per 2 minutes

### Input Security

1. **Validation**
   - Custom validation in controllers
   - Length limits for posts and comments
   - Username format validation

2. **Database Security**
   - Prisma ORM prevents SQL injection
   - Parameterized queries
   - Input sanitization

3. **CORS Configuration**
   ```javascript
   // Current implementation
   app.use(cors({ origin: '*' }));
   ```

## Current Implementation Details

### Error Handling
- Try-catch blocks in controllers
- No centralized error middleware
- Basic error response format

### File Upload
- Cloudinary integration for profile photos
- Multer middleware for upload handling
- Basic file type and size validation

### Database Optimization
- Proper indexing on foreign keys and frequently queried fields
- Composite indexes for feed queries
- Basic connection pooling via Prisma

### Testing
- Integration tests for comments system
- Test helpers for authentication and database setup
- Jest testing framework with Supertest

## Project Structure

```
social-media-backend/
├── controllers/         # Route handlers and business logic
├── middleware/          # Custom middleware (auth, rate limiting)
├── routes/             # API route definitions
├── prisma/             # Database schema and migrations
├── tests/              # Test suite
│   ├── integration/    # Integration tests
│   └── helpers/        # Test utilities
├── config/             # External service configurations
└── docs/               # Documentation
```

## Current Limitations

### Security
- CORS allows all origins
- No request validation middleware
- No centralized error handling
- No input sanitization middleware

### Performance
- No caching layer
- No connection pooling configuration
- No query optimization beyond basic indexing

### Features
- No real-time capabilities
- No notification system
- No content moderation
- No analytics or metrics

### Testing
- Limited test coverage
- Only comments system tested
- No unit tests
- No end-to-end tests

## Future Improvements

### Security Enhancements
- Implement proper CORS configuration
- Add input validation middleware
- Create centralized error handling
- Add request sanitization

### Performance Optimizations
- Implement Redis caching
- Add database connection pooling configuration
- Optimize slow queries
- Add response compression

### Feature Additions
- Real-time notifications with WebSockets
- Content moderation system
- User analytics and metrics
- Advanced search capabilities

### Testing Improvements
- Expand test coverage to all endpoints
- Add unit tests for utilities
- Implement end-to-end testing
- Add performance testing
