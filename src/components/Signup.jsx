import React, { useState } from 'react'
import './Signup.css'

function Signup({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    repassword: '',
    program: '',
    course: '',
    phoneNumber: ''
  })
  
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }
    
    if (!formData.repassword) {
      newErrors.repassword = 'Please confirm your password'
    } else if (formData.password !== formData.repassword) {
      newErrors.repassword = 'Passwords do not match'
    }
    
    if (!formData.program.trim()) {
      newErrors.program = 'Program is required'
    }
    
    if (!formData.course.trim()) {
      newErrors.course = 'Course is required'
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required'
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/[-\s]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number'
    }
    
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length === 0) {
      setLoading(true)
      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        })

        const data = await response.json()

        if (data.success) {
          // Show success message and redirect
          setTimeout(() => {
            onSwitchToLogin()
          }, 2000)
        } else {
          setLoading(false)
          alert(`Registration failed: ${data.message}`)
        }
      } catch (error) {
        setLoading(false)
        console.error('Registration error:', error)
        alert('Failed to connect to server. Please make sure the backend is running.')
      }
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Account</h2>
        <p className="subtitle">Sign up to get started</p>
        
        <form onSubmit={handleSubmit} className="signup-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter first name"
                className={errors.firstName ? 'error' : ''}
              />
              {errors.firstName && <span className="error-message">{errors.firstName}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter last name"
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <span className="error-message">{errors.lastName}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="repassword">Confirm Password</label>
              <input
                type="password"
                id="repassword"
                name="repassword"
                value={formData.repassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className={errors.repassword ? 'error' : ''}
              />
              {errors.repassword && <span className="error-message">{errors.repassword}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="program">Program</label>
              <input
                type="text"
                id="program"
                name="program"
                value={formData.program}
                onChange={handleChange}
                placeholder="Enter program"
                className={errors.program ? 'error' : ''}
              />
              {errors.program && <span className="error-message">{errors.program}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="course">Course</label>
              <input
                type="text"
                id="course"
                name="course"
                value={formData.course}
                onChange={handleChange}
                placeholder="Enter course"
                className={errors.course ? 'error' : ''}
              />
              {errors.course && <span className="error-message">{errors.course}</span>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              className={errors.phoneNumber ? 'error' : ''}
            />
            {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
          </div>
          
          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          
          <p className="login-link">
            Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Login</a>
          </p>
        </form>
      </div>
      
      {loading && (
        <div className="loading-overlay">
          <div className="loading-dialog">
            <div className="loading-spinner"></div>
            <h3>Registration successful!</h3>
            <p>Name: {formData.firstName} {formData.lastName}</p>
            <p>Email: {formData.email}</p>
            <p className="redirect-text">Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Signup
