# Deployment Guide

## Environment Setup

### Required Environment Variables

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

**Variable Descriptions:**
- **PORT**: Server port (default: 3000)
- **DATABASE_URL**: PostgreSQL connection string
- **JWT_SECRET**: Secret key for JWT tokens (use strong string in production)
- **CLOUDINARY_CLOUD_NAME**: Get from Cloudinary dashboard
- **CLOUDINARY_API_KEY**: Get from Cloudinary dashboard  
- **CLOUDINARY_API_SECRET**: Get from Cloudinary dashboard

## Quick Start

### 1. Clone and Install
```bash
git clone <repository-url>
cd social-media-backend
npm install
```

### 2. Environment Setup
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Database Setup
```bash
npm run db:generate
npm run db:migrate
```

### 4. Start Server
```bash
npm run dev
```

## Database Setup

### PostgreSQL Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

#### macOS
```bash
brew install postgresql
brew services start postgresql
```

#### Windows
Download and install from [postgresql.org](https://postgresql.org/download/windows/)

### Database Creation
```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE social_media_db;
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE social_media_db TO your_username;
\q
```

### Database Migrations
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# View database in Prisma Studio
npm run db:studio
```

## Cloudinary Setup

### 1. Create Account
- Sign up at [cloudinary.com](https://cloudinary.com)
- Verify email address

### 2. Get Credentials
- Navigate to Dashboard → Settings → API Keys
- Copy Cloud name, API Key, and API Secret

### 3. Configure Environment
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Production Deployment

### Environment Preparation
```bash
export NODE_ENV=production
```

### Security Considerations

1. **Environment Variables**
   - Use strong, unique JWT_SECRET
   - Never commit `.env` files
   - Use secrets management in production

2. **CORS Configuration**
   - Update CORS origins for production domains
   - Current implementation allows all origins (update for security)

## Testing the Deployment

### Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{ "status": "ok" }
```

### API Test
```bash
# Test user registration
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass123"}'
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify PostgreSQL is running
   - Confirm database exists

2. **JWT Token Errors**
   - Verify JWT_SECRET is set
   - Check token expiration (10 minutes)

3. **Cloudinary Upload Errors**
   - Verify API credentials
   - Check file size limits
   - Confirm file formats


## Security Checklist

- [ ] Strong JWT_SECRET in production
- [ ] Database connections use SSL
- [ ] CORS configured for specific domains
- [ ] Environment variables secured
- [ ] Error logging enabled
- [ ] Rate limiting configured
- [ ] File upload validation
- [ ] Input validation implemented
