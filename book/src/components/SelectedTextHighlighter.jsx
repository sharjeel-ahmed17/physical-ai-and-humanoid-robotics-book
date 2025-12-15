import React, { useEffect, useRef } from 'react';
import './SelectedTextHighlighter.css';

const SelectedTextHighlighter = ({ onTextSelected }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();

      if (selectedText && onTextSelected) {
        // Get the selected text and additional context
        const range = selection.getRangeAt(0);
        const selectedElement = range.commonAncestorContainer;

        // Find the closest content container
        let contentContainer = selectedElement;
        while (contentContainer && contentContainer !== document.body) {
          if (contentContainer.classList &&
              (contentContainer.classList.contains('markdown') ||
               contentContainer.classList.contains('container') ||
               contentContainer.classList.contains('main') ||
               contentContainer.tagName === 'ARTICLE')) {
            break;
          }
          contentContainer = contentContainer.parentElement;
        }

        // Get additional context like URL section
        const currentUrl = window.location.href;

        onTextSelected({
          text: selectedText,
          context: {
            url: currentUrl,
            element: contentContainer ? contentContainer.tagName : 'unknown',
            position: {
              x: range.getBoundingClientRect().x,
              y: range.getBoundingClientRect().y
            }
          }
        });
      }
    };

    document.addEventListener('mouseup', handleSelection);

    return () => {
      document.removeEventListener('mouseup', handleSelection);
    };
  }, [onTextSelected]);

  return (
    <div className="selected-text-highlighter" ref={contentRef}>
      {/* This component doesn't render anything visible */}
      {/* It just adds the selection detection functionality to the page */}
    </div>
  );
};

export default SelectedTextHighlighter;