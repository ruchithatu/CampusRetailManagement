import React, { useState, useEffect } from 'react'
import './ViewData.css'

function ViewData() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      } else {
        setError(data.message)
      }
    } catch (err) {
      setError('Failed to fetch users. Make sure backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="view-data-container"><p>Loading...</p></div>
  }

  if (error) {
    return <div className="view-data-container"><p className="error">{error}</p></div>
  }

  return (
    <div className="view-data-container">
      <div className="view-data-card">
        <h2>Registered Users ({users.length})</h2>
        <button onClick={fetchUsers} className="refresh-btn">Refresh</button>
        
        {users.length === 0 ? (
          <p className="no-users">No users registered yet.</p>
        ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Program</th>
                  <th>Course</th>
                  <th>Phone</th>
                  <th>Registered On</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user._id}>
                    <td>{index + 1}</td>
                    <td>{user.firstName}</td>
                    <td>{user.lastName}</td>
                    <td>{user.email}</td>
                    <td>{user.program}</td>
                    <td>{user.course}</td>
                    <td>{user.phoneNumber}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ViewData
