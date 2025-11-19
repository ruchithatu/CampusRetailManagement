import React, { useState } from 'react'
import './Login.css'

function Login({ onSwitchToSignup, onLoginSuccess, onForgotPassword }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userData, setUserData] = useState(null)

  const validateForm = () => {
    const newErrors = {}
    
    if (!email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password })
        })

        const data = await response.json()

        if (data.success) {
          // Store token in localStorage
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          console.log('Login successful. User stored:', data.user)
          console.log('localStorage user:', localStorage.getItem('user'))
          
          // Show loading overlay
          setLoading(true)
          setUserData(data.user)
          
          // Redirect to dashboard
          setTimeout(() => {
            onLoginSuccess(data.user)
          }, 2000)
        } else {
          // Check if error is due to user not registered
          if (data.message && data.message.toLowerCase().includes('not registered')) {
            const registerConfirm = window.confirm(`Login failed: ${data.message}\n\nUser not registered. Would you like to register now?`)
            if (registerConfirm) {
              onSwitchToSignup()
            }
          } else if (data.message && data.message.toLowerCase().includes('password is wrong')) {
            alert(`Login failed: ${data.message}`)
          } else {
            alert(`Login failed: ${data.message}`)
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        alert('Failed to connect to server. Please make sure the backend is running.')
      }
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please login to your account</p>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errors.email) setErrors({ ...errors, email: '' })
              }}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errors.password) setErrors({ ...errors, password: '' })
                }}
                placeholder="Enter your password"
                className={errors.password ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>
          
          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); onForgotPassword(); }}>Forgot Password?</a>
          </div>
          
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <p className="signup-link">
            Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToSignup(); }}>Sign up</a>
          </p>
        </form>
      </div>
      
      {loading && userData && (
        <div className="loading-overlay">
          <div className="loading-dialog">
            <div className="success-icon">✓</div>
            <h3>Login successful!</h3>
            <p className="welcome-text">Welcome {userData.firstName} {userData.lastName}!</p>
            <p className="redirect-text">Redirecting to dashboard...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
