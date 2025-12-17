// Authentication Session entity definition
import { z } from 'zod';
import { AuthSession } from '../types/auth-types';

// Zod schema for validation
export const AuthSessionSchema = z.object({
  session_id: z.string().min(1, 'Session ID is required'),
  user_id: z.string().min(1, 'User ID is required'),
  created_at: z.date(),
  expires_at: z.date(),
  ip_address: z.string().optional(),
  user_agent: z.string().optional(),
});

// Auth Session entity class
export class AuthSessionEntity {
  private session: AuthSession;

  constructor(sessionData: Partial<AuthSession>) {
    // Validate input data
    const validatedData = AuthSessionSchema.parse({
      ...sessionData,
      session_id: sessionData.session_id || this.generateSessionId(),
      created_at: sessionData.created_at || new Date(),
      expires_at: sessionData.expires_at || new Date(Date.now() + 30 * 60 * 1000), // Default: 30 minutes from now
    });

    this.session = validatedData as AuthSession;
  }

  // Get the session
  getSession(): AuthSession {
    return { ...this.session };
  }

  // Get session ID
  getSessionId(): string {
    return this.session.session_id;
  }

  // Get user ID
  getUserId(): string {
    return this.session.user_id;
  }

  // Get creation time
  getCreatedAt(): Date {
    return this.session.created_at;
  }

  // Get expiration time
  getExpiresAt(): Date {
    return this.session.expires_at;
  }

  // Get IP address
  getIpAddress(): string | undefined {
    return this.session.ip_address;
  }

  // Get user agent
  getUserAgent(): string | undefined {
    return this.session.user_agent;
  }

  // Check if session is expired
  isExpired(): boolean {
    return new Date() > this.session.expires_at;
  }

  // Update session expiration time
  extendExpiration(minutes: number = 30): void {
    this.session.expires_at = new Date(Date.now() + minutes * 60 * 1000);
  }

  // Update IP address
  updateIpAddress(ipAddress: string): void {
    this.session.ip_address = ipAddress;
  }

  // Update user agent
  updateUserAgent(userAgent: string): void {
    this.session.user_agent = userAgent;
  }

  // Generate a unique session ID
  private generateSessionId(): string {
    // In a real implementation, this would use a more robust ID generation method
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate the session
  validate(): boolean {
    try {
      AuthSessionSchema.parse(this.session);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get validation errors if any
  getValidationErrors(): string[] {
    try {
      AuthSessionSchema.parse(this.session);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(e => e.message);
      }
      return ['Unknown validation error'];
    }
  }
}