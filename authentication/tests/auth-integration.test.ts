// Integration tests for authentication flows (signup and signin)
import { AuthService } from '../services/auth-service';
import { ProfileService } from '../services/profile-service';
import { validateSignupRequest, validateSigninRequest, validateProfileUpdateRequest } from '../services/validation';
import { SignupRequest, SigninRequest, ProfileUpdateRequest } from '../types/auth-types';

// Mock the auth service dependencies for integration testing
jest.mock('../better-auth/config', () => ({
  auth: {
    emailPassword: {
      signUp: jest.fn().mockResolvedValue({
        id: 'user_1234567890',
        email: 'test@example.com',
      }),
      signIn: jest.fn().mockResolvedValue({
        user: {
          id: 'user_1234567890',
          email: 'test@example.com',
        },
      }),
    },
    session: {
      deleteSession: jest.fn().mockResolvedValue(undefined),
    },
    user: {
      getUserById: jest.fn().mockResolvedValue({
        id: 'user_1234567890',
        email: 'test@example.com',
      }),
    },
  },
}));

describe('Authentication Integration Tests', () => {
  let authService: AuthService;
  let profileService: ProfileService;

  beforeEach(() => {
    authService = new AuthService();
    profileService = new ProfileService();
  });

  describe('Signup Flow Integration', () => {
    test('should successfully register a new user with background data', async () => {
      const signupData: SignupRequest = {
        email: 'integration-test@example.com',
        password: 'SecurePass123!',
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 3,
        years_hardware: 2,
        primary_languages: ['JavaScript', 'Python'],
        development_area: 'web development',
        preferred_platforms: ['Linux'],
        robotics_experience: 'basic',
      };

      // Validate the signup request
      const validation = validateSignupRequest(signupData);
      expect(validation.success).toBe(true);

      // Perform signup
      const result = await authService.signup(signupData);

      // Verify the result structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user.email).toBe(signupData.email);
      expect(result.session).toHaveProperty('id');
      expect(result.session).toHaveProperty('expires_at');

      // Verify user profile contains background data
      expect(result.user.software_experience).toEqual(signupData.software_experience);
      expect(result.user.hardware_familiarity).toEqual(signupData.hardware_familiarity);
      expect(result.user.years_coding).toBe(signupData.years_coding);
      expect(result.user.years_hardware).toBe(signupData.years_hardware);
      expect(result.user.skill_level).toBeDefined();
      expect(result.user.learning_path).toBeDefined();
      expect(result.user.interests).toBeDefined();
    });

    test('should handle signup with minimal background data', async () => {
      const signupData: SignupRequest = {
        email: 'minimal-test@example.com',
        password: 'SecurePass123!',
      };

      const result = await authService.signup(signupData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user.email).toBe(signupData.email);
      expect(result.user.skill_level).toBeDefined(); // Should still calculate skill level
    });

    test('should handle signup validation errors', async () => {
      const invalidSignupData = {
        email: 'invalid-email', // Invalid email format
        password: 'short', // Too short
      };

      await expect(authService.signup(invalidSignupData as any))
        .rejects
        .toThrow('Invalid signup data');
    });

    test('should handle duplicate email error', async () => {
      // Mock the auth service to throw a duplicate email error
      const mockAuthService = {
        ...authService,
        registerWithBetterAuth: jest.fn().mockRejectedValue(
          new Error('already exists')
        ),
      };

      const signupData: SignupRequest = {
        email: 'duplicate@example.com',
        password: 'SecurePass123!',
      };

      await expect(
        (mockAuthService as any).registerWithBetterAuth(signupData)
      ).rejects.toThrow('A user with this email already exists');
    });
  });

  describe('Signin Flow Integration', () => {
    test('should successfully authenticate an existing user', async () => {
      const signinData: SigninRequest = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      // Validate the signin request
      const validation = validateSigninRequest(signinData);
      expect(validation.success).toBe(true);

      // Perform signin
      const result = await authService.signin(signinData);

      // Verify the result structure
      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('session');
      expect(result.user).toHaveProperty('id');
      expect(result.user).toHaveProperty('email');
      expect(result.user.email).toBe(signinData.email);
      expect(result.session).toHaveProperty('id');
      expect(result.session).toHaveProperty('expires_at');
    });

    test('should handle signin validation errors', async () => {
      const invalidSigninData = {
        email: 'invalid-email', // Invalid email format
        password: '', // Empty password
      };

      await expect(authService.signin(invalidSigninData as any))
        .rejects
        .toThrow('Invalid signin data');
    });

    test('should handle invalid credentials error', async () => {
      // Mock the auth service to throw an invalid credentials error
      const mockAuthService = {
        ...authService,
        signInWithBetterAuth: jest.fn().mockRejectedValue(
          new Error('invalid credentials')
        ),
      };

      const signinData: SigninRequest = {
        email: 'nonexistent@example.com',
        password: 'wrongpassword',
      };

      await expect(
        (mockAuthService as any).signInWithBetterAuth(signinData)
      ).rejects.toThrow('Invalid email or password');
    });

    test('should handle user profile retrieval after signin', async () => {
      const signinData: SigninRequest = {
        email: 'profile-test@example.com',
        password: 'SecurePass123!',
      };

      // Mock profile service to return a profile with background data
      jest.spyOn(profileService, 'getProfile').mockResolvedValue({
        id: 'user_1234567890',
        email: 'profile-test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        software_experience: ['JavaScript'],
        hardware_familiarity: ['Arduino'],
        skill_level: 'beginner',
        years_experience: 1,
        interests: ['Web Development'],
        learning_path: 'Start with fundamental programming concepts',
      });

      const result = await authService.signin(signinData);

      expect(result.user.software_experience).toEqual(['JavaScript']);
      expect(result.user.hardware_familiarity).toEqual(['Arduino']);
      expect(result.user.skill_level).toBe('beginner');
    });
  });

  describe('Profile Management Integration', () => {
    test('should successfully update user profile with authorization', async () => {
      const userId = 'user_1234567890';
      const requestingUserId = 'user_1234567890'; // Same user, so authorized

      // First create a profile by signing up
      const signupData: SignupRequest = {
        email: 'profile-update-test@example.com',
        password: 'SecurePass123!',
        software_experience: ['JavaScript'],
        hardware_familiarity: ['Arduino'],
        years_coding: 2,
      };

      const signupResult = await authService.signup(signupData);
      expect(signupResult.user.email).toBe(signupData.email);

      // Update the profile
      const updateData: ProfileUpdateRequest = {
        software_experience: ['JavaScript', 'Python', 'TypeScript'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 4,
        years_hardware: 2,
        primary_languages: ['JavaScript', 'Python'],
        development_area: 'full-stack development',
        preferred_platforms: ['Linux', 'macOS'],
        robotics_experience: 'intermediate',
      };

      // Mock the profile update in profile service
      jest.spyOn(profileService, 'updateProfile').mockResolvedValue({
        id: userId,
        email: 'profile-update-test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        software_experience: ['JavaScript', 'Python', 'TypeScript'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 4,
        years_hardware: 2,
        primary_languages: ['JavaScript', 'Python'],
        development_area: 'full-stack development',
        preferred_platforms: ['Linux', 'macOS'],
        robotics_experience: 'intermediate',
        skill_level: 'intermediate',
        years_experience: 4,
        interests: ['Advanced JavaScript', 'System Design'],
        learning_path: 'Continue learning advanced concepts',
      });

      const updatedProfile = await authService.updateUserProfile(requestingUserId, userId, updateData);

      expect(updatedProfile.software_experience).toEqual(['JavaScript', 'Python', 'TypeScript']);
      expect(updatedProfile.hardware_familiarity).toEqual(['Arduino', 'Raspberry Pi']);
      expect(updatedProfile.years_coding).toBe(4);
      expect(updatedProfile.years_hardware).toBe(2);
    });

    test('should handle unauthorized profile update attempt', async () => {
      const userId = 'user_1234567890';
      const requestingUserId = 'different_user_987654321'; // Different user, so not authorized

      const updateData: ProfileUpdateRequest = {
        software_experience: ['JavaScript', 'Python'],
      };

      await expect(authService.updateUserProfile(requestingUserId, userId, updateData))
        .rejects
        .toThrow('Unauthorized: You do not have permission to update this profile');
    });

    test('should successfully retrieve user profile with authorization', async () => {
      const userId = 'user_1234567890';
      const requestingUserId = 'user_1234567890'; // Same user, so authorized

      // Create a profile first
      const signupData: SignupRequest = {
        email: 'profile-retrieve-test@example.com',
        password: 'SecurePass123!',
        software_experience: ['JavaScript', 'Python'],
      };

      await authService.signup(signupData);

      // Mock profile retrieval
      jest.spyOn(profileService, 'getProfile').mockResolvedValue({
        id: userId,
        email: 'profile-retrieve-test@example.com',
        created_at: new Date(),
        updated_at: new Date(),
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino'],
        skill_level: 'intermediate',
        years_experience: 3,
        interests: ['Advanced JavaScript', 'System Design'],
        learning_path: 'Continue learning advanced concepts',
      });

      const retrievedProfile = await authService.getUserProfile(requestingUserId, userId);

      expect(retrievedProfile.email).toBe('profile-retrieve-test@example.com');
      expect(retrievedProfile.software_experience).toEqual(['JavaScript', 'Python']);
      expect(retrievedProfile.hardware_familiarity).toEqual(['Arduino']);
    });

    test('should handle unauthorized profile retrieval attempt', async () => {
      const userId = 'user_1234567890';
      const requestingUserId = 'different_user_987654321'; // Different user, so not authorized

      await expect(authService.getUserProfile(requestingUserId, userId))
        .rejects
        .toThrow('Unauthorized: You do not have permission to access this profile');
    });

    test('should handle profile update validation errors', async () => {
      const userId = 'user_1234567890';
      const requestingUserId = 'user_1234567890'; // Same user, so authorized

      // Invalid update data with too many software experiences
      const invalidUpdateData = {
        software_experience: Array(11).fill('JavaScript'), // More than max allowed
      } as ProfileUpdateRequest;

      await expect(authService.updateUserProfile(requestingUserId, userId, invalidUpdateData))
        .rejects
        .toThrow('Invalid profile update data');
    });

    test('should validate profile update data before processing', () => {
      const invalidUpdateData = {
        software_experience: Array(11).fill('JavaScript'), // More than max allowed
      };

      const validation = validateProfileUpdateRequest(invalidUpdateData as ProfileUpdateRequest);
      expect(validation.success).toBe(false);
      expect(validation.errors).toBeDefined();
    });
  });

  describe('Cross-service Integration', () => {
    test('should persist profile data correctly through signup and retrieval', async () => {
      const signupData: SignupRequest = {
        email: 'cross-service-test@example.com',
        password: 'SecurePass123!',
        software_experience: ['TypeScript', 'React'],
        hardware_familiarity: ['Raspberry Pi'],
        years_coding: 4,
      };

      // Signup the user
      const signupResult = await authService.signup(signupData);

      // Verify the signup result contains the profile data
      expect(signupResult.user.software_experience).toContain('TypeScript');
      expect(signupResult.user.hardware_familiarity).toContain('Raspberry Pi');
      expect(signupResult.user.years_coding).toBe(4);

      // Get the user profile directly through the profile service
      const profile = await profileService.getProfile(signupResult.user.id);

      // Verify the profile data is consistent
      expect(profile.software_experience).toContain('TypeScript');
      expect(profile.hardware_familiarity).toContain('Raspberry Pi');
      expect(profile.years_coding).toBe(4);
    });

    test('should handle rate limiting across signup and signin', async () => {
      const ipAddress = '192.168.1.1';

      // Test signup rate limiting
      const signupData: SignupRequest = {
        email: 'rate-limit-test@example.com',
        password: 'SecurePass123!',
      };

      // Mock rate limiting for signup
      const { checkRateLimit } = require('../services/validation');
      jest.spyOn(checkRateLimit, 'call').mockReturnValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 3600000, // 1 hour from now
      });

      await expect(authService.signup(signupData, ipAddress))
        .rejects
        .toThrow('Rate limit exceeded for signup');
    });
  });
});