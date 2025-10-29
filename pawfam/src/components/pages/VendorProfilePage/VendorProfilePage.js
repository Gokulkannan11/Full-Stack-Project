import React, { useState, useEffect } from 'react';
import { vendorProfileAPI } from '../../../services/api';
import './VendorProfilePage.css';

const VendorProfilePage = ({ user }) => {
    const [profile, setProfile] = useState(null);
    const [hasProfile, setHasProfile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        gender: '',
        mobileNumber: '',
        communicationAddress: ''
    });
    const [errors, setErrors] = useState({});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await vendorProfileAPI.getProfile();

            if (data.hasProfile && data.profile) {
                setProfile(data.profile);
                setHasProfile(true);
                setFormData({
                    name: data.profile.name,
                    gender: data.profile.gender,
                    mobileNumber: data.profile.mobileNumber,
                    communicationAddress: data.profile.communicationAddress
                });
            } else {
                setHasProfile(false);
            }
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            if (error.response?.status === 404) {
                setHasProfile(false);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name || formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.gender) {
            newErrors.gender = 'Please select a gender';
        }

        if (!/^[0-9]{10}$/.test(formData.mobileNumber)) {
            newErrors.mobileNumber = 'Mobile number must be exactly 10 digits';
        }

        if (!formData.communicationAddress || formData.communicationAddress.trim().length < 10) {
            newErrors.communicationAddress = 'Address must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
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
                const data = await vendorProfileAPI.updateProfile(formData);
                setProfile(data.profile);
                alert('Vendor profile updated successfully!');
            } else {
                // Create new profile
                const data = await vendorProfileAPI.createProfile(formData);
                setProfile(data.profile);
                setHasProfile(true);
                alert('Vendor profile created successfully!');
            }

            setIsEditing(false);
        } catch (error) {
            console.error('Error saving vendor profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to save vendor profile';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setLoading(true);
            await vendorProfileAPI.deleteProfile();
            setProfile(null);
            setHasProfile(false);
            setFormData({
                name: '',
                gender: '',
                mobileNumber: '',
                communicationAddress: ''
            });
            setShowDeleteConfirm(false);
            alert('Vendor profile deleted successfully!');
        } catch (error) {
            console.error('Error deleting vendor profile:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete vendor profile';
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
                communicationAddress: profile.communicationAddress
            });
        }
        setIsEditing(false);
        setErrors({});
    };

    if (loading && !profile) {
        return (
            <div className="vendor-profile-page">
                <div className="vendor-profile-container">
                    <div className="loading-spinner">Loading vendor profile...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="vendor-profile-page">
            <div className="vendor-profile-container">
                <h1 className="vendor-profile-title">Vendor Profile</h1>

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
                        <h2>Vendor Details</h2>
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
                            <p>You haven't added your vendor details yet.</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="btn btn-primary btn-large"
                            >
                                Add Vendor Details
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
                                    pattern="[0-9]{10}"
                                    disabled={loading}
                                />
                                {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="communicationAddress">Communication Address *</label>
                                <textarea
                                    id="communicationAddress"
                                    name="communicationAddress"
                                    value={formData.communicationAddress}
                                    onChange={handleInputChange}
                                    className={errors.communicationAddress ? 'error' : ''}
                                    placeholder="Enter your complete communication address"
                                    rows="4"
                                    disabled={loading}
                                />
                                {errors.communicationAddress && <span className="error-text">{errors.communicationAddress}</span>}
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
                                <strong>Vendor ID:</strong>
                                <span>{profile.vendorId}</span>
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
                                <strong>Communication Address:</strong>
                                <span>{profile.communicationAddress}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Confirm Delete</h3>
                            <p>Are you sure you want to delete your vendor profile? This action cannot be undone.</p>
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
            </div>
        </div>
    );
};

export default VendorProfilePage;
