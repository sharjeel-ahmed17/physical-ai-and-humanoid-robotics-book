import React, { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';
import SelectedTextHighlighter from './SelectedTextHighlighter';
import chatClient from '../services/chatClient';
import '../styles/chatWidget.css';

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedText, setSelectedText] = useState(null);
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);
  const [isClientReady, setIsClientReady] = useState(false);

  // Initialize chat client and check health on component mount
  useEffect(() => {
    const initializeClient = async () => {
      try {
        console.log('Initializing chat client...');
        const health = await chatClient.checkHealth();
        console.log('Health check response:', health);

        if (health.success) {
          console.log('Chat client is ready!');
          setIsClientReady(true);
          // Initialize with welcome message
          setMessages([
            {
              role: 'assistant',
              content: 'Hello! I\'m your AI assistant for the Physical AI & Humanoid Robotics book. Ask me anything about the book content!',
              timestamp: new Date().toISOString()
            }
          ]);
        } else {
          console.error('Health check failed:', health.error);
          setIsClientReady(false);
          // Show error message but allow user to try
          setMessages([
            {
              role: 'assistant',
              content: 'Connection to the chat service is unavailable. The service may be starting up. Please wait a moment and try sending a message.',
              timestamp: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error('Failed to initialize chat client:', error);
        setIsClientReady(false);
        // Show error message but allow retry
        setMessages([
          {
            role: 'assistant',
            content: 'Unable to connect to the chat service. Please ensure the backend server is running on http://localhost:8000',
            timestamp: new Date().toISOString()
          }
        ]);
      }
    };

    initializeClient();
  }, []);

  const handleSendMessage = async (messageData) => {
    // Try to send message even if health check failed initially
    // The backend might be ready now

    // Add user message to the conversation
    const userMessage = {
      role: 'user',
      content: messageData.query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Send message to the backend
      const response = await chatClient.sendMessage(
        messageData.query,
        {
          queryMode: messageData.queryMode,
          selectedText: messageData.selectedText
        }
      );

      if (response.success) {
        console.log('Message sent successfully:', response);
        // Mark client as ready since we got a successful response
        setIsClientReady(true);

        // Add assistant response to the conversation
        // Extract content from the response based on backend format
        let content = 'I received your message but there was an issue generating a response.';
        if (response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
          content = response.data.choices[0].message.content;
        } else if (response.data.response) {
          // Fallback to response field if choices not available
          content = response.data.response;
        }

        const assistantMessage = {
          role: 'assistant',
          content: content,
          citations: response.data.citations || [],
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else {
        console.error('Message send failed:', response);
        // Add error message to the conversation
        const errorMessage = {
          role: 'assistant',
          content: `Sorry, I couldn't process your request. ${response.error || 'Please check if the backend server is running.'}`,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelected = (selectionData) => {
    setSelectedText(selectionData.text);
  };

  const handleClearSelectedText = () => {
    setSelectedText(null);
  };

  const toggleWidget = () => {
    setIsWidgetOpen(!isWidgetOpen);
  };

  return (
    <div className="chat-widget">
      <SelectedTextHighlighter onTextSelected={handleTextSelected} />

      {isWidgetOpen ? (
        <div className="chat-widget-content">
          <div className="chat-widget-header">
            <h3>AI Assistant</h3>
            <button
              className="close-widget-btn"
              onClick={toggleWidget}
              aria-label="Close chat widget"
            >
              ×
            </button>
          </div>

          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            selectedText={selectedText}
            onClearSelectedText={handleClearSelectedText}
          />
        </div>
      ) : (
        <button
          className="open-widget-btn"
          onClick={toggleWidget}
          aria-label="Open chat widget"
        >
          💬 AI Assistant
        </button>
      )}
    </div>
  );
};

export default ChatWidget;