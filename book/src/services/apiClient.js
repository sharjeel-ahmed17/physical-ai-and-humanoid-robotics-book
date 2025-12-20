import axios from 'axios';

class ApiClient {
  constructor(baseURL) {
    // For production, use Hugging Face backend
    // For local development, use localhost
    const envBaseURL = typeof window !== 'undefined'
      ? window.REACT_APP_API_BASE_URL
      : process.env.REACT_APP_API_BASE_URL;

    // Default to Hugging Face backend for production
    const defaultBaseURL = envBaseURL || 'https://sharjeel17-chatbot.hf.space';

    this.client = axios.create({
      baseURL: baseURL || defaultBaseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = localStorage.getItem('api_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Chat endpoints
  async chatCompletion(data) {
    try {
      const response = await this.client.post('/chat/chat', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Content search endpoints
  async searchContent(data) {
    try {
      const response = await this.client.post('/content/search', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getContentStats() {
    try {
      const response = await this.client.get('/content/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Conversation endpoints
  async getConversationHistory(sessionId) {
    try {
      const response = await this.client.get(`/conversations/${sessionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteConversationHistory(sessionId) {
    try {
      const response = await this.client.delete(`/conversations/${sessionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      return {
        status,
        message: data.detail || data.message || 'An error occurred',
        ...data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        status: 0,
        message: 'Network error: Unable to reach the server',
      };
    } else {
      // Something else happened
      return {
        status: 0,
        message: error.message || 'An unknown error occurred',
      };
    }
  }
}

// Create and export a singleton instance
const apiClient = new ApiClient();
export default apiClient;