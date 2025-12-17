// Better Auth client setup for frontend integration
import { createAuthClient } from 'better-auth/client';

// Create the auth client with configuration
export const authClient = createAuthClient({
  baseURL: process.env.AUTH_URL || 'http://localhost:3000/api/auth',
  // Additional client configuration options
  headers: {
    'Content-Type': 'application/json',
  },
  // Timeout for requests
  timeout: 10000, // 10 seconds
});

// Export individual client functions for easier use
export const {
  signUp: clientSignUp,
  signIn: clientSignIn,
  signOut: clientSignOut,
  getSession: clientGetSession,
  updateSession: clientUpdateSession,
  // Add other client functions as needed
} = authClient;

// Helper function to get auth headers with token
export function getAuthHeaders(token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

// Type for authentication response
export interface AuthResponse {
  user: {
    id: string;
    email: string;
    // Include other user fields as needed
    [key: string]: any; // For additional fields like background data
  };
  session: {
    id: string;
    expiresAt: string;
    [key: string]: any;
  };
}

// Type for error response
export interface ErrorResponse {
  message: string;
  code?: string;
  [key: string]: any;
}