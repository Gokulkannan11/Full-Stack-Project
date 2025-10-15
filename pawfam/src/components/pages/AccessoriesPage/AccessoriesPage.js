import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { productsAPI } from '../../../services/api';
import './AccessoriesPage.css';

const AccessoriesPage = ({ user }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { 
    cartItems, 
    addToCart, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal, 
    getCartItemsCount,
    clearCart 
  } = useCart();

  // Mock products data
  const products = [
    {
      id: 1,
      name: 'Premium Dog Food',
      category: 'food',
      price: 45.99,
      rating: 4.5,
      image: 'https://placehold.co/300x300/ef4444/ffffff?text=Dog+Food',
      description: 'High-quality premium dog food with all essential nutrients'
    },
    {
      id: 2,
      name: 'Cat Grooming Brush',
      category: 'grooming',
      price: 15.99,
      rating: 4.2,
      image: 'https://placehold.co/300x300/3b82f6/ffffff?text=Grooming+Brush',
      description: 'Gentle brush for cat grooming and fur maintenance'
    },
    {
      id: 3,
      name: 'Pet Carrier Bag',
      category: 'accessories',
      price: 35.99,
      rating: 4.7,
      image: 'https://placehold.co/300x300/10b981/ffffff?text=Pet+Carrier',
      description: 'Comfortable and secure pet carrier for travel'
    },
    {
      id: 4,
      name: 'Dog Chew Toys',
      category: 'toys',
      price: 12.99,
      rating: 4.3,
      image: 'https://placehold.co/300x300/f59e0b/ffffff?text=Chew+Toys',
      description: 'Durable chew toys for dental health and entertainment'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products' },
    { id: 'food', name: 'Pet Food' },
    { id: 'grooming', name: 'Grooming' },
    { id: 'accessories', name: 'Accessories' },
    { id: 'toys', name: 'Toys' }
  ];

  const filteredProducts = products
    .filter(product => selectedCategory === 'all' || product.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low': return a.price - b.price;
        case 'price-high': return b.price - a.price;
        case 'rating': return b.rating - a.rating;
        default: return a.name.localeCompare(b.name);
      }
    });

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to complete your order');
      return;
    }

    setLoading(true);
    
    try {
      const orderPayload = {
        items: cartItems.map(item => ({
          productId: item.id.toString(),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: {
          fullName: checkoutData.fullName,
          email: checkoutData.email,
          address: checkoutData.address,
          city: checkoutData.city,
          state: checkoutData.state,
          zipCode: checkoutData.zipCode
        },
        paymentInfo: {
          cardNumber: checkoutData.cardNumber,
          expiryDate: checkoutData.expiryDate,
          cvv: checkoutData.cvv
        },
        totalAmount: getCartTotal()
      };

      await productsAPI.createOrder(orderPayload);
      
      alert('Order placed successfully! Thank you for your purchase.');
      setShowCheckout(false);
      clearCart();
      setCheckoutData({
        fullName: '',
        email: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        cardNumber: '',
        expiryDate: '',
        cvv: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error placing order');
    }
    
    setLoading(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCheckoutData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="accessories-page">
      <div className="accessories-header">
        <h1>Pet Accessories & Products</h1>
        <p>Everything your pet needs in one place</p>
      </div>

      {!user && (
        <div className="login-prompt">
          <p>Please <a href="#" onClick={() => window.location.reload()}>login</a> to purchase products</p>
        </div>
      )}

      <div className="accessories-controls">
        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        <button 
          className="cart-toggle" 
          onClick={() => setShowCart(true)}
          disabled={!user}
        >
          🛒 Cart ({getCartItemsCount()})
        </button>
      </div>

      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <div className="product-rating">
                ⭐ {product.rating}
              </div>
              <div className="product-price">${product.price}</div>
              <button 
                className="add-to-cart-btn"
                onClick={() => addToCart(product)}
                disabled={!user}
              >
                {user ? 'Add to Cart' : 'Login to Purchase'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h3>Shopping Cart</h3>
            <button 
              className="close-cart" 
              onClick={() => setShowCart(false)}
              disabled={loading}
            >
              ×
            </button>
          </div>
          <div className="cart-items">
            {cartItems.length === 0 ? (
              <p className="empty-cart">Your cart is empty</p>
            ) : (
              cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <img src={item.image} alt={item.name} />
                  <div className="cart-item-details">
                    <h4>{item.name}</h4>
                    <p>${item.price}</p>
                    <div className="quantity-controls">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={loading}
                      >
                        -
                      </button>
                      <span>{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button 
                    className="remove-item"
                    onClick={() => removeFromCart(item.id)}
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
          {cartItems.length > 0 && (
            <div className="cart-footer">
              <div className="cart-total">
                Total: ${getCartTotal().toFixed(2)}
              </div>
              <button 
                className="checkout-btn"
                onClick={() => {
                  setShowCart(false);
                  setShowCheckout(true);
                }}
                disabled={loading}
              >
                Proceed to Checkout
              </button>
            </div>
          )}
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="checkout-modal">
          <div className="checkout-form-container">
            <div className="checkout-header">
              <h2>Checkout</h2>
              <button 
                onClick={() => setShowCheckout(false)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleCheckoutSubmit} className="checkout-form">
              <div className="form-section">
                <h3>Shipping Information</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={checkoutData.fullName}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={checkoutData.email}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    name="address"
                    value={checkoutData.address}
                    onChange={handleInputChange}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>City *</label>
                    <input
                      type="text"
                      name="city"
                      value={checkoutData.city}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>State *</label>
                    <input
                      type="text"
                      name="state"
                      value={checkoutData.state}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>ZIP Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={checkoutData.zipCode}
                      onChange={handleInputChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Payment Information</h3>
                <div className="form-group">
                  <label>Card Number *</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={checkoutData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Expiry Date *</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={checkoutData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV *</label>
                    <input
                      type="text"
                      name="cvv"
                      value={checkoutData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="order-summary">
                <h3>Order Summary</h3>
                {cartItems.map(item => (
                  <div key={item.id} className="order-item">
                    <span>{item.name} x {item.quantity}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="order-total">
                  <strong>Total: ${getCartTotal().toFixed(2)}</strong>
                </div>
              </div>

              <button 
                type="submit" 
                className="place-order-btn"
                disabled={loading}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccessoriesPage;