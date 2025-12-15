import { useState, useEffect, useCallback } from 'react';
import chatClient from '../services/chatClient';

const useChat = (initialMessages = []) => {
  const [messages, setMessages] = useState(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(chatClient.sessionId);

  // Initialize with a welcome message
  useEffect(() => {
    if (initialMessages.length === 0) {
      setMessages([
        {
          id: 'welcome-' + Date.now(),
          role: 'assistant',
          content: 'Hello! I\'m your AI assistant for the Physical AI & Humanoid Robotics book. Ask me anything about the book content!',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [initialMessages]);

  // Function to send a message
  const sendMessage = useCallback(async (query, options = {}) => {
    // Validate input
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      setError('Message cannot be empty');
      return;
    }

    // Add user message to the conversation
    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Send message to the backend
      const response = await chatClient.sendMessage(query, options);

      if (response.success) {
        // Add assistant response to the conversation
        const assistantMessage = {
          id: 'assistant-' + Date.now(),
          role: 'assistant',
          content: response.data.choices[0]?.message?.content ||
                  'I received your message but there was an issue generating a response.',
          citations: response.data.citations || [],
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        setSessionId(response.sessionId);
      } else {
        // Add error message to the conversation
        const errorMessage = {
          id: 'error-' + Date.now(),
          role: 'assistant',
          content: `Sorry, I couldn't process your request: ${response.error}`,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err.message || 'An error occurred while sending the message');

      const errorMessage = {
        id: 'error-' + Date.now(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to clear conversation
  const clearConversation = useCallback(() => {
    const newSessionId = chatClient.resetSession();
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant for the Physical AI & Humanoid Robotics book. Ask me anything about the book content!',
        timestamp: new Date().toISOString()
      }
    ]);
    setSessionId(newSessionId);
    setError(null);
  }, []);

  // Function to get conversation history
  const getConversationHistory = useCallback(async () => {
    try {
      const response = await chatClient.getConversationHistory();
      if (response.success) {
        // Convert API response to our message format
        // For now, we'll just return the current messages
        return messages;
      }
      return messages;
    } catch (error) {
      console.error('Error getting conversation history:', error);
      return messages;
    }
  }, [messages]);

  // Function to search content
  const searchContent = useCallback(async (query, limit = 10) => {
    try {
      const response = await chatClient.searchContent(query, limit);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error searching content:', error);
      return null;
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearConversation,
    getConversationHistory,
    searchContent,
    setMessages
  };
};

export default useChat;