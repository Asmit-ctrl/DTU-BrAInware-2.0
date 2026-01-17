import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function DashboardHome() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);

  useEffect(() => {
    if (user?.role === 'parent') {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/parent/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
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
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <div className="user-avatar">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>

      <div className="welcome-card">
        <h2>Welcome back, {user?.name}! 👋</h2>
        <p>
          {user?.role === 'parent' 
            ? 'Manage your students and keep track of their progress.'
            : 'View your academic progress and profile information.'}
        </p>
      </div>

      <div className="stats-grid">
        {user?.role === 'parent' ? (
          <>
            <div className="stat-card">
              <div className="icon blue">👨‍🎓</div>
              <h3>Registered Students</h3>
              <div className="value">{students.length}</div>
            </div>
            <div className="stat-card">
              <div className="icon green">✅</div>
              <h3>Active Status</h3>
              <div className="value">Active</div>
            </div>
            <div className="stat-card">
              <div className="icon orange">🆔</div>
              <h3>Your Parent ID</h3>
              <div className="value" style={{ fontSize: '18px' }}>{user?.parentId}</div>
            </div>
          </>
        ) : (
          <>
            <div className="stat-card">
              <div className="icon blue">📚</div>
              <h3>Grade</h3>
              <div className="value">{user?.grade || 'Not Set'}</div>
            </div>
            <div className="stat-card">
              <div className="icon green">✅</div>
              <h3>Status</h3>
              <div className="value">Active</div>
            </div>
            <div className="stat-card">
              <div className="icon orange">🆔</div>
              <h3>Your Student ID</h3>
              <div className="value" style={{ fontSize: '18px' }}>{user?.studentId}</div>
            </div>
          </>
        )}
      </div>

      {user?.role === 'parent' && students.length > 0 && (
        <div className="students-section">
          <h3>Your Students</h3>
          {students.map((student) => (
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
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardHome;
