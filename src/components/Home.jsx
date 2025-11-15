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
            Join thousands of students and professionals advancing their education
          </p>
          <button className="login-btn-hero" onClick={onNavigateToLogin}>
            Login
          </button>
        </div>
        
        <div className="features">
          <div className="feature-card">
            <div className="feature-icon">📚</div>
            <h3>Quality Education</h3>
            <p>Access to top-tier courses and programs</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🎓</div>
            <h3>Expert Instructors</h3>
            <p>Learn from industry professionals</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🌟</div>
            <h3>Flexible Learning</h3>
            <p>Study at your own pace and schedule</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
