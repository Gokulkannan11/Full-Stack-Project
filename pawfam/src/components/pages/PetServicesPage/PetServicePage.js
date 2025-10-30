import React, { useState, useEffect } from 'react';
import { daycareAPI, petsAPI } from '../../../services/api';
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
  const [userPets, setUserPets] = useState([]);
  const [petsLoading, setPetsLoading] = useState(false);
  const [bookingMode, setBookingMode] = useState(null); // 'existing' or 'manual'
  const [selectedPetId, setSelectedPetId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Fetch user's pets when component mounts
  useEffect(() => {
    if (user) {
      fetchUserPets();
    }
  }, [user]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchKeyword);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchKeyword]);

  const fetchUserPets = async () => {
    try {
      setPetsLoading(true);
      const data = await petsAPI.getPets();
      setUserPets(data.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
      setUserPets([]);
    } finally {
      setPetsLoading(false);
    }
  };

  const handlePetSelection = (petId) => {
    const selectedPet = userPets.find(pet => pet.id === petId);

    if (selectedPet) {
      setSelectedPetId(petId);
      setBookingData({
        ...bookingData,
        petName: selectedPet.name,
        petType: selectedPet.category,
        petAge: selectedPet.age.toString()
      });
      // Automatically move to form after selection
      // The form will show with auto-filled values
    }
  };

  const handleModeSelection = (mode) => {
    setBookingMode(mode);
    if (mode === 'manual') {
      // Reset form for manual entry
      setBookingData({
        petName: '',
        petType: '',
        petAge: '',
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        specialInstructions: bookingData.specialInstructions
      });
      setSelectedPetId('');
    }
  };

  const resetBookingModal = () => {
    setSelectedCenter(null);
    setBookingMode(null);
    setSelectedPetId('');
    setBookingData({
      petName: '',
      petType: '',
      petAge: '',
      startDate: '',
      endDate: '',
      specialInstructions: ''
    });
  };

  // Mock data - replace with actual API call
  const daycareCenters = [
    {
      id: 1,
      name: 'Happy Paws Daycare',
      location: 'Peelamedu, Coimbatore',
      rating: 4.5,
      pricePerDay: 35,
      services: ['Day Care', 'Overnight Stay', 'Grooming'],
      availability: ['2024-01-15', '2024-01-16', '2024-01-17']
    },
    {
      id: 2,
      name: 'Pet Paradise Center',
      location: 'Singanallur, Coimbatore',
      rating: 4.8,
      pricePerDay: 45,
      services: ['Day Care', 'Training', 'Vet Services'],
      availability: ['2024-01-15', '2024-01-18', '2024-01-19']
    }
  ];

  // Filter daycare centers based on search keyword
  const filteredCenters = daycareCenters.filter(center => {
    if (!debouncedSearch) return true;

    const searchLower = debouncedSearch.toLowerCase();
    return (
      center.name.toLowerCase().includes(searchLower) ||
      center.location.toLowerCase().includes(searchLower) ||
      center.services.some(service => service.toLowerCase().includes(searchLower))
    );
  });

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
      resetBookingModal();
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

      <div className="search-bar-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search daycare centers by name, location, services..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        {searchKeyword && (
          <button
            className="clear-search-btn"
            onClick={() => setSearchKeyword('')}
            title="Clear search"
          >
            ×
          </button>
        )}
      </div>

      <div className="centers-grid">
        {filteredCenters.length === 0 ? (
          <div className="no-results">
            <p>No daycare centers found matching "{debouncedSearch}"</p>
            <button onClick={() => setSearchKeyword('')}>Clear Search</button>
          </div>
        ) : (
          filteredCenters.map(center => (
            <div key={center.id} className="center-card">
              <div className="center-image">
                <img src={`https://placehold.co/300x200/3b82f6/ffffff?text=${encodeURIComponent(center.name)}`} alt={center.name} />
              </div>
              <div className="center-info">
                <h3>{center.name}</h3>
                <p className="center-location">{center.location}</p>
                <div className="center-rating">
                  <span className="rating">⭐ {center.rating}</span>
                  <span className="price">₹{center.pricePerDay}/day</span>
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
          ))
        )}
      </div>

      {/* Booking Modal */}
      {selectedCenter && (
        <div className="booking-modal">
          <div className="booking-form-container">
            <div className="booking-header">
              <h2>Book {selectedCenter.name}</h2>
              <button
                className="close-btn"
                onClick={resetBookingModal}
                disabled={loading}
              >
                ×
              </button>
            </div>

            {/* Mode Selection */}
            {!bookingMode && (
              <div className="mode-selection">
                <h3>Choose Booking Method</h3>
                <div className="mode-buttons">
                  {userPets.length > 0 ? (
                    <>
                      <button
                        type="button"
                        className="mode-btn existing-pet-btn"
                        onClick={() => handleModeSelection('existing')}
                        disabled={petsLoading}
                      >
                        <span className="mode-icon">🐾</span>
                        <span className="mode-title">Choose from My Pets</span>
                        <span className="mode-desc">Select from {userPets.length} registered pet(s)</span>
                      </button>
                      <button
                        type="button"
                        className="mode-btn manual-btn"
                        onClick={() => handleModeSelection('manual')}
                      >
                        <span className="mode-icon">✏️</span>
                        <span className="mode-title">Enter Details Manually</span>
                        <span className="mode-desc">Fill in pet information</span>
                      </button>
                    </>
                  ) : (
                    <div className="no-pets-message">
                      <p>You don't have any registered pets yet.</p>
                      <button
                        type="button"
                        className="mode-btn manual-btn full-width"
                        onClick={() => handleModeSelection('manual')}
                      >
                        <span className="mode-icon">✏️</span>
                        <span className="mode-title">Enter Pet Details</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Existing Pets Selection */}
            {bookingMode === 'existing' && !selectedPetId && (
              <div className="pet-selection">
                <div className="selection-header">
                  <h3>Select Your Pet</h3>
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setBookingMode(null)}
                  >
                    ← Back
                  </button>
                </div>
                <div className="pets-list">
                  {userPets.map((pet) => (
                    <div
                      key={pet.id}
                      className="pet-option"
                      onClick={() => handlePetSelection(pet.id)}
                    >
                      <div className="pet-option-header">
                        <h4>{pet.name}</h4>
                        <span className="pet-badge">{pet.category}</span>
                      </div>
                      <div className="pet-option-details">
                        <p><strong>Breed:</strong> {pet.breed}</p>
                        <p><strong>Age:</strong> {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Form */}
            {((bookingMode === 'existing' && selectedPetId) || bookingMode === 'manual') && (
              <div className="booking-form-wrapper">
                <div className="selection-header">
                  <h3>{bookingMode === 'existing' ? 'Complete Booking' : 'Enter Pet Details'}</h3>
                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => {
                      if (bookingMode === 'existing') {
                        setSelectedPetId('');
                        setBookingData({
                          ...bookingData,
                          petName: '',
                          petType: '',
                          petAge: ''
                        });
                      } else {
                        setBookingMode(null);
                      }
                    }}
                    disabled={loading}
                  >
                    ← Back
                  </button>
                </div>
                <form onSubmit={handleBookingSubmit} className="booking-form">
                  {/* Pet Details Form - Always shown with auto-filled values for existing pets */}
                  <div className="form-group">
                    <label>Pet Name *</label>
                    <input
                      type="text"
                      value={bookingData.petName}
                      onChange={(e) => setBookingData({ ...bookingData, petName: e.target.value })}
                      required
                      disabled={loading || bookingMode === 'existing'}
                      className={bookingMode === 'existing' ? 'auto-filled' : ''}
                      placeholder="Enter pet's name"
                    />
                    {bookingMode === 'existing' && (
                      <small className="help-text">Auto-filled from your registered pet</small>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Pet Type *</label>
                      <select
                        value={bookingData.petType}
                        onChange={(e) => setBookingData({ ...bookingData, petType: e.target.value })}
                        required
                        disabled={loading || bookingMode === 'existing'}
                        className={bookingMode === 'existing' ? 'auto-filled' : ''}
                      >
                        <option value="">Select Pet Type</option>
                        <option value="Dog">Dog</option>
                        <option value="Cat">Cat</option>
                        <option value="Bird">Bird</option>
                        <option value="Other">Other</option>
                      </select>
                      {bookingMode === 'existing' && (
                        <small className="help-text">Auto-filled</small>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Pet Age *</label>
                      <input
                        type="number"
                        value={bookingData.petAge}
                        onChange={(e) => setBookingData({ ...bookingData, petAge: e.target.value })}
                        required
                        disabled={loading || bookingMode === 'existing'}
                        className={bookingMode === 'existing' ? 'auto-filled' : ''}
                        placeholder="Enter pet's age"
                      />
                      {bookingMode === 'existing' && (
                        <small className="help-text">Auto-filled</small>
                      )}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Start Date *</label>
                      <input
                        type="date"
                        value={bookingData.startDate}
                        onChange={(e) => setBookingData({ ...bookingData, startDate: e.target.value })}
                        required
                        disabled={loading}
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div className="form-group">
                      <label>End Date *</label>
                      <input
                        type="date"
                        value={bookingData.endDate}
                        onChange={(e) => setBookingData({ ...bookingData, endDate: e.target.value })}
                        required
                        disabled={loading}
                        min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Special Instructions</label>
                    <textarea
                      value={bookingData.specialInstructions}
                      onChange={(e) => setBookingData({ ...bookingData, specialInstructions: e.target.value })}
                      rows="3"
                      placeholder="Any special care instructions..."
                      disabled={loading}
                    />
                  </div>

                  <div className="booking-summary">
                    <h4>Booking Summary</h4>
                    <p>Center: {selectedCenter.name}</p>
                    <p>Price: ₹{selectedCenter.pricePerDay} per day</p>
                    {bookingData.startDate && bookingData.endDate && (
                      <p>
                        Total: ₹{Math.ceil(
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
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PetServicesPage;