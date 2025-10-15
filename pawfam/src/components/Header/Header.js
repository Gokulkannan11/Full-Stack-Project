import React, { useState } from 'react';
import './Header.css';

const Header = ({ onNavigate, isLoggedIn, onLogout, user }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="header">
      <nav className="header-nav container">
        <div className="logo-container" onClick={() => onNavigate('landing')}>
          <span className="logo-text">PetFam</span>
        </div>
        <div className="mobile-menu-btn">
          <button onClick={() => setMenuOpen(!menuOpen)} className="menu-toggle">
            <svg xmlns="http://www.w3.org/2000/svg" className="menu-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>
        <div className={`nav-links ${menuOpen ? 'nav-links-open' : ''}`}>
          <a href="#" className="nav-link" onClick={() => onNavigate('landing')}>Home</a>
          <a href="#" className="nav-link" onClick={() => onNavigate('services')}>Services</a>
          <a href="#" className="nav-link" onClick={() => onNavigate('accessories')}>Accessories</a>
          <a href="#" className="nav-link" onClick={() => onNavigate('adoption')}>Adoption</a>
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="user-greeting">Hello, {user?.username}</span>
              <button onClick={onLogout} className="btn btn-red">Logout</button>
            </div>
          ) : (
            <button onClick={() => onNavigate('login')} className="btn btn-primary">Login</button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;