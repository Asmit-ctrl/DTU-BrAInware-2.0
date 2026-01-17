import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
    fetchStats();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quizzes');
      setQuizzes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const startQuiz = (quizId) => {
    navigate(`/dashboard/quiz/${quizId}`);
  };

  const getSubjectIcon = (subject) => {
    const icons = {
      'Mathematics': '🔢',
      'Physics': '⚛️',
      'Chemistry': '🧪',
      'Biology': '🧬',
      'English': '📚'
    };
    return icons[subject] || '📝';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading quizzes...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <h1>📝 Available Quizzes</h1>
      </div>

      {stats && stats.totalQuizzesTaken > 0 && (
        <div className="welcome-card" style={{ marginBottom: '30px' }}>
          <h2>Your Quiz Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px', marginTop: '20px' }}>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalQuizzesTaken}</div>
              <div style={{ opacity: 0.9 }}>Quizzes Taken</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.averageAccuracy}%</div>
              <div style={{ opacity: 0.9 }}>Average Accuracy</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalCorrect}/{stats.totalQuestionsAnswered}</div>
              <div style={{ opacity: 0.9 }}>Questions Correct</div>
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 'bold' }}>{stats.totalHintsUsed}</div>
              <div style={{ opacity: 0.9 }}>Hints Used</div>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        {quizzes.map((quiz) => (
          <div key={quiz.quizId} className="stat-card" style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div className="icon blue" style={{ fontSize: '32px', background: 'none' }}>
              {getSubjectIcon(quiz.subject)}
            </div>
            <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '10px' }}>{quiz.title}</h3>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px', minHeight: '40px' }}>
              {quiz.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#999', marginBottom: '15px' }}>
              <span>📊 {quiz.totalQuestions} Questions</span>
              <span>⏱️ {quiz.timeLimit} mins</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ 
                background: 'rgba(102, 126, 234, 0.1)', 
                color: '#667eea', 
                padding: '5px 10px', 
                borderRadius: '5px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {quiz.subject}
              </span>
              <button 
                className="btn btn-primary" 
                style={{ width: 'auto', padding: '8px 16px', fontSize: '14px' }}
                onClick={() => startQuiz(quiz.quizId)}
              >
                Start Quiz →
              </button>
            </div>
          </div>
        ))}
      </div>

      {quizzes.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📝</div>
          <h3>No Quizzes Available</h3>
          <p>Check back later for new quizzes.</p>
        </div>
      )}
    </div>
  );
}

export default Quizzes;
