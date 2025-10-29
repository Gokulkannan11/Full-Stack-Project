import React, { useState, useRef } from 'react';
import { authAPI } from '../../../services/api';
import './SignUpPage.css';

const SignUpPage = ({ onNavigate, onSignup }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Prevent double submission
  const isSubmitting = useRef(false);

  const validateForm = () => {
    const newErrors = {};

    if (username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission
    if (isSubmitting.current || loading) {
      console.log('Already submitting, ignoring duplicate request...');
      return;
    }

    if (!validateForm()) {
      return;
    }

    isSubmitting.current = true;
    setLoading(true);
    setErrors({});

    try {
      console.log('Submitting registration...');

      // Single API call - authAPI.register now returns response.data directly
      const data = await authAPI.register({
        username,
        email,
        password
      });

      console.log('Registration successful:', data);

      // Store token and user info
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Show success message
      alert('Account created successfully! Please login.');

      // Navigate to login page
      if (onNavigate) {
        onNavigate('login');
      }

      // Optional: Call parent handler if provided
      if (onSignup) {
        onSignup(data);
      }

    } catch (error) {
      console.error('Signup error:', error);

      // Extract error message from response
      const errorMessage = error.response?.data?.message
        || error.message
        || 'Signup failed. Please try again.';

      setErrors({ submit: errorMessage });

      // Show error to user
      alert(errorMessage);

    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <h2 className="signup-title">Create Your PetFam Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`form-input ${errors.username ? 'error' : ''}`}
              required
              disabled={loading}
              placeholder="Enter your username"
              autoComplete="username"
            />
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${errors.email ? 'error' : ''}`}
              required
              disabled={loading}
              placeholder="Enter your email"
              autoComplete="email"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${errors.password ? 'error' : ''}`}
              required
              disabled={loading}
              placeholder="Enter your password"
              autoComplete="new-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              required
              disabled={loading}
              placeholder="Confirm your password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error" style={{
              color: 'red',
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: '#fee',
              borderRadius: '4px'
            }}>
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary signup-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="signup-link">
          <p>
            Already have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  onNavigate('login');
                }
              }}
              className="login-link"
            >
              Login here
            </a>
          </p>
          <p>
            Are you a vendor?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  onNavigate('vendor-signup');
                }
              }}
              className="vendor-link"
            >
              Sign up as vendor
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;