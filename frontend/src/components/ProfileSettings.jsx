import React, { useState, useEffect } from 'react';
import { User, ChevronLeft, Camera, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './ProfileSettings.css';

const ProfileSettings = ({ onBack }) => {
    const { user, updateUserProfile, logout } = useAuth();

    const [formData, setFormData] = useState({
        displayName: '',
        age: '',
        gender: 'Prefer not to say',
        historyYears: '',
        bio: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                displayName: user.displayName || '',
                age: user.age || '',
                gender: user.gender || 'Prefer not to say',
                historyYears: user.historyYears || '',
                bio: user.bio || ''
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        updateUserProfile(formData);
        onBack(); // Go back to dashboard
    };

    return (
        <div className="profile-container">
            <header className="profile-header">
                <button onClick={onBack} className="back-btn"><ChevronLeft size={24} /></button>
                <h1>My Profile</h1>
                <div style={{ width: 24 }} /> {/* spacer */}
            </header>

            <div className="profile-content">
                {/* Avatar Section */}
                <div className="avatar-section">
                    <div className="avatar-circle">
                        <User size={40} color="white" />
                        <button className="edit-avatar-btn"><Camera size={14} /></button>
                    </div>

                </div>

                {/* Form */}
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        placeholder="Enter your name"
                    />
                </div>

                <div className="form-group">
                    <label>Age</label>
                    <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleChange}
                        placeholder="Age"
                    />
                </div>

                <div className="form-group">
                    <label>Gender</label>
                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Non-binary</option>
                        <option>Prefer not to say</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Years with Migraine</label>
                    <input
                        type="number"
                        name="historyYears"
                        value={formData.historyYears}
                        onChange={handleChange}
                        placeholder="e.g. 5"
                    />
                </div>

                <div className="form-group">
                    <label>Bio / Medical Notes</label>
                    <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        placeholder="Any specific medical conditions..."
                        rows={3}
                    />
                </div>

                <button className="save-profile-btn" onClick={handleSave}>
                    Save Changes
                </button>

                <button className="logout-btn" onClick={() => logout()}>
                    <LogOut size={16} /> Log Out
                </button>
            </div>
        </div>
    );
};

export default ProfileSettings;
