import React, { useState, useEffect } from 'react'
import Home from './components/Home'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'
import ProductManagement from './components/ProductManagement'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'
import './App.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [resetToken, setResetToken] = useState('')
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    // Check if user is already logged in
    const userData = localStorage.getItem('user')
    if (userData) {
      setCurrentUser(JSON.parse(userData))
    }
    
    // Check if URL has reset token
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    if (token) {
      setResetToken(token)
      setCurrentPage('reset-password')
    }
  }, [])

  return (
    <div className="App">
      {currentPage === 'home' && (
        <Home 
          onNavigateToLogin={() => setCurrentPage('login')}
          onNavigateToRegister={() => setCurrentPage('signup')}
        />
      )}
      {currentPage === 'login' && (
        <Login 
          onSwitchToSignup={() => setCurrentPage('signup')}
          onLoginSuccess={(user) => {
            setCurrentUser(user)
            setCurrentPage('dashboard')
          }}
          onForgotPassword={() => setCurrentPage('forgot-password')}
        />
      )}
      {currentPage === 'signup' && (
        <Signup onSwitchToLogin={() => setCurrentPage('login')} />
      )}
      {currentPage === 'forgot-password' && (
        <ForgotPassword onBackToLogin={() => setCurrentPage('login')} />
      )}
      {currentPage === 'reset-password' && (
        <ResetPassword 
          token={resetToken}
          onResetSuccess={() => setCurrentPage('login')}
          onBackToLogin={() => setCurrentPage('login')}
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          currentUser={currentUser}
          onLogout={() => {
            setCurrentUser(null)
            setCurrentPage('home')
          }}
          onNavigateToProducts={() => setCurrentPage('products')}
        />
      )}
      {currentPage === 'products' && (
        <ProductManagement 
          currentUser={currentUser}
          onBack={() => setCurrentPage('dashboard')} 
        />
      )}
    </div>
  )
}

export default App
