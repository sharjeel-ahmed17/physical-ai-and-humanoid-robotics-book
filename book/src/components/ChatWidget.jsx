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
        const health = await chatClient.checkHealth();
        if (health.success) {
          setIsClientReady(true);
          // Load conversation history
          const history = await chatClient.getConversationHistory();
          if (history.success) {
            // Convert history to our message format
            // For now, we'll just initialize with an empty message history
            setMessages([
              {
                role: 'assistant',
                content: 'Hello! I\'m your AI assistant for the Physical AI & Humanoid Robotics book. Ask me anything about the book content!',
                timestamp: new Date().toISOString()
              }
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to initialize chat client:', error);
        setIsClientReady(false);
      }
    };

    initializeClient();
  }, []);

  const handleSendMessage = async (messageData) => {
    if (!isClientReady) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, the chat service is not available right now. Please try again later.',
          timestamp: new Date().toISOString()
        }
      ]);
      return;
    }

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
        // Add error message to the conversation
        const errorMessage = {
          role: 'assistant',
          content: `Sorry, I couldn't process your request: ${response.error}`,
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