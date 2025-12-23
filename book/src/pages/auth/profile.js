import React, { useState, useEffect } from 'react';
import { useHistory } from '@docusaurus/router';
import Layout from '@theme/Layout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './auth.module.css';

export default function Profile() {
  const history = useHistory();
  const { user, isAuthenticated, updateProfile, signout } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    years_coding: 0,
    years_hardware: 0,
    development_area: '',
    robotics_experience: 'none',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      history.push('/auth/login');
    }
  }, [isAuthenticated, history]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFormData({
        years_coding: user.years_coding || 0,
        years_hardware: user.years_hardware || 0,
        development_area: user.development_area || '',
        robotics_experience: user.robotics_experience || 'none',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
    setApiError('');
    setSuccessMessage('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setApiError('');
    setSuccessMessage('');

    // Reset form data
    if (user) {
      setFormData({
        years_coding: user.years_coding || 0,
        years_hardware: user.years_hardware || 0,
        development_area: user.development_area || '',
        robotics_experience: user.robotics_experience || 'none',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      await updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setApiError(error.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await signout();
      history.push('/auth/login');
    }
  };

  if (!user) {
    return (
      <Layout title="Profile">
        <div className={styles.authContainer}>
          <p>Loading profile...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile" description="View and edit your profile">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <div className={styles.profileHeader}>
            <h1 className={styles.authTitle}>Your Profile</h1>
            <button
              onClick={handleSignout}
              className={styles.signoutButton}
            >
              Sign Out
            </button>
          </div>

          {apiError && (
            <div className={styles.errorAlert}>
              <strong>Error:</strong> {apiError}
            </div>
          )}

          {successMessage && (
            <div className={styles.successAlert}>
              <strong>Success:</strong> {successMessage}
            </div>
          )}

          {/* Profile Information */}
          <div className={styles.profileSection}>
            <h3 className={styles.sectionTitle}>Account Information</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Email</label>
                <p className={styles.infoValue}>{user.email}</p>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>User ID</label>
                <p className={styles.infoValue}>{user.id}</p>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Skill Level</label>
                <p className={styles.infoValue}>
                  <span className={styles.badge}>{user.skill_level}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Background Information */}
          <div className={styles.profileSection}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Background Information</h3>
              {!isEditing && (
                <button onClick={handleEdit} className={styles.editButton}>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="years_coding" className={styles.formLabel}>
                    Years of Coding Experience
                  </label>
                  <input
                    type="number"
                    id="years_coding"
                    name="years_coding"
                    value={formData.years_coding}
                    onChange={handleChange}
                    className={styles.formInput}
                    min="0"
                    max="50"
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="years_hardware" className={styles.formLabel}>
                    Years of Hardware Experience
                  </label>
                  <input
                    type="number"
                    id="years_hardware"
                    name="years_hardware"
                    value={formData.years_hardware}
                    onChange={handleChange}
                    className={styles.formInput}
                    min="0"
                    max="50"
                    disabled={isSubmitting}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="development_area" className={styles.formLabel}>
                    Primary Development Area
                  </label>
                  <select
                    id="development_area"
                    name="development_area"
                    value={formData.development_area}
                    onChange={handleChange}
                    className={styles.formInput}
                    disabled={isSubmitting}
                  >
                    <option value="">Select an area</option>
                    <option value="web">Web Development</option>
                    <option value="mobile">Mobile Development</option>
                    <option value="embedded">Embedded Systems</option>
                    <option value="ai">AI/Machine Learning</option>
                    <option value="robotics">Robotics</option>
                    <option value="iot">IoT</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="robotics_experience" className={styles.formLabel}>
                    Robotics Experience Level
                  </label>
                  <select
                    id="robotics_experience"
                    name="robotics_experience"
                    value={formData.robotics_experience}
                    onChange={handleChange}
                    className={styles.formInput}
                    disabled={isSubmitting}
                  >
                    <option value="none">No Experience</option>
                    <option value="basic">Basic (Hobby projects)</option>
                    <option value="intermediate">Intermediate (Some professional work)</option>
                    <option value="advanced">Advanced (Expert level)</option>
                  </select>
                </div>

                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className={styles.secondaryButton}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Years of Coding</label>
                  <p className={styles.infoValue}>{user.years_coding || 0}</p>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Years of Hardware</label>
                  <p className={styles.infoValue}>{user.years_hardware || 0}</p>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Development Area</label>
                  <p className={styles.infoValue}>
                    {user.development_area || 'Not specified'}
                  </p>
                </div>
                <div className={styles.infoItem}>
                  <label className={styles.infoLabel}>Robotics Experience</label>
                  <p className={styles.infoValue}>
                    {user.robotics_experience || 'none'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Software & Hardware Experience */}
          <div className={styles.profileSection}>
            <h3 className={styles.sectionTitle}>Technical Experience</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Software Experience</label>
                <div className={styles.tagList}>
                  {user.software_experience && user.software_experience.length > 0 ? (
                    user.software_experience.map((tech, index) => (
                      <span key={index} className={styles.tag}>
                        {tech}
                      </span>
                    ))
                  ) : (
                    <p className={styles.infoValue}>None specified</p>
                  )}
                </div>
              </div>
              <div className={styles.infoItem}>
                <label className={styles.infoLabel}>Hardware Familiarity</label>
                <div className={styles.tagList}>
                  {user.hardware_familiarity && user.hardware_familiarity.length > 0 ? (
                    user.hardware_familiarity.map((hw, index) => (
                      <span key={index} className={styles.tag}>
                        {hw}
                      </span>
                    ))
                  ) : (
                    <p className={styles.infoValue}>None specified</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Learning Path */}
          {user.learning_path && (
            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Your Learning Path</h3>
              <p className={styles.learningPath}>{user.learning_path}</p>
            </div>
          )}

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <div className={styles.profileSection}>
              <h3 className={styles.sectionTitle}>Recommended Interests</h3>
              <div className={styles.tagList}>
                {user.interests.map((interest, index) => (
                  <span key={index} className={styles.interestTag}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
