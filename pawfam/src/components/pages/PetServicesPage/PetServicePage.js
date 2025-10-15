import React, { useState } from 'react';
import { daycareAPI } from '../../../services/api';
import './PetServicePage.css';

const PetServicesPage = ({ user }) => {
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [bookingData, setBookingData] = useState({
    petName: '',
    petType: '',
    petAge: '',
    startDate: '',
    endDate: '',
    specialInstructions: ''
  });
  const [loading, setLoading] = useState(false);

  // Mock data - replace with actual API call
  const daycareCenters = [
    {
      id: 1,
      name: 'Happy Paws Daycare',
      location: '123 Main St, New York',
      rating: 4.5,
      pricePerDay: 35,
      services: ['Day Care', 'Overnight Stay', 'Grooming'],
      availability: ['2024-01-15', '2024-01-16', '2024-01-17']
    },
    {
      id: 2,
      name: 'Pet Paradise Center',
      location: '456 Oak Ave, Los Angeles',
      rating: 4.8,
      pricePerDay: 45,
      services: ['Day Care', 'Training', 'Vet Services'],
      availability: ['2024-01-15', '2024-01-18', '2024-01-19']
    }
  ];

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      alert('Please login to book a daycare service');
      return;
    }

    setLoading(true);
    
    try {
      const start = new Date(bookingData.startDate);
      const end = new Date(bookingData.endDate);
      const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const totalAmount = days * selectedCenter.pricePerDay;

      const bookingPayload = {
        daycareCenter: {
          name: selectedCenter.name,
          location: selectedCenter.location,
          pricePerDay: selectedCenter.pricePerDay
        },
        petName: bookingData.petName,
        petType: bookingData.petType,
        petAge: bookingData.petAge,
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        specialInstructions: bookingData.specialInstructions,
        totalAmount: totalAmount
      };

      await daycareAPI.createBooking(bookingPayload);
      
      alert('Daycare booking created successfully!');
      setSelectedCenter(null);
      setBookingData({
        petName: '',
        petType: '',
        petAge: '',
        startDate: '',
        endDate: '',
        specialInstructions: ''
      });
    } catch (error) {
      alert(error.response?.data?.message || 'Error creating booking');
    }
    
    setLoading(false);
  };

  return (
    <div className="services-page">
      <div className="services-header">
        <h1>Pet Daycare Centers</h1>
        <p>Find the perfect daycare for your furry friends</p>
      </div>

      {!user && (
        <div className="login-prompt">
          <p>Please <a href="#" onClick={() => window.location.reload()}>login</a> to book daycare services</p>
        </div>
      )}

      <div className="centers-grid">
        {daycareCenters.map(center => (
          <div key={center.id} className="center-card">
            <div className="center-image">
              <img src={`https://placehold.co/300x200/3b82f6/ffffff?text=${encodeURIComponent(center.name)}`} alt={center.name} />
            </div>
            <div className="center-info">
              <h3>{center.name}</h3>
              <p className="center-location">{center.location}</p>
              <div className="center-rating">
                <span className="rating">⭐ {center.rating}</span>
                <span className="price">${center.pricePerDay}/day</span>
              </div>
              <div className="center-services">
                <strong>Services:</strong>
                <div className="service-tags">
                  {center.services.map(service => (
                    <span key={service} className="service-tag">{service}</span>
                  ))}
                </div>
              </div>
              <button 
                className="book-btn"
                onClick={() => setSelectedCenter(center)}
                disabled={!user}
              >
                {user ? 'Book Now' : 'Login to Book'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selectedCenter && (
        <div className="booking-modal">
          <div className="booking-form-container">
            <div className="booking-header">
              <h2>Book {selectedCenter.name}</h2>
              <button 
                className="close-btn"
                onClick={() => setSelectedCenter(null)}
                disabled={loading}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleBookingSubmit} className="booking-form">
              <div className="form-group">
                <label>Pet Name *</label>
                <input
                  type="text"
                  value={bookingData.petName}
                  onChange={(e) => setBookingData({...bookingData, petName: e.target.value})}
                  required
                  disabled={loading}
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Pet Type *</label>
                  <select
                    value={bookingData.petType}
                    onChange={(e) => setBookingData({...bookingData, petType: e.target.value})}
                    required
                    disabled={loading}
                  >
                    <option value="">Select Pet Type</option>
                    <option value="dog">Dog</option>
                    <option value="cat">Cat</option>
                    <option value="bird">Bird</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Pet Age *</label>
                  <input
                    type="number"
                    value={bookingData.petAge}
                    onChange={(e) => setBookingData({...bookingData, petAge: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={bookingData.startDate}
                    onChange={(e) => setBookingData({...bookingData, startDate: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
                
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={bookingData.endDate}
                    onChange={(e) => setBookingData({...bookingData, endDate: e.target.value})}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  value={bookingData.specialInstructions}
                  onChange={(e) => setBookingData({...bookingData, specialInstructions: e.target.value})}
                  rows="3"
                  placeholder="Any special care instructions..."
                  disabled={loading}
                />
              </div>

              <div className="booking-summary">
                <h4>Booking Summary</h4>
                <p>Center: {selectedCenter.name}</p>
                <p>Price: ${selectedCenter.pricePerDay} per day</p>
                {bookingData.startDate && bookingData.endDate && (
                  <p>
                    Total: ${Math.ceil(
                      (new Date(bookingData.endDate) - new Date(bookingData.startDate)) / 
                      (1000 * 60 * 60 * 24)
                    ) * selectedCenter.pricePerDay}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="submit-booking-btn"
                disabled={loading}
              >
                {loading ? 'Booking...' : 'Confirm Booking'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PetServicesPage;