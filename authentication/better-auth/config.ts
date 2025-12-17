// Better Auth configuration for user authentication with background profiling
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { env } from '../../src/config/env';

// Validate that required environment variables are set
if (!process.env.AUTH_SECRET && !env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required for authentication');
}

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL environment variable is not set');
}

// If using Neon database, you would import and configure the Neon adapter
// import { neon } from 'pg';
// const db = neon(process.env.DATABASE_URL!);

// For now, using a generic database adapter setup
// In a real implementation, you would use the appropriate adapter for your database
// import { db } from './db'; // Your database instance

export const auth = betterAuth({
  database: drizzleAdapter(/* db, {
    // User schema customization for background profiling
    user: {
      // Add custom fields for background data
      software_experience: 'jsonb',
      hardware_familiarity: 'jsonb',
      skill_level: 'text',
      years_experience: 'integer',
      interests: 'jsonb',
      learning_path: 'text',
    }
  } */), // Placeholder - actual adapter would be configured based on your database
  secret: process.env.AUTH_SECRET || env.AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Enable for production security
  },
  account: {
    accountLinking: {
      enabled: true,
    },
  },
  session: {
    expires: 24 * 60 * 60, // 24 hours (reduced from 7 days for security)
    updateAge: 60 * 60, // Update session every hour
    cookie: {
      // Secure cookie settings
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      sameSite: 'strict', // Prevent CSRF
      httpOnly: true, // Prevent XSS
    },
  },
  socialProviders: {
    // Add social providers if needed
  },
  email: {
    // Configure email settings
    from: process.env.FROM_EMAIL || 'noreply@yourdomain.com',
    // Enable rate limiting for emails
    maxFrequency: 5, // Max 5 emails per hour per user
  },
  // Custom user fields for background data collection
  user: {
    additionalFields: {
      software_experience: {
        type: 'string', // In practice, this would be JSON, but storing as string for compatibility
        required: false,
        defaultValue: '[]'
      },
      hardware_familiarity: {
        type: 'string', // In practice, this would be JSON, but storing as string for compatibility
        required: false,
        defaultValue: '[]'
      },
      skill_level: {
        type: 'string',
        required: false,
        defaultValue: 'beginner'
      },
      years_experience: {
        type: 'number',
        required: false,
        defaultValue: 0
      },
      interests: {
        type: 'string', // In practice, this would be JSON, but storing as string for compatibility
        required: false,
        defaultValue: '[]'
      },
      learning_path: {
        type: 'string',
        required: false,
        defaultValue: ''
      }
    }
  },
  // Security configurations
  advanced: {
    generateUserId: () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    // Enable security headers
    send2FAOnSignIn: false, // Enable if 2FA is required
  },
  // Rate limiting
  rateLimit: {
    window: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    enabled: true,
  },
  // Account security
  account: {
    accountLockout: {
      duration: 15, // 15 minutes
      attempts: 5, // After 5 failed attempts
    },
    twoFactor: {
      enabled: false, // Enable in production if needed
      issuer: 'Physical AI & Humanoid Robotics Textbook',
    },
  },
  // Password requirements
  password: {
    enabled: true,
    // Enhanced password requirements for security
    minLength: 8,
    requireSpecialChars: true,
    requireNumbers: true,
    requireUppercase: true,
    requireLowercase: true,
  },
  // Security headers and protections
  security: {
    // Enable CSRF protection
    csrf: true,
    // Enable XSS protection
    xss: true,
    // Additional security measures
    bruteForceProtection: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5,
    },
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

// Export additional auth utilities if needed
export const {
  signIn,
  signOut,
  signUp,
  getSession,
  updateSession
} = auth;