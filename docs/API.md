# API Documentation

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
| GET | `/users/` | No | Search users by username |
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

### 📰 Feed Routes
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/feed/home` | Yes | Get home feed (posts from followed users) |
| GET | `/feed/explore` | No | Get explore feed (all posts, public) |

### 🏥 Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server status check |

## 🔍 User Search System

### Search Endpoint
```http
GET /users/?q=search_query
```

**Description**: Search for users by username with partial, case-insensitive matching.

**Parameters:**
- `q` (query parameter): Search query string
  - **Required**: Yes
  - **Minimum length**: 3 characters
  - **Maximum length**: 20 characters  
  - **Allowed characters**: lowercase letters, numbers, underscores
  - **Format**: Matches username validation patterns

**Search Behavior:**
- **Partial matching**: Searches anywhere within username
- **Case-insensitive**: `john` matches `JohnDoe`, `johnsmith`, etc.
- **Alphabetical sorting**: Results sorted by username A-Z

**Response Format:**
```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "displayName": "John Doe",
      "profilePhotoUrl": "https://example.com/photo.jpg"
    },
    {
      "id": 2,
      "username": "johnsmith",
      "displayName": "John Smith", 
      "profilePhotoUrl": null
    }
  ]
}
```

**Example Requests:**

**Search for users containing "john":**
```http
GET /users/?q=john
```

**Search for users containing "dev":**
```http
GET /users/?q=dev
```

**Success Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "developer123",
      "displayName": "Developer",
      "profilePhotoUrl": "https://example.com/dev.jpg"
    },
    {
      "id": 2,
      "username": "dev_user",
      "displayName": "Dev User",
      "profilePhotoUrl": null
    }
  ]
}
```

**Empty Results (200):**
```json
{
  "users": []
}
```

**Error Responses:**

**Missing query parameter (400):**
```json
{
  "error": "Search query is required",
  "field": "q"
}
```

**Query too short (400):**
```http
GET /users/?q=ab
```
```json
{
  "error": "Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores",
  "field": "q"
}
```

**Invalid characters (400):**
```http
GET /users/?q=John@
```
```json
{
  "error": "Username must be 3-20 characters long and contain only lowercase letters, numbers, and underscores",
  "field": "q"
}
```

**Database error (500):**
```json
{
  "error": "Database operation failed"
}
```

**Search Examples:**
- `q=john` → Matches: `johndoe`, `johnsmith`, `myjohn`, `john123`
- `q=dev` → Matches: `developer`, `dev_user`, `code_dev`, `devmaster`
- `q=123` → Matches: `user123`, `test123`, `admin123`
- `q=_` → Matches: `user_name`, `test_user`, `admin_account`

**Performance Notes:**
- Username field is indexed for fast lookups
- Results limited to essential user data fields
- Case-insensitive search optimized for performance

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

**Note:** The author object structure varies by endpoint:
- **Create Comment** returns: `id`, `username`, `displayName`
- **Get Comments** returns: `id`, `username`, `profilePhotoUrl`

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
  "comments": [
    {
      "id": 789,
      "content": "This is a great post!",
      "postId": 123,
      "authorId": 456,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": 456,
        "username": "johndoe",
        "profilePhotoUrl": "https://example.com/photo.jpg"
      }
    }
  ],
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

### Get Post by ID
```http
GET /posts/:id
```

**Description:** Retrieve a single post by its ID. Includes author information, like count, and like status for authenticated users.

**Success Response (200):**
```json
{
  "post": {
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
}
```

**Error Responses:**
```json
// 400 - Invalid post ID
{ "error": "Invalid post ID", "field": "id" }

// 404 - Post not found
{ "error": "Post not found", "field": "id" }

// 500 - Server error
{ "error": "Database operation failed" }
```

**Features:**
- **Public Access**: No authentication required
- **Author Information**: Includes author's username, display name, and profile photo
- **Like Status**: For authenticated users, includes whether the current user has liked the post
- **Like Count**: Always includes total number of likes on the post

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

## 📰 Feed System

The feed system provides two endpoints for consuming social media content with cursor-based pagination for optimal performance.

### Feed Data Model
```json
{
  "posts": [
    {
      "id": 1,
      "content": "This is a post",
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
      "commentsCount": 8,
      "isLikedByCurrentUser": true
    }
  ],
  "nextCursor": "eyJpZCI6MTIzLCJjcmVhdGVkQXQiOiIyMDI0LTAxLTAxVDAwOjAwOjAwLjAwMFoifQ==",
  "hasMore": true
}
```

### Cursor Pagination

Both feed endpoints use cursor-based pagination for optimal performance:

**Query Parameters:**
- `cursor` (optional): Base64-encoded cursor string for pagination
- `limit` (optional): Number of posts to return (default: 10, max: 50)

**Cursor Format:**
The cursor is a base64-encoded JSON object containing:
```json
{
  "id": 123,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Pagination Flow:**
1. **First Request**: No cursor required
2. **Subsequent Requests**: Use `nextCursor` from previous response
3. **End of Feed**: `hasMore` will be `false` and `nextCursor` will be `null`

### 🏠 Home Feed

**Endpoint:** `GET /feed/home`

**Description:** Returns posts from users that the authenticated user follows. Requires authentication.

**Request:**
```http
GET /feed/home?limit=10
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "content": "Great weather today!",
      "authorId": 456,
      "createdAt": "2024-01-01T12:00:00.000Z",
      "updatedAt": "2024-01-01T12:00:00.000Z",
      "author": {
        "id": 456,
        "username": "jane_doe",
        "displayName": "Jane Doe",
        "profilePhotoUrl": "https://example.com/jane.jpg"
      },
      "likesCount": 15,
      "commentsCount": 3,
      "isLikedByCurrentUser": true
    }
  ],
  "nextCursor": "eyJpZCI6MSwiY3JlYXRlZEF0IjoiMjAyNC0wMS0wMVQxMjowMDowMC4wMDBaIn0=",
  "hasMore": true
}
```

**Features:**
- **Authentication Required**: Only authenticated users can access
- **Followed Users Only**: Shows posts from users you follow
- **Like Status**: Always includes `isLikedByCurrentUser` (true/false)
- **Performance**: Optimized with database indexes and batch queries

**Error Responses:**
```json
// 401 - Not authenticated
{ "error": "Invalid or expired token" }

// 400 - Invalid limit
{ "error": "Invalid limit (must be between 1 and 50)", "field": "limit" }

// 400 - Invalid cursor
{ "error": "Invalid or malformed cursor", "field": "cursor" }
```

### 🔍 Explore Feed

**Endpoint:** `GET /feed/explore`

**Description:** Returns all posts ordered by most recent. Public endpoint with optional authentication.

**Request (Unauthenticated):**
```http
GET /feed/explore?limit=10
```

**Request (Authenticated):**
```http
GET /feed/explore?limit=10
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "posts": [
    {
      "id": 2,
      "content": "Hello world!",
      "authorId": 789,
      "createdAt": "2024-01-01T13:00:00.000Z",
      "updatedAt": "2024-01-01T13:00:00.000Z",
      "author": {
        "id": 789,
        "username": "bob_smith",
        "displayName": "Bob Smith",
        "profilePhotoUrl": null
      },
      "likesCount": 8,
      "commentsCount": 1,
      "isLikedByCurrentUser": false
    }
  ],
  "nextCursor": "eyJpZCI6MiwiY3JlYXRlZEF0IjoiMjAyNC0wMS0wMVQxMzowMDowMC4wMDBaIn0=",
  "hasMore": true
}
```

**Features:**
- **Public Access**: No authentication required
- **All Posts**: Shows posts from all users
- **Optional Auth**: Like status only available for authenticated users
- **Like Status**: 
  - Authenticated: `isLikedByCurrentUser` = true/false
  - Unauthenticated: `isLikedByCurrentUser` = false
- **Performance**: Optimized with dedicated database index

### 🔄 Pagination Examples

**First Request:**
```http
GET /feed/explore?limit=5
```

**Response:**
```json
{
  "posts": [...],
  "nextCursor": "eyJpZCI6NSwiY3JlYXRlZEF0IjoiMjAyNC0wMS0wMVQxNDowMDowMC4wMDBaIn0=",
  "hasMore": true
}
```

**Next Request:**
```http
GET /feed/explore?limit=5&cursor=eyJpZCI6NSwiY3JlYXRlZEF0IjoiMjAyNC0wMS0wMVQxNDowMDowMC4wMDBaIn0=
```

**Final Page:**
```json
{
  "posts": [...],
  "nextCursor": null,
  "hasMore": false
}
```
