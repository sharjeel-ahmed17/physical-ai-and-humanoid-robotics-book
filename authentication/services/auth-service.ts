// Authentication service with background profiling
import { auth } from '../better-auth/config';
import { UserProfileEntity } from '../models/user-profile';
import { AuthSessionEntity } from '../models/auth-session';
import {
  validateSignupRequest,
  validateSigninRequest,
  isSignupRateLimited,
  isSigninRateLimited,
  checkRateLimit
} from './validation';
import { categorizeUser, getLearningPath, getRecommendedInterests } from '../utils/user-categorization';
import { ProfileService } from './profile-service';
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

    // In a real implementation, this would send logs to a centralized logging service
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

// Auth Service class
export class AuthService {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  // Create Better Auth registration handler with comprehensive error handling
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

      // Register user with Better Auth
      // In a real implementation, this would use the actual Better Auth signup method
      let authUser;
      try {
        Logger.debug('Creating user in Better Auth', { ...logContext, email: validatedData.email });
        authUser = await auth.emailPassword.signUp({
          email: validatedData.email,
          password: validatedData.password,
          profileData: {
            software_experience: JSON.stringify(validatedData.software_experience || []),
            hardware_familiarity: JSON.stringify(validatedData.hardware_familiarity || []),
            skill_level: skillLevel,
            years_experience: validatedData.years_coding || 0,
            interests: JSON.stringify(interests),
            learning_path: learningPath,
          }
        });
        Logger.info('User created in Better Auth successfully', { ...logContext, userId: authUser.id });
      } catch (authError) {
        const errorMsg = `Authentication service error: ${authError instanceof Error ? authError.message : 'Unknown authentication error'}`;
        Logger.error(errorMsg, { ...logContext, authError: authError instanceof Error ? authError.message : 'Unknown error' });

        if (authError instanceof Error && authError.message.toLowerCase().includes('already exists')) {
          throw new Error('A user with this email already exists');
        }
        throw new Error(errorMsg);
      }

      // Create user profile with background data
      let userProfile;
      try {
        Logger.debug('Creating user profile', { ...logContext, userId: authUser.id });
        userProfile = await this.profileService.createOrUpdateProfile(authUser.id, {
          id: authUser.id,
          email: authUser.email,
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
          learning_path,
        });
        Logger.info('User profile created successfully', { ...logContext, userId: authUser.id });
      } catch (profileError) {
        const errorMsg = `Profile creation failed: ${profileError instanceof Error ? profileError.message : 'Unknown profile error'}`;
        Logger.error(errorMsg, { ...logContext, userId: authUser.id, profileError: profileError instanceof Error ? profileError.message : 'Unknown error' });

        // If profile creation fails, we might want to rollback the user creation
        // In a real implementation, you would delete the user account if profile creation fails
        throw new Error(errorMsg);
      }

      // Create auth session
      let authSession;
      try {
        Logger.debug('Creating auth session', { ...logContext, userId: authUser.id });
        authSession = new AuthSessionEntity({
          user_id: authUser.id,
          ip_address: ipAddress,
        });
        Logger.info('Auth session created successfully', { ...logContext, userId: authUser.id, sessionId: authSession.getSessionId() });
      } catch (sessionError) {
        const errorMsg = `Session creation failed: ${sessionError instanceof Error ? sessionError.message : 'Unknown session error'}`;
        Logger.error(errorMsg, { ...logContext, userId: authUser.id, sessionError: sessionError instanceof Error ? sessionError.message : 'Unknown error' });
        throw new Error(errorMsg);
      }

      Logger.info('User registration completed successfully', { ...logContext, userId: authUser.id, sessionId: authSession.getSessionId() });

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

      // Re-throw with appropriate message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during signup');
      }
    }
  }

  // Implement signup endpoint contract (this now uses the Better Auth registration handler)
  async signup(userData: SignupRequest, ipAddress?: string): Promise<AuthResponse> {
    return await this.registerWithBetterAuth(userData, ipAddress);
  }

  // Create Better Auth signin handler with comprehensive error handling
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

      // Authenticate user with Better Auth
      // In a real implementation, this would use the actual Better Auth signin method
      let authSession;
      try {
        Logger.debug('Authenticating user with Better Auth', { ...logContext, email: validatedCredentials.email });
        authSession = await auth.emailPassword.signIn({
          email: validatedCredentials.email,
          password: validatedCredentials.password,
        });
        Logger.info('User authenticated successfully', { ...logContext, userId: authSession.user.id });
      } catch (authError) {
        const errorMsg = authError instanceof Error && authError.message.toLowerCase().includes('invalid credentials')
          ? 'Invalid email or password'
          : `Authentication service error: ${authError instanceof Error ? authError.message : 'Unknown authentication error'}`;

        Logger.error(errorMsg, { ...logContext, authError: authError instanceof Error ? authError.message : 'Unknown error' });

        if (authError instanceof Error && authError.message.toLowerCase().includes('invalid credentials')) {
          throw new Error('Invalid email or password');
        }
        throw new Error(errorMsg);
      }

      // Get user profile
      let userProfile;
      try {
        Logger.debug('Retrieving user profile', { ...logContext, userId: authSession.user.id });
        userProfile = await this.profileService.getProfile(authSession.user.id);
        Logger.info('User profile retrieved successfully', { ...logContext, userId: authSession.user.id });
      } catch (profileError) {
        const errorMsg = `Profile retrieval failed: ${profileError instanceof Error ? profileError.message : 'Unknown profile error'}`;
        Logger.error(errorMsg, { ...logContext, userId: authSession.user.id, profileError: profileError instanceof Error ? profileError.message : 'Unknown error' });
        throw new Error(errorMsg);
      }

      // Create auth session entity
      let authSessionEntity;
      try {
        Logger.debug('Creating auth session', { ...logContext, userId: authSession.user.id });
        authSessionEntity = new AuthSessionEntity({
          user_id: authSession.user.id,
          ip_address: ipAddress,
        });
        Logger.info('Auth session created successfully', { ...logContext, userId: authSession.user.id, sessionId: authSessionEntity.getSessionId() });
      } catch (sessionError) {
        const errorMsg = `Session creation failed: ${sessionError instanceof Error ? sessionError.message : 'Unknown session error'}`;
        Logger.error(errorMsg, { ...logContext, userId: authSession.user.id, sessionError: sessionError instanceof Error ? sessionError.message : 'Unknown error' });
        throw new Error(errorMsg);
      }

      Logger.info('User signin completed successfully', { ...logContext, userId: authSession.user.id, sessionId: authSessionEntity.getSessionId() });

      return {
        user: userProfile,
        session: {
          id: authSessionEntity.getSessionId(),
          expires_at: authSessionEntity.getExpiresAt().toISOString(),
        },
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An unexpected error occurred during signin';
      Logger.error('Signin error', { ...logContext, error: errorMsg });

      // Re-throw with appropriate message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during signin');
      }
    }
  }

  // Implement signin endpoint contract (this now uses the Better Auth signin handler)
  async signin(credentials: SigninRequest, ipAddress?: string): Promise<AuthResponse> {
    return await this.signInWithBetterAuth(credentials, ipAddress);
  }

  // Sign out method
  async signOut(sessionId: string): Promise<void> {
    const logContext = {
      operation: 'signOut',
      sessionId
    };

    Logger.info('Starting user sign out', logContext);

    try {
      Logger.debug('Deleting session from Better Auth', { ...logContext, sessionId });
      // In a real implementation, use Better Auth's signOut method
      await auth.session.deleteSession(sessionId);
      Logger.info('User signed out successfully', { ...logContext, sessionId });
    } catch (error) {
      const errorMsg = `Sign out failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      Logger.error(errorMsg, { ...logContext, error: error instanceof Error ? error.message : 'Unknown error' });
      throw new Error(errorMsg);
    }
  }

  // Check if user is authorized to perform profile operations
  async isUserAuthorizedForProfileOperation(userId: string, requestedUserId: string): Promise<boolean> {
    const logContext = {
      operation: 'isUserAuthorizedForProfileOperation',
      userId,
      requestedUserId
    };

    Logger.debug('Starting authorization check', logContext);

    try {
      // In a real implementation, this would verify the user's session/token
      // and check if the requesting user has permissions to access/modify the requested profile
      // For now, we implement basic authorization: users can only access their own profiles
      const isAuthorized = userId === requestedUserId;

      Logger.info('Authorization check completed', { ...logContext, isAuthorized });
      return isAuthorized;
    } catch (error) {
      const errorMsg = `Authorization check error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      Logger.error(errorMsg, { ...logContext, error: error instanceof Error ? error.message : 'Unknown error' });
      return false;
    }
  }

  // Update user profile with authorization check
  async updateUserProfile(requestingUserId: string, targetUserId: string, updateData: ProfileUpdateRequest): Promise<UserProfile> {
    const logContext = {
      operation: 'updateUserProfile',
      requestingUserId,
      targetUserId
    };

    Logger.info('Starting user profile update', logContext);

    try {
      Logger.debug('Checking user authorization', { ...logContext, updateData });

      // Check if the requesting user is authorized to update this profile
      const isAuthorized = await this.isUserAuthorizedForProfileOperation(requestingUserId, targetUserId);
      if (!isAuthorized) {
        const errorMsg = 'Unauthorized: You do not have permission to update this profile';
        Logger.warn(errorMsg, { ...logContext, isAuthorized });
        throw new Error(errorMsg);
      }

      Logger.info('User authorized to update profile', { ...logContext, isAuthorized });

      // Update the profile through the profile service
      Logger.debug('Updating user profile', { ...logContext });
      const updatedProfile = await this.profileService.updateProfile(targetUserId, updateData);
      Logger.info('User profile updated successfully', { ...logContext, profileId: updatedProfile.id });

      return updatedProfile;
    } catch (error) {
      const errorMsg = error instanceof Error && error.message.includes('Unauthorized')
        ? error.message
        : `Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`;

      Logger.error(errorMsg, {
        ...logContext,
        error: error instanceof Error ? error.message : 'Unknown error',
        updateData
      });

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw error;
      }
      throw new Error(errorMsg);
    }
  }

  // Get user profile with authorization check
  async getUserProfile(requestingUserId: string, targetUserId: string): Promise<UserProfile> {
    const logContext = {
      operation: 'getUserProfile',
      requestingUserId,
      targetUserId
    };

    Logger.info('Starting user profile retrieval', logContext);

    try {
      Logger.debug('Checking user authorization', logContext);

      // Check if the requesting user is authorized to access this profile
      const isAuthorized = await this.isUserAuthorizedForProfileOperation(requestingUserId, targetUserId);
      if (!isAuthorized) {
        const errorMsg = 'Unauthorized: You do not have permission to access this profile';
        Logger.warn(errorMsg, { ...logContext, isAuthorized });
        throw new Error(errorMsg);
      }

      Logger.info('User authorized to access profile', { ...logContext, isAuthorized });

      // In a real implementation, fetch user from Better Auth
      Logger.debug('Fetching user from Better Auth', { ...logContext });
      const betterAuthUser = await auth.user.getUserById(targetUserId);
      Logger.info('User fetched from Better Auth successfully', { ...logContext, userId: betterAuthUser?.id });

      // Get profile from profile service
      Logger.debug('Fetching profile from profile service', { ...logContext });
      const profile = await this.profileService.getProfile(targetUserId);
      Logger.info('User profile fetched successfully', { ...logContext, profileId: profile.id });

      return profile;
    } catch (error) {
      const errorMsg = error instanceof Error && error.message.includes('Unauthorized')
        ? error.message
        : `Failed to get user profile: ${error instanceof Error ? error.message : 'Unknown error'}`;

      Logger.error(errorMsg, {
        ...logContext,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      if (error instanceof Error && error.message.includes('Unauthorized')) {
        throw error;
      }
      throw new Error(errorMsg);
    }
  }
}