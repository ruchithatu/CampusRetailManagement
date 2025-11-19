import React, { useState } from 'react'
import './OrderModal.css'

function BuyModal({ product, user, onClose }) {
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery')
  const [pickupLocation, setPickupLocation] = useState('Inside College')
  const [pickupDetails, setPickupDetails] = useState('')
  const [upiId, setUpiId] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation for online payment
    if (paymentMethod === 'Online' && !upiId && !cardNumber) {
      alert('Please provide either UPI ID or Card Number for online payment')
      return
    }

    // Validation for pickup location details
    if ((pickupLocation === 'Classroom' || pickupLocation === 'Other') && !pickupDetails.trim()) {
      alert(`Please specify the ${pickupLocation === 'Classroom' ? 'classroom number' : 'pickup location'}`)
      return
    }

    setSubmitting(true)
    try {
      const finalPickupLocation = pickupLocation === 'Classroom' || pickupLocation === 'Other' 
        ? `${pickupLocation}: ${pickupDetails}` 
        : pickupLocation

      const orderData = {
        customerId: user._id,
        sellerId: product.userId._id,
        productId: product._id,
        productName: product.name,
        orderType: 'buy',
        paymentMethod,
        pickupLocation: finalPickupLocation,
        totalAmount: product.price || 0
      }

      // Add payment details if online payment
      if (paymentMethod === 'Online') {
        orderData.paymentDetails = {
          upiId: upiId || undefined,
          cardNumber: cardNumber || undefined
        }
      }

      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      const data = await response.json()
      if (data.success) {
        alert('Purchase order placed successfully!')
        onClose()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Error placing order')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="order-modal-close" onClick={onClose}>×</button>
        
        <h2>Buy: {product.name}</h2>
        
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-section">
            <h3>Product Details</h3>
            <div className="product-summary">
              <p><strong>Product:</strong> {product.name}</p>
              <p><strong>Price:</strong> <span className="price-highlight">${product.price}</span></p>
              {product.description && (
                <p><strong>Description:</strong> {product.description}</p>
              )}
            </div>
          </div>

          <div className="form-section">
            <h3>Seller Information</h3>
            <div className="seller-summary">
              <p><strong>Seller:</strong> {product.userId.firstName} {product.userId.lastName}</p>
              <p><strong>Email:</strong> {product.userId.email}</p>
            </div>
          </div>

          <div className="form-section">
            <h3>Payment Method</h3>
            <select
              name="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              required
            >
              <option value="Cash on Delivery">Cash on Delivery</option>
              <option value="Online">Online Payment</option>
            </select>
            
            {paymentMethod === 'Online' && (
              <div className="payment-details">
                <div className="form-group">
                  <label>UPI ID</label>
                  <input
                    type="text"
                    placeholder="example@upi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    maxLength="19"
                  />
                </div>
                <p className="payment-note">* Provide either UPI ID or Card Number</p>
              </div>
            )}
          </div>

          <div className="form-section">
            <h3>Pickup Location</h3>
            <select
              name="pickupLocation"
              value={pickupLocation}
              onChange={(e) => {
                setPickupLocation(e.target.value)
                setPickupDetails('')
              }}
              required
            >
              <option value="Inside College">Inside College</option>
              <option value="Classroom">Classroom</option>
              <option value="Other">Other</option>
            </select>
            
            <div className="form-group" style={{ marginTop: '15px' }}>
              <label>Where to Pick Up *</label>
              <input
                type="text"
                placeholder={pickupLocation === 'Classroom' ? 'Enter classroom number (e.g., 101, 2A)' : 'Enter specific location (e.g., Main Gate, Library)'}
                value={pickupDetails}
                onChange={(e) => setPickupDetails(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="total-section">
            <h3>Total Amount: <span className="total-amount">${product.price}</span></h3>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={submitting}>
              {submitting ? 'Placing Order...' : 'Confirm Purchase'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BuyModal
