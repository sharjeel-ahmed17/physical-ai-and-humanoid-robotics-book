import React, { useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import { useAuth } from '../contexts/AuthContext';
import styles from './ProtectedRoute.module.css';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const history = useHistory();

  useEffect(() => {
    if (!loading && !isAuthenticated()) {
      // Redirect to login with return URL
      const currentPath = window.location.pathname;
      history.push(`/auth/login?returnUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, loading, history]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div className={styles.unauthorizedContainer}>
        <div className={styles.unauthorizedCard}>
          <svg
            className={styles.lockIcon}
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <h2>Authentication Required</h2>
          <p>Please sign in to access this page.</p>
          <a href="/auth/login" className={styles.loginLink}>
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
