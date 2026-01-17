import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;

  if (!result) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>No result data available</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/quizzes')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const getGrade = (accuracy) => {
    if (accuracy >= 90) return { grade: 'A+', color: '#2ed573', emoji: '🏆' };
    if (accuracy >= 80) return { grade: 'A', color: '#26de81', emoji: '🌟' };
    if (accuracy >= 70) return { grade: 'B', color: '#ffa502', emoji: '👍' };
    if (accuracy >= 60) return { grade: 'C', color: '#ff7979', emoji: '📚' };
    return { grade: 'D', color: '#e74c3c', emoji: '💪' };
  };

  const gradeInfo = getGrade(result.accuracy);

  return (
    <div>
      <div className="content-header">
        <h1>Quiz Results</h1>
      </div>

      {/* Score Card */}
      <div className="welcome-card" style={{ textAlign: 'center', marginBottom: '30px' }}>
        <div style={{ fontSize: '80px', marginBottom: '10px' }}>{gradeInfo.emoji}</div>
        <h2 style={{ fontSize: '48px', marginBottom: '10px' }}>
          {result.accuracy}%
        </h2>
        <div style={{ 
          fontSize: '32px', 
          fontWeight: 'bold',
          color: gradeInfo.color,
          marginBottom: '15px'
        }}>
          Grade: {gradeInfo.grade}
        </div>
        <p style={{ fontSize: '18px', opacity: 0.9 }}>
          You got {result.correctAnswers} out of {result.totalQuestions} questions correct!
        </p>
      </div>

      {/* Detailed Stats */}
      <div className="stats-grid" style={{ marginBottom: '30px' }}>
        <div className="stat-card">
          <div className="icon green">✅</div>
          <h3>Correct Answers</h3>
          <div className="value">{result.correctAnswers}</div>
        </div>

        <div className="stat-card">
          <div className="icon" style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c' }}>❌</div>
          <h3>Wrong Answers</h3>
          <div className="value">{result.wrongAnswers}</div>
        </div>

        <div className="stat-card">
          <div className="icon blue">💡</div>
          <h3>Hints Used</h3>
          <div className="value">{result.hintUsageCount}</div>
        </div>

        <div className="stat-card">
          <div className="icon orange">⏱️</div>
          <h3>Time Taken</h3>
          <div className="value">{Math.floor(result.totalTimeTaken / 60)}m {result.totalTimeTaken % 60}s</div>
        </div>

        <div className="stat-card">
          <div className="icon" style={{ background: 'rgba(155, 89, 182, 0.1)', color: '#9b59b6' }}>🔁</div>
          <h3>Repeated Mistakes</h3>
          <div className="value">{result.mistakeRepetitionCount}</div>
        </div>

        <div className="stat-card">
          <div className="icon" style={{ background: 'rgba(255, 82, 82, 0.1)', color: '#ff5252' }}>📉</div>
          <h3>Max Consecutive Wrong</h3>
          <div className="value">{result.consecutiveWrongAnswers}</div>
        </div>

        {result.postRevisionAccuracy > 0 && (
          <div className="stat-card">
            <div className="icon" style={{ background: 'rgba(52, 152, 219, 0.1)', color: '#3498db' }}>📈</div>
            <h3>Post-Revision Accuracy</h3>
            <div className="value">{result.postRevisionAccuracy}%</div>
          </div>
        )}

        <div className="stat-card">
          <div className="icon blue">⌛</div>
          <h3>Avg Time/Question</h3>
          <div className="value">{Math.round(result.totalTimeTaken / result.totalQuestions)}s</div>
        </div>
      </div>

      {/* Question Review */}
      <div className="profile-container">
        <h2 style={{ marginBottom: '25px', fontSize: '24px' }}>Question Review</h2>
        
        {result.questionResults.map((q, index) => (
          <div 
            key={q.questionId}
            style={{
              padding: '20px',
              background: q.isCorrect ? 'rgba(46, 213, 115, 0.05)' : 'rgba(231, 76, 60, 0.05)',
              border: `2px solid ${q.isCorrect ? '#2ed573' : '#e74c3c'}`,
              borderRadius: '12px',
              marginBottom: '15px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: q.isCorrect ? '#2ed573' : '#e74c3c',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </div>
              <span style={{ fontSize: '20px' }}>{q.isCorrect ? '✅' : '❌'}</span>
              {q.hintUsed && <span style={{ fontSize: '18px' }}>💡</span>}
              {q.attemptCount > 1 && (
                <span style={{ 
                  background: 'rgba(155, 89, 182, 0.1)',
                  color: '#9b59b6',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  {q.attemptCount} attempts
                </span>
              )}
            </div>

            <h4 style={{ fontSize: '16px', marginBottom: '12px', color: '#333' }}>
              {q.questionText}
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ 
                padding: '10px 15px',
                background: q.isCorrect ? 'rgba(46, 213, 115, 0.1)' : 'rgba(231, 76, 60, 0.1)',
                borderRadius: '8px',
                fontWeight: '500'
              }}>
                <strong>{q.isCorrect ? '✅' : '❌'} Your Answer:</strong> {String.fromCharCode(65 + q.selectedAnswer)}
              </div>
              
              {!q.isCorrect && (
                <div style={{ 
                  padding: '10px 15px',
                  background: 'rgba(46, 213, 115, 0.1)',
                  borderRadius: '8px',
                  fontWeight: '500',
                  color: '#2ed573'
                }}>
                  <strong>✅ Correct Answer:</strong> {String.fromCharCode(65 + q.correctAnswer)}
                </div>
              )}

              <div style={{ fontSize: '13px', color: '#666', marginTop: '5px' }}>
                ⏱️ Time: {q.timeTaken}s
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
        <button 
          className="btn btn-secondary"
          style={{ width: 'auto', padding: '12px 30px' }}
          onClick={() => navigate('/dashboard/quiz-history')}
        >
          View History
        </button>
        <button 
          className="btn btn-primary"
          style={{ width: 'auto', padding: '12px 30px' }}
          onClick={() => navigate('/dashboard/quizzes')}
        >
          Take Another Quiz
        </button>
      </div>
    </div>
  );
}

export default QuizResult;
