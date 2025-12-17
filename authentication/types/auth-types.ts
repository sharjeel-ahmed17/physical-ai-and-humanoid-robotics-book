// Type definitions for authentication module with background profiling

// User Profile type definition
export interface UserProfile {
  id: string;
  email: string;
  password_hash?: string;
  created_at: Date;
  updated_at: Date;
  // Software Background Attributes
  software_experience?: string[];
  years_coding?: number;
  primary_languages?: string[];
  development_area?: string;
  // Hardware Background Attributes
  hardware_familiarity?: string[];
  years_hardware?: number;
  preferred_platforms?: string[];
  robotics_experience?: 'none' | 'basic' | 'intermediate' | 'advanced';
  // Derived Attributes
  skill_level?: 'beginner' | 'intermediate' | 'advanced';
  interests?: string[];
  learning_path?: string;
}

// Authentication Session type definition
export interface AuthSession {
  session_id: string;
  user_id: string;
  created_at: Date;
  expires_at: Date;
  ip_address?: string;
  user_agent?: string;
}

// User categorization type
export type UserSkillLevel = 'beginner' | 'intermediate' | 'advanced';

// Signup request type
export interface SignupRequest {
  email: string;
  password: string;
  software_experience?: string[];
  hardware_familiarity?: string[];
  years_coding?: number;
  years_hardware?: number;
  primary_languages?: string[];
  development_area?: string;
  preferred_platforms?: string[];
  robotics_experience?: 'none' | 'basic' | 'intermediate' | 'advanced';
}

// Signin request type
export interface SigninRequest {
  email: string;
  password: string;
}

// API response types
export interface AuthResponse {
  user: UserProfile;
  session: {
    id: string;
    expires_at: string;
  };
}

export interface ProfileUpdateRequest {
  software_experience?: string[];
  hardware_familiarity?: string[];
  years_coding?: number;
  years_hardware?: number;
  primary_languages?: string[];
  development_area?: string;
  preferred_platforms?: string[];
  robotics_experience?: 'none' | 'basic' | 'intermediate' | 'advanced';
}

// Error response type
export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

// User categorization input type
export interface UserBackgroundData {
  software_experience?: string[];
  hardware_familiarity?: string[];
  years_coding?: number;
  years_hardware?: number;
  primary_languages?: string[];
  development_area?: string;
  preferred_platforms?: string[];
  robotics_experience?: 'none' | 'basic' | 'intermediate' | 'advanced';
}