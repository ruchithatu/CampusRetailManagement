import React, { useState, useEffect } from 'react'
import './History.css'

function History({ currentUser }) {
  const [user, setUser] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    // Get user from props or localStorage
    const activeUser = currentUser || JSON.parse(localStorage.getItem('user') || '{}')
    if (activeUser && activeUser._id) {
      setUser(activeUser)
      fetchHistory(activeUser._id)
    }
  }, [currentUser])

  const fetchHistory = async (userId) => {
    if (!userId) {
      const userData = localStorage.getItem('user')
      if (userData) {
        userId = JSON.parse(userData)._id
      } else {
        return
      }
    }
    try {
      const response = await fetch(`http://localhost:5000/api/products/history/${userId}`)
      const data = await response.json()
      if (data.success) {
        setHistory(data.history)
      }
    } catch (error) {
      console.error('Error fetching history:', error)
    }
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'added':
        return '#10b981'
      case 'edited':
        return '#f59e0b'
      case 'deleted':
        return '#ef4444'
      default:
        return '#6b7280'
    }
  }

  return (
    <div className="history">
      <h2>Product History</h2>
      
      <div className="history-timeline">
        {history.length === 0 ? (
          <p className="no-history">No history records found</p>
        ) : (
          history.map((record) => (
            <div key={record._id} className="history-item">
              <div className="history-icon" style={{ backgroundColor: getActionColor(record.action) }}>
                {record.action === 'added' && '➕'}
                {record.action === 'edited' && '✏️'}
                {record.action === 'deleted' && '🗑️'}
              </div>
              <div className="history-content">
                <div className="history-header">
                  <span className="history-action" style={{ color: getActionColor(record.action) }}>
                    {record.action.toUpperCase()}
                  </span>
                  <span className="history-time">{formatDateTime(record.timestamp)}</span>
                </div>
                <div className="history-details">
                  <strong>{record.productName}</strong>
                  <p>{record.details}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default History
