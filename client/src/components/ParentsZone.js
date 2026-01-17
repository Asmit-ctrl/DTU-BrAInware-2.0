import React, { useState, useEffect } from 'react';
import { OnDemandChatBot } from 'ondemand-react-chat-bot';
import { useAuth } from '../context/AuthContext';
import './ParentsZone.css';

const ParentsZone = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentContext, setStudentContext] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);

  // Fetch parent's students on mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Fetch student context when student is selected
  useEffect(() => {
    if (selectedStudent) {
      fetchStudentContext(selectedStudent.studentId);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/parent/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentContext = async (studentId) => {
    setContextLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/parent/student-context/${studentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStudentContext(data);
      }
    } catch (error) {
      console.error('Error fetching student context:', error);
    } finally {
      setContextLoading(false);
    }
  };

  // Build comprehensive context variables for the chatbot
  const buildContextVariables = () => {
    const baseContext = [
      { key: 'parentId', value: user?.id || 'guest' },
      { key: 'parentName', value: user?.name || 'Parent' },
      { key: 'role', value: 'parent' },
      { key: 'purpose', value: 'student_progress_inquiry' }
    ];

    if (!studentContext) return baseContext;

    const { studentInfo, academicSummary, quizPerformance, examPerformance, assignmentPerformance, learningInsights, recentDoubts } = studentContext;

    return [
      ...baseContext,
      // Student Info
      { key: 'studentId', value: studentInfo?.id || '' },
      { key: 'studentName', value: studentInfo?.name || '' },
      { key: 'studentGrade', value: String(studentInfo?.grade || '') },
      { key: 'studentClass', value: String(studentInfo?.profile?.class || studentInfo?.grade || '') },
      
      // Academic Summary
      { key: 'totalQuizzesTaken', value: String(academicSummary?.totalQuizzesTaken || 0) },
      { key: 'totalExamsTaken', value: String(academicSummary?.totalExamsTaken || 0) },
      { key: 'totalAssignments', value: String(academicSummary?.totalAssignments || 0) },
      { key: 'averageScore', value: String(academicSummary?.averageScore || 0) },
      { key: 'recentDoubtsCount', value: String(academicSummary?.recentDoubts || 0) },
      
      // Performance Data (JSON strings for complex data)
      { key: 'recentQuizScores', value: JSON.stringify(quizPerformance || []) },
      { key: 'recentExamScores', value: JSON.stringify(examPerformance || []) },
      { key: 'recentAssignments', value: JSON.stringify(assignmentPerformance || []) },
      
      // Learning Insights
      { key: 'weakAreas', value: (learningInsights?.weakAreas || []).join(', ') || 'None identified' },
      { key: 'strengths', value: (learningInsights?.strengths || []).join(', ') || 'None identified' },
      { key: 'recentTopics', value: (learningInsights?.recentTopics || []).join(', ') || 'None' },
      
      // Recent Doubts
      { key: 'recentDoubts', value: JSON.stringify(recentDoubts || []) },
      
      // System Prompt Context
      { key: 'systemContext', value: `You are a helpful educational assistant for parents. You have access to the following student data:
Student: ${studentInfo?.name} (Grade ${studentInfo?.grade})
Average Score: ${academicSummary?.averageScore}%
Quizzes Taken: ${academicSummary?.totalQuizzesTaken}
Exams Taken: ${academicSummary?.totalExamsTaken}
Assignments: ${academicSummary?.totalAssignments}
Weak Areas: ${(learningInsights?.weakAreas || []).join(', ') || 'None'}
Strengths: ${(learningInsights?.strengths || []).join(', ') || 'None'}

Help the parent understand their child's academic progress, provide study tips, and answer questions about performance.` }
    ];
  };

  // API Key and Bot ID from OnDemand.io
  const apiKey = process.env.REACT_APP_ONDEMAND_API_KEY || 'hwsawbZchaiKlGInexGx4kqNQaAoLotP';
  const botId = process.env.REACT_APP_PARENT_BOT_ID || 'KZLGKdMwL0SA';

  if (loading) {
    return (
      <div className="parents-zone-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your students...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="parents-zone-container">
      {/* Header */}
      <div className="parents-zone-header">
        <div className="header-content">
          <h1>👨‍👩‍👧 Parents Zone</h1>
          <p>Connect with our AI assistant to track your child's progress</p>
        </div>
      </div>

      {/* Student Selector */}
      {students.length > 0 && (
        <div className="student-selector">
          <label>Select Student:</label>
          <select 
            value={selectedStudent?.studentId || ''} 
            onChange={(e) => {
              const student = students.find(s => s.studentId === e.target.value);
              setSelectedStudent(student);
            }}
          >
            {students.map(student => (
              <option key={student.studentId} value={student.studentId}>
                {student.name} (Grade {student.grade})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Student Context Summary */}
      {studentContext && !contextLoading && (
        <div className="student-context-summary">
          <h3>📊 {studentContext.studentInfo?.name}'s Summary</h3>
          <div className="context-cards">
            <div className="context-card">
              <span className="stat-value">{studentContext.academicSummary?.averageScore}%</span>
              <span className="stat-label">Average Score</span>
            </div>
            <div className="context-card">
              <span className="stat-value">{studentContext.academicSummary?.totalQuizzesTaken}</span>
              <span className="stat-label">Quizzes</span>
            </div>
            <div className="context-card">
              <span className="stat-value">{studentContext.academicSummary?.totalExamsTaken}</span>
              <span className="stat-label">Exams</span>
            </div>
            <div className="context-card">
              <span className="stat-value">{studentContext.academicSummary?.totalAssignments}</span>
              <span className="stat-label">Assignments</span>
            </div>
          </div>
          
          {studentContext.learningInsights?.weakAreas?.length > 0 && (
            <div className="insights-section">
              <span className="insight-label">⚠️ Needs Improvement:</span>
              <span className="insight-value">{studentContext.learningInsights.weakAreas.join(', ')}</span>
            </div>
          )}
          
          {studentContext.learningInsights?.strengths?.length > 0 && (
            <div className="insights-section success">
              <span className="insight-label">✅ Strengths:</span>
              <span className="insight-value">{studentContext.learningInsights.strengths.join(', ')}</span>
            </div>
          )}
        </div>
      )}

      {contextLoading && (
        <div className="context-loading">
          <div className="spinner small"></div>
          <p>Loading student data...</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="parents-info-panel">
        <div className="info-card">
          <span className="info-icon">📊</span>
          <div>
            <h4>Progress Tracking</h4>
            <p>View your child's academic performance</p>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">📝</span>
          <div>
            <h4>Quiz Reports</h4>
            <p>Get detailed quiz and exam reports</p>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">💬</span>
          <div>
            <h4>Ask Questions</h4>
            <p>Chat with AI about your child's learning</p>
          </div>
        </div>
        <div className="info-card">
          <span className="info-icon">🎯</span>
          <div>
            <h4>Recommendations</h4>
            <p>Get personalized study suggestions</p>
          </div>
        </div>
      </div>

      {/* OnDemand Chat Bot with Student Context */}
      <div className="chatbot-wrapper">
        {selectedStudent ? (
          <OnDemandChatBot
            key={selectedStudent.studentId} // Force re-render when student changes
            apiKey={apiKey}
            botId={botId}
            contextVariables={buildContextVariables()}
          />
        ) : (
          <div className="no-student-message">
            <p>👨‍🎓 No students found. Please add a student first.</p>
            <a href="/dashboard/students" className="add-student-btn">Add Student</a>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>📌 Quick Links</h3>
        <div className="action-buttons">
          <a href="/dashboard/students" className="action-btn">
            👨‍🎓 View Students
          </a>
          <a href="/dashboard/quiz-history" className="action-btn">
            📈 Quiz History
          </a>
          <a href="/dashboard/analytics" className="action-btn">
            🤖 AI Analytics
          </a>
        </div>
      </div>
    </div>
  );
};

export default ParentsZone;
