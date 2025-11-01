import React, { useState, useEffect } from 'react';
import { profileAPI, petsAPI } from '../../../services/api';
import './ProfilePage.css';

const ProfilePage = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        mobileNumber: '',
        residentialAddress: ''
    });
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    // Pets state
    const [pets, setPets] = useState([]);
    const [petsLoading, setPetsLoading] = useState(true);
    const [showPetForm, setShowPetForm] = useState(false);
    const [editingPetId, setEditingPetId] = useState(null);
    const [petFormData, setPetFormData] = useState({
        category: '',
        breed: '',
        name: '',
        age: ''
    });
    const [petErrors, setPetErrors] = useState({});
    const [availableBreeds, setAvailableBreeds] = useState([]);
    const [deletingPetId, setDeletingPetId] = useState(null);

    // Search and Sort state for pets
    const [petSearchKeyword, setPetSearchKeyword] = useState('');
    const [petSortBy, setPetSortBy] = useState('category-cat'); // Default sort
    const [filteredPets, setFilteredPets] = useState([]);

    useEffect(() => {
        fetchProfile();
        fetchPets();
    }, []); const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await profileAPI.getProfile();

            if (data.hasProfile && data.profile) {
                setProfile(data.profile);
                setHasProfile(true);
                setFormData({
                    name: data.profile.name,
                    gender: data.profile.gender,
                    mobileNumber: data.profile.mobileNumber,
                    residentialAddress: data.profile.residentialAddress
                });
            } else {
                setHasProfile(false);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.response?.status === 404) {
                setHasProfile(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length < 3) {
            newErrors.name = 'Name must be at least 3 characters';
        } else if (formData.name.trim().length > 50) {
            newErrors.name = 'Name cannot exceed 50 characters';
        }

        if (!formData.gender) {
            newErrors.gender = 'Please select a gender';
        }

        // Validate mobile number - must be exactly 10 digits and start with 6-9
        if (!formData.mobileNumber) {
            newErrors.mobileNumber = 'Mobile number is required';
        } else if (!/^[6-9]\d{9}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Mobile number must be 10 digits starting with 6-9';
        }

        if (!formData.residentialAddress || formData.residentialAddress.trim().length < 10) {
            newErrors.residentialAddress = 'Address must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Special handling for mobile number - only allow digits and limit to 10
        if (name === 'mobileNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData(prev => ({
                ...prev,
                [name]: numericValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);

            if (hasProfile) {
                // Update existing profile
                const data = await profileAPI.updateProfile(formData);
                setProfile(data.profile);
                alert('Profile updated successfully!');
            } else {
                // Create new profile
                const data = await profileAPI.createProfile(formData);
                setProfile(data.profile);
                setHasProfile(true);
                alert('Profile created successfully!');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save profile';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await profileAPI.deleteProfile();
            setProfile(null);
            setHasProfile(false);
            setFormData({
                name: '',
                gender: '',
                mobileNumber: '',
                residentialAddress: ''
            });
            setShowDeleteConfirm(false);
            alert('Profile deleted successfully!');
        } catch (error) {
            console.error('Error deleting profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete profile';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (hasProfile && profile) {
            setFormData({
                name: profile.name,
                gender: profile.gender,
                mobileNumber: profile.mobileNumber,
                residentialAddress: profile.residentialAddress
            });
        }
        setIsEditing(false);
        setErrors({});
    };

    // ==================== PETS FUNCTIONS ====================

    const fetchPets = async () => {
        try {
            setPetsLoading(true);
            const data = await petsAPI.getPets();
            setPets(data.pets || []);
        } catch (error) {
            console.error('Error fetching pets:', error);
            setPets([]);
        } finally {
            setPetsLoading(false);
        }
    };

    // Filter and sort pets whenever pets, search, or sort changes
    useEffect(() => {
        let result = [...pets];

        // Apply search filter
        if (petSearchKeyword.trim()) {
            const keyword = petSearchKeyword.toLowerCase();
            result = result.filter(pet =>
                pet.name.toLowerCase().includes(keyword) ||
                pet.category.toLowerCase().includes(keyword) ||
                pet.breed.toLowerCase().includes(keyword) ||
                pet.age.toString().includes(keyword)
            );
        }

        // Apply sorting
        result = sortPets(result, petSortBy);

        setFilteredPets(result);
    }, [pets, petSearchKeyword, petSortBy]);

    const sortPets = (petsArray, sortOption) => {
        const sorted = [...petsArray];

        switch (sortOption) {
            case 'category-cat':
                // Show Cats first, then Dogs
                return sorted.sort((a, b) => {
                    if (a.category === 'Cat' && b.category !== 'Cat') return -1;
                    if (a.category !== 'Cat' && b.category === 'Cat') return 1;
                    return 0;
                });
            case 'category-dog':
                // Show Dogs first, then Cats
                return sorted.sort((a, b) => {
                    if (a.category === 'Dog' && b.category !== 'Dog') return -1;
                    if (a.category !== 'Dog' && b.category === 'Dog') return 1;
                    return 0;
                });
            case 'age-asc':
                return sorted.sort((a, b) => a.age - b.age);
            case 'age-desc':
                return sorted.sort((a, b) => b.age - a.age);
            default:
                return sorted;
        }
    };

    const handlePetSearchChange = (e) => {
        setPetSearchKeyword(e.target.value);
    };

    const clearPetSearch = () => {
        setPetSearchKeyword('');
    };

    const handlePetSortChange = (e) => {
        setPetSortBy(e.target.value);
    };

    const fetchBreeds = async (category) => {
        try {
            const data = await petsAPI.getBreeds(category);
            setAvailableBreeds(data.breeds || []);
        } catch (error) {
            console.error('Error fetching breeds:', error);
            setAvailableBreeds([]);
        }
    };

    const handlePetCategoryChange = async (category) => {
        setPetFormData(prev => ({
            ...prev,
            category,
            breed: '' // Reset breed when category changes
        }));

        if (category) {
            await fetchBreeds(category);
        } else {
            setAvailableBreeds([]);
        }
    };

    const handlePetInputChange = (e) => {
        const { name, value } = e.target;
        setPetFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error for this field
        if (petErrors[name]) {
            setPetErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validatePetForm = () => {
        const newErrors = {};

        if (!petFormData.category) {
            newErrors.category = 'Please select a pet category';
        }

        if (!petFormData.breed) {
            newErrors.breed = 'Please select a breed';
        }

        if (!petFormData.name || petFormData.name.trim().length < 2) {
            newErrors.name = 'Pet name must be at least 2 characters';
        }

        const age = Number(petFormData.age);
        if (!petFormData.age || isNaN(age) || age < 0 || age > 30) {
            newErrors.age = 'Age must be a number between 0 and 30';
        }

        setPetErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddPet = () => {
        setPetFormData({
            category: '',
            breed: '',
            name: '',
            age: ''
        });
        setAvailableBreeds([]);
        setPetErrors({});
        setEditingPetId(null);
        setShowPetForm(true);
    };

    const handleEditPet = (pet) => {
        setPetFormData({
            category: pet.category,
            breed: pet.breed,
            name: pet.name,
            age: pet.age.toString()
        });
        setEditingPetId(pet.id);
        fetchBreeds(pet.category);
        setPetErrors({});
        setShowPetForm(true);
    };

    const handlePetFormSubmit = async (e) => {
        e.preventDefault();

        if (!validatePetForm()) {
            return;
        }

        try {
            setPetsLoading(true);

            if (editingPetId) {
                // Update existing pet
                await petsAPI.updatePet(editingPetId, petFormData);
                alert('Pet updated successfully!');
            } else {
                // Create new pet
                await petsAPI.createPet(petFormData);
                alert('Pet added successfully!');
            }

            await fetchPets();
            setShowPetForm(false);
            setPetFormData({
                category: '',
                breed: '',
                name: '',
                age: ''
            });
            setAvailableBreeds([]);
            setEditingPetId(null);
        } catch (error) {
            console.error('Error saving pet:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save pet';
            alert(errorMessage);
        } finally {
            setPetsLoading(false);
        }
    };

    const handleDeletePet = async (petId) => {
        if (!window.confirm('Are you sure you want to delete this pet?')) {
            return;
        }

        try {
            setPetsLoading(true);
            await petsAPI.deletePet(petId);
            alert('Pet deleted successfully!');
            await fetchPets();
        } catch (error) {
            console.error('Error deleting pet:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete pet';
            alert(errorMessage);
        } finally {
            setPetsLoading(false);
        }
    };

    const handleCancelPetForm = () => {
        setShowPetForm(false);
        setPetFormData({
            category: '',
            breed: '',
            name: '',
            age: ''
        });
        setAvailableBreeds([]);
        setPetErrors({});
        setEditingPetId(null);
    }; if (loading && !profile) {
        return (
            <div className="profile-page">
                <div className="profile-container">
                    <div className="loading-spinner">Loading profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="profile-page">
            <div className="profile-container">
                <h1 className="profile-title">My Profile</h1>

                <div className="profile-info-section">
                    <h2>Account Information</h2>
                    <div className="account-info">
                        <p><strong>Username:</strong> {user?.username}</p>
                        <p><strong>Email:</strong> {user?.email}</p>
                        <p><strong>Role:</strong> {user?.role}</p>
                    </div>
                </div>

                <div className="profile-details-section">
                    <div className="section-header">
                        <h2>User Details</h2>
                        {hasProfile && !isEditing && (
                            <div className="action-buttons">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="btn btn-primary"
                                >
                                    Edit Details
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="btn btn-danger"
                                >
                                    Delete Details
                                </button>
                            </div>
                        )}
                    </div>

                    {!hasProfile && !isEditing ? (
                        <div className="no-profile">
                            <p>You haven't added your details yet.</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary btn-large"
                            >
                                Add User Details
                            </button>
                        </div>
                    ) : isEditing ? (
                        <form onSubmit={handleSubmit} className="profile-form">
                            <div className="form-group">
                                <label htmlFor="name">Name *</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="Enter your full name"
                                    minLength="3"
                                    maxLength="50"
                                    disabled={loading}
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label>Gender *</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Male"
                                            checked={formData.gender === 'Male'}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span>Male</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Female"
                                            checked={formData.gender === 'Female'}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span>Female</span>
                                    </label>
                                    <label className="radio-label">
                                        <input
                                            type="radio"
                                            name="gender"
                                            value="Other"
                                            checked={formData.gender === 'Other'}
                                            onChange={handleInputChange}
                                            disabled={loading}
                                        />
                                        <span>Other</span>
                                    </label>
                                </div>
                                {errors.gender && <span className="error-text">{errors.gender}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="mobileNumber">Mobile Number *</label>
                                <input
                                    type="tel"
                                    id="mobileNumber"
                                    name="mobileNumber"
                                    value={formData.mobileNumber}
                                    onChange={handleInputChange}
                                    className={errors.mobileNumber ? 'error' : ''}
                                    placeholder="Enter 10-digit mobile number"
                                    maxLength="10"
                                    pattern="[6-9][0-9]{9}"
                                    title="Please enter a valid 10-digit mobile number starting with 6-9"
                                    disabled={loading}
                                />
                                {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="residentialAddress">Residential Address *</label>
                                <textarea
                                    id="residentialAddress"
                                    name="residentialAddress"
                                    value={formData.residentialAddress}
                                    onChange={handleInputChange}
                                    className={errors.residentialAddress ? 'error' : ''}
                                    placeholder="Enter your complete residential address"
                                    rows="4"
                                    disabled={loading}
                                />
                                {errors.residentialAddress && <span className="error-text">{errors.residentialAddress}</span>}
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : (hasProfile ? 'Update Details' : 'Save Details')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="profile-details">
                            <div className="detail-item">
                                <strong>User ID:</strong>
                                <span>{profile.userId}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Name:</strong>
                                <span>{profile.name}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Gender:</strong>
                                <span>{profile.gender}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Mobile Number:</strong>
                                <span>{profile.mobileNumber}</span>
                            </div>
                            <div className="detail-item">
                                <strong>Residential Address:</strong>
                                <span>{profile.residentialAddress}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete your profile details? This action cannot be undone.</p>
                            <div className="modal-actions">
                                <button
                                    onClick={handleDelete}
                                    className="btn btn-danger"
                                    disabled={loading}
                                >
                                    {loading ? 'Deleting...' : 'Yes, Delete'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="btn btn-secondary"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== PETS SECTION ==================== */}
                <div className="pets-section">
                    <div className="section-header">
                        <h2>My Pets</h2>
                        {!showPetForm && (
                            <button
                                onClick={handleAddPet}
                                className="btn btn-primary"
                            >
                                Add New Pet
                            </button>
                        )}
                    </div>

                    {petsLoading && pets.length === 0 ? (
                        <div className="loading-spinner">Loading pets...</div>
                    ) : showPetForm ? (
                        <div className="pet-form-container">
                            <h3>{editingPetId ? 'Edit Pet Details' : 'Add New Pet'}</h3>
                            <form onSubmit={handlePetFormSubmit} className="pet-form">
                                <div className="form-group">
                                    <label>Pet Category *</label>
                                    <div className="radio-group">
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="Dog"
                                                checked={petFormData.category === 'Dog'}
                                                onChange={(e) => handlePetCategoryChange(e.target.value)}
                                                disabled={petsLoading}
                                            />
                                            <span>Dog</span>
                                        </label>
                                        <label className="radio-label">
                                            <input
                                                type="radio"
                                                name="category"
                                                value="Cat"
                                                checked={petFormData.category === 'Cat'}
                                                onChange={(e) => handlePetCategoryChange(e.target.value)}
                                                disabled={petsLoading}
                                            />
                                            <span>Cat</span>
                                        </label>
                                    </div>
                                    {petErrors.category && <span className="error-text">{petErrors.category}</span>}
                                </div>

                                {petFormData.category && (
                                    <div className="form-group">
                                        <label htmlFor="breed">Breed *</label>
                                        <select
                                            id="breed"
                                            name="breed"
                                            value={petFormData.breed}
                                            onChange={handlePetInputChange}
                                            className={petErrors.breed ? 'error' : ''}
                                            disabled={petsLoading}
                                        >
                                            <option value="">Select a breed</option>
                                            {availableBreeds.map((breed) => (
                                                <option key={breed} value={breed}>
                                                    {breed}
                                                </option>
                                            ))}
                                        </select>
                                        {petErrors.breed && <span className="error-text">{petErrors.breed}</span>}
                                    </div>
                                )}

                                <div className="form-group">
                                    <label htmlFor="petName">Name of the Pet *</label>
                                    <input
                                        type="text"
                                        id="petName"
                                        name="name"
                                        value={petFormData.name}
                                        onChange={handlePetInputChange}
                                        className={petErrors.name ? 'error' : ''}
                                        placeholder="Enter pet's name"
                                        disabled={petsLoading}
                                    />
                                    {petErrors.name && <span className="error-text">{petErrors.name}</span>}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="petAge">Age of the Pet *</label>
                                    <input
                                        type="number"
                                        id="petAge"
                                        name="age"
                                        value={petFormData.age}
                                        onChange={handlePetInputChange}
                                        className={petErrors.age ? 'error' : ''}
                                        placeholder="Enter pet's age"
                                        min="0"
                                        max="30"
                                        disabled={petsLoading}
                                    />
                                    {petErrors.age && <span className="error-text">{petErrors.age}</span>}
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={petsLoading}
                                    >
                                        {petsLoading ? 'Saving...' : (editingPetId ? 'Update Pet' : 'Add Pet')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancelPetForm}
                                        className="btn btn-secondary"
                                        disabled={petsLoading}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : pets.length === 0 ? (
                        <div className="no-pets">
                            <p>You haven't added any pets yet.</p>
                            <button
                                onClick={handleAddPet}
                                className="btn btn-primary btn-large"
                            >
                                Add Your First Pet
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Search and Sort Controls */}
                            <div className="pets-search-sort-container">
                                <div className="pets-search-wrapper">
                                    <input
                                        type="text"
                                        className="pets-search-input"
                                        placeholder="Search by name, category, breed, or age..."
                                        value={petSearchKeyword}
                                        onChange={handlePetSearchChange}
                                    />
                                    {petSearchKeyword && (
                                        <button
                                            className="pets-clear-search-btn"
                                            onClick={clearPetSearch}
                                            title="Clear search"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>

                                <div className="pets-sort-controls">
                                    <label className="pets-sort-label">Sort by:</label>
                                    <select
                                        className="pets-sort-select"
                                        value={petSortBy}
                                        onChange={handlePetSortChange}
                                    >
                                        <option value="category-cat">Category: Cat First</option>
                                        <option value="category-dog">Category: Dog First</option>
                                        <option value="age-asc">Age: Low to High</option>
                                        <option value="age-desc">Age: High to Low</option>
                                    </select>
                                </div>
                            </div>

                            {petSearchKeyword && (
                                <div className="pets-search-results-info">
                                    Found {filteredPets.length} result{filteredPets.length !== 1 ? 's' : ''}
                                    {petSearchKeyword && ` for "${petSearchKeyword}"`}
                                </div>
                            )}

                            {filteredPets.length === 0 ? (
                                <div className="no-pets">
                                    <p>No pets match your search "{petSearchKeyword}".</p>
                                    <button
                                        className="clear-search-btn-inline"
                                        onClick={clearPetSearch}
                                    >
                                        Clear Search
                                    </button>
                                </div>
                            ) : (
                                <div className="pets-grid">
                                    {filteredPets.map((pet) => (
                                        <div key={pet.id} className="pet-card">
                                            <div className="pet-card-header">
                                                <h3>{pet.name}</h3>
                                                <span className="pet-category-badge">{pet.category}</span>
                                            </div>
                                            <div className="pet-card-body">
                                                <p><strong>Breed:</strong> {pet.breed}</p>
                                                <p><strong>Age:</strong> {pet.age} {pet.age === 1 ? 'year' : 'years'}</p>
                                            </div>
                                            <div className="pet-card-actions">
                                                <button
                                                    onClick={() => handleEditPet(pet)}
                                                    className="btn btn-small btn-primary"
                                                    disabled={petsLoading}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePet(pet.id)}
                                                    className="btn btn-small btn-danger"
                                                    disabled={petsLoading}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
