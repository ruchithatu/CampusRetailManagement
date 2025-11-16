import React, { useState } from 'react'
import AddProduct from './AddProduct'
import ManageProduct from './ManageProduct'
import ManageOrders from './ManageOrders'
import ViewUser from './ViewUser'
import History from './History'
import Notifications from './Notifications'
import './ProductManagement.css'

function ProductManagement({ currentUser, onBack }) {
  const [activeTab, setActiveTab] = useState('addproduct')

  const menuItems = [
    { id: 'addproduct', label: 'Add Product', icon: '📦' },
    { id: 'manageproduct', label: 'Manage Product', icon: '🛠️' },
    { id: 'manageorders', label: 'Manage Orders', icon: '📋' },
    { id: 'viewuser', label: 'View User', icon: '👥' },
    { id: 'history', label: 'History', icon: '📜' }
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'addproduct':
        return <AddProduct currentUser={currentUser} />
      case 'manageproduct':
        return <ManageProduct currentUser={currentUser} />
      case 'manageorders':
        return <ManageOrders currentUser={currentUser} />
      case 'viewuser':
        return <ViewUser />
      case 'history':
        return <History currentUser={currentUser} />
      default:
        return <AddProduct currentUser={currentUser} />
    }
  }

  return (
    <div className="product-management-container">
      {/* Left Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <button className="back-to-dashboard" onClick={onBack}>
          ← Back to Dashboard
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="content-area">
        <div className="content-header">
          <Notifications user={currentUser} />
        </div>
        {renderContent()}
      </main>
    </div>
  )
}

export default ProductManagement
