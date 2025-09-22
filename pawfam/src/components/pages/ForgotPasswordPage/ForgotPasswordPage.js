import React, { useState } from 'react';
import Modal from '../../Modal/Modal';
import './ForgotPasswordPage.css';

const ForgotPasswordPage = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Simulating password reset for email: ${email}`);
    setIsModalOpen(true);
  };

  return (
    <div className="forgot-page">
      <div className="forgot-container">
        <h2 className="forgot-title">Forgot Password</h2>
        <p className="forgot-subtitle">
          Enter your email and we'll send you a link to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="forgot-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary forgot-btn">Send Reset Link</button>
        </form>
        <div className="forgot-link">
          <a href="#" onClick={() => onNavigate('login')} className="login-link">Back to Login</a>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Password Reset"
        message="A password reset link has been sent to your email. Please check your inbox."
      />
    </div>
  );
};

export default ForgotPasswordPage;