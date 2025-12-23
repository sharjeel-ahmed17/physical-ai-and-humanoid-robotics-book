import React, { useEffect } from 'react';
import ChatWidget from '../components/ChatWidget';
import { AuthProvider } from '../contexts/AuthContext';

// Default CSS for the chat widget
import '../styles/chatWidget.css';

// Root component that wraps the entire Docusaurus app
const Root = ({ children }) => {
  useEffect(() => {
    // Any initialization code can go here
    console.log('Physical AI & Humanoid Robotics Chatbot loaded');
    console.log('Authentication system initialized');
  }, []);

  return (
    <AuthProvider>
      {children}
      <ChatWidget />
    </AuthProvider>
  );
};

export default Root;