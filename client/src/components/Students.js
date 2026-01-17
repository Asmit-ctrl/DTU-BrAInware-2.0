import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Students() {
  const { user, registerStudent } = useAuth();
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newStudentId, setNewStudentId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    grade: '',
    dateOfBirth: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parent/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await registerStudent(
      formData.name,
      formData.password,
      formData.grade,
      formData.dateOfBirth
    );

    if (result.success) {
      setNewStudentId(result.studentId);
      setMessage({ 
        type: 'success', 
        text: `Student registered successfully! Student ID: ${result.studentId}` 
      });
      setFormData({
        name: '',
        password: '',
        confirmPassword: '',
        grade: '',
        dateOfBirth: ''
      });
      fetchStudents();
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
        <h1>My Students</h1>
      </div>

      <div className="students-section">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>Registered Students ({students.length})</h3>
          <button 
            className="btn btn-primary" 
            style={{ width: 'auto', padding: '10px 20px' }}
            onClick={() => {
              setShowForm(!showForm);
              setNewStudentId(null);
              setMessage({ type: '', text: '' });
            }}
          >
            {showForm ? 'Cancel' : '+ Add Student'}
          </button>
        </div>

        {showForm && (
          <div className="add-student-form">
            <h4>Register New Student</h4>
            
            {message.text && (
              <div className={message.type === 'success' ? 'success-message' : 'error-message'}>
                {message.text}
                {newStudentId && (
                  <p style={{ marginTop: '10px', fontWeight: 'bold' }}>
                    📝 Give this Student ID to your student: <span style={{ fontSize: '18px', color: '#667eea' }}>{newStudentId}</span>
                  </p>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Student Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter student's full name"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Grade</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="Enter grade (e.g., 5th, 10th)"
                  />
                </div>
              </div>

              <div className="form-row">
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
                  <label>Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create password (min 6 chars)"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Confirm Password *</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm password"
                    required
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Registering...' : 'Register Student'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {students.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>👨‍🎓</div>
            <h3>No Students Registered</h3>
            <p>Click "Add Student" to register your first student.</p>
          </div>
        ) : (
          students.map((student) => (
            <div key={student.studentId} className="student-card">
              <div className="student-info">
                <div className="student-avatar">
                  {getInitials(student.name)}
                </div>
                <div className="student-details">
                  <h4>{student.name}</h4>
                  <p>Grade: {student.grade || 'Not Set'}</p>
                </div>
              </div>
              <div className="student-id-badge">
                ID: {student.studentId}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="students-section" style={{ marginTop: '20px', background: '#f8f9fa', padding: '20px', borderRadius: '15px' }}>
        <h4 style={{ marginBottom: '10px' }}>📌 How it works:</h4>
        <ol style={{ paddingLeft: '20px', color: '#666', lineHeight: '1.8' }}>
          <li>Click "Add Student" and fill in the student's details</li>
          <li>After registration, you'll receive a <strong>Student ID</strong></li>
          <li>Share this Student ID with your student</li>
          <li>Your student can use the ID and password to login from the Student Login page</li>
        </ol>
      </div>
    </div>
  );
}

export default Students;
