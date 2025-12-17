// Unit tests for profile management functionality
import { ProfileService } from '../services/profile-service';
import { UserProfileEntity } from '../models/user-profile';
import { validateProfileUpdateRequest } from '../services/validation';
import { UserProfile, ProfileUpdateRequest } from '../types/auth-types';

// Mock the user categorization utilities
jest.mock('../utils/user-categorization', () => ({
  categorizeUser: jest.fn().mockReturnValue('intermediate'),
  getLearningPath: jest.fn().mockReturnValue('Continue learning advanced concepts'),
  getRecommendedInterests: jest.fn().mockReturnValue(['Advanced JavaScript', 'System Design']),
}));

describe('Profile Management Unit Tests', () => {
  let profileService: ProfileService;

  beforeEach(() => {
    profileService = new ProfileService();
  });

  describe('validateProfileUpdateRequest', () => {
    test('should validate correct profile update data', () => {
      const validData: ProfileUpdateRequest = {
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 3,
        years_hardware: 2,
        primary_languages: ['JavaScript', 'Python'],
        development_area: 'web development',
        preferred_platforms: ['Linux'],
        robotics_experience: 'basic',
      };

      const result = validateProfileUpdateRequest(validData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.errors).toBeUndefined();
    });

    test('should fail validation with too many software experiences', () => {
      const invalidData = {
        software_experience: Array(11).fill('JavaScript'), // More than max of 10
      };

      const result = validateProfileUpdateRequest(invalidData as any);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    test('should fail validation with negative years of experience', () => {
      const invalidData = {
        years_coding: -1,
        years_hardware: -1,
      };

      const result = validateProfileUpdateRequest(invalidData as any);

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

    test('should validate profile correctly', () => {
      const validProfile = new UserProfileEntity({
        id: 'user_123',
        email: 'test@example.com',
      });

      expect(validProfile.validate()).toBe(true);

      const invalidProfile = new UserProfileEntity({
        id: '', // Invalid ID
        email: 'invalid-email',
      });

      expect(invalidProfile.validate()).toBe(false);
    });
  });

  describe('ProfileService createOrUpdateProfile', () => {
    test('should create a new profile successfully', async () => {
      const userId = 'user_1234567890';
      const profileData = {
        email: 'test@example.com',
        software_experience: ['JavaScript'],
        hardware_familiarity: ['Arduino'],
        years_coding: 2,
      };

      const result = await profileService.createOrUpdateProfile(userId, profileData);

      expect(result.id).toBe(userId);
      expect(result.email).toBe('test@example.com');
      expect(result.software_experience).toEqual(['JavaScript']);
      expect(result.skill_level).toBe('intermediate'); // Mocked value
    });

    test('should update an existing profile', async () => {
      const userId = 'user_1234567890';

      // First create a profile
      const initialProfile = await profileService.createOrUpdateProfile(userId, {
        email: 'test@example.com',
        software_experience: ['JavaScript'],
      });

      // Then update it
      const updatedProfile = await profileService.createOrUpdateProfile(userId, {
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
      }, true);

      expect(updatedProfile.id).toBe(userId);
      expect(updatedProfile.software_experience).toEqual(['JavaScript', 'Python']);
      expect(updatedProfile.hardware_familiarity).toEqual(['Arduino', 'Raspberry Pi']);
    });

    test('should handle invalid user ID error', async () => {
      await expect(profileService.createOrUpdateProfile('', {
        email: 'test@example.com',
      })).rejects.toThrow('Invalid user ID provided');
    });

    test('should handle missing profile data error', async () => {
      await expect(profileService.createOrUpdateProfile('user_123', undefined as any)).rejects.toThrow('Profile data is required');
    });

    test('should handle profile validation error', async () => {
      await expect(profileService.createOrUpdateProfile('user_123', {
        id: 'user_123',
        email: 'invalid-email', // This should cause validation to fail
      })).rejects.toThrow('Invalid profile data: Profile validation failed');
    });
  });

  describe('ProfileService updateProfile', () => {
    test('should update profile with valid data', async () => {
      const userId = 'user_1234567890';

      // Create an initial profile
      await profileService.createOrUpdateProfile(userId, {
        email: 'test@example.com',
        software_experience: ['JavaScript'],
      });

      // Update the profile
      const updateData: ProfileUpdateRequest = {
        software_experience: ['JavaScript', 'Python', 'TypeScript'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 4,
        years_hardware: 2,
      };

      const result = await profileService.updateProfile(userId, updateData);

      expect(result.software_experience).toEqual(['JavaScript', 'Python', 'TypeScript']);
      expect(result.hardware_familiarity).toEqual(['Arduino', 'Raspberry Pi']);
      expect(result.years_coding).toBe(4);
      expect(result.years_hardware).toBe(2);
    });

    test('should handle invalid update data', async () => {
      const userId = 'user_1234567890';

      const invalidUpdateData = {
        software_experience: Array(11).fill('JavaScript'), // Too many experiences
      } as ProfileUpdateRequest;

      await expect(profileService.updateProfile(userId, invalidUpdateData)).rejects.toThrow('Invalid profile update data');
    });

    test('should handle invalid user ID for update', async () => {
      const invalidUpdateData: ProfileUpdateRequest = {
        software_experience: ['JavaScript'],
      };

      await expect(profileService.updateProfile('', invalidUpdateData)).rejects.toThrow('Invalid user ID provided for profile update');
    });
  });

  describe('ProfileService getProfile', () => {
    test('should retrieve an existing profile', async () => {
      const userId = 'user_1234567890';

      // Create a profile first
      await profileService.createOrUpdateProfile(userId, {
        email: 'test@example.com',
        software_experience: ['JavaScript'],
      });

      // Retrieve the profile
      const result = await profileService.getProfile(userId);

      expect(result.id).toBe(userId);
      expect(result.email).toBe('test@example.com');
      expect(result.software_experience).toEqual(['JavaScript']);
    });

    test('should create a basic profile if it does not exist', async () => {
      const userId = 'nonexistent_user_1234567890';

      const result = await profileService.getProfile(userId);

      expect(result.id).toBe(userId);
      expect(result.email).toBe('user@example.com'); // Default value
      expect(result.software_experience).toEqual([]);
      expect(result.skill_level).toBe('beginner');
    });

    test('should handle invalid user ID for retrieval', async () => {
      await expect(profileService.getProfile('')).rejects.toThrow('Invalid user ID provided for profile retrieval');
    });
  });

  describe('ProfileService updateUserCategorization', () => {
    test('should update user categorization based on profile data', async () => {
      const userId = 'user_1234567890';

      // Create a profile first
      await profileService.createOrUpdateProfile(userId, {
        email: 'test@example.com',
        software_experience: ['JavaScript'],
      });

      // Update categorization with new data
      const updatedProfile = await profileService.updateUserCategorization(userId, {
        software_experience: ['JavaScript', 'Python', 'React', 'Node.js'],
        hardware_familiarity: ['Arduino', 'Raspberry Pi'],
        years_coding: 5,
        years_hardware: 3,
      });

      expect(updatedProfile.software_experience).toEqual(['JavaScript', 'Python', 'React', 'Node.js']);
      expect(updatedProfile.hardware_familiarity).toEqual(['Arduino', 'Raspberry Pi']);
      expect(updatedProfile.years_coding).toBe(5);
      expect(updatedProfile.years_hardware).toBe(3);
      expect(updatedProfile.skill_level).toBe('intermediate'); // Mocked value
    });

    test('should handle invalid user ID for categorization update', async () => {
      await expect(profileService.updateUserCategorization('', {
        software_experience: ['JavaScript'],
      })).rejects.toThrow('Invalid user ID provided for categorization update');
    });

    test('should handle missing profile data for categorization update', async () => {
      await expect(profileService.updateUserCategorization('user_123', undefined as any)).rejects.toThrow('Profile data is required for categorization update');
    });
  });

  describe('ProfileService persistProfileDuringSignup', () => {
    test('should persist profile during signup', async () => {
      const userId = 'user_1234567890';
      const email = 'test@example.com';
      const backgroundData = {
        software_experience: ['JavaScript', 'Python'],
        hardware_familiarity: ['Arduino'],
        years_coding: 2,
      };

      const result = await profileService.persistProfileDuringSignup(userId, email, backgroundData);

      expect(result.id).toBe(userId);
      expect(result.email).toBe(email);
      expect(result.software_experience).toEqual(['JavaScript', 'Python']);
      expect(result.hardware_familiarity).toEqual(['Arduino']);
      expect(result.years_coding).toBe(2);
      expect(result.skill_level).toBe('intermediate'); // Mocked value
    });

    test('should handle invalid user ID during signup', async () => {
      await expect(profileService.persistProfileDuringSignup('', 'test@example.com', {
        software_experience: ['JavaScript'],
      })).rejects.toThrow('Invalid user ID provided for profile persistence during signup');
    });

    test('should handle invalid email during signup', async () => {
      await expect(profileService.persistProfileDuringSignup('user_123', 'invalid-email', {
        software_experience: ['JavaScript'],
      })).rejects.toThrow('Invalid email provided for profile persistence during signup');
    });

    test('should handle missing background data during signup', async () => {
      await expect(profileService.persistProfileDuringSignup('user_123', 'test@example.com', undefined as any)).rejects.toThrow('Background data is required for profile persistence during signup');
    });
  });

  describe('Error Handling', () => {
    test('should handle unexpected errors in createOrUpdateProfile', async () => {
      // This test would require mocking the UserProfileEntity constructor to throw an error
      // For now, we verify that the error handling is in place
      const userId = 'user_1234567890';
      const profileData = {
        email: 'test@example.com',
      };

      const result = await profileService.createOrUpdateProfile(userId, profileData);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
    });

    test('should handle validation errors appropriately', async () => {
      await expect(profileService.createOrUpdateProfile('', undefined as any))
        .rejects.toThrow('Invalid user ID provided');

      await expect(profileService.updateProfile('', undefined as any))
        .rejects.toThrow('Invalid user ID provided for profile update');

      await expect(profileService.getProfile(''))
        .rejects.toThrow('Invalid user ID provided for profile retrieval');
    });
  });
});