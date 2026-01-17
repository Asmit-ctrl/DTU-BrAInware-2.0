import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [isParent, setIsParent] = useState(true);
  const [formData, setFormData] = useState({
    id: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { loginParent, loginStudent } = useAuth();
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
    setLoading(true);
    setError('');

    const result = isParent 
      ? await loginParent(formData.id, formData.password)
      : await loginStudent(formData.id, formData.password);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Welcome Back!</h2>
        <p>Sign in to continue to your dashboard</p>

        <div className="auth-tabs">
          <button 
            className={`auth-tab ${isParent ? 'active' : ''}`}
            onClick={() => setIsParent(true)}
          >
            Parent Login
          </button>
          <button 
            className={`auth-tab ${!isParent ? 'active' : ''}`}
            onClick={() => setIsParent(false)}
          >
            Student Login
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{isParent ? 'Parent ID' : 'Student ID'}</label>
            <input
              type="text"
              name="id"
              placeholder={isParent ? 'Enter your Parent ID' : 'Enter your Student ID'}
              value={formData.id}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="switch-link">
          <p>
            Don't have an account?{' '}
            <button onClick={() => navigate('/register')}>
              Register as Parent
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
