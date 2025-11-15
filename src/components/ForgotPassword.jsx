import React, { useState } from 'react'
import './ForgotPassword.css'

function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')
    setError('')

    if (!email) {
      setError('Please enter your email address')
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Password reset link has been sent to your email. Please check your inbox.')
        setEmail('')
      } else {
        setError(data.message)
      }
    } catch (err) {
      console.error('Forgot password error:', err)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password?</h2>
        <p className="subtitle">Enter your email address and we'll send you a link to reset your password</p>
        
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={loading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}
          {message && <div className="success-message">{message}</div>}
          
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
          
          <button type="button" className="back-btn" onClick={onBackToLogin}>
            ← Back to Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default ForgotPassword
