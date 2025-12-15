import React from 'react';
import './Message.css';

const Message = ({ role, content, citations = [], timestamp }) => {
  const isUser = role === 'user';
  const isAssistant = role === 'assistant';

  return (
    <div className={`message ${isUser ? 'user-message' : 'assistant-message'}`}>
      <div className="message-content">
        <div className="message-text">
          {content}
        </div>

        {isAssistant && citations && citations.length > 0 && (
          <div className="citations">
            <div className="citation-title">Sources:</div>
            <ul className="citation-list">
              {citations.map((citation, index) => (
                <li key={index} className="citation-item">
                  <a
                    href={citation.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="citation-link"
                  >
                    {citation.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {timestamp && (
        <div className="message-timestamp">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default Message;