import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Sidebar({ currentPage }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = user?.role === 'parent' 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'students', label: 'My Students', icon: '👨‍🎓', path: '/dashboard/students' },
        { id: 'parents-zone', label: 'Parents Zone', icon: '💬', path: '/dashboard/parents-zone' },
        { id: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/profile' },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
        { id: 'quizzes', label: 'Take Quiz', icon: '📝', path: '/dashboard/quizzes' },
        { id: 'quiz-history', label: 'Quiz History', icon: '📈', path: '/dashboard/quiz-history' },
        { id: 'analytics', label: 'AI Analytics', icon: '🤖', path: '/dashboard/analytics' },
        { id: 'lessons', label: 'AI Lessons', icon: '📚', path: '/dashboard/lessons' },
        { id: 'exam', label: 'Exam', icon: '🎯', path: '/dashboard/exam' },
        { id: 'assignment', label: 'Assignment', icon: '📋', path: '/dashboard/assignment' },
        { id: 'doubt', label: 'Ask Doubt', icon: '🤔', path: '/dashboard/doubt' },
        { id: 'schedule', label: 'My Schedule', icon: '📅', path: '/dashboard/schedule' },
        { id: 'profile', label: 'Profile', icon: '👤', path: '/dashboard/profile' },
      ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>🎓 EduPortal</h2>
        <p>{user?.role === 'parent' ? 'Parent Dashboard' : 'Student Dashboard'}</p>
      </div>

      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-menu-item ${currentPage === item.id ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <span style={{ fontSize: '20px', marginRight: '12px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span style={{ marginRight: '8px' }}>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
