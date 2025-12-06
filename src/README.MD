# Authentication + API Key System

A production-ready authentication system built with NestJS and PostgreSQL that supports both JWT-based user authentication and API key-based service-to-service communication.

## Features

- **User Authentication** - Secure signup/login with JWT tokens
- **API Key Management** - Generate, list, and revoke API keys for services
- **Flexible Authentication** - Support for both JWT and API key authentication
- **Security Best Practices** - Password hashing, token expiration, key revocation
- **Multiple Expiration Options** - Set expiration by date or days from now
- **TypeScript** - Full type safety throughout the application

##  Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

### 1. Clone and Install Dependencies

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @nestjs/typeorm typeorm pg
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @nestjs/config
npm install bcrypt class-validator class-transformer
npm install --save-dev @types/bcrypt @types/passport-jwt
```

### 2. Database Setup

```bash
# Create database
createdb auth_system

# Or via psql
psql -U postgres
CREATE DATABASE auth_system;
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=auth_system
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 4. Run the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start on `http://localhost:3000`

##  API Documentation

### Authentication Endpoints

#### Signup
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** Same as signup

### API Key Management

#### Create API Key (Requires JWT)
```http
POST /keys/create
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "name": "My Service Key",
  "expiresAt": "2025-12-31"
}
```

**Expiration Options:**
- `"expiresAt": "2025-12-31T23:59:59Z"` - Full ISO timestamp
- `"expiresAt": "2025-12-31"` - Date only
- Omit both for no expiration

**Response:**
```json
{
  "message": "API key created successfully",
  "apiKey": {
    "id": "uuid",
    "key": "sk_abc123...",
    "name": "My Service Key",
    "expiresAt": "2026-01-05T00:00:00.000Z",
    "createdAt": "2025-12-06T00:00:00.000Z"
  }
}
```

 **Save the `key` immediately! It's only shown once.**

#### List API Keys (Requires JWT)
```http
GET /keys
Authorization: Bearer YOUR_JWT_TOKEN
```

**Response:**
```json
{
  "apiKeys": [
    {
      "id": "uuid",
      "name": "My Service Key",
      "expiresAt": "2026-01-05T00:00:00.000Z",
      "revoked": false,
      "createdAt": "2025-12-06T00:00:00.000Z"
    }
  ]
}
```

#### Revoke API Key (Requires JWT)
```http
DELETE /keys/:id/revoke
Authorization: Bearer YOUR_JWT_TOKEN
```

### Protected Routes

#### User-Only Route (JWT Required)
```http
GET /protected/user-only
Authorization: Bearer YOUR_JWT_TOKEN
```

#### Service-Only Route (API Key Required)
```http
GET /protected/service-only
x-api-key: sk_your_api_key_here
```

#### Flexible Route (JWT or API Key)
```http
GET /protected/flexible
Authorization: Bearer YOUR_JWT_TOKEN
# OR
x-api-key: sk_your_api_key_here
```

#### Public Route (No Auth)
```http
GET /protected/public
```

##  Testing with Postman

### 1. Setup Environment Variables
Create a Postman environment with:
- `jwt_token` - Your JWT token
- `api_key` - Your API key

### 2. Auto-Save Tokens
In the **Tests** tab after signup/login:
```javascript
pm.environment.set("jwt_token", pm.response.json().token);
```

After creating API key:
```javascript
pm.environment.set("api_key", pm.response.json().apiKey.key);
```

### 3. Use Variables in Headers
- JWT: `Authorization: Bearer {{jwt_token}}`
- API Key: `x-api-key: {{api_key}}`

## 🏗️ Project Structure

```
src/
├── entities/
│   ├── user.entity.ts          # User database model
│   └── api-key.entity.ts       # API Key database model
├── auth/
│   ├── auth.module.ts          # Auth module configuration
│   ├── auth.controller.ts      # Signup/Login endpoints
│   ├── auth.service.ts         # Authentication logic
│   └── dto/
│       └── auth.dto.ts         # Request validation DTOs
├── keys/
│   ├── keys.module.ts          # API Keys module
│   ├── keys.controller.ts      # Key management endpoints
│   ├── keys.service.ts         # Key creation/validation logic
│   └── dto/
│       └── create-api-key.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts       # JWT authentication guard
│   ├── api-key.guard.ts        # API Key authentication guard
│   └── flexible-auth.guard.ts  # Both JWT and API Key guard
├── protected/
│   ├── protected.module.ts     # Demo protected routes module
│   └── protected.controller.ts # Example protected endpoints
├── app.module.ts               # Root application module
└── main.ts                     # Application entry point
```

##  Security Features

- **Password Hashing** - Bcrypt with salt rounds for secure password storage
- **JWT Expiration** - Tokens expire after 24 hours
- **API Key Expiration** - Custom expiration dates for each key
- **Key Revocation** - Instantly disable compromised keys
- **Input Validation** - Class-validator ensures data integrity
- **Type Safety** - TypeScript prevents runtime errors

##  Database Schema

### Users Table
| Column    | Type      | Description              |
|-----------|-----------|--------------------------|
| id        | UUID      | Primary key              |
| email     | VARCHAR   | Unique email address     |
| password  | VARCHAR   | Hashed password          |
| isActive  | BOOLEAN   | Account status           |
| createdAt | TIMESTAMP | Account creation date    |

### API Keys Table
| Column    | Type      | Description              |
|-----------|-----------|--------------------------|
| id        | UUID      | Primary key              |
| key       | VARCHAR   | Unique API key (indexed) |
| name      | VARCHAR   | Key description          |
| expiresAt | TIMESTAMP | Expiration date (nullable)|
| revoked   | BOOLEAN   | Revocation status        |
| createdAt | TIMESTAMP | Creation date            |
| userId    | UUID      | Foreign key to users     |

##  Use Cases

### User Authentication Flow
1. User signs up → receives JWT token
2. User includes token in `Authorization: Bearer <token>` header
3. Access user-specific routes and resources

### Service-to-Service Flow
1. Admin creates API key via authenticated endpoint
2. Service stores key securely
3. Service includes key in `x-api-key` header for requests
4. Access service-specific routes without user context

### Flexible Authentication
Some routes accept both methods:
- Web dashboard uses JWT (user session)
- Background services use API keys
- Same endpoint, different auth methods

## Configuration

### JWT Settings
Edit in `auth/auth.module.ts`:
```typescript
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: { expiresIn: '24h' }, // Change token lifetime
})
```

### Database Settings
Edit in `app.module.ts`:
```typescript
TypeOrmModule.forRoot({
  synchronize: true, // Set to false in production
  // Use migrations instead
})
```

##  Production Checklist

- [ ] Change `JWT_SECRET` to cryptographically secure random string
- [ ] Set `synchronize: false` in TypeORM configuration
- [ ] Set up database migrations
- [ ] Add rate limiting (e.g., @nestjs/throttler)
- [ ] Enable HTTPS/TLS
- [ ] Add request logging
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Add helmet for security headers
- [ ] Implement refresh tokens
- [ ] Add API documentation (Swagger)
- [ ] Set up CI/CD pipeline

##  Common Issues

### "Cannot find module '@nestjs/common'"
```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
```

### "Connection refused" database error
Ensure PostgreSQL is running:
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Check connection
psql -U postgres -h localhost
```

### "Invalid token" errors
- Token may have expired (24h default)
- Check JWT_SECRET matches between signup and validation
- Ensure token is properly formatted: `Bearer <token>`

##  Technology Stack

- **NestJS** - Progressive Node.js framework with TypeScript
- **TypeORM** - ORM for type-safe database operations
- **PostgreSQL** - Relational database
- **JWT** - Stateless authentication tokens
- **Bcrypt** - Password hashing
- **Class Validator** - DTO validation

## 📄 License

MIT

## 👤 Author

Built for service-to-service authentication requirements

---

**Need help?** Check the API examples above or create an issue.