import axios from 'axios';

// Get base URL from environment variable (injected by webpack)
// eslint-disable-next-line no-undef
const API_BASE_URL = typeof process !== 'undefined' && process.env.REACT_APP_AUTH_API_BASE_URL
  ? process.env.REACT_APP_AUTH_API_BASE_URL
  : 'http://localhost:5000';

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds timeout
});

// Request interceptor to add auth token to requests
authAPI.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      if (userData.id) {
        config.headers['x-user-id'] = userData.id;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear local storage on unauthorized
      localStorage.removeItem('user');
      localStorage.removeItem('session');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service
 */
const authService = {
  /**
   * Sign up a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User and session data
   */
  async signup(userData) {
    try {
      const response = await authAPI.post('/api/auth/signup', userData);

      if (response.data.success) {
        // Store user and session data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('session', JSON.stringify(response.data.data.session));
        return response.data.data;
      }

      throw new Error(response.data.error?.message || 'Signup failed');
    } catch (error) {
      throw new Error(
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to sign up. Please try again.'
      );
    }
  },

  /**
   * Sign in an existing user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User and session data
   */
  async signin(email, password) {
    try {
      const response = await authAPI.post('/api/auth/signin', {
        email,
        password,
      });

      if (response.data.success) {
        // Store user and session data
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('session', JSON.stringify(response.data.data.session));
        return response.data.data;
      }

      throw new Error(response.data.error?.message || 'Signin failed');
    } catch (error) {
      throw new Error(
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to sign in. Please check your credentials.'
      );
    }
  },

  /**
   * Sign out the current user
   * @returns {Promise<void>}
   */
  async signout() {
    try {
      const session = localStorage.getItem('session');

      if (session) {
        const sessionData = JSON.parse(session);
        await authAPI.post('/api/auth/signout', {
          sessionId: sessionData.id,
        });
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      // Clear local storage regardless of API call result
      localStorage.removeItem('user');
      localStorage.removeItem('session');
    }
  },

  /**
   * Get user profile
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User profile data
   */
  async getProfile(userId) {
    try {
      const response = await authAPI.get(`/api/auth/profile/${userId}`);

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(response.data.error?.message || 'Failed to get profile');
    } catch (error) {
      throw new Error(
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to get user profile.'
      );
    }
  },

  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} updateData - Profile update data
   * @returns {Promise<Object>} Updated profile data
   */
  async updateProfile(userId, updateData) {
    try {
      const response = await authAPI.put(`/api/auth/profile/${userId}`, updateData);

      if (response.data.success) {
        // Update stored user data
        const user = localStorage.getItem('user');
        if (user) {
          const userData = JSON.parse(user);
          const updatedUser = { ...userData, ...response.data.data };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        return response.data.data;
      }

      throw new Error(response.data.error?.message || 'Failed to update profile');
    } catch (error) {
      throw new Error(
        error.response?.data?.error?.message ||
        error.message ||
        'Failed to update profile.'
      );
    }
  },

  /**
   * Get current user from local storage
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  /**
   * Get current session from local storage
   * @returns {Object|null} Current session data
   */
  getCurrentSession() {
    try {
      const session = localStorage.getItem('session');
      return session ? JSON.parse(session) : null;
    } catch (error) {
      console.error('Error getting current session:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated
   * @returns {boolean} True if user is authenticated
   */
  isAuthenticated() {
    const user = this.getCurrentUser();
    const session = this.getCurrentSession();

    if (!user || !session) {
      return false;
    }

    // Check if session is expired
    const expiresAt = new Date(session.expires_at);
    const now = new Date();

    if (expiresAt < now) {
      // Session expired, clear data
      this.signout();
      return false;
    }

    return true;
  },

  /**
   * Check health of authentication API
   * @returns {Promise<Object>} Health status
   */
  async checkHealth() {
    try {
      const response = await authAPI.get('/health');
      return response.data;
    } catch (error) {
      throw new Error('Authentication service is unavailable');
    }
  },
};

export default authService;
