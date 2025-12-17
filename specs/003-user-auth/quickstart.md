# Quickstart: Authentication Module

## Overview
This guide explains how to set up and use the authentication module with background profiling for user personalization.

## Prerequisites
- Node.js v18+ installed
- Better Auth account/configured
- Environment variables set up

## Installation

1. **Set up environment variables**:
   ```bash
   # In your .env file
   AUTH_SECRET=your_auth_secret
   AUTH_URL=your_auth_url
   DATABASE_URL=your_database_url
   ```

2. **Install dependencies**:
   ```bash
   npm install @better-auth/node
   npm install @better-auth/adapter-your-database
   ```

## Configuration

1. **Initialize Better Auth**:
   ```typescript
   // authentication/better-auth/config.ts
   import { betterAuth } = from "@better-auth/node";
   import { databaseAdapter } from "@better-auth/adapter-your-database";

   export const auth = betterAuth({
     database: databaseAdapter,
     secret: process.env.AUTH_SECRET,
     emailAndPassword: {
       enabled: true,
       requireEmailVerification: false,
     },
     // Custom user fields for background data
     user: {
       additionalFields: {
         software_experience: {
           type: "string",
           required: false,
           defaultValue: "[]"
         },
         hardware_familiarity: {
           type: "string",
           required: false,
           defaultValue: "[]"
         },
         skill_level: {
           type: "string",
           required: false,
           defaultValue: "beginner"
         },
         years_experience: {
           type: "number",
           required: false,
           defaultValue: 0
         }
       }
     }
   });
   ```

2. **Set up auth client**:
   ```typescript
   // authentication/better-auth/client.ts
   import { createAuthClient } from "@better-auth/node/client";

   export const authClient = createAuthClient({
     baseURL: process.env.AUTH_URL,
     // Client configuration
   });
   ```

## Usage

### Registration with Background Profiling
```typescript
import { auth } from "./better-auth/config";
import { categorizeUser } from "./utils/user-categorization";

// During signup, collect background information
const registerUser = async (userData) => {
  // Extract background data
  const {
    email,
    password,
    software_experience,
    hardware_familiarity,
    years_experience
  } = userData;

  // Categorize user based on background
  const skillLevel = categorizeUser({
    software_experience,
    hardware_familiarity,
    years_experience
  });

  // Create user with Better Auth
  const user = await auth.emailPassword.register({
    email,
    password,
    profileData: {
      software_experience: JSON.stringify(software_experience),
      hardware_familiarity: JSON.stringify(hardware_familiarity),
      skill_level: skillLevel,
      years_experience
    }
  });

  return user;
};
```

### Signin
```typescript
import { auth } from "./better-auth/config";

const signInUser = async (email, password) => {
  const session = await auth.emailPassword.signIn({
    email,
    password
  });

  return session;
};
```

### Profile Management
```typescript
import { auth } from "./better-auth/config";

// Update user profile with new background information
const updateUserProfile = async (userId, profileData) => {
  const updatedUser = await auth.user.updateUser({
    userId,
    data: profileData
  });

  return updatedUser;
};

// Get user profile
const getUserProfile = async (userId) => {
  const user = await auth.user.getUser({
    userId
  });

  return user;
};
```

## API Endpoints

### POST /api/auth/signup
- Request body: `{ email, password, software_experience, hardware_familiarity, years_experience }`
- Response: `{ user, session, skill_level }`

### POST /api/auth/signin
- Request body: `{ email, password }`
- Response: `{ user, session }`

### GET /api/auth/profile
- Requires authentication
- Response: `{ user profile with background data }`

### PUT /api/auth/profile
- Requires authentication
- Request body: `{ updated profile fields }`
- Response: `{ updated user }`

## Testing

```bash
# Run authentication tests
npm run test:auth

# Run integration tests
npm run test:integration:auth
```

## Environment Variables

- `AUTH_SECRET`: Secret key for signing tokens
- `AUTH_URL`: Base URL for auth endpoints
- `DATABASE_URL`: Connection string for user data storage
- `NODE_ENV`: Environment (development/production)