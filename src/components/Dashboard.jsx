import React, { useState, useEffect } from 'react'
import './Dashboard.css'
import RentModal from './RentModal'
import BuyModal from './BuyModal'

function Dashboard({ currentUser, onLogout, onNavigateToProducts }) {
  const [user, setUser] = useState(null)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [allProducts, setAllProducts] = useState([])
  const [filter, setFilter] = useState('All') // 'All', 'Electronic', 'Non-Electronic'
  const [selectedProduct, setSelectedProduct] = useState(null) // For detail modal
  const [rentModalProduct, setRentModalProduct] = useState(null) // For rent modal
  const [buyModalProduct, setBuyModalProduct] = useState(null) // For buy modal

  useEffect(() => {
    // Get user data from localStorage or props
    const userData = currentUser || JSON.parse(localStorage.getItem('user') || '{}')
    if (userData) {
      setUser(userData)
    }
    
    // Fetch all products for marketplace
    fetchAllProducts()
  }, [currentUser])

  const fetchAllProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products/all')
      const data = await response.json()
      if (data.success) {
        setAllProducts(data.products)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    onLogout()
  }

  const openProductDetail = (product) => {
    setSelectedProduct(product)
  }

  const closeProductDetail = () => {
    setSelectedProduct(null)
  }

  const handleRentClick = (product, e) => {
    e.stopPropagation()
    setRentModalProduct(product)
    setSelectedProduct(null)
  }

  const handleBuyClick = (product, e) => {
    e.stopPropagation()
    setBuyModalProduct(product)
    setSelectedProduct(null)
  }

  const closeRentModal = () => {
    setRentModalProduct(null)
  }

  const closeBuyModal = () => {
    setBuyModalProduct(null)
  }

  if (!user) {
    return <div className="dashboard-container">Loading...</div>
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-left">
          <h2 className="dashboard-title">Dashboard</h2>
        </div>
        
        <div className="nav-right">
          <button className="your-product-btn" onClick={onNavigateToProducts}>
            Your Product
          </button>
          
          <div className="profile-section">
            <button 
              className="profile-btn"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <div className="profile-icon">
                {user.firstName.charAt(0)}{user.lastName.charAt(0)}
              </div>
            </button>
            
            {showProfileMenu && (
              <div className="profile-menu">
                <div className="profile-info">
                  <p className="profile-name">{user.firstName} {user.lastName}</p>
                  <p className="profile-email">{user.email}</p>
                </div>
                <hr />
                <div className="profile-details">
                  <p><strong>Program:</strong> {user.program}</p>
                  <p><strong>Course:</strong> {user.course}</p>
                  <p><strong>Phone:</strong> {user.phoneNumber}</p>
                </div>
                <hr />
                <button className="logout-btn" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="dashboard-main">
        <div className="welcome-section">
          <div className="welcome-header">
            <div>
              <h1>Welcome back, {user.firstName}! 👋</h1>
              <p className="welcome-subtitle">Browse all available products</p>
            </div>
            <div className="filter-buttons">
              <button 
                className={filter === 'All' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('All')}
              >
                All
              </button>
              <button 
                className={filter === 'Electronic' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('Electronic')}
              >
                Electronic
              </button>
              <button 
                className={filter === 'Non-Electronic' ? 'filter-btn active' : 'filter-btn'}
                onClick={() => setFilter('Non-Electronic')}
              >
                Non-Electronic
              </button>
            </div>
          </div>
        </div>

        <div className="products-marketplace">
          <h2>All Products</h2>
          {allProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Products Available</h3>
              <p>Be the first to add a product!</p>
            </div>
          ) : (
            <div className="products-grid">
              {allProducts
                .filter(product => filter === 'All' || product.category === filter)
                .map((product) => (
                <div key={product._id} className="product-card" onClick={() => openProductDetail(product)}>
                  <div className="product-image-placeholder">
                    {product.image ? (
                      <img 
                        src={`http://localhost:5000/uploads/${product.image}`} 
                        alt={product.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '8px'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = `<div style="display: flex; align-items: center; justify-content: center; height: 100%; font-size: 14px; color: white; text-align: center; padding: 10px;">${product.image}</div>`
                        }}
                      />
                    ) : (
                      '📦'
                    )}
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    {product.category === 'Non-Electronic' && product.price && (
                      <p className="product-price">${product.price}</p>
                    )}
                    {product.category === 'Electronic' && (
                      <p className="product-availability">
                        Available
                      </p>
                    )}
                    {product.userId && (
                      <p className="product-seller">
                        Seller: {product.userId.firstName} {product.userId.lastName}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={closeProductDetail}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeProductDetail}>×</button>
            
            <div className="modal-body">
              <div className="modal-image-section">
                {selectedProduct.image ? (
                  <img 
                    src={`http://localhost:5000/uploads/${selectedProduct.image}`} 
                    alt={selectedProduct.name}
                    className="modal-product-image"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'
                    }}
                  />
                ) : (
                  <div className="modal-no-image">📦</div>
                )}
              </div>

              <div className="modal-details-section">
                <h2>{selectedProduct.name}</h2>
                
                <div className="modal-info-group">
                  <label>Category:</label>
                  <span>{selectedProduct.category}</span>
                </div>

                {selectedProduct.category === 'Non-Electronic' && selectedProduct.price && (
                  <div className="modal-info-group">
                    <label>Price:</label>
                    <span className="modal-price">${selectedProduct.price}</span>
                  </div>
                )}

                {selectedProduct.category === 'Electronic' && (
                  <>
                    {selectedProduct.availabilityFrom && (
                      <div className="modal-info-group">
                        <label>Available From:</label>
                        <span>{new Date(selectedProduct.availabilityFrom).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedProduct.availabilityTo && (
                      <div className="modal-info-group">
                        <label>Available To:</label>
                        <span>{new Date(selectedProduct.availabilityTo).toLocaleDateString()}</span>
                      </div>
                    )}
                    {selectedProduct.damageLeft && (
                      <div className="modal-info-group">
                        <label>Damage Left:</label>
                        <span>{selectedProduct.damageLeft}</span>
                      </div>
                    )}
                    {selectedProduct.damageRight && (
                      <div className="modal-info-group">
                        <label>Damage Right:</label>
                        <span>{selectedProduct.damageRight}</span>
                      </div>
                    )}
                  </>
                )}

                {selectedProduct.description && (
                  <div className="modal-info-group">
                    <label>Description:</label>
                    <p className="modal-description">{selectedProduct.description}</p>
                  </div>
                )}

                {selectedProduct.userId && (
                  <div className="modal-seller-info">
                    <h3>Seller Information</h3>
                    <p><strong>Name:</strong> {selectedProduct.userId.firstName} {selectedProduct.userId.lastName}</p>
                    <p><strong>Email:</strong> {selectedProduct.userId.email}</p>
                  </div>
                )}

                <div className="modal-actions">
                  {selectedProduct.category === 'Electronic' ? (
                    <button 
                      className="action-btn rent-btn"
                      onClick={(e) => handleRentClick(selectedProduct, e)}
                    >
                      Rent Now
                    </button>
                  ) : (
                    <button 
                      className="action-btn buy-btn-modal"
                      onClick={(e) => handleBuyClick(selectedProduct, e)}
                    >
                      Buy Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rent Modal */}
      {rentModalProduct && (
        <RentModal
          product={rentModalProduct}
          user={user}
          onClose={closeRentModal}
        />
      )}

      {/* Buy Modal */}
      {buyModalProduct && (
        <BuyModal
          product={buyModalProduct}
          user={user}
          onClose={closeBuyModal}
        />
      )}
    </div>
  )
}

export default Dashboard
