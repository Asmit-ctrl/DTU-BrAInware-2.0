import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function QuizTaker() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [showHint, setShowHint] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setShowHint(false);
    setSelectedAnswer(null);
  }, [currentQuestionIndex]);

  const fetchQuiz = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/quizzes/${quizId}`);
      setQuiz(response.data);
      setStartTime(Date.now());
      
      // Initialize answers array
      const initialAnswers = response.data.questions.map(q => ({
        questionId: q.questionId,
        selectedAnswer: null,
        timeTaken: 0,
        hintUsed: false,
        attemptCount: 0
      }));
      setAnswers(initialAnswers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching quiz:', error);
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      alert('Please select an answer before proceeding.');
      return;
    }

    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      ...newAnswers[currentQuestionIndex],
      selectedAnswer: selectedAnswer,
      timeTaken: timeTaken,
      hintUsed: showHint,
      attemptCount: newAnswers[currentQuestionIndex].attemptCount + 1
    };
    setAnswers(newAnswers);

    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      const prevAnswer = answers[currentQuestionIndex - 1];
      if (prevAnswer.selectedAnswer !== null) {
        setSelectedAnswer(prevAnswer.selectedAnswer);
      }
    }
  };

  const submitQuiz = async (finalAnswers) => {
    setSubmitting(true);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/quizzes/${quizId}/submit`,
        {
          answers: finalAnswers,
          startedAt: startTime,
          completedAt: Date.now()
        }
      );
      
      navigate('/dashboard/quiz-result', { 
        state: { result: response.data.result } 
      });
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit quiz. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading Quiz...</h2>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Quiz not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/quizzes')}>
          Back to Quizzes
        </button>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div>
      <div className="content-header">
        <h1>{quiz.title}</h1>
        <button 
          className="btn btn-secondary" 
          style={{ width: 'auto', padding: '10px 20px' }}
          onClick={() => {
            if (window.confirm('Are you sure you want to exit? Your progress will be lost.')) {
              navigate('/dashboard/quizzes');
            }
          }}
        >
          Exit Quiz
        </button>
      </div>

      <div className="profile-container">
        {/* Progress Bar */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: '600' }}>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            <span style={{ color: '#667eea', fontWeight: '600' }}>{Math.round(progress)}% Complete</span>
          </div>
          <div style={{ 
            width: '100%', 
            height: '8px', 
            background: '#e0e0e0', 
            borderRadius: '10px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: `${progress}%`, 
              height: '100%', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
        </div>

        {/* Question */}
        <div style={{ marginBottom: '30px' }}>
          <div style={{ 
            background: '#f8f9fa', 
            padding: '25px', 
            borderRadius: '15px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
              <span style={{ 
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                width: '35px',
                height: '35px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {currentQuestionIndex + 1}
              </span>
              <span style={{ 
                background: `${
                  currentQuestion.difficulty === 'easy' ? 'rgba(46, 213, 115, 0.1)' :
                  currentQuestion.difficulty === 'medium' ? 'rgba(255, 165, 2, 0.1)' :
                  'rgba(231, 76, 60, 0.1)'
                }`,
                color: `${
                  currentQuestion.difficulty === 'easy' ? '#2ed573' :
                  currentQuestion.difficulty === 'medium' ? '#ffa502' :
                  '#e74c3c'
                }`,
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600'
              }}>
                {currentQuestion.difficulty?.toUpperCase()}
              </span>
            </div>
            <h3 style={{ fontSize: '20px', color: '#333', lineHeight: '1.6' }}>
              {currentQuestion.questionText}
            </h3>
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                style={{
                  padding: '18px 20px',
                  border: `2px solid ${selectedAnswer === index ? '#667eea' : '#e0e0e0'}`,
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: selectedAnswer === index ? 'rgba(102, 126, 234, 0.1)' : 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px'
                }}
                onMouseEnter={(e) => {
                  if (selectedAnswer !== index) {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedAnswer !== index) {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = 'white';
                  }
                }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: `2px solid ${selectedAnswer === index ? '#667eea' : '#ccc'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: selectedAnswer === index ? '#667eea' : 'white',
                  color: selectedAnswer === index ? 'white' : '#ccc',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span style={{ flex: 1, fontSize: '16px', color: '#333' }}>{option}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hint Section */}
        {currentQuestion.hint && (
          <div style={{ marginBottom: '30px' }}>
            {!showHint ? (
              <button
                className="btn btn-secondary"
                style={{ width: 'auto', padding: '10px 20px' }}
                onClick={() => setShowHint(true)}
              >
                💡 Show Hint
              </button>
            ) : (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffc107',
                padding: '15px 20px',
                borderRadius: '10px',
                color: '#856404'
              }}>
                <strong>💡 Hint:</strong> {currentQuestion.hint}
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'space-between' }}>
          <button
            className="btn btn-secondary"
            style={{ width: 'auto', padding: '12px 30px' }}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </button>
          <button
            className="btn btn-primary"
            style={{ width: 'auto', padding: '12px 30px' }}
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 
             currentQuestionIndex === quiz.questions.length - 1 ? 'Submit Quiz' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizTaker;
