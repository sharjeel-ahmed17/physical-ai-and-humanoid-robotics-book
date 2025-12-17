// Authentication module test environment setup
import { jest } from '@jest/globals';
import type { Config } from '@jest/types';

// Mock environment variables for testing
process.env.AUTH_SECRET = process.env.AUTH_SECRET || 'test-auth-secret-key-must-be-32-chars';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.FROM_EMAIL = process.env.FROM_EMAIL || 'test@example.com';

// Mock Better Auth module
jest.mock('../../authentication/better-auth/config', () => {
  const mockAuth = {
    emailPassword: {
      signUp: jest.fn().mockImplementation(async ({ email, password }) => {
        // Simulate user creation
        return {
          id: `user_${Date.now()}`,
          email,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
      signIn: jest.fn().mockImplementation(async ({ email, password }) => {
        // Simulate successful sign in
        return {
          user: {
            id: `user_${Date.now()}`,
            email,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          session: {
            id: `session_${Date.now()}`,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
          }
        };
      }),
    },
    session: {
      deleteSession: jest.fn().mockResolvedValue(undefined),
    },
    user: {
      getUserById: jest.fn().mockImplementation(async (userId) => {
        return {
          id: userId,
          email: 'test@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }),
    }
  };

  return {
    auth: mockAuth,
    signIn: mockAuth.emailPassword.signIn,
    signOut: mockAuth.session.deleteSession,
    signUp: mockAuth.emailPassword.signUp,
    getSession: jest.fn().mockResolvedValue(null),
    updateSession: jest.fn().mockResolvedValue(undefined),
    validateAuthConfig: jest.fn().mockReturnValue(undefined),
  };
});

// Mock database operations
jest.mock('../../authentication/models/user-profile', () => {
  const mockUserProfiles = new Map();

  return {
    UserProfileEntity: jest.fn().mockImplementation((data) => {
      const id = data.id || `profile_${Date.now()}`;
      return {
        ...data,
        id,
        created_at: data.created_at || new Date(),
        updated_at: data.updated_at || new Date(),
        save: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      };
    }),
    getAllUserProfiles: jest.fn().mockResolvedValue(Array.from(mockUserProfiles.values())),
  };
});

jest.mock('../../authentication/models/auth-session', () => {
  return {
    AuthSessionEntity: jest.fn().mockImplementation((data) => {
      const id = data.id || `session_${Date.now()}`;
      return {
        ...data,
        id,
        created_at: data.created_at || new Date(),
        expires_at: data.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000),
        getSessionId: jest.fn().mockReturnValue(id),
        getExpiresAt: jest.fn().mockReturnValue(new Date(Date.now() + 24 * 60 * 60 * 1000)),
        save: jest.fn().mockResolvedValue(undefined),
      };
    }),
  };
});

// Mock utility functions
jest.mock('../../authentication/utils/user-categorization', () => {
  return {
    categorizeUser: jest.fn().mockReturnValue('intermediate'),
    getLearningPath: jest.fn().mockReturnValue('full-stack-development'),
    getRecommendedInterests: jest.fn().mockReturnValue(['JavaScript', 'TypeScript', 'React']),
  };
});

// Mock services
jest.mock('../../authentication/services/profile-service', () => {
  return {
    ProfileService: jest.fn().mockImplementation(() => {
      return {
        createOrUpdateProfile: jest.fn().mockImplementation(async (userId, profileData) => {
          return {
            id: userId,
            email: profileData.email,
            software_experience: profileData.software_experience || [],
            hardware_familiarity: profileData.hardware_familiarity || [],
            years_coding: profileData.years_coding || 0,
            years_hardware: profileData.years_hardware || 0,
            primary_languages: profileData.primary_languages || [],
            development_area: profileData.development_area || '',
            preferred_platforms: profileData.preferred_platforms || [],
            robotics_experience: profileData.robotics_experience || 'none',
            skill_level: profileData.skill_level || 'beginner',
            interests: profileData.interests || [],
            learning_path: profileData.learning_path || '',
            created_at: new Date(),
            updated_at: new Date(),
          };
        }),
        getProfile: jest.fn().mockImplementation(async (userId) => {
          return {
            id: userId,
            email: 'test@example.com',
            software_experience: ['JavaScript', 'Python'],
            hardware_familiarity: ['Arduino', 'Raspberry Pi'],
            years_coding: 2,
            years_hardware: 1,
            primary_languages: ['JavaScript', 'Python'],
            development_area: 'web development',
            preferred_platforms: ['Arduino'],
            robotics_experience: 'basic',
            skill_level: 'intermediate',
            interests: ['JavaScript', 'TypeScript', 'React'],
            learning_path: 'full-stack-development',
            created_at: new Date(),
            updated_at: new Date(),
          };
        }),
        updateProfile: jest.fn().mockImplementation(async (userId, updateData) => {
          return {
            id: userId,
            email: 'test@example.com',
            ...updateData,
            created_at: new Date(Date.now() - 86400000), // 1 day ago
            updated_at: new Date(),
          };
        }),
      };
    })
  };
});

// Create a custom Jest matcher for easier testing
expect.extend({
  toBeValidUserProfile(received) {
    const pass =
      received.id &&
      received.email &&
      Array.isArray(received.software_experience) &&
      Array.isArray(received.hardware_familiarity) &&
      typeof received.skill_level === 'string';

    return {
      message: () => `expected user profile to be valid`,
      pass,
    };
  },

  toBeValidAuthResponse(received) {
    const pass =
      received.user &&
      received.session &&
      received.user.id &&
      received.session.id;

    return {
      message: () => `expected auth response to be valid`,
      pass,
    };
  },
});

// Define custom matchers types for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUserProfile(): R;
      toBeValidAuthResponse(): R;
    }
  }
}

// Additional test utilities
export const createMockRequest = (overrides = {}) => {
  return {
    headers: {
      get: jest.fn((headerName: string) => {
        const headers: Record<string, string> = {
          'content-type': 'application/json',
          'x-forwarded-for': '127.0.0.1',
          ...overrides.headers,
        };
        return headers[headerName.toLowerCase()];
      }),
    },
    nextUrl: {
      pathname: overrides.pathname || '/api/auth/signup',
      search: overrides.search || '',
    },
    method: overrides.method || 'POST',
    ip: overrides.ip || '127.0.0.1',
    ...overrides,
  };
};

export const createMockResponse = () => {
  const mockResponse = {
    headers: new Map(),
    status: 200,
    statusText: 'OK',
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue(''),
    arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
    formData: jest.fn().mockResolvedValue(new FormData()),
    blob: jest.fn().mockResolvedValue(new Blob()),
    clone: jest.fn().mockReturnValue({}),
    body: null,
    bodyUsed: false,
  };

  return {
    next: jest.fn().mockReturnValue(mockResponse),
    redirect: jest.fn().mockReturnValue(mockResponse),
    rewrite: jest.fn().mockReturnValue(mockResponse),
    set: jest.fn(),
    get: jest.fn(),
    append: jest.fn(),
    has: jest.fn(),
    delete: jest.fn(),
    forEach: jest.fn(),
    ...mockResponse,
  };
};

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Setup complete message
console.log('Authentication test environment initialized');