// Unit tests for signup functionality
import { AuthService } from '../services/auth-service';
import { validateSignupRequest } from '../services/validation';
import { UserProfileEntity } from '../models/user-profile';
import { AuthSessionEntity } from '../models/auth-session';
import { categorizeUser } from '../utils/user-categorization';
import { SignupRequest } from '../types/auth-types';

// Mock the auth service dependencies
jest.mock('../better-auth/config', () => ({
  auth: {
    emailPassword: {
      signUp: jest.fn(),
    },
  },
}));

jest.mock('../services/profile-service', () => ({
  ProfileService: jest.fn().mockImplementation(() => ({
    createOrUpdateProfile: jest.fn().mockResolvedValue({
      id: 'user_1234567890',
      email: 'test@example.com',
      created_at: new Date(),
      updated_at: new Date(),
      software_experience: ['JavaScript'],
      hardware_familiarity: ['Arduino'],
      skill_level: 'beginner',
      years_experience: 1,
      interests: ['Web Development'],
      learning_path: 'Start with fundamental programming concepts',
    }),
  })),
}));

describe('Signup Unit Tests', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('validateSignupRequest', () => {
    test('should validate correct signup data', () => {
      const validData: SignupRequest = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino'],
        years_coding: 2,
        years_hardware: 1,
      };

      const result = validateSignupRequest(validData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    test('should fail validation with invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'ValidPass123!',
      };

      const result = validateSignupRequest(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toContainEqual(expect.stringContaining('Invalid email'));
    });

    test('should fail validation with weak password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'weak',
      };

      const result = validateSignupRequest(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    test('should fail validation with too many software experiences', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        software_experience: Array(11).fill('JavaScript'), // More than max of 10
      };

      const result = validateSignupRequest(invalidData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });
  });

  describe('UserProfileEntity', () => {
    test('should create a valid user profile', () => {
      const profileData = {
        id: 'user_123',
        email: 'test@example.com',
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino'],
        years_coding: 3,
      };

      const profile = new UserProfileEntity(profileData);

      expect(profile.getId()).toBe('user_123');
      expect(profile.getEmail()).toBe('test@example.com');
      expect(profile.getSoftwareExperience()).toEqual(['JavaScript', 'Python']);
      expect(profile.getYearsCoding()).toBe(3);
      expect(profile.validate()).toBe(true);
    });

    test('should calculate skill level correctly', () => {
      const profileData = {
        id: 'user_123',
        email: 'test@example.com',
      };

      const profile = new UserProfileEntity(profileData);

      const backgroundData = {
        software_experience: ['JavaScript', 'Python', 'React', 'Node.js'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 5,
        years_hardware: 2,
      };

      const skillLevel = profile.calculateSkillLevel(backgroundData);

      expect(skillLevel).toBe('advanced'); // Based on 5 years coding + 2 years hardware + 4 SW exp + 2 HW exp
    });
  });

  describe('AuthSessionEntity', () => {
    test('should create a valid auth session', () => {
      const sessionData = {
        user_id: 'user_123',
      };

      const session = new AuthSessionEntity(sessionData);

      expect(session.getUserId()).toBe('user_123');
      expect(session.getSessionId()).toBeDefined();
      expect(session.isExpired()).toBe(false); // Should not be expired immediately
      expect(session.validate()).toBe(true);
    });

    test('should extend session expiration', () => {
      const sessionData = {
        user_id: 'user_123',
      };

      const session = new AuthSessionEntity(sessionData);
      const originalExpiry = session.getExpiresAt();

      // Extend by 60 minutes
      session.extendExpiration(60);

      const newExpiry = session.getExpiresAt();
      expect(newExpiry.getTime()).toBeGreaterThan(originalExpiry.getTime());
    });
  });

  describe('categorizeUser utility', () => {
    test('should categorize beginner user correctly', () => {
      const beginnerData = {
        software_experience: ['JavaScript'],
        hardware_familiarity: [],
        years_coding: 0,
        years_hardware: 0,
      };

      const skillLevel = categorizeUser(beginnerData);
      expect(skillLevel).toBe('beginner');
    });

    test('should categorize intermediate user correctly', () => {
      const intermediateData = {
        software_experience: ['JavaScript', 'Python', 'React'],
        hardware_familiarity: ['Arduino'],
        years_coding: 2,
        years_hardware: 1,
      };

      const skillLevel = categorizeUser(intermediateData);
      expect(skillLevel).toBe('intermediate');
    });

    test('should categorize advanced user correctly', () => {
      const advancedData = {
        software_experience: ['JavaScript', 'Python', 'React', 'Node.js', 'Go', 'Rust'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi', 'ROS', 'FPGA'],
        years_coding: 8,
        years_hardware: 5,
      };

      const skillLevel = categorizeUser(advancedData);
      expect(skillLevel).toBe('advanced');
    });
  });
});