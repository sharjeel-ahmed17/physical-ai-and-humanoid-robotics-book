import React, { useState } from 'react';
import { useHistory } from '@docusaurus/router';
import Layout from '@theme/Layout';
import { useAuth } from '../../contexts/AuthContext';
import styles from './auth.module.css';

export default function Signup() {
  const history = useHistory();
  const { signup, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    software_experience: [],
    hardware_familiarity: [],
    years_coding: 0,
    years_hardware: 0,
    primary_languages: [],
    development_area: '',
    preferred_platforms: [],
    robotics_experience: 'none',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated()) {
      history.push('/');
    }
  }, [isAuthenticated, history]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      // Handle multi-select checkboxes
      setFormData((prev) => {
        const currentValues = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...currentValues, value] };
        } else {
          return {
            ...prev,
            [name]: currentValues.filter((v) => v !== value),
          };
        }
      });
    } else if (type === 'number') {
      setFormData((prev) => ({
        ...prev,
        [name]: parseInt(value) || 0,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateStep1 = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one uppercase letter';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one lowercase letter';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one number';
    } else if (!/[!@#$%^&*]/.test(formData.password)) {
      newErrors.password = 'Password must contain at least one special character (!@#$%^&*)';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};

    if (!formData.development_area) {
      newErrors.development_area = 'Please select your development area';
    }

    if (!formData.robotics_experience) {
      newErrors.robotics_experience = 'Please select your robotics experience level';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      setApiError('');
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setApiError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateStep2()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const signupData = {
        email: formData.email,
        password: formData.password,
        software_experience: formData.software_experience,
        hardware_familiarity: formData.hardware_familiarity,
        years_coding: formData.years_coding,
        years_hardware: formData.years_hardware,
        primary_languages: formData.primary_languages,
        development_area: formData.development_area,
        preferred_platforms: formData.preferred_platforms,
        robotics_experience: formData.robotics_experience,
      };

      await signup(signupData);

      // Redirect to home page on success
      history.push('/');
    } catch (error) {
      setApiError(error.message || 'Failed to sign up. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Sign Up" description="Create a new account">
      <div className={styles.authContainer}>
        <div className={styles.authCard}>
          <h1 className={styles.authTitle}>Create Your Account</h1>
          <p className={styles.authSubtitle}>
            Join us to start your journey in Physical AI & Robotics
          </p>

          {/* Progress Indicator */}
          <div className={styles.progressContainer}>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${(currentStep / 2) * 100}%` }}
              ></div>
            </div>
            <p className={styles.progressText}>
              Step {currentStep} of 2
            </p>
          </div>

          {apiError && (
            <div className={styles.errorAlert}>
              <strong>Error:</strong> {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {/* Step 1: Account Information */}
            {currentStep === 1 && (
              <div className={styles.formStep}>
                <h3 className={styles.stepTitle}>Account Information</h3>

                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.email ? styles.inputError : ''}`}
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <span className={styles.errorMessage}>{errors.email}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>
                    Password *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.password ? styles.inputError : ''}`}
                    placeholder="Create a strong password"
                  />
                  {errors.password && (
                    <span className={styles.errorMessage}>{errors.password}</span>
                  )}
                  <small className={styles.formHint}>
                    Must be 8+ characters with uppercase, lowercase, number, and special character
                  </small>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="confirmPassword" className={styles.formLabel}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.confirmPassword ? styles.inputError : ''}`}
                    placeholder="Re-enter your password"
                  />
                  {errors.confirmPassword && (
                    <span className={styles.errorMessage}>{errors.confirmPassword}</span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className={styles.submitButton}
                >
                  Next: Background Information
                </button>
              </div>
            )}

            {/* Step 2: Background Profiling */}
            {currentStep === 2 && (
              <div className={styles.formStep}>
                <h3 className={styles.stepTitle}>Your Background</h3>
                <p className={styles.stepDescription}>
                  Help us personalize your learning experience
                </p>

                {/* Software Experience */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Software Experience (Select all that apply)
                  </label>
                  <div className={styles.checkboxGroup}>
                    {['JavaScript', 'Python', 'C++', 'Java', 'C', 'Rust', 'Go'].map((lang) => (
                      <label key={lang} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="software_experience"
                          value={lang}
                          checked={formData.software_experience.includes(lang)}
                          onChange={handleChange}
                          className={styles.checkbox}
                        />
                        {lang}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Years Coding */}
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
                  />
                </div>

                {/* Hardware Familiarity */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Hardware Familiarity (Select all that apply)
                  </label>
                  <div className={styles.checkboxGroup}>
                    {['Arduino', 'Raspberry Pi', 'ESP32', 'NVIDIA Jetson', 'Custom PCB'].map((hw) => (
                      <label key={hw} className={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          name="hardware_familiarity"
                          value={hw}
                          checked={formData.hardware_familiarity.includes(hw)}
                          onChange={handleChange}
                          className={styles.checkbox}
                        />
                        {hw}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Years Hardware */}
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
                  />
                </div>

                {/* Development Area */}
                <div className={styles.formGroup}>
                  <label htmlFor="development_area" className={styles.formLabel}>
                    Primary Development Area *
                  </label>
                  <select
                    id="development_area"
                    name="development_area"
                    value={formData.development_area}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.development_area ? styles.inputError : ''}`}
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
                  {errors.development_area && (
                    <span className={styles.errorMessage}>{errors.development_area}</span>
                  )}
                </div>

                {/* Robotics Experience */}
                <div className={styles.formGroup}>
                  <label htmlFor="robotics_experience" className={styles.formLabel}>
                    Robotics Experience Level *
                  </label>
                  <select
                    id="robotics_experience"
                    name="robotics_experience"
                    value={formData.robotics_experience}
                    onChange={handleChange}
                    className={`${styles.formInput} ${errors.robotics_experience ? styles.inputError : ''}`}
                  >
                    <option value="none">No Experience</option>
                    <option value="basic">Basic (Hobby projects)</option>
                    <option value="intermediate">Intermediate (Some professional work)</option>
                    <option value="advanced">Advanced (Expert level)</option>
                  </select>
                  {errors.robotics_experience && (
                    <span className={styles.errorMessage}>{errors.robotics_experience}</span>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className={styles.buttonGroup}>
                  <button
                    type="button"
                    onClick={handleBack}
                    className={styles.secondaryButton}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={styles.submitButton}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>
                </div>
              </div>
            )}
          </form>

          {/* Sign In Link */}
          <div className={styles.authFooter}>
            <p>
              Already have an account?{' '}
              <a href="/auth/login" className={styles.authLink}>
                Sign in here
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
