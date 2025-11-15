import React, { useState, useEffect } from 'react'
import './AddProduct.css'

function AddProduct({ currentUser }) {
  const [user, setUser] = useState(null)
  const [product, setProduct] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    dept: '',
    availabilityFrom: '',
    availabilityTo: '',
    damageLeft: '',
    damageRight: '',
    image: null
  })

  useEffect(() => {
    // Get user from props or localStorage
    const loadUser = () => {
      if (currentUser && currentUser._id) {
        console.log('User from props:', currentUser)
        setUser(currentUser)
      } else {
        const userData = localStorage.getItem('user')
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData)
            console.log('User from localStorage:', parsedUser)
            setUser(parsedUser)
          } catch (error) {
            console.error('Error parsing user data:', error)
          }
        } else {
          console.warn('No user found in localStorage')
        }
      }
    }
    
    loadUser()
  }, [currentUser])

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProduct({
        ...product,
        image: file
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Get user from state or props or localStorage
    let activeUser = user || currentUser
    
    if (!activeUser || !activeUser._id) {
      // Try one more time from localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        try {
          activeUser = JSON.parse(userData)
        } catch (error) {
          console.error('Error parsing user:', error)
        }
      }
    }
    
    if (!activeUser || !activeUser._id) {
      console.error('No user found. User state:', user, 'currentUser prop:', currentUser, 'localStorage:', localStorage.getItem('user'))
      alert('Error: User not logged in. Please login again.')
      return
    }
    
    console.log('Submitting product for user:', activeUser)
    
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('userId', activeUser._id)
      formData.append('name', product.name)
      formData.append('category', product.category)
      formData.append('description', product.description)
      
      // Add image file if selected
      if (product.image) {
        formData.append('image', product.image)
      }
      
      // Add category-specific fields
      if (product.category === 'Electronic') {
        if (product.availabilityFrom) formData.append('availabilityFrom', product.availabilityFrom)
        if (product.availabilityTo) formData.append('availabilityTo', product.availabilityTo)
        if (product.damageLeft) formData.append('damageLeft', product.damageLeft)
        if (product.damageRight) formData.append('damageRight', product.damageRight)
      } else if (product.category === 'Non-Electronic') {
        if (product.price) formData.append('price', product.price)
        if (product.dept) formData.append('dept', product.dept)
      }

      const response = await fetch('http://localhost:5000/api/products/add', {
        method: 'POST',
        body: formData // Don't set Content-Type header, browser will set it with boundary
      })

      const data = await response.json()

      if (data.success) {
        alert('Product added successfully!')
        // Reset form
        setProduct({
          name: '',
          category: '',
          description: '',
          price: '',
          dept: '',
          availabilityFrom: '',
          availabilityTo: '',
          damageLeft: '',
          damageRight: '',
          image: null
        })
        // Reset file input
        const fileInput = document.getElementById('image')
        if (fileInput) {
          fileInput.value = ''
        }
      } else {
        alert('Error adding product: ' + data.message)
      }
    } catch (error) {
      console.error('Error adding product:', error)
      alert('Error adding product. Please try again.')
    }
  }

  // Show loading message if user is not loaded yet
  if (!user) {
    return (
      <div className="add-product">
        <h2>Add New Product</h2>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          <p>Loading user information...</p>
          <p style={{ fontSize: '12px', marginTop: '10px' }}>If this persists, please log in again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="add-product">
      <h2>Add New Product</h2>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
        Logged in as: <strong>{user.firstName} {user.lastName}</strong>
      </p>
      
      <form onSubmit={handleSubmit} className="product-form">
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={product.category}
            onChange={handleChange}
            required
          >
            <option value="">Select category</option>
            <option value="Electronic">Electronic</option>
            <option value="Non-Electronic">Non-Electronic</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={product.name}
            onChange={handleChange}
            placeholder="Enter product name"
            required
          />
        </div>

        {product.category === 'Electronic' && (
          <>
            <div className="form-group">
              <label htmlFor="image">Upload Product Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="availabilityFrom">Availability From</label>
                <input
                  type="date"
                  id="availabilityFrom"
                  name="availabilityFrom"
                  value={product.availabilityFrom}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="availabilityTo">Availability To</label>
                <input
                  type="date"
                  id="availabilityTo"
                  name="availabilityTo"
                  value={product.availabilityTo}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="damageLeft">Damage (Left)</label>
                <input
                  type="text"
                  id="damageLeft"
                  name="damageLeft"
                  value={product.damageLeft}
                  onChange={handleChange}
                  placeholder="Left side damage description"
                />
              </div>

              <div className="form-group">
                <label htmlFor="damageRight">Damage (Right)</label>
                <input
                  type="text"
                  id="damageRight"
                  name="damageRight"
                  value={product.damageRight}
                  onChange={handleChange}
                  placeholder="Right side damage description"
                />
              </div>
            </div>
          </>
        )}

        {product.category === 'Non-Electronic' && (
          <>
            <div className="form-group">
              <label htmlFor="image">Upload Product Image</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dept">Department</label>
              <input
                type="text"
                id="dept"
                name="dept"
                value={product.dept}
                onChange={handleChange}
                placeholder="Enter department"
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={product.description}
            onChange={handleChange}
            placeholder="Enter product description"
            rows="4"
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          Add Product
        </button>
      </form>
    </div>
  )
}

export default AddProduct
