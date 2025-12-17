// Input validation functions for authentication module
import { z } from 'zod';
import { SignupRequest, SigninRequest, ProfileUpdateRequest } from '../types/auth-types';

// Rate limiting storage (in a real implementation, this would be in Redis or similar)
const rateLimitStorage: Map<string, { count: number; timestamp: number }> = new Map();

// Signup request validation schema
export const SignupRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  software_experience: z
    .array(z.string().min(2).max(50))
    .max(10, 'Maximum 10 software experiences allowed')
    .optional(),
  hardware_familiarity: z
    .array(z.string().min(2).max(50))
    .max(10, 'Maximum 10 hardware familiarites allowed')
    .optional(),
  years_coding: z
    .number()
    .min(0, 'Years of coding must be 0 or greater')
    .max(50, 'Years of coding must be 50 or less')
    .optional(),
  years_hardware: z
    .number()
    .min(0, 'Years of hardware experience must be 0 or greater')
    .max(50, 'Years of hardware experience must be 50 or less')
    .optional(),
  primary_languages: z.array(z.string()).optional(),
  development_area: z.string().optional(),
  preferred_platforms: z.array(z.string()).optional(),
  robotics_experience: z
    .enum(['none', 'basic', 'intermediate', 'advanced'])
    .optional(),
});

// Signin request validation schema
export const SigninRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Profile update request validation schema
export const ProfileUpdateRequestSchema = z.object({
  software_experience: z
    .array(z.string().min(2).max(50))
    .max(10, 'Maximum 10 software experiences allowed')
    .optional(),
  hardware_familiarity: z
    .array(z.string().min(2).max(50))
    .max(10, 'Maximum 10 hardware familiarites allowed')
    .optional(),
  years_coding: z
    .number()
    .min(0, 'Years of coding must be 0 or greater')
    .max(50, 'Years of coding must be 50 or less')
    .optional(),
  years_hardware: z
    .number()
    .min(0, 'Years of hardware experience must be 0 or greater')
    .max(50, 'Years of hardware experience must be 50 or less')
    .optional(),
  primary_languages: z.array(z.string()).optional(),
  development_area: z.string().optional(),
  preferred_platforms: z.array(z.string()).optional(),
  robotics_experience: z
    .enum(['none', 'basic', 'intermediate', 'advanced'])
    .optional(),
});

// Validate signup request
export function validateSignupRequest(data: unknown): {
  success: boolean;
  data?: SignupRequest;
  errors?: string[];
} {
  try {
    // Sanitize the input data before validation
    const sanitizedData = sanitizeObject(data as Record<string, any>);
    const result = SignupRequestSchema.parse(sanitizedData);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Enhanced signup validation with business logic
export function validateSignupWithBusinessLogic(data: SignupRequest): {
  success: boolean;
  errors?: string[];
} {
  const errors: string[] = [];

  // Email validation
  if (!validateEmail(data.email)) {
    errors.push('Invalid email format');
  }

  // Password strength validation
  const passwordValidation = validatePasswordStrength(data.password);
  if (!passwordValidation.valid) {
    errors.push(...passwordValidation.errors);
  }

  // Software experience validation
  if (data.software_experience) {
    const softwareValidation = validateStringArray(data.software_experience, 0, 10, 2, 50);
    if (!softwareValidation.valid) {
      errors.push(...softwareValidation.errors);
    }
  }

  // Hardware familiarity validation
  if (data.hardware_familiarity) {
    const hardwareValidation = validateStringArray(data.hardware_familiarity, 0, 10, 2, 50);
    if (!hardwareValidation.valid) {
      errors.push(...hardwareValidation.errors);
    }
  }

  // Years validation
  if (data.years_coding !== undefined) {
    const yearsCodingValidation = validateNumberInRange(data.years_coding, 0, 50);
    if (!yearsCodingValidation.valid) {
      errors.push(...yearsCodingValidation.errors);
    }
  }

  if (data.years_hardware !== undefined) {
    const yearsHardwareValidation = validateNumberInRange(data.years_hardware, 0, 50);
    if (!yearsHardwareValidation.valid) {
      errors.push(...yearsHardwareValidation.errors);
    }
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined
  };
}

// Validate signin request
export function validateSigninRequest(data: unknown): {
  success: boolean;
  data?: SigninRequest;
  errors?: string[];
} {
  try {
    // Sanitize the input data before validation
    const sanitizedData = sanitizeObject(data as Record<string, any>);
    const result = SigninRequestSchema.parse(sanitizedData);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Validate profile update request
export function validateProfileUpdateRequest(data: unknown): {
  success: boolean;
  data?: ProfileUpdateRequest;
  errors?: string[];
} {
  try {
    // Sanitize the input data before validation
    const sanitizedData = sanitizeObject(data as Record<string, any>);
    const result = ProfileUpdateRequestSchema.parse(sanitizedData);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => err.message);
      return { success: false, errors };
    }
    return { success: false, errors: ['Unknown validation error'] };
  }
}

// Rate limiting function
export function checkRateLimit(identifier: string, maxRequests: number, windowMs: number): {
  allowed: boolean;
  remaining: number;
  resetTime: number;
} {
  const now = Date.now();
  const record = rateLimitStorage.get(identifier);

  if (!record) {
    // First request from this identifier
    rateLimitStorage.set(identifier, { count: 1, timestamp: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Check if window has passed
  if (now - record.timestamp > windowMs) {
    // Reset the counter
    rateLimitStorage.set(identifier, { count: 1, timestamp: now });
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  // Check if limit exceeded
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.timestamp + windowMs,
    };
  }

  // Increment the counter
  rateLimitStorage.set(identifier, { count: record.count + 1, timestamp: record.timestamp });

  return {
    allowed: true,
    remaining: maxRequests - (record.count + 1),
    resetTime: record.timestamp + windowMs,
  };
}

// Validate email format
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password should contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Sanitize input to prevent injection attacks
export function sanitizeInput(input: string): string {
  // Remove potentially dangerous characters
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/vbscript:/gi, '')   // Remove vbscript: protocol
    .replace(/on\w+\s*=/gi, '');  // Remove event handlers like onclick, onload, etc.
}

// Sanitize an entire object recursively
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'string' ? sanitizeInput(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized as T;
}

// Sanitize array of strings
export function sanitizeStringArray(arr: string[]): string[] {
  return arr.map(item => sanitizeInput(item));
}

// Validate array of strings
export function validateStringArray(
  arr: unknown,
  minItems: number = 0,
  maxItems: number = 10,
  minLength: number = 2,
  maxLength: number = 50
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(arr)) {
    errors.push('Value must be an array');
    return { valid: false, errors };
  }

  if (arr.length < minItems) {
    errors.push(`Array must have at least ${minItems} items`);
  }

  if (arr.length > maxItems) {
    errors.push(`Array must have at most ${maxItems} items`);
  }

  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'string') {
      errors.push(`Item at index ${i} must be a string`);
    } else if (arr[i].length < minLength) {
      errors.push(`Item at index ${i} must be at least ${minLength} characters long`);
    } else if (arr[i].length > maxLength) {
      errors.push(`Item at index ${i} must be at most ${maxLength} characters long`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Validate number within range
export function validateNumberInRange(
  value: unknown,
  min: number,
  max: number
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof value !== 'number') {
    errors.push('Value must be a number');
  } else if (value < min) {
    errors.push(`Value must be at least ${min}`);
  } else if (value > max) {
    errors.push(`Value must be at most ${max}`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Check if request is rate limited for signup
export function isSignupRateLimited(ipAddress: string): boolean {
  const result = checkRateLimit(`signup:${ipAddress}`, 5, 3600000); // 5 signups per hour
  return !result.allowed;
}

// Check if request is rate limited for signin
export function isSigninRateLimited(ipAddress: string): boolean {
  const result = checkRateLimit(`signin:${ipAddress}`, 10, 300000); // 10 signins per 5 minutes
  return !result.allowed;
}