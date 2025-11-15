import React, { useState, useEffect } from 'react'
import './ViewUser.css'

function ViewUser() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/users')
      const data = await response.json()
      
      if (data.success) {
        setUsers(data.users)
      }
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="view-user"><p>Loading users...</p></div>
  }

  return (
    <div className="view-user">
      <h2>View Users ({users.length})</h2>
      
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Program</th>
              <th>Course</th>
              <th>Phone</th>
              <th>Registered</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>{user.firstName} {user.lastName}</td>
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
    </div>
  )
}

export default ViewUser
