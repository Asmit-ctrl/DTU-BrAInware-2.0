import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { registerParent } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    const result = await registerParent(
      formData.name, 
      formData.password, 
      formData.email, 
      formData.phone
    );

    if (result.success) {
      setSuccess({
        parentId: result.parentId,
        name: result.name
      });
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-box">
          <h2>🎉 Registration Successful!</h2>
          <div className="success-message">
            <strong>Your Parent ID: {success.parentId}</strong>
            <p>Please save this ID. You'll need it to login.</p>
          </div>
          <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
            Welcome, <strong>{success.name}</strong>! Your account has been created successfully.
          </p>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Parent Registration</h2>
        <p>Create an account to manage your students</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Password *</label>
            <input
              type="password"
              name="password"
              placeholder="Create a password (min 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="switch-link">
          <p>
            Already have an account?{' '}
            <button onClick={() => navigate('/login')}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
