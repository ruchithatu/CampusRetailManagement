import React, { useState } from 'react'
import './OrderModal.css'

function RentModal({ product, user, onClose }) {
  const [formData, setFormData] = useState({
    rentFrom: '',
    rentTo: '',
    pickupLocation: 'Inside College'
  })
  const [availability, setAvailability] = useState(null)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setAvailability(null) // Reset availability when dates change
  }

  const checkAvailability = async () => {
    if (!formData.rentFrom || !formData.rentTo) {
      alert('Please select both dates')
      return
    }

    if (new Date(formData.rentFrom) >= new Date(formData.rentTo)) {
      alert('End date must be after start date')
      return
    }

    setChecking(true)
    try {
      const response = await fetch('http://localhost:5000/api/orders/check-availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: product._id,
          rentFrom: formData.rentFrom,
          rentTo: formData.rentTo
        })
      })

      const data = await response.json()
      setAvailability(data)
    } catch (error) {
      console.error('Error checking availability:', error)
      alert('Error checking availability')
    } finally {
      setChecking(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!availability || !availability.available) {
      alert('Please check availability first')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:5000/api/orders/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerId: user._id,
          sellerId: product.userId._id,
          productId: product._id,
          productName: product.name,
          orderType: 'rent',
          rentFrom: formData.rentFrom,
          rentTo: formData.rentTo,
          pickupLocation: formData.pickupLocation,
          paymentMethod: 'N/A',
          totalAmount: 0
        })
      })

      const data = await response.json()
      if (data.success) {
        alert('Rent request submitted successfully!')
        onClose()
      } else {
        alert('Error: ' + data.message)
      }
    } catch (error) {
      console.error('Error submitting rent:', error)
      alert('Error submitting rent request')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="order-modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="order-modal-close" onClick={onClose}>×</button>
        
        <h2>Rent: {product.name}</h2>
        
        <form onSubmit={handleSubmit} className="order-form">
          <div className="form-section">
            <h3>Rental Period</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label>From Date *</label>
                <input
                  type="date"
                  name="rentFrom"
                  value={formData.rentFrom}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>To Date *</label>
                <input
                  type="date"
                  name="rentTo"
                  value={formData.rentTo}
                  onChange={handleChange}
                  min={formData.rentFrom || new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <button 
              type="button" 
              className="check-btn"
              onClick={checkAvailability}
              disabled={checking || !formData.rentFrom || !formData.rentTo}
            >
              {checking ? 'Checking...' : 'Check Availability'}
            </button>

            {availability && (
              <div className={`availability-result ${availability.available ? 'available' : 'not-available'}`}>
                {availability.message}
              </div>
            )}
          </div>

          {availability && availability.available && (
            <>
              <div className="form-section">
                <h3>Pickup Location</h3>
                <select
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  required
                >
                  <option value="Inside College">Inside College</option>
                  <option value="Classroom">Classroom</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Confirm Rent'}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}

export default RentModal
