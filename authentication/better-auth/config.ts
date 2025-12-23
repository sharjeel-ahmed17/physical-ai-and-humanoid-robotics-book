// Better Auth configuration for user authentication with background profiling
import { betterAuth } from 'better-auth';
import { env } from '../src/config/env';

// Validate that required environment variables are set
if (!process.env.AUTH_SECRET && !env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for authentication');
}

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL environment variable is not set - using in-memory storage (development only)');
}

// Basic Better Auth configuration without database for now
export const auth = betterAuth({
  secret: process.env.AUTH_SECRET || env.AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Disable for development
  },
  session: {
    expiresIn: 24 * 60 * 60, // 24 hours in seconds
    updateAge: 60 * 60, // Update session every hour
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 // 1 hour cache
    }
  },
  advanced: {
    generateId: () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  },
});

// Additional security utilities
export const validateAuthConfig = () => {
  // Validate that sensitive environment variables are properly set
  const requiredEnvVars = ['AUTH_SECRET'];
  const missingEnvVars = requiredEnvVars.filter(envVar =>
    !process.env[envVar] && !env[envVar]
  );

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Validate that auth secret is sufficiently long
  const authSecret = process.env.AUTH_SECRET || env.AUTH_SECRET;
  if (authSecret && authSecret.length < 32) {
    console.warn('AUTH_SECRET should be at least 32 characters for security');
  }
};

// Run validation on config initialization
validateAuthConfig();

// Export auth instance
export default auth;
