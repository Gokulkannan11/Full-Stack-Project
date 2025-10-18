import React, { useState, useEffect } from 'react';
import { CartProvider } from './context/CartContext';
import Modal from './components/Modal/Modal';
import Header from './components/Header/Header';
import LandingPage from './components/pages/LandingPage/LandingPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import SignUpPage from './components/pages/SignUpPage/SignUpPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage/ForgotPasswordPage';
import PetServicesPage from './components/pages/PetServicesPage/PetServicePage';
import AccessoriesPage from './components/pages/AccessoriesPage/AccessoriesPage';
import AdoptionPage from './components/pages/AdoptionPage/AdoptionPage';
import { authAPI } from './services/api';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: '', message: '' });
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authAPI.getCurrentUser();
          setIsLoggedIn(true);
          setUser(data.user); // Changed from response.data.user to data.user
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuthStatus();
  }, []);

  const showModal = (title, message) => {
    setModalContent({ title, message });
    setIsModalOpen(true);
  };

  // FIXED: handleLogin now receives the response data from LoginPage
  // It does NOT make another API call
  const handleLogin = (data) => {
    // data already contains token and user from the LoginPage API call
    setIsLoggedIn(true);
    setUser(data.user);
    setCurrentPage('landing');
    showModal('Login Successful', `Welcome back, ${data.user.username}!`);
  };

  // FIXED: handleSignup now receives the response data from SignUpPage
  // It does NOT make another API call
  const handleSignup = (data) => {
    // data already contains token and user from the SignUpPage API call
    setIsLoggedIn(true);
    setUser(data.user);
    setCurrentPage('landing');
    showModal('Signup Successful', `Welcome to PetFam, ${data.user.username}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    setCurrentPage('landing');
    showModal('Logged Out', 'You have been successfully logged out.');
  };

  const renderPage = () => {
    if (loading) {
      return <div className="loading">Loading...</div>;
    }

    switch (currentPage) {
      case 'login':
        return <LoginPage onNavigate={setCurrentPage} onLogin={handleLogin} />;
      case 'signup':
        return <SignUpPage onNavigate={setCurrentPage} onSignup={handleSignup} />;
      case 'forgot':
        return <ForgotPasswordPage onNavigate={setCurrentPage} />;
      case 'services':
        return <PetServicesPage user={user} />;
      case 'accessories':
        return <AccessoriesPage user={user} />;
      case 'adoption':
        return <AdoptionPage user={user} />;
      case 'landing':
      default:
        return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <CartProvider>
      <div className="app">
        {currentPage !== 'login' && currentPage !== 'signup' && currentPage !== 'forgot' && (
          <Header 
            onNavigate={setCurrentPage} 
            isLoggedIn={isLoggedIn} 
            onLogout={handleLogout}
            user={user}
          />
        )}
        <main>
          {renderPage()}
        </main>
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={modalContent.title}
          message={modalContent.message}
        />
      </div>
    </CartProvider>
  );
};

export default App;