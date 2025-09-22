import React, { useState } from 'react';
import Modal from './components/Modal/Modal';
import Header from './components/Header/Header';
import LandingPage from './components/pages/LandingPage/LandingPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import SignUpPage from './components/pages/SignUpPage/SignUpPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage/ForgotPasswordPage';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });

  const showModal = (title, message) => {
    setModalContent({ title, message });
    setIsModalOpen(true);
  };

  const handleLogin = (email, password) => {
    if (email && password) {
      setTimeout(() => {
        setIsLoggedIn(true);
        setUser({ email, name: email.split('@')[0] });
        setCurrentPage('landing');
        showModal('Login Successful', `Welcome back, ${email.split('@')[0]}!`);
      }, 1000);
    }
  };

  const handleSignup = (username, email, password) => {
    if (username && email && password) {
      setTimeout(() => {
        setIsLoggedIn(true);
        setUser({ email, name: username });
        setCurrentPage('landing');
        showModal('Signup Successful', `Welcome to PawFam🐾, ${username}!`);
      }, 1000);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('landing');
    showModal('Logged Out', 'You have been successfully logged out.');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} onSignup={handleSignup} />;
      case 'forgot':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app">
      {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'forgot' && (
        <Header onNavigate={setCurrentPage} isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      )}
      {renderPage()}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalContent.title}
        message={modalContent.message}
      />
    </div>
  );
};

export default App;