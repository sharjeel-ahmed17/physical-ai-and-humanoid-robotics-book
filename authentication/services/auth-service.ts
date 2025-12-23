// Authentication service with Neon PostgreSQL database
import { eq } from 'drizzle-orm';
import { db } from '../src/db/connection';
import { users, sessions } from '../src/db/schema';
import type { NewUser, NewSession } from '../src/db/schema';
import { AuthSessionEntity } from '../models/auth-session';
import {
  validateSignupRequest,
  validateSigninRequest,
  isSignupRateLimited,
  isSigninRateLimited,
  checkRateLimit
} from './validation';
import { categorizeUser, getLearningPath, getRecommendedInterests } from '../utils/user-categorization';
import {
  SignupRequest,
  SigninRequest,
  UserProfile,
  AuthResponse,
  UserBackgroundData,
  ProfileUpdateRequest
} from '../types/auth-types';

// Enhanced logging utility
class Logger {
  static log(level: string, message: string, context?: Record<string, any>) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      service: 'AuthService'
    };
    console.log(JSON.stringify(logEntry));
  }

  static info(message: string, context?: Record<string, any>) {
    this.log('INFO', message, context);
  }

  static error(message: string, context?: Record<string, any>) {
    this.log('ERROR', message, context);
  }

  static warn(message: string, context?: Record<string, any>) {
    this.log('WARN', message, context);
  }

  static debug(message: string, context?: Record<string, any>) {
    this.log('DEBUG', message, context);
  }
}

// Auth Service class with database integration
export class AuthService {
  // Registration handler with database
  async registerWithBetterAuth(userData: SignupRequest, ipAddress?: string): Promise<AuthResponse> {
    const logContext = {
      operation: 'registerWithBetterAuth',
      email: userData.email,
      ipAddress: ipAddress || 'unknown'
    };

    Logger.info('Starting user registration', logContext);

    try {
      // Check rate limiting
      if (ipAddress && isSignupRateLimited(ipAddress)) {
        const rateLimitResult = checkRateLimit(`signup:${ipAddress}`, 5, 3600000);
        const errorMsg = `Rate limit exceeded for signup. Try again after ${new Date(rateLimitResult.resetTime).toLocaleTimeString()}`;
        Logger.warn(errorMsg, { ...logContext, rateLimitResult });
        throw new Error(errorMsg);
      }

      Logger.debug('Validating signup request', logContext);

      // Validate input data
      const validation = validateSignupRequest(userData);
      if (!validation.success) {
        const errorMsg = `Invalid signup data: ${validation.errors?.join(', ')}`;
        Logger.error(errorMsg, { ...logContext, validationErrors: validation.errors });
        throw new Error(errorMsg);
      }

      const validatedData = validation.data!;
      Logger.info('Signup request validated successfully', { ...logContext, userId: validatedData.email });

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, validatedData.email)).limit(1);
      if (existingUser.length > 0) {
        throw new Error('A user with this email already exists');
      }

      // Calculate skill level based on background data
      const backgroundData: UserBackgroundData = {
        software_experience: validatedData.software_experience,
        hardware_familiarity: validatedData.hardware_familiarity,
        years_coding: validatedData.years_coding,
        years_hardware: validatedData.years_hardware,
        primary_languages: validatedData.primary_languages,
        development_area: validatedData.development_area,
        preferred_platforms: validatedData.preferred_platforms,
        robotics_experience: validatedData.robotics_experience,
      };

      const skillLevel = categorizeUser(backgroundData);
      const learningPath = getLearningPath(backgroundData);
      const interests = getRecommendedInterests(backgroundData);

      Logger.debug('User categorized successfully', { ...logContext, skillLevel, learningPath });

      // Create user ID
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Insert user into database
      const newUser: NewUser = {
        id: userId,
        email: validatedData.email,
        password: validatedData.password, // In production, hash this with bcrypt!
        software_experience: validatedData.software_experience as any,
        hardware_familiarity: validatedData.hardware_familiarity as any,
        years_coding: validatedData.years_coding || 0,
        years_hardware: validatedData.years_hardware || 0,
        primary_languages: validatedData.primary_languages as any,
        development_area: validatedData.development_area,
        preferred_platforms: validatedData.preferred_platforms as any,
        robotics_experience: validatedData.robotics_experience,
        skill_level: skillLevel,
        interests: interests as any,
        learning_path: learningPath,
      };

      await db.insert(users).values(newUser);
      Logger.info('User created in database successfully', { ...logContext, userId });

      // Create user profile
      const userProfile: UserProfile = {
        id: userId,
        email: validatedData.email,
        software_experience: validatedData.software_experience,
        hardware_familiarity: validatedData.hardware_familiarity,
        years_coding: validatedData.years_coding,
        years_hardware: validatedData.years_hardware,
        primary_languages: validatedData.primary_languages,
        development_area: validatedData.development_area,
        preferred_platforms: validatedData.preferred_platforms,
        robotics_experience: validatedData.robotics_experience,
        skill_level: skillLevel,
        interests,
        learning_path: learningPath,
      };

      // Create auth session
      const authSession = new AuthSessionEntity({
        user_id: userId,
        ip_address: ipAddress,
      });

      // Save session to database
      const newSession: NewSession = {
        id: authSession.getSessionId(),
        user_id: userId,
        ip_address: ipAddress || null,
        expires_at: authSession.getExpiresAt(),
      };

      await db.insert(sessions).values(newSession);

      Logger.info('User registration completed successfully', { ...logContext, userId, sessionId: authSession.getSessionId() });

      return {
        user: userProfile,
        session: {
          id: authSession.getSessionId(),
          expires_at: authSession.getExpiresAt().toISOString(),
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred during signup';
      Logger.error('Signup error', { ...logContext, error: errorMsg });
      throw error instanceof Error ? error : new Error('An unexpected error occurred during signup');
    }
  }

  async signup(userData: SignupRequest, ipAddress?: string): Promise<AuthResponse> {
    return await this.registerWithBetterAuth(userData, ipAddress);
  }

  // Signin handler with database
  async signInWithBetterAuth(credentials: SigninRequest, ipAddress?: string): Promise<AuthResponse> {
    const logContext = {
      operation: 'signInWithBetterAuth',
      email: credentials.email,
      ipAddress: ipAddress || 'unknown'
    };

    Logger.info('Starting user signin', logContext);

    try {
      // Check rate limiting
      if (ipAddress && isSigninRateLimited(ipAddress)) {
        const rateLimitResult = checkRateLimit(`signin:${ipAddress}`, 10, 300000);
        const errorMsg = `Rate limit exceeded for signin. Try again after ${new Date(rateLimitResult.resetTime).toLocaleTimeString()}`;
        Logger.warn(errorMsg, { ...logContext, rateLimitResult });
        throw new Error(errorMsg);
      }

      Logger.debug('Validating signin request', logContext);

      // Validate input data
      const validation = validateSigninRequest(credentials);
      if (!validation.success) {
        const errorMsg = `Invalid signin data: ${validation.errors?.join(', ')}`;
        Logger.error(errorMsg, { ...logContext, validationErrors: validation.errors });
        throw new Error(errorMsg);
      }

      const validatedCredentials = validation.data!;
      Logger.info('Signin request validated successfully', { ...logContext, email: validatedCredentials.email });

      // Find user in database
      const userResults = await db.select().from(users).where(eq(users.email, validatedCredentials.email)).limit(1);

      if (userResults.length === 0 || userResults[0].password !== validatedCredentials.password) {
        throw new Error('Invalid email or password');
      }

      const user = userResults[0];
      Logger.info('User authenticated successfully', { ...logContext, userId: user.id });

      // Create user profile
      const userProfile: UserProfile = {
        id: user.id,
        email: user.email,
        software_experience: user.software_experience as string[],
        hardware_familiarity: user.hardware_familiarity as string[],
        years_coding: user.years_coding || 0,
        years_hardware: user.years_hardware || 0,
        primary_languages: user.primary_languages as string[],
        development_area: user.development_area || '',
        preferred_platforms: user.preferred_platforms as string[],
        robotics_experience: user.robotics_experience || 'none',
        skill_level: user.skill_level || 'beginner',
        interests: user.interests as string[],
        learning_path: user.learning_path || '',
      };

      // Create auth session
      const authSession = new AuthSessionEntity({
        user_id: user.id,
        ip_address: ipAddress,
      });

      // Save session to database
      const newSession: NewSession = {
        id: authSession.getSessionId(),
        user_id: user.id,
        ip_address: ipAddress || null,
        expires_at: authSession.getExpiresAt(),
      };

      await db.insert(sessions).values(newSession);

      Logger.info('User signin completed successfully', { ...logContext, userId: user.id, sessionId: authSession.getSessionId() });

      return {
        user: userProfile,
        session: {
          id: authSession.getSessionId(),
          expires_at: authSession.getExpiresAt().toISOString(),
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred during signin';
      Logger.error('Signin error', { ...logContext, error: errorMsg });
      throw error instanceof Error ? error : new Error('An unexpected error occurred during signin');
    }
  }

  async signin(credentials: SigninRequest, ipAddress?: string): Promise<AuthResponse> {
    return await this.signInWithBetterAuth(credentials, ipAddress);
  }

  // Sign out method with database
  async signOut(sessionId: string): Promise<void> {
    const logContext = {
      operation: 'signOut',
      sessionId
    };

    Logger.info('Starting user sign out', logContext);

    try {
      // Delete session from database
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      Logger.info('User signed out successfully', { ...logContext, sessionId });
    } catch (error) {
      Logger.error('Signout error', { ...logContext, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }

  // Get user profile from database
  async getUserProfile(requestingUserId: string, targetUserId: string): Promise<UserProfile> {
    const logContext = {
      operation: 'getUserProfile',
      requestingUserId,
      targetUserId
    };

    Logger.info('Starting user profile retrieval', logContext);

    // Check authorization
    if (requestingUserId !== targetUserId) {
      throw new Error('Unauthorized: You do not have permission to access this profile');
    }

    // Find user in database
    const userResults = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);

    if (userResults.length === 0) {
      throw new Error('User not found');
    }

    const user = userResults[0];

    const profile: UserProfile = {
      id: user.id,
      email: user.email,
      software_experience: user.software_experience as string[],
      hardware_familiarity: user.hardware_familiarity as string[],
      years_coding: user.years_coding || 0,
      years_hardware: user.years_hardware || 0,
      primary_languages: user.primary_languages as string[],
      development_area: user.development_area || '',
      preferred_platforms: user.preferred_platforms as string[],
      robotics_experience: user.robotics_experience || 'none',
      skill_level: user.skill_level || 'beginner',
      interests: user.interests as string[],
      learning_path: user.learning_path || '',
    };

    Logger.info('User profile fetched successfully', { ...logContext, profileId: profile.id });
    return profile;
  }

  // Update user profile in database
  async updateUserProfile(requestingUserId: string, targetUserId: string, updateData: ProfileUpdateRequest): Promise<UserProfile> {
    const logContext = {
      operation: 'updateUserProfile',
      requestingUserId,
      targetUserId
    };

    Logger.info('Starting user profile update', logContext);

    // Check authorization
    if (requestingUserId !== targetUserId) {
      throw new Error('Unauthorized: You do not have permission to update this profile');
    }

    // Update user in database
    await db.update(users)
      .set({
        ...updateData,
        updated_at: new Date(),
      })
      .where(eq(users.id, targetUserId));

    // Fetch updated user
    const userResults = await db.select().from(users).where(eq(users.id, targetUserId)).limit(1);

    if (userResults.length === 0) {
      throw new Error('User not found');
    }

    const user = userResults[0];

    const updatedProfile: UserProfile = {
      id: user.id,
      email: user.email,
      software_experience: user.software_experience as string[],
      hardware_familiarity: user.hardware_familiarity as string[],
      years_coding: user.years_coding || 0,
      years_hardware: user.years_hardware || 0,
      primary_languages: user.primary_languages as string[],
      development_area: user.development_area || '',
      preferred_platforms: user.preferred_platforms as string[],
      robotics_experience: user.robotics_experience || 'none',
      skill_level: user.skill_level || 'beginner',
      interests: user.interests as string[],
      learning_path: user.learning_path || '',
    };

    Logger.info('User profile updated successfully', { ...logContext, profileId: updatedProfile.id });
    return updatedProfile;
  }
}
