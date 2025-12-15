import React from 'react';
import './Citation.css';

const Citation = ({ citation, index }) => {
  const {
    source_url: sourceUrl,
    title,
    text,
    relevance_score: relevanceScore,
    formatted,
  } = citation;

  return (
    <div className="citation">
      <div className="citation-header">
        <span className="citation-index">[{index + 1}]</span>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="citation-title"
        >
          {title}
        </a>
        {relevanceScore && (
          <span className="citation-score">
            ({(relevanceScore * 100).toFixed(1)}%)
          </span>
        )}
      </div>

      {text && (
        <div className="citation-text">
          {text}
        </div>
      )}

      {formatted && (
        <div className="citation-formatted">
          {formatted}
        </div>
      )}
    </div>
  );
};

export default Citation;