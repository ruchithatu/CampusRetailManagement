import React from 'react'
import './Home.css'

function Home({ onNavigateToLogin, onNavigateToRegister }) {
  return (
    <div className="home-container">
      <nav className="home-nav">
        <button className="register-btn" onClick={onNavigateToRegister}>
          Register
        </button>
      </nav>
      
      <div className="home-content">
        <div className="hero-section">
          <h1 className="hero-title">Welcome to Our Platform</h1>
          <p className="hero-subtitle">
            Join thousands of students are exchange their education Products.
          </p>
          <button className="login-btn-hero" onClick={onNavigateToLogin}>
            Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default Home
