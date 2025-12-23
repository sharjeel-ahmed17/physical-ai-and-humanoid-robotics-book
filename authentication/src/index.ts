// Authentication Server Entry Point
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { AuthService } from '../services/auth-service';
import { SignupRequest, SigninRequest } from '../types/auth-types';

// Load environment variables from authentication directory
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('🔧 Environment loaded');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Auth Service
const authService = new AuthService();

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'authentication-server'
  });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Physical AI & Humanoid Robotics - Authentication API',
    version: '1.0.0',
    endpoints: {
      signup: 'POST /api/auth/signup',
      signin: 'POST /api/auth/signin',
      signout: 'POST /api/auth/signout',
      profile: 'GET /api/auth/profile',
      updateProfile: 'PUT /api/auth/profile'
    }
  });
});

// Signup endpoint
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const userData: SignupRequest = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await authService.signup(userData, ipAddress);

    res.status(201).json({
      success: true,
      data: result,
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'SIGNUP_FAILED',
        message: error instanceof Error ? error.message : 'Signup failed'
      }
    });
  }
});

// Signin endpoint
app.post('/api/auth/signin', async (req: Request, res: Response) => {
  try {
    const credentials: SigninRequest = req.body;
    const ipAddress = req.ip || req.socket.remoteAddress;

    const result = await authService.signin(credentials, ipAddress);

    res.status(200).json({
      success: true,
      data: result,
      message: 'User signed in successfully'
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(401).json({
      success: false,
      error: {
        code: 'SIGNIN_FAILED',
        message: error instanceof Error ? error.message : 'Signin failed'
      }
    });
  }
});

// Signout endpoint
app.post('/api/auth/signout', async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'Session ID is required'
        }
      });
    }

    await authService.signOut(sessionId);

    res.status(200).json({
      success: true,
      message: 'User signed out successfully'
    });
  } catch (error) {
    console.error('Signout error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'SIGNOUT_FAILED',
        message: error instanceof Error ? error.message : 'Signout failed'
      }
    });
  }
});

// Get user profile endpoint
app.get('/api/auth/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.headers['x-user-id'] as string;

    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User ID header is required'
        }
      });
    }

    const profile = await authService.getUserProfile(requestingUserId, userId);

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Get profile error:', error);
    const statusCode = error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: 'PROFILE_FETCH_FAILED',
        message: error instanceof Error ? error.message : 'Failed to fetch profile'
      }
    });
  }
});

// Update user profile endpoint
app.put('/api/auth/profile/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.headers['x-user-id'] as string;
    const updateData = req.body;

    if (!requestingUserId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User ID header is required'
        }
      });
    }

    const updatedProfile = await authService.updateUserProfile(requestingUserId, userId, updateData);

    res.status(200).json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    const statusCode = error instanceof Error && error.message.includes('Unauthorized') ? 403 : 400;
    res.status(statusCode).json({
      success: false,
      error: {
        code: 'PROFILE_UPDATE_FAILED',
        message: error instanceof Error ? error.message : 'Failed to update profile'
      }
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Authentication Server is running!`);
  console.log(`📍 Server URL: http://localhost:${PORT}`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/\n`);
});

export default app;
