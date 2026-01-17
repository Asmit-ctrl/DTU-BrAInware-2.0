import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.profile?.address || '',
    city: user?.profile?.city || '',
    state: user?.profile?.state || '',
    zipCode: user?.profile?.zipCode || '',
    // Student specific
    grade: user?.grade || '',
    dateOfBirth: user?.dateOfBirth || '',
    school: user?.profile?.school || '',
    class: user?.profile?.class || '',
    section: user?.profile?.section || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const profileData = user?.role === 'parent' 
      ? {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          profile: {
            address: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode
          }
        }
      : {
          name: formData.name,
          grade: formData.grade,
          dateOfBirth: formData.dateOfBirth,
          profile: {
            school: formData.school,
            class: formData.class,
            section: formData.section
          }
        };

    const result = await updateProfile(profileData);
    
    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.message });
    }
    setLoading(false);
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase() || '?';
  };

  return (
    <div>
      <div className="content-header">
        <h1>Profile Settings</h1>
      </div>

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            {getInitials(user?.name)}
          </div>
          <div className="profile-info">
            <h2>{user?.name}</h2>
            <p>{user?.role === 'parent' ? `Parent ID: ${user?.parentId}` : `Student ID: ${user?.studentId}`}</p>
          </div>
        </div>

        {message.text && (
          <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>

          {user?.role === 'parent' ? (
            <>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter your address"
                />
              </div>

              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                />
              </div>

              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter your state"
                />
              </div>

              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Enter your zip code"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label>Grade</label>
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  placeholder="Enter your grade"
                />
              </div>

              <div className="form-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>School Name</label>
                <input
                  type="text"
                  name="school"
                  value={formData.school}
                  onChange={handleChange}
                  placeholder="Enter your school name"
                />
              </div>

              <div className="form-group">
                <label>Class</label>
                <input
                  type="text"
                  name="class"
                  value={formData.class}
                  onChange={handleChange}
                  placeholder="Enter your class"
                />
              </div>

              <div className="form-group">
                <label>Section</label>
                <input
                  type="text"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  placeholder="Enter your section"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;
