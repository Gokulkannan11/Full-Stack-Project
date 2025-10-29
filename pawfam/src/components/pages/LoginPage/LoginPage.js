import React, { useState, useRef } from 'react';
import { authAPI } from '../../../services/api';
import './LoginPage.css';

const LoginPage = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Prevent double submission
  const isSubmitting = useRef(false);

  const validateForm = () => {
    const newErrors = {};

    if (!email || !email.includes('@') || !email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event bubbling

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
      console.log('Submitting login for:', email);

      // Call API - authAPI.login returns response.data directly
      const data = await authAPI.login({
        email,
        password
      });

      console.log('Login successful:', data);

      // Store token and user info
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // DO NOT show alert - causes issues with navigation
      console.log('User logged in successfully');

      // Call parent handler ONLY if provided (pass the data, not credentials)
      if (onLogin) {
        // Pass the response data, not the credentials
        await onLogin(data);
      } else {
        // If no parent handler, navigate to home/dashboard
        if (onNavigate) {
          onNavigate('home');
        }
      }

    } catch (error) {
      console.error('Login error:', error);

      // Extract error message from response
      const errorMessage = error.response?.data?.message
        || error.message
        || 'Login failed. Please check your credentials.';

      setErrors({ submit: errorMessage });

    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Login to PetFam</h2>
        <form onSubmit={handleSubmit} noValidate>
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
              autoComplete="current-password"
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {errors.submit && (
            <div className="error-message submit-error" style={{
              color: '#dc3545',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="login-links">
          <p className="login-link-text">
            Don't have an account?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  onNavigate('signup');
                }
              }}
              className="login-link"
            >
              Sign Up here
            </a>
          </p>
          <p className="login-link-text">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  onNavigate('forgot');
                }
              }}
              className="login-link"
            >
              Forgot Password?
            </a>
          </p>
          <p className="login-link-text">
            Are you a vendor?{' '}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (!loading) {
                  onNavigate('vendor-login');
                }
              }}
              className="vendor-link"
            >
              Vendor Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;