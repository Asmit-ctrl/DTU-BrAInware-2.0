import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    setLoading(false);
  }, []);

  const loginParent = async (parentId, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/parent/login', {
        parentId,
        password
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const loginStudent = async (studentId, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/student/login', {
        studentId,
        password
      });
      
      const { token, user: userData } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(userData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const registerParent = async (name, password, email, phone) => {
    try {
      const response = await axios.post('http://localhost:5000/api/parent/register', {
        name,
        password,
        email,
        phone
      });
      return { 
        success: true, 
        parentId: response.data.parentId,
        name: response.data.name 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const registerStudent = async (name, password, grade, dateOfBirth) => {
    try {
      const response = await axios.post('http://localhost:5000/api/student/register', {
        name,
        password,
        grade,
        dateOfBirth
      });
      return { 
        success: true, 
        studentId: response.data.studentId,
        name: response.data.name 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const endpoint = user.role === 'parent' 
        ? 'http://localhost:5000/api/parent/profile' 
        : 'http://localhost:5000/api/student/profile';
      
      const response = await axios.put(endpoint, profileData);
      
      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      return { success: true, message: 'Profile updated successfully' };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    loginParent,
    loginStudent,
    registerParent,
    registerStudent,
    updateProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
