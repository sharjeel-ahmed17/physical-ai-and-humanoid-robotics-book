// Profile service for managing user profiles with background data
import { UserProfileEntity } from '../models/user-profile';
import { UserProfile, ProfileUpdateRequest } from '../types/auth-types';
import { validateProfileUpdateRequest } from './validation';
import { categorizeUser, getLearningPath, getRecommendedInterests } from '../utils/user-categorization';

// In-memory storage for demonstration purposes
// In a real implementation, this would be a database
const profileStorage: Map<string, UserProfile> = new Map();

export class ProfileService {
  // Create or update user profile with background data
  async createOrUpdateProfile(
    userId: string,
    profileData: Partial<UserProfile>,
    isUpdate: boolean = false
  ): Promise<UserProfile> {
    try {
      // Validate input parameters
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid user ID provided');
      }

      if (!profileData) {
        throw new Error('Profile data is required');
      }

      // Create a new user profile entity
      const userProfile = new UserProfileEntity({
        ...profileData,
        id: userId,
      });

      // Validate the profile entity before proceeding
      if (!userProfile.validate()) {
        throw new Error('Invalid profile data: Profile validation failed');
      }

      // If this is an update, merge with existing data
      if (isUpdate) {
        const existingProfile = profileStorage.get(userId);
        if (existingProfile) {
          userProfile.updateProfile({
            ...existingProfile,
            ...profileData,
          });

          // Validate again after update
          if (!userProfile.validate()) {
            throw new Error('Invalid profile data after update: Profile validation failed');
          }
        } else {
          // If we're trying to update a profile that doesn't exist, this might be an error
          console.warn(`Profile for user ${userId} does not exist, creating new profile instead of updating`);
        }
      }

      // Calculate skill level if background data is provided
      if (
        profileData.software_experience ||
        profileData.hardware_familiarity ||
        profileData.years_coding !== undefined ||
        profileData.years_hardware !== undefined
      ) {
        const backgroundData = {
          software_experience: profileData.software_experience || [],
          hardware_familiarity: profileData.hardware_familiarity || [],
          years_coding: profileData.years_coding,
          years_hardware: profileData.years_hardware,
          primary_languages: profileData.primary_languages || [],
          development_area: profileData.development_area,
          preferred_platforms: profileData.preferred_platforms || [],
          robotics_experience: profileData.robotics_experience,
        };

        const skillLevel = categorizeUser(backgroundData);
        const learningPath = getLearningPath(backgroundData);
        const interests = getRecommendedInterests(backgroundData);

        // Update the profile with calculated values
        userProfile.updateProfile({
          skill_level: skillLevel,
          learning_path: learningPath,
          interests,
        });
      }

      // Validate the final profile before persisting
      if (!userProfile.validate()) {
        throw new Error('Invalid profile data after processing: Profile validation failed');
      }

      // Persist the profile data to storage
      const finalProfile = userProfile.getProfile();
      profileStorage.set(userId, finalProfile);

      return finalProfile;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid user ID') || error.message.includes('Profile data is required')) {
          throw error; // Re-throw validation errors as-is
        }
        throw new Error(`Failed to create or update profile: ${error.message}`);
      } else {
        throw new Error(`Failed to create or update profile: Unknown error occurred`);
      }
    }
  }

  // Update user profile with new background information
  async updateProfile(userId: string, updateData: ProfileUpdateRequest): Promise<UserProfile> {
    try {
      // Validate input parameters
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid user ID provided for profile update');
      }

      if (!updateData) {
        throw new Error('Profile update data is required');
      }

      // Validate the update request
      const validation = validateProfileUpdateRequest(updateData);
      if (!validation.success) {
        throw new Error(`Invalid profile update data: ${validation.errors?.join(', ')}`);
      }

      // Create updated profile data
      const updatedProfileData: Partial<UserProfile> = {
        software_experience: updateData.software_experience,
        hardware_familiarity: updateData.hardware_familiarity,
        years_coding: updateData.years_coding,
        years_hardware: updateData.years_hardware,
        primary_languages: updateData.primary_languages,
        development_area: updateData.development_area,
        preferred_platforms: updateData.preferred_platforms,
        robotics_experience: updateData.robotics_experience,
      };

      // Create or update the profile
      return await this.createOrUpdateProfile(userId, updatedProfileData, true);
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid user ID') ||
            error.message.includes('Profile update data is required') ||
            error.message.includes('Invalid profile update data')) {
          throw error; // Re-throw validation errors as-is
        }
        throw new Error(`Profile update failed: ${error.message}`);
      } else {
        throw new Error(`Profile update failed: Unknown error occurred`);
      }
    }
  }

  // Get user profile by ID
  async getProfile(userId: string): Promise<UserProfile> {
    try {
      // Validate input parameter
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid user ID provided for profile retrieval');
      }

      // Try to get from storage first
      let profile = profileStorage.get(userId);

      if (!profile) {
        // If not found, create a basic profile
        profile = {
          id: userId,
          email: 'user@example.com', // This would come from the database in a real implementation
          created_at: new Date(),
          updated_at: new Date(),
          software_experience: [],
          hardware_familiarity: [],
          skill_level: 'beginner',
          years_experience: 0,
          interests: [],
          learning_path: '',
        };

        // Store the basic profile
        profileStorage.set(userId, profile);
      }

      // Validate the retrieved profile
      if (!profile.id || typeof profile.id !== 'string') {
        throw new Error('Retrieved profile has invalid ID');
      }

      return profile;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid user ID')) {
          throw error; // Re-throw validation errors as-is
        }
        throw new Error(`Failed to get profile: ${error.message}`);
      } else {
        throw new Error(`Failed to get profile: Unknown error occurred`);
      }
    }
  }

  // Update user categorization based on profile update
  async updateUserCategorization(userId: string, profileData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Validate input parameters
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid user ID provided for categorization update');
      }

      if (!profileData) {
        throw new Error('Profile data is required for categorization update');
      }

      // Get the current profile
      const currentProfile = await this.getProfile(userId);

      // Merge with update data
      const updatedProfileData = {
        ...currentProfile,
        ...profileData,
      };

      // Create a new profile entity with updated data
      const userProfile = new UserProfileEntity(updatedProfileData);

      // Validate the profile entity
      if (!userProfile.validate()) {
        throw new Error('Invalid profile data for categorization: Profile validation failed');
      }

      // Calculate new skill level based on updated background data
      const backgroundData = {
        software_experience: updatedProfileData.software_experience || [],
        hardware_familiarity: updatedProfileData.hardware_familiarity || [],
        years_coding: updatedProfileData.years_coding,
        years_hardware: updatedProfileData.years_hardware,
        primary_languages: updatedProfileData.primary_languages || [],
        development_area: updatedProfileData.development_area,
        preferred_platforms: updatedProfileData.preferred_platforms || [],
        robotics_experience: updatedProfileData.robotics_experience,
      };

      const newSkillLevel = categorizeUser(backgroundData);
      const newLearningPath = getLearningPath(backgroundData);
      const newInterests = getRecommendedInterests(backgroundData);

      // Update the profile with new calculated values
      userProfile.updateProfile({
        skill_level: newSkillLevel,
        learning_path: newLearningPath,
        interests: newInterests,
      });

      // Validate the updated profile
      if (!userProfile.validate()) {
        throw new Error('Invalid profile data after categorization update: Profile validation failed');
      }

      // Persist the updated profile
      const finalProfile = userProfile.getProfile();
      profileStorage.set(userId, finalProfile);

      return finalProfile;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid user ID') ||
            error.message.includes('Profile data is required') ||
            error.message.includes('Profile validation failed')) {
          throw error; // Re-throw validation errors as-is
        }
        throw new Error(`Failed to update user categorization: ${error.message}`);
      } else {
        throw new Error(`Failed to update user categorization: Unknown error occurred`);
      }
    }
  }

  // Persist user profile data during signup
  async persistProfileDuringSignup(userId: string, email: string, backgroundData: Partial<UserProfile>): Promise<UserProfile> {
    try {
      // Validate input parameters
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        throw new Error('Invalid user ID provided for profile persistence during signup');
      }

      if (!email || typeof email !== 'string' || !email.includes('@')) {
        throw new Error('Invalid email provided for profile persistence during signup');
      }

      if (!backgroundData) {
        throw new Error('Background data is required for profile persistence during signup');
      }

      // Create a new profile with the signup data
      const newProfile: Partial<UserProfile> = {
        id: userId,
        email,
        ...backgroundData,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Calculate skill level based on background data
      const calculatedBackgroundData = {
        software_experience: backgroundData.software_experience || [],
        hardware_familiarity: backgroundData.hardware_familiarity || [],
        years_coding: backgroundData.years_coding,
        years_hardware: backgroundData.years_hardware,
        primary_languages: backgroundData.primary_languages || [],
        development_area: backgroundData.development_area,
        preferred_platforms: backgroundData.preferred_platforms || [],
        robotics_experience: backgroundData.robotics_experience,
      };

      const skillLevel = categorizeUser(calculatedBackgroundData);
      const learningPath = getLearningPath(calculatedBackgroundData);
      const interests = getRecommendedInterests(calculatedBackgroundData);

      // Add calculated values to the profile
      newProfile.skill_level = skillLevel;
      newProfile.learning_path = learningPath;
      newProfile.interests = interests;

      // Create and persist the profile
      const userProfile = new UserProfileEntity(newProfile);

      // Validate the profile before persisting
      if (!userProfile.validate()) {
        throw new Error('Invalid profile data during signup: Profile validation failed');
      }

      const finalProfile = userProfile.getProfile();

      // Store in persistent storage
      profileStorage.set(userId, finalProfile);

      return finalProfile;
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid user ID') ||
            error.message.includes('Invalid email') ||
            error.message.includes('Background data is required') ||
            error.message.includes('Profile validation failed')) {
          throw error; // Re-throw validation errors as-is
        }
        throw new Error(`Failed to persist profile during signup: ${error.message}`);
      } else {
        throw new Error(`Failed to persist profile during signup: Unknown error occurred`);
      }
    }
  }
}