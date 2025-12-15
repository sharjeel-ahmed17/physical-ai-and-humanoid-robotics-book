import { useState, useEffect } from 'react';

const useSelectedText = () => {
  const [selectedText, setSelectedText] = useState(null);
  const [selectionContext, setSelectionContext] = useState(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text) {
        // Get additional context about the selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const context = {
          url: window.location.href,
          element: range.commonAncestorContainer?.parentElement?.tagName || 'unknown',
          position: { x: rect.x, y: rect.y },
          dimensions: { width: rect.width, height: rect.height }
        };

        setSelectedText(text);
        setSelectionContext(context);
      } else {
        setSelectedText(null);
        setSelectionContext(null);
      }
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        setSelectedText(null);
        setSelectionContext(null);
      }
    });

    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', (e) => {
        if (e.key === 'Escape') {
          setSelectedText(null);
          setSelectionContext(null);
        }
      });
    };
  }, []);

  const clearSelection = () => {
    setSelectedText(null);
    setSelectionContext(null);
    window.getSelection().removeAllRanges();
  };

  return {
    selectedText,
    selectionContext,
    clearSelection
  };
};

export default useSelectedText;