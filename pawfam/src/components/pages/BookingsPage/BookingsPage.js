import React, { useState, useEffect } from 'react';
import { daycareAPI, productsAPI, adoptionAPI } from '../../../services/api';
import './BookingsPage.css';

// Save this file as: pawfam/src/components/pages/BookingsPage/BookingsPage.js

const BookingsPage = ({ user }) => {
  const [activeTab, setActiveTab] = useState('daycare');
  const [daycareBookings, setDaycareBookings] = useState([]);
  const [productOrders, setProductOrders] = useState([]);
  const [adoptionApplications, setAdoptionApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt-desc'); // Default sort by newest first
  const [accessoriesSortBy, setAccessoriesSortBy] = useState('createdAt-desc'); // Sort for accessories

  useEffect(() => {
    if (user) {
      fetchAllBookings();
    }
  }, [user]);

  // Handle search with debouncing
  useEffect(() => {
    if (user && activeTab === 'daycare') {
      const delayDebounce = setTimeout(() => {
        handleDaycareSearch();
      }, 500); // 500ms delay

      return () => clearTimeout(delayDebounce);
    }
  }, [searchKeyword, user]);

  const handleDaycareSearch = async () => {
    try {
      setIsSearching(true);
      const daycareData = await daycareAPI.getBookings(searchKeyword);
      const sortedData = sortBookings(Array.isArray(daycareData) ? daycareData : [], sortBy);
      setDaycareBookings(sortedData);
    } catch (error) {
      console.error('Error searching daycare bookings:', error);
      setDaycareBookings([]);
    } finally {
      setIsSearching(false);
    }
  };

  const sortBookings = (bookings, sortOption) => {
    const sorted = [...bookings];

    switch (sortOption) {
      case 'totalAmount-asc':
        return sorted.sort((a, b) => a.totalAmount - b.totalAmount);
      case 'totalAmount-desc':
        return sorted.sort((a, b) => b.totalAmount - a.totalAmount);
      case 'createdAt-asc':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'createdAt-desc':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return sorted;
    }
  };

  const handleSortChange = (e) => {
    const newSortBy = e.target.value;
    setSortBy(newSortBy);
    const sortedData = sortBookings(daycareBookings, newSortBy);
    setDaycareBookings(sortedData);
  };

  const handleAccessoriesSortChange = (e) => {
    const newSortBy = e.target.value;
    setAccessoriesSortBy(newSortBy);
    const sortedData = sortBookings(productOrders, newSortBy);
    setProductOrders(sortedData);
  };

  const handleSearchChange = (e) => {
    setSearchKeyword(e.target.value);
  };

  const clearSearch = () => {
    setSearchKeyword('');
  };

  const fetchAllBookings = async () => {
    try {
      setLoading(true);

      // Fetch daycare bookings
      try {
        const daycareData = await daycareAPI.getBookings(searchKeyword);
        console.log('Daycare bookings:', daycareData);
        setDaycareBookings(Array.isArray(daycareData) ? daycareData : []);
      } catch (error) {
        console.error('Error fetching daycare bookings:', error);
        setDaycareBookings([]);
      }

      // Fetch product orders
      try {
        const productsData = await productsAPI.getOrders();
        console.log('Product orders:', productsData);
        const sortedProducts = sortBookings(Array.isArray(productsData) ? productsData : [], accessoriesSortBy);
        setProductOrders(sortedProducts);
      } catch (error) {
        console.error('Error fetching product orders:', error);
        setProductOrders([]);
      }

      // Fetch adoption applications
      try {
        const adoptionData = await adoptionAPI.getApplications();
        console.log('Adoption applications:', adoptionData);
        setAdoptionApplications(adoptionData.applications || []);
      } catch (error) {
        console.error('Error fetching adoption applications:', error);
        setAdoptionApplications([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      processing: 'status-processing',
      shipped: 'status-shipped',
      delivered: 'status-delivered',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
      rejected: 'status-rejected',
      approved: 'status-approved',
      under_review: 'status-review',
      scheduled: 'status-scheduled'
    };
    return statusMap[status] || 'status-pending';
  };

  if (!user) {
    return (
      <div className="bookings-page">
        <div className="bookings-container">
          <div className="no-bookings">
            <h2>Please Login</h2>
            <p>You need to be logged in to view your bookings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bookings-page">
      <div className="bookings-container">
        <div className="bookings-header-section">
          <h1 className="bookings-title">My Bookings</h1>
          <button
            className="refresh-btn"
            onClick={fetchAllBookings}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="bookings-tabs">
          <button
            className={`tab-btn ${activeTab === 'daycare' ? 'active' : ''}`}
            onClick={() => setActiveTab('daycare')}
          >
            Daycare Bookings
            <span className="tab-count">{daycareBookings.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'accessories' ? 'active' : ''}`}
            onClick={() => setActiveTab('accessories')}
          >
            Accessories Orders
            <span className="tab-count">{productOrders.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'adoption' ? 'active' : ''}`}
            onClick={() => setActiveTab('adoption')}
          >
            Adoption Applications
            <span className="tab-count">{adoptionApplications.length}</span>
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading bookings...</div>
        ) : (
          <div className="bookings-content">
            {/* Daycare Bookings Tab */}
            {activeTab === 'daycare' && (
              <div className="bookings-list">
                {/* Search Bar */}
                <div className="search-bar-container">
                  <div className="search-sort-container">
                    <div className="search-input-wrapper">
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search by pet name, type, center, location, status..."
                        value={searchKeyword}
                        onChange={handleSearchChange}
                      />
                      {searchKeyword && (
                        <button
                          className="clear-search-btn"
                          onClick={clearSearch}
                          title="Clear search"
                        >
                          ✕
                        </button>
                      )}
                      {isSearching && (
                        <span className="search-loading">🔍</span>
                      )}
                    </div>

                    <div className="sort-controls">
                      <label className="sort-label">Sort by:</label>
                      <select
                        className="sort-select"
                        value={sortBy}
                        onChange={handleSortChange}
                      >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="totalAmount-desc">Amount: High to Low</option>
                        <option value="totalAmount-asc">Amount: Low to High</option>
                      </select>
                    </div>
                  </div>

                  {searchKeyword && (
                    <div className="search-results-info">
                      Found {daycareBookings.length} result{daycareBookings.length !== 1 ? 's' : ''}
                      {searchKeyword && ` for "${searchKeyword}"`}
                    </div>
                  )}
                </div>

                {daycareBookings.length === 0 ? (
                  <div className="no-bookings">
                    <div className="no-bookings-icon">📅</div>
                    {searchKeyword ? (
                      <>
                        <h3>No Results Found</h3>
                        <p>No daycare bookings match your search "{searchKeyword}".</p>
                        <button className="clear-search-btn-inline" onClick={clearSearch}>
                          Clear Search
                        </button>
                      </>
                    ) : (
                      <>
                        <h3>No Daycare Bookings Yet</h3>
                        <p>You haven't made any daycare bookings yet.</p>
                        <p>Visit the Centers page to book a daycare service for your pet.</p>
                      </>
                    )}
                  </div>
                ) : (
                  daycareBookings.map((booking) => (
                    <div key={booking._id} className="booking-card">
                      <div className="booking-header">
                        <h3>{booking.daycareCenter?.name || 'Daycare Center'}</h3>
                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="detail-label">Pet Name:</span>
                          <span className="detail-value">{booking.petName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Pet Type:</span>
                          <span className="detail-value">{booking.petType}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{booking.daycareCenter?.location || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Start Date:</span>
                          <span className="detail-value">{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">End Date:</span>
                          <span className="detail-value">{formatDate(booking.endDate)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Total Amount:</span>
                          <span className="detail-value amount">₹{booking.totalAmount}</span>
                        </div>
                        {booking.specialInstructions && (
                          <div className="detail-row">
                            <span className="detail-label">Special Instructions:</span>
                            <span className="detail-value">{booking.specialInstructions}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="detail-label">Booked On:</span>
                          <span className="detail-value">{formatDate(booking.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Accessories Orders Tab */}
            {activeTab === 'accessories' && (
              <div className="bookings-list">
                {/* Sort Controls for Accessories */}
                {productOrders.length > 0 && (
                  <div className="search-bar-container">
                    <div className="sort-controls">
                      <label className="sort-label">Sort by:</label>
                      <select
                        className="sort-select"
                        value={accessoriesSortBy}
                        onChange={handleAccessoriesSortChange}
                      >
                        <option value="createdAt-desc">Newest First</option>
                        <option value="createdAt-asc">Oldest First</option>
                        <option value="totalAmount-desc">Amount: High to Low</option>
                        <option value="totalAmount-asc">Amount: Low to High</option>
                      </select>
                    </div>
                  </div>
                )}

                {productOrders.length === 0 ? (
                  <div className="no-bookings">
                    <div className="no-bookings-icon">🛍️</div>
                    <h3>No Accessory Orders Yet</h3>
                    <p>You haven't placed any accessory orders yet.</p>
                  </div>
                ) : (
                  productOrders.map((order) => (
                    <div key={order._id} className="booking-card">
                      <div className="booking-header">
                        <h3>Order #{order._id.slice(-8).toUpperCase()}</h3>
                        <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="booking-details">
                        <div className="order-items">
                          <h4>Items:</h4>
                          {order.items?.map((item, index) => (
                            <div key={index} className="order-item">
                              <div className="order-item-info">
                                <span className="item-name">{item.name}</span>
                                <span className="item-quantity">Qty: {item.quantity}</span>
                              </div>
                              <span className="item-price">₹{item.price * item.quantity}</span>
                            </div>
                          ))}
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Shipping Address:</span>
                          <span className="detail-value">
                            {order.shippingAddress?.fullName}<br />
                            {order.shippingAddress?.address}, {order.shippingAddress?.city}<br />
                            {order.shippingAddress?.state} - {order.shippingAddress?.zipCode}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Total Amount:</span>
                          <span className="detail-value amount">₹{order.totalAmount}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Ordered On:</span>
                          <span className="detail-value">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Adoption Applications Tab */}
            {activeTab === 'adoption' && (
              <div className="bookings-list">
                {adoptionApplications.length === 0 ? (
                  <div className="no-bookings">
                    <p>You haven't submitted any adoption applications yet.</p>
                  </div>
                ) : (
                  adoptionApplications.map((application) => (
                    <div key={application._id} className="booking-card">
                      <div className="booking-header">
                        <h3>{application.pet?.name || 'Pet Adoption'}</h3>
                        <span className={`status-badge ${getStatusBadgeClass(application.status)}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="booking-details">
                        <div className="detail-row">
                          <span className="detail-label">Pet Type:</span>
                          <span className="detail-value">{application.pet?.type}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Breed:</span>
                          <span className="detail-value">{application.pet?.breed}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Age:</span>
                          <span className="detail-value">{application.pet?.age}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Shelter:</span>
                          <span className="detail-value">{application.pet?.shelter}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Contact Name:</span>
                          <span className="detail-value">{application.personalInfo?.fullName}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value">{application.personalInfo?.email}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{application.personalInfo?.phone}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Experience Level:</span>
                          <span className="detail-value">{application.experience?.level}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Visit Scheduled:</span>
                          <span className="detail-value">
                            {formatDate(application.visitSchedule?.date)} at {application.visitSchedule?.time}
                          </span>
                        </div>
                        {application.adoptionReason && (
                          <div className="detail-row">
                            <span className="detail-label">Adoption Reason:</span>
                            <span className="detail-value">{application.adoptionReason}</span>
                          </div>
                        )}
                        <div className="detail-row">
                          <span className="detail-label">Applied On:</span>
                          <span className="detail-value">{formatDate(application.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingsPage;