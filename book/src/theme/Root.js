import React, { useEffect } from 'react';
import ChatWidget from '../components/ChatWidget';

// Default CSS for the chat widget
import '../styles/chatWidget.css';

// Root component that wraps the entire Docusaurus app
const Root = ({ children }) => {
  useEffect(() => {
    // Any initialization code can go here
    console.log('Physical AI & Humanoid Robotics Chatbot loaded');
  }, []);

  return (
    <>
      {children}
      <ChatWidget />
    </>
  );
};

export default Root;