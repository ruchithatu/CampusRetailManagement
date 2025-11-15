import React, { useState, useEffect } from 'react'
import './ManageProduct.css'

function ManageProduct({ currentUser }) {
  const [user, setUser] = useState(null)
  const [products, setProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  const [editForm, setEditForm] = useState({
    name: '',
    category: '',
    description: '',
    image: '',
    price: '',
    dept: '',
    availabilityFrom: '',
    availabilityTo: '',
    damageLeft: '',
    damageRight: ''
  })

  useEffect(() => {
    // Get user from props or localStorage
    const activeUser = currentUser || JSON.parse(localStorage.getItem('user') || '{}')
    if (activeUser && activeUser._id) {
      setUser(activeUser)
      fetchProducts(activeUser._id)
    }
  }, [currentUser])

  const fetchProducts = async (userId) => {
    if (!userId) {
      const userData = localStorage.getItem('user')
      if (userData) {
        userId = JSON.parse(userData)._id
      } else {
        return
      }
    }
    try {
      const response = await fetch(`http://localhost:5000/api/products/list/${userId}`)
      const data = await response.json()
      if (data.success) {
        setProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        const response = await fetch(`http://localhost:5000/api/products/delete/${id}`, {
          method: 'DELETE'
        })
        const data = await response.json()
        if (data.success) {
          alert('Product deleted successfully!')
          fetchProducts()
        } else {
          alert('Error deleting product: ' + data.message)
        }
      } catch (error) {
        console.error('Error deleting product:', error)
        alert('Error deleting product. Please try again.')
      }
    }
  }

  const handleEditClick = (product) => {
    setEditingProduct(product._id)
    setEditForm({
      name: product.name,
      category: product.category,
      description: product.description,
      image: product.image || '',
      price: product.price || '',
      dept: product.dept || '',
      availabilityFrom: product.availabilityFrom ? product.availabilityFrom.split('T')[0] : '',
      availabilityTo: product.availabilityTo ? product.availabilityTo.split('T')[0] : '',
      damageLeft: product.damageLeft || '',
      damageRight: product.damageRight || ''
    })
  }

  const handleEditChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    })
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setEditForm({
        ...editForm,
        image: file,
        imageFile: file // Store file separately for FormData
      })
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('name', editForm.name)
      formData.append('category', editForm.category)
      formData.append('description', editForm.description)
      
      // Add image file if selected
      if (editForm.imageFile) {
        formData.append('image', editForm.imageFile)
      }
      
      // Add category-specific fields
      if (editForm.category === 'Electronic') {
        if (editForm.availabilityFrom) formData.append('availabilityFrom', editForm.availabilityFrom)
        if (editForm.availabilityTo) formData.append('availabilityTo', editForm.availabilityTo)
        if (editForm.damageLeft) formData.append('damageLeft', editForm.damageLeft)
        if (editForm.damageRight) formData.append('damageRight', editForm.damageRight)
      } else if (editForm.category === 'Non-Electronic') {
        if (editForm.price) formData.append('price', editForm.price)
        if (editForm.dept) formData.append('dept', editForm.dept)
      }
      
      const response = await fetch(`http://localhost:5000/api/products/edit/${editingProduct}`, {
        method: 'PUT',
        body: formData // Don't set Content-Type header
      })
      const data = await response.json()
      if (data.success) {
        alert('Product updated successfully!')
        setEditingProduct(null)
        fetchProducts()
      } else {
        alert('Error updating product: ' + data.message)
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Error updating product. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="manage-product">
      <h2>Manage Products</h2>
      
      {editingProduct && (
        <div className="edit-modal">
          <div className="edit-modal-content">
            <h3>Edit Product</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                >
                  <option value="Electronic">Electronic</option>
                  <option value="Non-Electronic">Non-Electronic</option>
                </select>
              </div>
              <div className="form-group">
                <label>Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                {editForm.image && typeof editForm.image === 'string' && (
                  <p style={{ fontSize: '12px', color: '#666' }}>
                    Current: {editForm.image}
                  </p>
                )}
              </div>
              {editForm.category === 'Electronic' && (
                <>
                  <div className="form-group">
                    <label>Availability From</label>
                    <input
                      type="date"
                      name="availabilityFrom"
                      value={editForm.availabilityFrom}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Availability To</label>
                    <input
                      type="date"
                      name="availabilityTo"
                      value={editForm.availabilityTo}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Damage Left</label>
                    <input
                      type="text"
                      name="damageLeft"
                      value={editForm.damageLeft}
                      onChange={handleEditChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Damage Right</label>
                    <input
                      type="text"
                      name="damageRight"
                      value={editForm.damageRight}
                      onChange={handleEditChange}
                    />
                  </div>
                </>
              )}
              {editForm.category === 'Non-Electronic' && (
                <>
                  <div className="form-group">
                    <label>Price</label>
                    <input
                      type="number"
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <input
                      type="text"
                      name="dept"
                      value={editForm.dept}
                      onChange={handleEditChange}
                    />
                  </div>
                </>
              )}
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn">Save Changes</button>
                <button type="button" onClick={() => setEditingProduct(null)} className="cancel-btn">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Availability</th>
              <th>Damage Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No products found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product._id}>
                  <td>
                    {product.image ? (
                      <div className="product-image">
                        <img 
                          src={`http://localhost:5000/uploads/${product.image}`} 
                          alt={product.name}
                          style={{ 
                            width: '60px', 
                            height: '60px', 
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = `<span class="image-name">${product.image}</span>`
                          }}
                        />
                      </div>
                    ) : (
                      <span className="no-image">No image</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>
                    {formatDate(product.availabilityFrom)} - {formatDate(product.availabilityTo)}
                  </td>
                  <td>
                    {product.damageLeft || product.damageRight ? 
                      `L: ${product.damageLeft || 'None'}, R: ${product.damageRight || 'None'}` : 
                      'No damage reported'}
                  </td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(product)}>Edit</button>
                    <button className="delete-btn" onClick={() => handleDelete(product._id, product.name)}>Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageProduct
