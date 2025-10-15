import React, { useState } from 'react';
import Modal from '../../Modal/Modal';
import { authAPI } from '../../../services/api';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authAPI.forgotPassword(email);
      setModalContent({
        title: 'Password Reset',
        message: 'A password reset link has been sent to your email. Please check your inbox.'
      });
    } catch (error) {
      setModalContent({
        title: 'Error',
        message: error.response?.data?.message || 'An error occurred while processing your request.'
      });
    }
    
    setIsModalOpen(true);
    setLoading(false);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-subtitle">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
              disabled={loading}
            />
          </div>
          <button 
            type="submit" 
            className="btn btn-primary forgot-btn"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="forgot-link">
          <a href="#" onClick={() => onNavigate('login')} className="login-link">Back to Login</a>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
};

export default ForgotPasswordPage;