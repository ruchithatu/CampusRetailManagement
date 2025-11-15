import React, { useState, useEffect } from 'react'
import './ManageOrders.css'

function ManageOrders({ currentUser }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = currentUser || JSON.parse(localStorage.getItem('user') || '{}')
    if (userData && userData._id) {
      setUser(userData)
      fetchOrders(userData._id)
    }
  }, [currentUser])

  const fetchOrders = async (sellerId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/orders/seller/${sellerId}`)
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (orderId) => {
    if (!window.confirm('Are you sure you want to approve this order?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/approve/${orderId}`, {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        alert('Order approved and email sent to customer!')
        fetchOrders(user._id)
      } else {
        alert('Error approving order: ' + data.message)
      }
    } catch (error) {
      console.error('Error approving order:', error)
      alert('Error approving order')
    }
  }

  const handleGiven = async (orderId) => {
    if (!window.confirm('Mark this order as handed over to customer?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/given/${orderId}`, {
        method: 'PUT'
      })
      const data = await response.json()
      if (data.success) {
        alert('Order marked as given!')
        fetchOrders(user._id)
      } else {
        alert('Error updating order: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Error updating order')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      given: { class: 'status-given', text: 'Given' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    }
    const badge = badges[status] || badges.pending
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>
  }

  if (loading) {
    return <div className="manage-orders-container">Loading orders...</div>
  }

  return (
    <div className="manage-orders-container">
      <div className="orders-header">
        <h2>Manage Orders</h2>
        <p className="orders-subtitle">View and manage customer orders for your products</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">📋</div>
          <h3>No Orders Yet</h3>
          <p>Orders from customers will appear here</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Type</th>
                <th>Dates/Details</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="order-id">#{order.orderId}</td>
                  <td>
                    <div className="customer-info">
                      <strong>{order.customerId.firstName} {order.customerId.lastName}</strong>
                      <small>{order.customerId.email}</small>
                    </div>
                  </td>
                  <td>
                    <div className="product-info-cell">
                      {order.productId?.image && (
                        <img 
                          src={`http://localhost:5000/uploads/${order.productId.image}`}
                          alt={order.productName}
                          className="product-thumb"
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      )}
                      <span>{order.productName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`type-badge ${order.orderType === 'rent' ? 'type-rent' : 'type-buy'}`}>
                      {order.orderType === 'rent' ? 'Rent' : 'Buy'}
                    </span>
                  </td>
                  <td>
                    {order.orderType === 'rent' ? (
                      <div className="rent-details">
                        <small>From: {new Date(order.rentFrom).toLocaleDateString()}</small>
                        <small>To: {new Date(order.rentTo).toLocaleDateString()}</small>
                        <small>Pickup: {order.pickupLocation}</small>
                      </div>
                    ) : (
                      <span className="text-muted">Purchase</span>
                    )}
                  </td>
                  <td>
                    <div className="payment-info">
                      <small>{order.paymentMethod}</small>
                      <span className={`payment-status ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="total-amount">${order.totalAmount}</td>
                  <td>{getStatusBadge(order.status)}</td>
                  <td>
                    <div className="action-buttons">
                      {order.status === 'pending' && (
                        <button 
                          className="btn-approve"
                          onClick={() => handleApprove(order._id)}
                        >
                          Approve
                        </button>
                      )}
                      {order.status === 'approved' && (
                        <button 
                          className="btn-given"
                          onClick={() => handleGiven(order._id)}
                        >
                          Mark Given
                        </button>
                      )}
                      {order.status === 'given' && (
                        <span className="text-success">✓ Completed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ManageOrders
