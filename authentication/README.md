# Authentication Module

This module provides secure user authentication with background profiling capabilities for the Physical AI and Humanoid Robotics Textbook project.

## Overview

The authentication module implements secure signup and signin functionality using Better Auth with collection of user software and hardware background during signup for future personalization. The implementation includes user profile schema with background data fields, authentication services, and user categorization logic to determine beginner/intermediate/advanced levels based on responses.

## Features

- **Secure User Registration**: New users can register with email and password, plus provide background information
- **Background Profiling**: Collection of user's software and hardware experience during signup
- **User Categorization**: Automatic categorization as beginner/intermediate/advanced based on background data
- **Secure Signin**: Existing users can securely authenticate
- **Profile Management**: Authenticated users can update their background information
- **Input Sanitization**: All user inputs are sanitized to prevent injection attacks
- **Rate Limiting**: Protection against brute force attacks
- **Security Headers**: Additional security protections for web attacks

## Architecture

```
authentication/
├── better-auth/
│   ├── config.ts          # Better Auth configuration with security settings
│   ├── client.ts          # Auth client setup
│   └── middleware.ts      # Security middleware with headers and protections
├── models/
│   ├── user-profile.ts    # User profile schema with background data
│   └── auth-session.ts    # Authentication session model
├── services/
│   ├── auth-service.ts    # Authentication business logic
│   ├── profile-service.ts # Profile management service
│   └── validation.ts      # Input validation and sanitization
├── types/
│   └── auth-types.ts      # Authentication-related type definitions
├── utils/
│   └── user-categorization.ts # Logic for categorizing users
└── tests/
    ├── signup.test.ts     # Unit tests for signup functionality
    ├── signin.test.ts     # Unit tests for signin functionality
    ├── profile.test.ts    # Unit tests for profile management
    └── auth-integration.test.ts # Integration tests for auth flows
```

## Dependencies

- Better Auth: For authentication management
- Neon Database: For persistent user data storage
- Drizzle ORM: For database operations
- Zod: For data validation

## Configuration

The authentication module requires the following environment variables:

- `AUTH_SECRET`: Secret key for signing tokens (minimum 32 characters)
- `DATABASE_URL`: Connection string for user data storage
- `FROM_EMAIL`: Email address used for sending verification emails
- `NODE_ENV`: Environment (development/production)

Create a `.env` file based on `.env.example` with your specific configuration:

```bash
AUTH_SECRET=your_secret_key
DATABASE_URL=your_neon_database_connection_string
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up your Neon database and update the DATABASE_URL in your .env file

3. Run database migrations:
```bash
npx drizzle-kit push
```

## Security Features

- **Input Sanitization**: All inputs are sanitized using HTML entity encoding and malicious pattern removal
- **Session Security**: Secure cookies with HttpOnly, SameSite, and Secure flags
- **Rate Limiting**: Protection against brute force attacks (5 signup attempts per 15 minutes)
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, number, and special character
- **CSRF Protection**: Enabled to prevent cross-site request forgery
- **XSS Protection**: Security headers to prevent cross-site scripting
- **Email Verification**: Required for production security

## API Endpoints

- `POST /api/auth/signup`: Register a new user with background profiling data
- `POST /api/auth/signin`: Authenticate an existing user
- `GET /api/auth/profile`: Retrieve the authenticated user's profile
- `PUT /api/auth/profile`: Update the authenticated user's profile
- `POST /api/auth/signout`: End the current user session

## Error Handling

All error responses follow this format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details (optional)"
  }
}
```

## Common Error Codes

- `INVALID_INPUT`: Request data doesn't meet validation requirements
- `UNAUTHORIZED`: Authentication required or failed
- `RESOURCE_NOT_FOUND`: Requested resource doesn't exist
- `CONFLICT`: Request conflicts with existing data (e.g., duplicate email)
- `RATE_LIMITED`: Too many requests from the same source
- `INTERNAL_ERROR`: Server-side error occurred

## Testing

Run authentication tests with:

```bash
npm run test:auth
npm run test:integration:auth
```

## User Categorization

Users are automatically categorized as beginner, intermediate, or advanced based on their provided background information:

- **Beginner**: Less than 1 year of experience in software or hardware
- **Intermediate**: 1-3 years of experience in software or hardware
- **Advanced**: More than 3 years of experience in software or hardware

## Deployment

For production deployment, ensure:

1. Environment variables are properly configured
2. Email verification is enabled
3. Two-factor authentication is considered
4. Database connection is secure
5. Proper SSL certificates are in place
6. Rate limits are appropriately configured for your traffic