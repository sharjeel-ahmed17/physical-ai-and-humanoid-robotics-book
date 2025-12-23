import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useHistory } from '@docusaurus/router';
import styles from './NavbarAuth.module.css';

export default function NavbarAuth() {
  const { user, isAuthenticated, signout } = useAuth();
  const history = useHistory();
  const [showDropdown, setShowDropdown] = React.useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('NavbarAuth rendered');
    console.log('User:', user);
    console.log('Is Authenticated:', isAuthenticated());
  }, [user, isAuthenticated]);

  const handleSignout = async () => {
    await signout();
    setShowDropdown(false);
    history.push('/');
  };

  const handleProfile = () => {
    setShowDropdown(false);
    history.push('/auth/profile');
  };

  if (!isAuthenticated()) {
    return (
      <div className={styles.authButtons}>
        <a href="/auth/login" className={styles.loginButton}>
          Login
        </a>
        <a href="/auth/signup" className={styles.signupButton}>
          Sign Up
        </a>
      </div>
    );
  }

  return (
    <div className={styles.userMenu}>
      <button
        className={styles.userButton}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label="User menu"
      >
        <div className={styles.userAvatar}>
          {user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className={styles.userName}>
          {user?.email?.split('@')[0] || 'User'}
        </span>
        <svg
          className={styles.dropdownIcon}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
        >
          <path d="M6 9L1 4h10z" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div
            className={styles.dropdownBackdrop}
            onClick={() => setShowDropdown(false)}
          />
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <div className={styles.dropdownEmail}>{user?.email}</div>
              {user?.skill_level && (
                <div className={styles.dropdownBadge}>
                  {user.skill_level}
                </div>
              )}
            </div>
            <div className={styles.dropdownDivider} />
            <button
              className={styles.dropdownItem}
              onClick={handleProfile}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm0 1c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
              View Profile
            </button>
            <button
              className={styles.dropdownItem}
              onClick={handleSignout}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M3 0h10a1 1 0 011 1v5h-2V2H4v12h8v-4h2v5a1 1 0 01-1 1H3a1 1 0 01-1-1V1a1 1 0 011-1z" />
                <path d="M10 8l3-3v2h5v2h-5v2l-3-3z" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
