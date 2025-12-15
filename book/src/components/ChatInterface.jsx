import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import './ChatInterface.css';

const ChatInterface = ({
  messages = [],
  onSendMessage,
  isLoading = false,
  selectedText = null,
  onClearSelectedText = null
}) => {
  const [inputValue, setInputValue] = useState('');
  const [queryMode, setQueryMode] = useState('book-wide');
  const messagesEndRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && onSendMessage && !isLoading) {
      const messageData = {
        query: inputValue,
        queryMode,
        selectedText: queryMode === 'selected-text' ? selectedText : null
      };

      onSendMessage(messageData);
      setInputValue('');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {selectedText && (
          <div className="selected-text-preview">
            <div className="selected-text-label">Selected text:</div>
            <div className="selected-text-content">
              "{selectedText.substring(0, 200)}{selectedText.length > 200 ? '...' : ''}"
            </div>
            {onClearSelectedText && (
              <button
                className="clear-selected-text-btn"
                onClick={onClearSelectedText}
              >
                Clear selection
              </button>
            )}
          </div>
        )}

        {messages.map((message, index) => (
          <Message
            key={index}
            role={message.role}
            content={message.content}
            citations={message.citations || []}
            timestamp={message.timestamp}
          />
        ))}

        {isLoading && (
          <Message
            role="assistant"
            content="Thinking..."
            citations={[]}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="query-mode-selector">
          <label>
            <input
              type="radio"
              value="book-wide"
              checked={queryMode === 'book-wide'}
              onChange={(e) => setQueryMode(e.target.value)}
            />
            Book-wide Q&A
          </label>
          <label>
            <input
              type="radio"
              value="selected-text"
              checked={queryMode === 'selected-text'}
              onChange={(e) => setQueryMode(e.target.value)}
              disabled={!selectedText}
            />
            Selected-text Q&A
          </label>
        </div>

        <div className="input-container">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={
              queryMode === 'selected-text' && selectedText
                ? 'Ask about the selected text...'
                : 'Ask about the Physical AI & Humanoid Robotics book...'
            }
            disabled={isLoading}
            className="chat-input"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="send-button"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;