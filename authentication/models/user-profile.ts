// User Profile entity definition with background profiling data
import { z } from 'zod';
import { UserSkillLevel, UserProfile, UserBackgroundData } from '../types/auth-types';

// Zod schema for validation
export const UserProfileSchema = z.object({
  id: z.string().min(1, 'User ID is required'),
  email: z.string().email('Invalid email format'),
  password_hash: z.string().optional(),
  created_at: z.date(),
  updated_at: z.date(),
  // Software Background Attributes
  software_experience: z.array(z.string()).max(10, 'Maximum 10 software experiences allowed').optional(),
  years_coding: z.number().min(0).max(50, 'Years of coding must be between 0 and 50').optional(),
  primary_languages: z.array(z.string()).optional(),
  development_area: z.string().optional(),
  // Hardware Background Attributes
  hardware_familiarity: z.array(z.string()).max(10, 'Maximum 10 hardware familiarities allowed').optional(),
  years_hardware: z.number().min(0).max(50, 'Years of hardware experience must be between 0 and 50').optional(),
  preferred_platforms: z.array(z.string()).optional(),
  robotics_experience: z.enum(['none', 'basic', 'intermediate', 'advanced']).optional(),
  // Derived Attributes
  skill_level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  interests: z.array(z.string()).optional(),
  learning_path: z.string().optional(),
});

// User Profile entity class
export class UserProfileEntity {
  private profile: UserProfile;

  constructor(profileData: Partial<UserProfile>) {
    // Validate input data
    const validatedData = UserProfileSchema.parse({
      ...profileData,
      id: profileData.id || this.generateId(),
      created_at: profileData.created_at || new Date(),
      updated_at: profileData.updated_at || new Date(),
    });

    this.profile = validatedData as UserProfile;
  }

  // Get the user profile
  getProfile(): UserProfile {
    return { ...this.profile };
  }

  // Update profile data
  updateProfile(updateData: Partial<UserProfile>): void {
    const updatedProfile = {
      ...this.profile,
      ...updateData,
      updated_at: new Date(),
    };

    // Validate updated data
    const validatedData = UserProfileSchema.parse(updatedProfile);
    this.profile = validatedData as UserProfile;
  }

  // Get user ID
  getId(): string {
    return this.profile.id;
  }

  // Get user email
  getEmail(): string {
    return this.profile.email;
  }

  // Get software experience
  getSoftwareExperience(): string[] {
    return this.profile.software_experience || [];
  }

  // Get hardware familiarity
  getHardwareFamiliarity(): string[] {
    return this.profile.hardware_familiarity || [];
  }

  // Get years of coding experience
  getYearsCoding(): number {
    return this.profile.years_coding || 0;
  }

  // Get years of hardware experience
  getYearsHardware(): number {
    return this.profile.years_hardware || 0;
  }

  // Get skill level
  getSkillLevel(): UserSkillLevel | undefined {
    return this.profile.skill_level;
  }

  // Get learning path
  getLearningPath(): string | undefined {
    return this.profile.learning_path;
  }

  // Calculate skill level based on background data
  calculateSkillLevel(backgroundData: UserBackgroundData): UserSkillLevel {
    const { software_experience, hardware_familiarity, years_coding, years_hardware } = backgroundData;

    // Calculate a score based on background data
    let score = 0;

    // Years of experience contribute to the score
    if (years_coding !== undefined) score += years_coding;
    if (years_hardware !== undefined) score += years_hardware;

    // Number of technologies known contributes to the score
    if (software_experience) score += Math.min(software_experience.length, 5);
    if (hardware_familiarity) score += Math.min(hardware_familiarity.length, 5);

    // Determine skill level based on score
    if (score <= 5) return 'beginner';
    if (score <= 10) return 'intermediate';
    return 'advanced';
  }

  // Generate a unique ID for the user
  private generateId(): string {
    // In a real implementation, this would use a more robust ID generation method
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Validate the user profile
  validate(): boolean {
    try {
      UserProfileSchema.parse(this.profile);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get validation errors if any
  getValidationErrors(): string[] {
    try {
      UserProfileSchema.parse(this.profile);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.errors.map(e => e.message);
      }
      return ['Unknown validation error'];
    }
  }
}