import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Exam.css';

const Exam = () => {
  const { user } = useAuth();
  const [view, setView] = useState('home'); // home, generating, taking, results, history
  const [topic, setTopic] = useState('Number System');
  const [currentExam, setCurrentExam] = useState(null);
  const [currentAttempt, setCurrentAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [markedForReview, setMarkedForReview] = useState(new Set());

  // Topics available for exam
  const topics = [
    'Number System',
    'Polynomials',
    'Coordinate Geometry',
    'Linear Equations',
    'Triangles',
    'Quadrilaterals',
    'Areas of Parallelograms and Triangles',
    'Circles',
    'Surface Areas and Volumes',
    'Statistics',
    'Probability'
  ];

  // Fetch exam history on load
  useEffect(() => {
    if (user?.id) {
      fetchExamHistory();
      fetchGeneratedExams();
    }
  }, [user]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (view === 'taking' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const fetchExamHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exam/attempts/${user.id}`);
      setExamHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const fetchGeneratedExams = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${user.id}`);
      console.log('📚 Fetched exams:', response.data);
      const generatedExams = response.data.data?.filter(exam => exam.status === 'generated') || [];
      console.log('✅ Generated exams (not yet taken):', generatedExams.length);
      if (generatedExams.length > 0 && !currentExam) {
        // Set the most recent generated exam as current
        console.log('📝 Setting current exam:', generatedExams[0].examTitle);
        setCurrentExam(generatedExams[0]);
      }
    } catch (error) {
      console.error('Error fetching generated exams:', error);
    }
  };

  const generateExam = async () => {
    setLoading(true);
    setError('');
    setView('generating');

    try {
      const response = await axios.post('http://localhost:5000/api/exam/generate', {
        studentId: user.id,
        topic: topic
      });

      if (response.data.data) {
        setCurrentExam(response.data.data);
        setView('home');
        setLoading(false);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate exam');
      setView('home');
      setLoading(false);
    }
  };

  const startExam = async () => {
    if (!currentExam) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/exam/${currentExam.examId}/start`, {
        studentId: user.id
      });

      if (response.data.data) {
        setCurrentAttempt(response.data.data);
        setTimeLeft(currentExam.durationMinutes * 60); // Convert to seconds
        setAnswers({});
        setCurrentQuestion(0);
        setMarkedForReview(new Set());
        setView('taking');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to start exam');
    }
  };

  const selectAnswer = async (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));

    // Auto-save answer
    if (currentAttempt) {
      try {
        await axios.post(`http://localhost:5000/api/exam/${currentExam.examId}/answer`, {
          attemptId: currentAttempt.attemptId,
          questionId,
          selectedAnswer: answer
        });
      } catch (error) {
        console.error('Failed to save answer:', error);
      }
    }
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const handleSubmitExam = async () => {
    if (!currentAttempt || !currentExam) return;

    try {
      const response = await axios.post(`http://localhost:5000/api/exam/${currentExam.examId}/submit`, {
        attemptId: currentAttempt.attemptId,
        answers: answers
      });

      if (response.data.data) {
        setResults(response.data.data);
        setView('results');
        fetchExamHistory();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit exam');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#27ae60';
      case 'medium': return '#f39c12';
      case 'hard': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  const getPerformanceColor = (level) => {
    switch (level) {
      case 'STRONG': return '#27ae60';
      case 'MEDIUM': return '#f39c12';
      case 'WEAK': return '#e74c3c';
      default: return '#95a5a6';
    }
  };

  // Render home view
  const renderHome = () => (
    <div className="exam-home">
      <div className="exam-header">
        <h2>📝 Adaptive Examination</h2>
        <p>Test your knowledge with AI-generated exams tailored to your level</p>
      </div>

      <div className="exam-setup">
        <div className="setup-card">
          <h3>🎯 Generate New Exam</h3>
          
          <div className="form-group">
            <label>Select Topic:</label>
            <select value={topic} onChange={(e) => setTopic(e.target.value)}>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

        <div className="exam-info">
          <div className="info-item">
            <span className="info-icon">📊</span>
            <span>15 Questions</span>
          </div>
          <div className="info-item">
            <span className="info-icon">⏱️</span>
            <span>35 Minutes</span>
          </div>
          <div className="info-item">
            <span className="info-icon">💯</span>
            <span>60 Marks</span>
          </div>
        </div>

        <div className="difficulty-breakdown">
          <h4>Difficulty Distribution:</h4>
          <div className="difficulty-bars">
            <div className="diff-bar easy">
              <span className="diff-label">Easy (5)</span>
              <span className="diff-marks">10 marks</span>
            </div>
            <div className="diff-bar medium">
              <span className="diff-label">Medium (6)</span>
              <span className="diff-marks">24 marks</span>
            </div>
            <div className="diff-bar hard">
              <span className="diff-label">Hard (4)</span>
              <span className="diff-marks">24 marks</span>
            </div>
          </div>
        </div>          <button 
            className="generate-btn"
            onClick={generateExam}
            disabled={loading}
          >
            {loading ? '🔄 Generating...' : '✨ Generate Exam'}
          </button>
        </div>

        {currentExam && (
          <div className="ready-card">
            <h3>✅ Exam Ready!</h3>
            <p className="exam-title">{currentExam.examTitle}</p>
            <p className="exam-topic">Topic: {currentExam.topic}</p>
            <p className="exam-questions">{currentExam.totalQuestions} Questions • {currentExam.totalMarks} Marks</p>
            <button className="start-btn" onClick={startExam}>
              🚀 Start Exam
            </button>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Exam History */}
      {examHistory.length > 0 && (
        <div className="exam-history">
          <h3>📜 Your Exam History</h3>
          <div className="history-list">
            {examHistory.slice(0, 5).map(attempt => (
              <div key={attempt.attemptId} className="history-item">
                <div className="history-info">
                  <span className="history-topic">{attempt.topic}</span>
                  <span className="history-date">
                    {new Date(attempt.submittedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="history-score">
                  <span 
                    className="score-badge"
                    style={{ backgroundColor: getPerformanceColor(attempt.performanceLevel) }}
                  >
                    {attempt.percentage}% - {attempt.performanceLevel}
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
    <div className="exam-generating">
      <div className="generating-animation">
        <div className="spinner-large"></div>
        <h2>🤖 AI is Creating Your Exam...</h2>
        <p>Generating 15 balanced questions on <strong>{topic}</strong></p>
        <div className="generating-steps">
          <div className="step active">📚 Analyzing NCERT curriculum</div>
          <div className="step">🎯 Selecting easy questions</div>
          <div className="step">📊 Adding medium questions</div>
          <div className="step">🔥 Including challenging problems</div>
          <div className="step">✅ Finalizing exam paper</div>
        </div>
      </div>
    </div>
  );

  // Render exam taking view
  const renderTaking = () => {
    if (!currentExam || !currentExam.questions) return null;
    
    const question = currentExam.questions[currentQuestion];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="exam-taking">
        {/* Header */}
        <div className="exam-taking-header">
          <div className="exam-title-small">{currentExam.examTitle}</div>
          <div className={`timer ${timeLeft < 300 ? 'warning' : ''}`}>
            ⏱️ {formatTime(timeLeft)}
          </div>
          <div className="progress-info">
            {answeredCount}/{currentExam.totalQuestions} Answered
          </div>
        </div>

        {/* Main Content */}
        <div className="exam-content">
          {/* Question Panel */}
          <div className="question-panel">
            <div className="question-header">
              <span className="question-number">Question {currentQuestion + 1}</span>
              <span 
                className="question-difficulty"
                style={{ backgroundColor: getDifficultyColor(question.difficulty) }}
              >
                {question.difficulty} • {question.marks} marks
              </span>
            </div>

            <div className="question-text">
              {question.question}
            </div>

            <div className="options-list">
              {question.options.map((option, idx) => (
                <div
                  key={idx}
                  className={`option ${answers[question.id] === option.charAt(0) ? 'selected' : ''}`}
                  onClick={() => selectAnswer(question.id, option.charAt(0))}
                >
                  <span className="option-letter">{option.charAt(0)}</span>
                  <span className="option-text">{option.substring(3)}</span>
                </div>
              ))}
            </div>

            <div className="question-actions">
              <button
                className={`review-btn ${markedForReview.has(question.id) ? 'marked' : ''}`}
                onClick={() => toggleMarkForReview(question.id)}
              >
                {markedForReview.has(question.id) ? '🔖 Marked' : '📌 Mark for Review'}
              </button>
              
              <button
                className="clear-btn"
                onClick={() => setAnswers(prev => {
                  const newAnswers = {...prev};
                  delete newAnswers[question.id];
                  return newAnswers;
                })}
              >
                🗑️ Clear
              </button>
            </div>

            {/* Navigation */}
            <div className="question-navigation">
              <button
                className="nav-btn"
                disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(prev => prev - 1)}
              >
                ← Previous
              </button>
              
              {currentQuestion < currentExam.questions.length - 1 ? (
                <button
                  className="nav-btn next"
                  onClick={() => setCurrentQuestion(prev => prev + 1)}
                >
                  Next →
                </button>
              ) : (
                <button
                  className="submit-btn"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to submit the exam?')) {
                      handleSubmitExam();
                    }
                  }}
                >
                  Submit Exam ✓
                </button>
              )}
            </div>
          </div>

          {/* Question Palette */}
          <div className="question-palette">
            <h4>Question Palette</h4>
            <div className="palette-grid">
              {currentExam.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`palette-item 
                    ${currentQuestion === idx ? 'current' : ''} 
                    ${answers[q.id] ? 'answered' : ''} 
                    ${markedForReview.has(q.id) ? 'review' : ''}
                  `}
                  onClick={() => setCurrentQuestion(idx)}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
            
            <div className="palette-legend">
              <div className="legend-item">
                <span className="dot current"></span> Current
              </div>
              <div className="legend-item">
                <span className="dot answered"></span> Answered
              </div>
              <div className="legend-item">
                <span className="dot review"></span> Marked
              </div>
              <div className="legend-item">
                <span className="dot"></span> Not Visited
              </div>
            </div>

            <button
              className="submit-btn-palette"
              onClick={() => {
                if (window.confirm(`You have answered ${answeredCount} out of ${currentExam.totalQuestions} questions. Submit?`)) {
                  handleSubmitExam();
                }
              }}
            >
              📤 Submit Exam
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render results view
  const renderResults = () => {
    if (!results) return null;

    return (
      <div className="exam-results">
        <div className="results-header">
          <h2>📊 Exam Results</h2>
          <div 
            className="performance-badge"
            style={{ backgroundColor: getPerformanceColor(results.performanceLevel) }}
          >
            {results.performanceLevel}
          </div>
        </div>

        <div className="score-card">
          <div className="main-score">
            <div className="score-circle">
              <span className="score-value">{results.percentage}%</span>
              <span className="score-label">Score</span>
            </div>
            <div className="score-details">
              <p>{results.totalScore} / {results.maxScore} marks</p>
              <p>Time: {Math.floor(results.timeTaken / 60)}m {results.timeTaken % 60}s</p>
            </div>
          </div>

          <div className="score-summary">
            <div className="summary-item correct">
              <span className="count">{results.summary.correct}</span>
              <span className="label">Correct</span>
            </div>
            <div className="summary-item incorrect">
              <span className="count">{results.summary.incorrect}</span>
              <span className="label">Incorrect</span>
            </div>
            <div className="summary-item unanswered">
              <span className="count">{results.summary.unanswered}</span>
              <span className="label">Unanswered</span>
            </div>
          </div>
        </div>

        <div className="difficulty-results">
          <h3>📈 Performance by Difficulty</h3>
          <div className="diff-cards">
            <div className="diff-card easy">
              <h4>Easy</h4>
              <p className="diff-score">
                {results.difficultyBreakdown.easy.scored}/{results.difficultyBreakdown.easy.total}
              </p>
              <p className="diff-count">{results.difficultyBreakdown.easy.count} questions</p>
            </div>
            <div className="diff-card medium">
              <h4>Medium</h4>
              <p className="diff-score">
                {results.difficultyBreakdown.medium.scored}/{results.difficultyBreakdown.medium.total}
              </p>
              <p className="diff-count">{results.difficultyBreakdown.medium.count} questions</p>
            </div>
            <div className="diff-card hard">
              <h4>Hard</h4>
              <p className="diff-score">
                {results.difficultyBreakdown.hard.scored}/{results.difficultyBreakdown.hard.total}
              </p>
              <p className="diff-count">{results.difficultyBreakdown.hard.count} questions</p>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        <div className="detailed-results">
          <h3>📝 Question-wise Analysis</h3>
          {results.results.map((r, idx) => (
            <div key={idx} className={`result-item ${r.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="result-header">
                <span className="result-num">Q{idx + 1}</span>
                <span 
                  className="result-diff"
                  style={{ backgroundColor: getDifficultyColor(r.difficulty) }}
                >
                  {r.difficulty}
                </span>
                <span className="result-marks">
                  {r.scored}/{r.marks} marks
                </span>
                <span className={`result-status ${r.isCorrect ? 'correct' : 'incorrect'}`}>
                  {r.isCorrect ? '✓' : '✗'}
                </span>
              </div>
              <p className="result-question">{r.question}</p>
              <div className="result-answers">
                <span className="your-answer">
                  Your Answer: <strong>{r.studentAnswer}</strong>
                </span>
                {!r.isCorrect && (
                  <span className="correct-answer">
                    Correct: <strong>{r.correctAnswer}</strong>
                  </span>
                )}
              </div>
              {r.explanation && (
                <p className="result-explanation">💡 {r.explanation}</p>
              )}
            </div>
          ))}
        </div>

        <div className="results-actions">
          <button className="action-btn" onClick={() => {
            setView('home');
            setCurrentExam(null);
            setResults(null);
          }}>
            🏠 Back to Home
          </button>
          <button className="action-btn primary" onClick={generateExam}>
            📝 Take Another Exam
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="exam-container">
      {view === 'home' && renderHome()}
      {view === 'generating' && renderGenerating()}
      {view === 'taking' && renderTaking()}
      {view === 'results' && renderResults()}
    </div>
  );
};

export default Exam;
