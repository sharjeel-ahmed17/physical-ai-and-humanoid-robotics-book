import apiClient from './apiClient';
import { v4 as uuidv4 } from 'uuid';

class ChatClient {
  constructor() {
    this.sessionId = this.getSessionId();
  }

  // Get or create session ID
  getSessionId() {
    // Check if we're in the browser environment (not server-side rendering)
    if (typeof window !== 'undefined' && window.localStorage) {
      let sessionId = localStorage.getItem('chat_session_id');
      if (!sessionId) {
        sessionId = uuidv4();
        localStorage.setItem('chat_session_id', sessionId);
      }
      return sessionId;
    } else {
      // If running server-side, return a temporary ID
      // In a real implementation, you'd want to handle session management differently for SSR
      return this.sessionId || uuidv4();
    }
  }

  // Reset session
  resetSession() {
    const newSessionId = uuidv4();
    localStorage.setItem('chat_session_id', newSessionId);
    this.sessionId = newSessionId;
    return newSessionId;
  }

  // Send a message to the chat API
  async sendMessage(query, options = {}) {
    const {
      queryMode = 'book-wide', // 'book-wide' or 'selected-text'
      selectedText = null,
    } = options;

    const requestData = {
      query: query,
      session_id: this.sessionId,
      query_mode: queryMode,
    };

    if (selectedText) {
      requestData.selected_text = selectedText;
    }

    try {
      const response = await apiClient.chatCompletion(requestData);
      return {
        success: true,
        data: response,
        sessionId: this.sessionId,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get response from chat API',
        sessionId: this.sessionId,
      };
    }
  }

  // Search content in the book
  async searchContent(query, limit = 10) {
    try {
      const response = await apiClient.searchContent({
        query,
        limit,
      });
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to search content',
      };
    }
  }

  // Get conversation history
  async getConversationHistory() {
    try {
      const response = await apiClient.getConversationHistory(this.sessionId);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get conversation history',
      };
    }
  }

  // Get content statistics
  async getContentStats() {
    try {
      const response = await apiClient.getContentStats();
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to get content stats',
      };
    }
  }

  // Check API health
  async checkHealth() {
    try {
      const response = await apiClient.healthCheck();
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'API health check failed',
      };
    }
  }
}

// Create and export a singleton instance
const chatClient = new ChatClient();
export default chatClient;