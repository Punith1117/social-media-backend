# Social Media Backend API | Node.js Express REST API

![Node.js](https://img.shields.io/badge/node.js-%23339933.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

A production-ready RESTful API for social media applications built with Node.js, Express, PostgreSQL, and Prisma. This capstone project demonstrates full-stack development capabilities with secure authentication, social features, and scalable architecture.

**Frontend Repository:** [https://github.com/Punith1117/social-media-frontend](https://github.com/Punith1117/social-media-frontend)

## Table of Contents

- [Project Purpose](#-project-purpose)
- [Learning Objectives](#-learning-objectives)
- [Core Features](#-core-features)
- [Project Highlights](#-project-highlights)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Architecture Overview](#-architecture-overview)
- [Project Structure](#-project-structure)
- [Testing](#-testing)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Future Enhancements](#-future-enhancements)

## 🎯 Project Purpose

Built as the final capstone project for The Odin Project's full-stack curriculum, this social media backend showcases the ability to design and implement complex, production-grade APIs that handle authentication, data relationships, file uploads, and performance optimization.

## 💡 Learning Objectives

- **RESTful API Design**: Implemented proper HTTP methods, status codes, and error handling following industry best practices
- **Authentication & Security**: JWT token-based authentication with bcrypt password hashing and rate limiting for security
- **Database Architecture**: Designed PostgreSQL schema with proper indexing, relationships, and cascading deletes using Prisma ORM
- **Test-Driven Development**: Comprehensive testing suite with Jest and Supertest, demonstrating TDD methodology
- **Performance Optimization**: Implemented cursor-based pagination and database indexing for scalable data retrieval
- **File Management**: Integrated Cloudinary for cloud-based file storage with Multer for upload handling
- **Error Handling**: Consistent error response format with proper HTTP status codes and validation

## 🚀 Core Features

- **Secure Authentication** with JWT tokens and bcrypt password hashing
- **User Profiles** with customizable details and profile photos
- **User Search** with partial, case-insensitive username matching
- **Social Networking** with follow/unfollow system
- **Posts System** with create, read, update, delete functionality and pagination
- **Comments System** with create, read, delete functionality and rate limiting
- **Like System** for posts with user-specific like status tracking
- **Feed System** with home feed (followed users) and explore feed (all posts)
- **File Uploads** via Cloudinary integration for profile photos
- **Rate Limiting** for API abuse prevention
- **RESTful Design** following industry best practices

## 📊 Project Highlights

### Technical Challenges Overcome
- **Authentication Flow**: Designed secure JWT-based authentication with 10-minute token expiration
- **Database Relationships**: Implemented complex many-to-many relationships for follow system with proper cascading deletes
- **Performance**: Optimized database queries with indexing and cursor-based pagination for large datasets
- **File Upload Security**: Integrated Cloudinary with validation and error handling for profile photo uploads
- **Rate Limiting**: Implemented custom rate limiting middleware to prevent API abuse

### Testing Strategy
- **Test-Driven Development**: Comprehensive testing approach with Jest and Supertest
- **Comprehensive Coverage**: Integration tests for API endpoints, authentication, and error handling
- **Test Utilities**: Created reusable helpers for authentication and database operations
- **Continuous Testing**: Jest watch mode for development efficiency

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT + Passport.js
- **File Storage**: Cloudinary + Multer
- **Security**: bcrypt, CORS, input validation, rate limiting
- **Testing**: Jest, Supertest (TDD approach)
- **Development**: Prisma Studio, hot reload

## 🚀 Quick Start

**Prerequisites:**
- Node.js 18+
- PostgreSQL

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd social-media-backend
   npm install
   ```

2. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Cloudinary credentials
   ```

3. **Database setup**
   ```bash
   npm run db:generate
   npm run db:migrate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🏗 Architecture Overview

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

## 📁 Project Structure

```
social-media-backend/
├── controllers/         # Route handlers and business logic
├── middleware/          # Custom middleware (auth, rate limiting)
├── routes/             # API route definitions
├── prisma/             # Database schema and migrations
├── tests/              # Test suite and TDD implementation
├── config/             # External service configurations
├── docs/               # Detailed documentation
└── utils.js           # Utility functions
```

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode for development
npm run test:coverage # Coverage report
```

**Test Coverage Areas:**
- Authentication & Authorization
- API Endpoint Validation
- Error Handling
- Database Operations
- Rate Limiting
- File Upload Operations

**Manual API Testing:** Use Postman to test endpoints interactively. Refer to the API documentation for endpoint details.

## 📚 Documentation

- **[API Documentation](docs/API.md)** - Complete API reference with examples
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Production setup and configuration
- **[Architecture Details](docs/ARCHITECTURE.md)** - Technical architecture and design decisions

## 🚀 Deployment

### Production Deployment on Render

This application is configured for production deployment on Render cloud platform with the following implementation:

- **Automated CI/CD Pipeline**: GitHub integration for seamless deployment from code commits
- **Environment Configuration**: Production-ready environment variables with secure secrets management
- **Database Integration**: Supabase PostgreSQL with connection pooling for optimal performance
- **Health Monitoring**: Implemented health check endpoints for deployment monitoring

**Key Production Features:**
- Connection pooling database URLs for high-traffic handling
- Secure environment variable management
- Automatic build and deployment pipeline
- Health check endpoints for monitoring

**Deployment Notes:**
- Configured for Render's free tier (30-60s wake time from sleep mode)

## 🚀 Future Enhancements

- **Real-time Features**: WebSocket integration for live notifications (planned)
- **Caching Layer**: Redis implementation for performance optimization
- **Analytics**: User engagement and content performance metrics
- **Microservices**: Split into user service, post service, etc.
- **GraphQL**: Alternative API interface for complex queries

---

**Built with ❤️ as a capstone project for The Odin Project**
