import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function QuizHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quiz-history');
      setHistory(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching history:', error);
      setLoading(false);
    }
  };

  const viewDetails = (attemptId) => {
    const attempt = history.find(h => h.attemptId === attemptId);
    if (attempt) {
      navigate('/dashboard/quiz-result', { 
        state: { result: attempt } 
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGradeColor = (accuracy) => {
    if (accuracy >= 90) return '#2ed573';
    if (accuracy >= 80) return '#26de81';
    if (accuracy >= 70) return '#ffa502';
    if (accuracy >= 60) return '#ff7979';
    return '#e74c3c';
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading history...</div>;
  }

  return (
    <div>
      <div className="content-header">
        <h1>📊 Quiz History</h1>
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '60px', marginBottom: '20px' }}>📝</div>
          <h3>No Quiz History</h3>
          <p>You haven't taken any quizzes yet.</p>
          <button 
            className="btn btn-primary"
            style={{ width: 'auto', padding: '12px 30px', marginTop: '20px' }}
            onClick={() => navigate('/dashboard/quizzes')}
          >
            Take Your First Quiz
          </button>
        </div>
      ) : (
        <div className="profile-container">
          {history.map((attempt) => (
            <div 
              key={attempt.attemptId}
              style={{
                padding: '20px',
                background: 'white',
                border: '2px solid #e0e0e0',
                borderRadius: '15px',
                marginBottom: '15px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onClick={() => viewDetails(attempt.attemptId)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(102, 126, 234, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e0e0e0';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', color: '#333', marginBottom: '8px' }}>
                    {attempt.quizTitle}
                  </h3>
                  <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', fontSize: '14px', color: '#666' }}>
                    <span>📚 {attempt.subject}</span>
                    <span>📅 {formatDate(attempt.date)}</span>
                    <span>⏱️ {Math.floor(attempt.totalTimeTaken / 60)}m {attempt.totalTimeTaken % 60}s</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '32px', 
                      fontWeight: 'bold',
                      color: getGradeColor(attempt.accuracy)
                    }}>
                      {attempt.accuracy}%
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Accuracy</div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
                      {attempt.correctAnswers}/{attempt.totalQuestions}
                    </div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Correct</div>
                  </div>

                  {attempt.hintUsageCount > 0 && (
                    <div style={{ 
                      background: 'rgba(255, 193, 7, 0.1)',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ffc107' }}>
                        {attempt.hintUsageCount}
                      </div>
                      <div style={{ fontSize: '11px', color: '#ffc107' }}>💡 Hints</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Metrics */}
              <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginTop: '15px',
                paddingTop: '15px',
                borderTop: '1px solid #f0f0f0',
                flexWrap: 'wrap',
                fontSize: '13px'
              }}>
                {attempt.mistakeRepetitionCount > 0 && (
                  <span style={{ 
                    background: 'rgba(155, 89, 182, 0.1)',
                    color: '#9b59b6',
                    padding: '5px 10px',
                    borderRadius: '5px'
                  }}>
                    🔁 {attempt.mistakeRepetitionCount} repeated mistakes
                  </span>
                )}
                {attempt.consecutiveWrongAnswers > 0 && (
                  <span style={{ 
                    background: 'rgba(231, 76, 60, 0.1)',
                    color: '#e74c3c',
                    padding: '5px 10px',
                    borderRadius: '5px'
                  }}>
                    📉 {attempt.consecutiveWrongAnswers} max consecutive wrong
                  </span>
                )}
                {attempt.postRevisionAccuracy > 0 && (
                  <span style={{ 
                    background: 'rgba(52, 152, 219, 0.1)',
                    color: '#3498db',
                    padding: '5px 10px',
                    borderRadius: '5px'
                  }}>
                    📈 {attempt.postRevisionAccuracy}% post-revision accuracy
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default QuizHistory;
