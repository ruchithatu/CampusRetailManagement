import React from 'react'
import './ManageOrder.css'

function ManageOrder() {
  const orders = [
    { id: 1, customer: 'John Doe', product: 'Product A', quantity: 2, status: 'Pending', total: 599.98 },
    { id: 2, customer: 'Jane Smith', product: 'Product B', quantity: 1, status: 'Completed', total: 19.99 },
    { id: 3, customer: 'Bob Wilson', product: 'Product C', quantity: 3, status: 'Shipped', total: 149.97 }
  ]

  return (
    <div className="manage-order">
      <h2>Manage Orders</h2>
      
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td>{order.quantity}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <span className={`status status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>
                  <button className="view-btn">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ManageOrder
