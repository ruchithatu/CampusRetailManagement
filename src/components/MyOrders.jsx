import React, { useState, useEffect } from 'react'
import './MyOrders.css'

function MyOrders({ currentUser }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [showComplaintModal, setShowComplaintModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [complaintText, setComplaintText] = useState('')
  const [complaints, setComplaints] = useState({})

  useEffect(() => {
    const userData = currentUser || JSON.parse(localStorage.getItem('user') || '{}')
    if (userData && userData._id) {
      setUser(userData)
      fetchOrders(userData._id)
    }
  }, [currentUser])

  const fetchOrders = async (customerId) => {
    setLoading(true)
    try {
      const response = await fetch(`http://localhost:5000/api/orders/customer/${customerId}`)
      const data = await response.json()
      if (data.success) {
        setOrders(data.orders)
        // Check for complaints for each order
        data.orders.forEach(order => {
          checkComplaint(order._id)
        })
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkComplaint = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/order/${orderId}`)
      const data = await response.json()
      if (data.success && data.hasComplaint) {
        setComplaints(prev => ({
          ...prev,
          [orderId]: data.complaint
        }))
      }
    } catch (error) {
      console.error('Error checking complaint:', error)
    }
  }

  const handleRaiseComplaint = (order) => {
    setSelectedOrder(order)
    setShowComplaintModal(true)
    setComplaintText('')
  }

  const handleSubmitComplaint = async () => {
    if (!complaintText.trim()) {
      alert('Please enter your complaint')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/complaints/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          customerId: user._id,
          sellerId: selectedOrder.sellerId._id,
          productId: selectedOrder.productId._id,
          productName: selectedOrder.productName,
          complaintText: complaintText
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(`Complaint registered successfully! Token Number: ${data.complaint.tokenNumber}`)
        setShowComplaintModal(false)
        checkComplaint(selectedOrder._id)
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error submitting complaint:', error)
      alert('Error submitting complaint')
    }
  }

  const handleReturn = async (order) => {
    if (!window.confirm('Do you want to return this product?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5000/api/orders/return/${order._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data = await response.json()
      if (data.success) {
        alert('Product returned successfully!')
        fetchOrders(user._id)
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error returning product:', error)
      alert('Error returning product')
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { class: 'status-pending', text: 'Pending' },
      approved: { class: 'status-approved', text: 'Approved' },
      given: { class: 'status-given', text: 'Given' },
      returned: { class: 'status-returned', text: 'Returned' },
      completed: { class: 'status-completed', text: 'Completed' },
      cancelled: { class: 'status-cancelled', text: 'Cancelled' }
    }
    const badge = badges[status] || badges.pending
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>
  }

  if (loading) {
    return <div className="my-orders-container">Loading orders...</div>
  }

  return (
    <div className="my-orders-container">
      <div className="orders-header">
        <h2>My Orders</h2>
        <p className="orders-subtitle">View your orders and raise complaints if needed</p>
      </div>

      {orders.length === 0 ? (
        <div className="empty-orders">
          <div className="empty-icon">🛒</div>
          <h3>No Orders Yet</h3>
          <p>Your orders will appear here</p>
        </div>
      ) : (
        <div className="orders-grid">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-card-header">
                <span className="order-id">Order #{order.orderId}</span>
                {getStatusBadge(order.status)}
              </div>

              <div className="order-card-body">
                <div className="product-section">
                  {order.productId?.image && (
                    <img 
                      src={`http://localhost:5000/uploads/${order.productId.image}`}
                      alt={order.productName}
                      className="order-product-image"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  )}
                  <div className="product-details">
                    <h4>{order.productName}</h4>
                    <span className={`order-type ${order.orderType === 'rent' ? 'type-rent' : 'type-buy'}`}>
                      {order.orderType === 'rent' ? 'Rent' : 'Purchase'}
                    </span>
                  </div>
                </div>

                <div className="seller-info">
                  <strong>Seller:</strong> {order.sellerId.firstName} {order.sellerId.lastName}
                  <br />
                  <small>{order.sellerId.email}</small>
                </div>

                {order.orderType === 'rent' && (
                  <div className="rent-info">
                    <p><strong>From:</strong> {new Date(order.rentFrom).toLocaleDateString()}</p>
                    <p><strong>To:</strong> {new Date(order.rentTo).toLocaleDateString()}</p>
                    <p><strong>Pickup:</strong> {order.pickupLocation}</p>
                  </div>
                )}

                <div className="payment-details">
                  <p><strong>Payment:</strong> {order.paymentMethod}</p>
                  <p><strong>Amount:</strong> ${order.totalAmount}</p>
                  <span className={`payment-badge ${order.paymentStatus === 'paid' ? 'paid' : 'pending'}`}>
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="order-actions">
                  {(order.status === 'approved' || order.status === 'given') && order.status !== 'returned' && (
                    <button 
                      className="btn-return"
                      onClick={() => handleReturn(order)}
                    >
                      🔄 Return Product
                    </button>
                  )}
                  {order.status === 'returned' && !complaints[order._id] && (
                    <button 
                      className="btn-complaint"
                      onClick={() => handleRaiseComplaint(order)}
                    >
                      🎫 Raise Complaint
                    </button>
                  )}
                  {complaints[order._id] && (
                    <div className="complaint-info">
                      <div className="token-badge">
                        🎫 Token #{complaints[order._id].tokenNumber}
                      </div>
                      <span className={`complaint-status ${complaints[order._id].status}`}>
                        {complaints[order._id].status}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="order-card-footer">
                <small>Ordered on {new Date(order.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && (
        <div className="complaint-modal-overlay" onClick={() => setShowComplaintModal(false)}>
          <div className="complaint-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Raise Complaint</h3>
              <button className="close-btn" onClick={() => setShowComplaintModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p><strong>Order:</strong> #{selectedOrder?.orderId}</p>
              <p><strong>Product:</strong> {selectedOrder?.productName}</p>
              <textarea
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Describe your issue with the returned product..."
                rows="6"
                className="complaint-textarea"
              />
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowComplaintModal(false)}>
                Cancel
              </button>
              <button className="btn-submit" onClick={handleSubmitComplaint}>
                Submit Complaint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyOrders
