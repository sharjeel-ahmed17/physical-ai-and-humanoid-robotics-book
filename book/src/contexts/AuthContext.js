import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load user and session from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = authService.getCurrentUser();
      const storedSession = authService.getCurrentSession();

      if (storedUser && storedSession) {
        // Check if session is still valid
        const expiresAt = new Date(storedSession.expires_at);
        const now = new Date();

        if (expiresAt > now) {
          setUser(storedUser);
          setSession(storedSession);
        } else {
          // Session expired, clear data
          authService.signout();
        }
      }
    } catch (err) {
      console.error('Error loading auth state:', err);
      setError('Failed to load authentication state');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign up a new user
   */
  const signup = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.signup(userData);

      setUser(result.user);
      setSession(result.session);

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Signup failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign in an existing user
   */
  const signin = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const result = await authService.signin(email, password);

      setUser(result.user);
      setSession(result.session);

      return result;
    } catch (err) {
      const errorMessage = err.message || 'Signin failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out the current user
   */
  const signout = async () => {
    try {
      setLoading(true);
      setError(null);

      await authService.signout();

      setUser(null);
      setSession(null);
    } catch (err) {
      console.error('Signout error:', err);
      // Clear state even if API call fails
      setUser(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update user profile
   */
  const updateProfile = async (updateData) => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user is currently signed in');
      }

      const updatedUser = await authService.updateProfile(user.id, updateData);

      setUser(updatedUser);

      return updatedUser;
    } catch (err) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Refresh user profile
   */
  const refreshProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('No user is currently signed in');
      }

      const refreshedUser = await authService.getProfile(user.id);

      setUser(refreshedUser);

      return refreshedUser;
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh profile';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const value = {
    user,
    session,
    loading,
    error,
    signup,
    signin,
    signout,
    updateProfile,
    refreshProfile,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use Auth Context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default AuthContext;
