import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Assignment.css';

const Assignment = () => {
  const { user } = useAuth();
  const [view, setView] = useState('home'); // home, generating, taking, results
  const [topic, setTopic] = useState('Number System');
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [studentAnalytics, setStudentAnalytics] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Topics available
  const topics = [
    'Number System',
    'Polynomials',
    'Coordinate Geometry',
    'Linear Equations',
    'Triangles',
    'Quadrilaterals',
    'Circles',
    'Statistics',
    'Probability'
  ];

  // Fetch data on load
  useEffect(() => {
    if (user?.id) {
      fetchAssignmentHistory();
      fetchStudentAnalytics();
      fetchPendingAssignments();
    }
  }, [user]);

  const fetchAssignmentHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignment/attempts/${user.id}`);
      setAssignmentHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchStudentAnalytics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/student/${user.id}/analytics`);
      setStudentAnalytics(response.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchPendingAssignments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/assignments/${user.id}`);
      const pending = response.data.data?.filter(a => a.status === 'generated') || [];
      if (pending.length > 0 && !currentAssignment) {
        setCurrentAssignment(pending[0]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const generateAssignment = async () => {
    setLoading(true);
    setError('');
    setView('generating');

    try {
      const response = await axios.post('http://localhost:5000/api/assignment/generate', {
        studentId: user.id,
        topic: topic
      });

      if (response.data.data) {
        setCurrentAssignment(response.data.data);
        setView('home');
        setLoading(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate assignment');
      setView('home');
      setLoading(false);
    }
  };

  const startAssignment = async () => {
    if (!currentAssignment) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/assignment/${currentAssignment.assignmentId}/start`, {
        studentId: user.id
      });

      setCurrentAttempt(response.data.data);
      setAnswers({});
      setCurrentQuestion(0);
      setStartTime(Date.now());
      setView('taking');

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start assignment');
    }
  };

  const handleAnswerSelect = async (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));

    // Auto-save answer
    try {
      await axios.post(`http://localhost:5000/api/assignment/${currentAssignment.assignmentId}/answer`, {
        studentId: user.id,
        questionId,
        answer
      });
    } catch (error) {
      console.error('Error saving answer:', error);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!currentAssignment || !currentAttempt) return;

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    try {
      const response = await axios.post(`http://localhost:5000/api/assignment/${currentAssignment.assignmentId}/submit`, {
        studentId: user.id,
        answers,
        timeTaken
      });

      setResults(response.data.data);
      setView('results');
      fetchAssignmentHistory();
      fetchStudentAnalytics();

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit assignment');
    }
  };

  const resetToHome = () => {
    setView('home');
    setCurrentAssignment(null);
    setCurrentAttempt(null);
    setAnswers({});
    setResults(null);
    setCurrentQuestion(0);
    fetchPendingAssignments();
  };

  // Format time
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render home view
  const renderHome = () => (
    <div className="assignment-home">
      <div className="assignment-header">
        <h1>📚 Daily Assignment</h1>
        <p>Personalized practice based on your performance</p>
      </div>

      {/* Analytics Summary */}
      {studentAnalytics && (
        <div className="analytics-summary">
          <h3>📊 Your Performance Summary</h3>
          <div className="analytics-cards">
            <div className={`analytics-card ${studentAnalytics.quizAnalytics?.riskLevel?.toLowerCase()}`}>
              <span className="card-label">Risk Level</span>
              <span className="card-value">{studentAnalytics.quizAnalytics?.riskLevel || 'N/A'}</span>
            </div>
            <div className="analytics-card">
              <span className="card-label">Avg Score</span>
              <span className="card-value">{studentAnalytics.quizAnalytics?.averageScore || 0}%</span>
            </div>
            <div className="analytics-card">
              <span className="card-label">Performance</span>
              <span className="card-value">{studentAnalytics.quizAnalytics?.performanceStatus || 'N/A'}</span>
            </div>
            <div className="analytics-card">
              <span className="card-label">Quizzes Done</span>
              <span className="card-value">{studentAnalytics.totalQuizzes || 0}</span>
            </div>
          </div>
          {studentAnalytics.quizAnalytics?.weakConcepts?.length > 0 && (
            <div className="weak-concepts">
              <span className="weak-label">Areas to improve:</span>
              <span className="weak-list">{studentAnalytics.quizAnalytics.weakConcepts.join(', ')}</span>
            </div>
          )}
          {!studentAnalytics.hasAiAnalytics && (
            <div className="no-analytics-warning">
              <span>⚠️ No AI Analytics found. Go to <strong>AI Analytics</strong> page and generate analytics first for personalized assignments!</span>
            </div>
          )}
        </div>
      )}

      {/* Current Assignment */}
      {currentAssignment ? (
        <div className="current-assignment">
          <h3>📝 Your Assignment is Ready!</h3>
          <div className="assignment-card">
            <h4>{currentAssignment.assignmentTitle}</h4>
            <div className="assignment-meta">
              <span>📊 {currentAssignment.totalQuestions} Questions</span>
              <span>💯 {currentAssignment.totalMarks} Marks</span>
              <span>⏱️ {currentAssignment.estimatedTime}</span>
            </div>
            <div className="difficulty-pills">
              <span className="pill easy">Easy: {currentAssignment.difficultyBreakdown?.easy || 0}</span>
              <span className="pill medium">Medium: {currentAssignment.difficultyBreakdown?.medium || 0}</span>
              <span className="pill hard">Hard: {currentAssignment.difficultyBreakdown?.hard || 0}</span>
            </div>
            {currentAssignment.analyticsBasedFeedback && (
              <p className="feedback-text">{currentAssignment.analyticsBasedFeedback}</p>
            )}
            <button className="start-btn" onClick={startAssignment}>
              Start Assignment
            </button>
          </div>
        </div>
      ) : (
        <div className="generate-section">
          <h3>🎯 Generate New Assignment</h3>
          <div className="topic-select">
            <label>Select Topic:</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="assignment-info">
            <div className="info-item">
              <span className="info-icon">📊</span>
              <span>10 Questions</span>
            </div>
            <div className="info-item">
              <span className="info-icon">⏱️</span>
              <span>~20 Minutes</span>
            </div>
            <div className="info-item">
              <span className="info-icon">💯</span>
              <span>30 Marks</span>
            </div>
          </div>

          <p className="info-text">
            Questions will be adapted based on your quiz performance and weak areas.
          </p>

          <button 
            className="generate-btn"
            onClick={generateAssignment}
            disabled={loading}
          >
            {loading ? 'Generating...' : '🚀 Generate My Assignment'}
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {/* Assignment History */}
      {assignmentHistory.length > 0 && (
        <div className="assignment-history">
          <h3>📜 Recent Assignments</h3>
          <div className="history-list">
            {assignmentHistory.slice(0, 5).map(attempt => (
              <div key={attempt.attemptId} className="history-item">
                <div className="history-info">
                  <span className="history-date">
                    {new Date(attempt.completedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-score">
                  <span className={`score ${attempt.percentage >= 60 ? 'pass' : 'fail'}`}>
                    {attempt.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Render generating view
  const renderGenerating = () => (
    <div className="assignment-generating">
      <div className="generating-animation">
        <div className="spinner-large"></div>
        <h2>🤖 Creating Your Personalized Assignment...</h2>
        <p>Analyzing your performance and selecting questions on <strong>{topic}</strong></p>
        <div className="generating-steps">
          <div className="step active">📊 Analyzing your quiz history</div>
          <div className="step">🎯 Identifying weak areas</div>
          <div className="step">📝 Selecting adaptive questions</div>
          <div className="step">✅ Finalizing assignment</div>
        </div>
      </div>
    </div>
  );

  // Render taking view
  const renderTaking = () => {
    if (!currentAssignment || !currentAssignment.questions) return null;
    
    const question = currentAssignment.questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="assignment-taking">
        <div className="assignment-header-bar">
          <h2>{currentAssignment.assignmentTitle}</h2>
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {currentAssignment.totalQuestions}</span>
            <span className="answered">{answeredCount} Answered</span>
          </div>
        </div>

        <div className="assignment-content">
          <div className="question-section">
            <div className="question-header">
              <span className={`difficulty-badge ${question.difficulty}`}>
                {question.difficulty.toUpperCase()}
              </span>
              <span className="marks-badge">{question.marks} marks</span>
            </div>

            <div className="question-text">
              <strong>Q{currentQuestion + 1}.</strong> {question.question}
            </div>

            <div className="options-list">
              {question.options.map((option, idx) => (
                <button
                  key={idx}
                  className={`option-btn ${answers[question.id] === option.charAt(0) ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(question.id, option.charAt(0))}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="navigation-buttons">
              <button
                className="nav-btn prev"
                onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                disabled={currentQuestion === 0}
              >
                ← Previous
              </button>
              
              {currentQuestion < currentAssignment.totalQuestions - 1 ? (
                <button
                  className="nav-btn next"
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="nav-btn submit"
                  onClick={handleSubmitAssignment}
                  disabled={answeredCount < currentAssignment.totalQuestions}
                >
                  Submit Assignment
                </button>
              )}
            </div>
          </div>

          <div className="question-palette">
            <h4>Questions</h4>
            <div className="palette-grid">
              {currentAssignment.questions.map((q, idx) => (
                <button
                  key={q.id}
                  className={`palette-btn 
                    ${currentQuestion === idx ? 'current' : ''} 
                    ${answers[q.id] ? 'answered' : ''}`}
                  onClick={() => setCurrentQuestion(idx)}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <div className="palette-legend">
              <span><span className="dot answered"></span> Answered</span>
              <span><span className="dot current"></span> Current</span>
              <span><span className="dot"></span> Not Answered</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render results view
  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="assignment-results">
        <div className="results-header">
          <h1>📊 Assignment Complete!</h1>
          <div className={`score-circle ${results.percentage >= 60 ? 'pass' : 'fail'}`}>
            <span className="score-value">{results.percentage}%</span>
            <span className="score-label">{results.score}/{results.totalMarks}</span>
          </div>
        </div>

        <div className="results-stats">
          <div className="stat-item">
            <span className="stat-label">Performance</span>
            <span className="stat-value">{results.feedback?.performanceLevel}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Time Taken</span>
            <span className="stat-value">{formatTime(results.timeTaken)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Correct</span>
            <span className="stat-value">
              {results.questionResults.filter(r => r.isCorrect).length}/{results.questionResults.length}
            </span>
          </div>
        </div>

        {results.feedback?.conceptsToReview?.length > 0 && (
          <div className="concepts-to-review">
            <h3>📚 Concepts to Review</h3>
            <div className="concept-pills">
              {results.feedback.conceptsToReview.map((concept, idx) => (
                <span key={idx} className="concept-pill">{concept}</span>
              ))}
            </div>
          </div>
        )}

        <div className="question-review">
          <h3>📝 Question Review</h3>
          {results.questionResults.map((result, idx) => (
            <div key={idx} className={`review-item ${result.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="review-header">
                <span>Q{result.questionId}</span>
                <span className="review-status">
                  {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                </span>
                <span className="review-marks">
                  {result.marksAwarded}/{currentAssignment.questions[idx]?.marks || 0} marks
                </span>
              </div>
              {!result.isCorrect && (
                <div className="review-answer">
                  Your answer: {result.selectedAnswer || 'Not answered'} | 
                  Correct: {result.correctAnswer}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button className="action-btn primary" onClick={resetToHome}>
            🏠 Back to Home
          </button>
          <button className="action-btn secondary" onClick={() => {
            resetToHome();
            setTimeout(generateAssignment, 100);
          }}>
            📝 New Assignment
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="assignment-container">
      {view === 'home' && renderHome()}
      {view === 'generating' && renderGenerating()}
      {view === 'taking' && renderTaking()}
      {view === 'results' && renderResults()}
    </div>
  );
};

export default Assignment;
