import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Schedule.css';

const Schedule = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [chapters, setChapters] = useState([]);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeDay, setActiveDay] = useState(0);

  const subjects = [
    { id: 'mathematics', name: 'Mathematics' },
    { id: 'science', name: 'Science' },
    { id: 'english', name: 'English' },
    { id: 'social-science', name: 'Social Science' }
  ];

  // Fetch students on mount
  // Fetch students when component mounts or user changes
  useEffect(() => {
    fetchStudents();
  }, [user]);

  // Fetch chapters when subject changes
  useEffect(() => {
    if (selectedSubject) {
      fetchChapters(selectedSubject);
    } else {
      setChapters([]);
      setSelectedChapter('');
    }
  }, [selectedSubject]);

  const fetchStudents = async () => {
    try {
      // First try from AuthContext user
      let userData = user;
      
      // Fallback to localStorage
      if (!userData || !userData.role) {
        userData = JSON.parse(localStorage.getItem('user') || '{}');
      }
      
      console.log('User data for Schedule:', userData);
      
      if (userData.role === 'student') {
        // For student login - use their own ID
        const studentId = userData.studentId || userData.id || userData._id;
        const studentName = userData.name || userData.studentName || 'Student';
        if (studentId) {
          setStudents([{ id: studentId, name: studentName }]);
          setSelectedStudent(studentId);
        } else {
          // Fallback: create a temporary student entry with name
          const tempId = 'student_' + Date.now();
          setStudents([{ id: tempId, name: studentName }]);
          setSelectedStudent(tempId);
        }
      } else if (userData.role === 'parent' && userData.students && userData.students.length > 0) {
        // For parent login - show their children
        setStudents(userData.students);
        if (userData.students.length === 1) {
          setSelectedStudent(userData.students[0].id);
        }
      } else if (userData.name) {
        // Fallback for any logged in user with a name
        const userId = userData.id || userData._id || userData.studentId || 'user_' + Date.now();
        setStudents([{ id: userId, name: userData.name }]);
        setSelectedStudent(userId);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchChapters = async (subject) => {
    try {
      const response = await fetch(`http://localhost:5000/api/schedule/chapters/${subject}`);
      const data = await response.json();
      if (data.data?.chapters) {
        setChapters(data.data.chapters);
      }
    } catch (err) {
      console.error('Error fetching chapters:', err);
    }
  };

  const generateSchedule = async () => {
    if (!selectedStudent || !selectedSubject || !selectedChapter) {
      setError('Please select student, subject, and chapter');
      return;
    }

    setLoading(true);
    setError('');
    setSchedule(null);

    try {
      const chapter = chapters.find(c => c.number === parseInt(selectedChapter) || c.title === selectedChapter);
      const studentData = students.find(s => s.id === selectedStudent);
      
      const response = await fetch('http://localhost:5000/api/schedule/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: selectedStudent,
          studentName: studentData?.name || 'Student',
          subject: selectedSubject,
          chapter: chapter?.title || selectedChapter,
          chapterTopics: chapter?.topics || []
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setSchedule(data.data);
        setActiveDay(0);
      } else {
        setError(data.message || 'Failed to generate schedule');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Error generating schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4CAF50';
      case 'moderate': case 'medium': return '#FF9800';
      case 'hard': case 'difficult': return '#f44336';
      default: return '#2196F3';
    }
  };

  // Helper function to extract topic name from topic (handles both string and object formats)
  const getTopicName = (topic) => {
    if (!topic) return 'Study';
    if (typeof topic === 'string') return topic;
    if (typeof topic === 'object') return topic.topicName || topic.name || topic.title || 'Study';
    return 'Study';
  };

  const getPerformanceBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'weak': case 'struggling': return { color: '#f44336', icon: '🔴', label: 'Needs Practice' };
      case 'moderate': case 'average': return { color: '#FF9800', icon: '🟡', label: 'Progressing' };
      case 'strong': case 'excellent': return { color: '#4CAF50', icon: '🟢', label: 'Excellent' };
      default: return { color: '#2196F3', icon: '🔵', label: 'In Progress' };
    }
  };

  const parseScheduleResponse = (scheduleData) => {
    if (!scheduleData) return [];
    
    // If schedule is already an array
    if (Array.isArray(scheduleData)) {
      return scheduleData;
    }
    
    // If schedule is a string (AI response), try to parse it
    if (typeof scheduleData === 'string') {
      try {
        // Try to find JSON in the response
        const jsonMatch = scheduleData.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        
        // Parse day-by-day format from text
        const days = [];
        const dayMatches = scheduleData.match(/Day\s*\d+[:\s][\s\S]*?(?=Day\s*\d+|$)/gi);
        
        if (dayMatches) {
          dayMatches.forEach((dayText, index) => {
            const topicMatch = dayText.match(/Topic[s]?[:\s]*([^\n]+)/i);
            const questionsMatch = dayText.match(/Question[s]?[:\s]*(\d+)/i);
            const difficultyMatch = dayText.match(/Difficulty[:\s]*(\w+)/i);
            const focusMatch = dayText.match(/Focus[:\s]*([^\n]+)/i);
            
            days.push({
              day: index + 1,
              date: getDateForDay(index),
              topics: topicMatch ? [topicMatch[1].trim()] : [`Topic ${index + 1}`],
              questionsCount: questionsMatch ? parseInt(questionsMatch[1]) : 10,
              difficulty: difficultyMatch ? difficultyMatch[1] : 'Moderate',
              focusArea: focusMatch ? focusMatch[1].trim() : 'Practice and Review',
              activities: ['Study material', 'Practice problems', 'Self-assessment']
            });
          });
        }
        
        return days.length > 0 ? days : generateDefaultSchedule();
      } catch (e) {
        console.error('Error parsing schedule:', e);
        return generateDefaultSchedule();
      }
    }
    
    return generateDefaultSchedule();
  };

  const getDateForDay = (dayIndex) => {
    const date = new Date();
    date.setDate(date.getDate() + dayIndex);
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const generateDefaultSchedule = () => {
    const chapter = chapters.find(c => c.number === parseInt(selectedChapter) || c.title === selectedChapter);
    const topics = chapter?.topics || ['Topic 1', 'Topic 2', 'Topic 3'];
    
    return Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      date: getDateForDay(i),
      topics: [topics[i % topics.length]],
      questionsCount: 10,
      difficulty: i < 2 ? 'Easy' : (i < 5 ? 'Moderate' : 'Hard'),
      focusArea: i === 0 ? 'Introduction' : (i === 6 ? 'Review & Practice' : 'Deep Learning'),
      activities: ['Read theory', 'Solve examples', 'Practice questions']
    }));
  };

  const parsedSchedule = schedule?.schedule ? parseScheduleResponse(schedule.schedule) : [];

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h1>📅 Weekly Study Schedule</h1>
        <p>AI-powered personalized study plan based on your performance</p>
      </div>

      {/* Configuration Section */}
      <div className="schedule-config">
        <div className="config-row">
          <div className="config-item">
            <label>👤 Student</label>
            <select 
              value={selectedStudent} 
              onChange={(e) => setSelectedStudent(e.target.value)}
            >
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="config-item">
            <label>📚 Subject</label>
            <select 
              value={selectedSubject} 
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Select Subject</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="config-item">
            <label>📖 Chapter</label>
            <select 
              value={selectedChapter} 
              onChange={(e) => setSelectedChapter(e.target.value)}
              disabled={!selectedSubject}
            >
              <option value="">Select Chapter</option>
              {chapters.map(c => (
                <option key={c.number} value={c.number}>
                  {c.number}. {c.title}
                </option>
              ))}
            </select>
          </div>

          <button 
            className="generate-btn"
            onClick={generateSchedule}
            disabled={loading || !selectedStudent || !selectedSubject || !selectedChapter}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              <>
                🚀 Generate Schedule
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="schedule-error">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Schedule Display */}
      {schedule && (
        <div className="schedule-display">
          {/* Student Performance Card */}
          <div className="performance-card">
            <div className="performance-header">
              <h3>📊 Performance Analysis</h3>
              <div 
                className="performance-badge"
                style={{ backgroundColor: getPerformanceBadge(schedule.performanceLevel).color }}
              >
                {getPerformanceBadge(schedule.performanceLevel).icon} {getPerformanceBadge(schedule.performanceLevel).label}
              </div>
            </div>
            <div className="performance-info">
              <span><strong>Student:</strong> {schedule.studentName}</span>
              <span><strong>Subject:</strong> {schedule.subject}</span>
              <span><strong>Chapter:</strong> {schedule.chapter}</span>
            </div>
          </div>

          {/* Weekly Calendar */}
          <div className="weekly-calendar">
            <h3>📆 7-Day Study Plan</h3>
            <div className="day-tabs">
              {parsedSchedule.map((day, index) => (
                <button
                  key={index}
                  className={`day-tab ${activeDay === index ? 'active' : ''}`}
                  onClick={() => setActiveDay(index)}
                  style={{ 
                    borderBottomColor: activeDay === index ? getDifficultyColor(day.difficulty) : 'transparent'
                  }}
                >
                  <span className="day-number">Day {day.day}</span>
                  <span className="day-date">{day.date}</span>
                </button>
              ))}
            </div>

            {/* Active Day Details */}
            {parsedSchedule[activeDay] && (
              <div className="day-details">
                <div className="day-header">
                  <h4>Day {parsedSchedule[activeDay].day} - {parsedSchedule[activeDay].date}</h4>
                  <span 
                    className="difficulty-badge"
                    style={{ backgroundColor: getDifficultyColor(parsedSchedule[activeDay].difficulty) }}
                  >
                    {parsedSchedule[activeDay].difficulty}
                  </span>
                </div>

                <div className="day-content">
                  <div className="content-section">
                    <h5>📝 Topics to Cover</h5>
                    <ul className="topic-list">
                      {parsedSchedule[activeDay].topics?.map((topic, i) => (
                        <li key={i}>{getTopicName(topic)}</li>
                      )) || <li>Review material</li>}
                    </ul>
                  </div>

                  <div className="content-section">
                    <h5>🎯 Focus Area</h5>
                    <p>{parsedSchedule[activeDay].focusArea || 'Practice and understanding'}</p>
                  </div>

                  <div className="content-section">
                    <h5>📊 Daily Target</h5>
                    <div className="target-info">
                      <div className="target-item">
                        <span className="target-number">{parsedSchedule[activeDay].questionsCount || 10}</span>
                        <span className="target-label">Questions</span>
                      </div>
                      <div className="target-item">
                        <span className="target-number">{parsedSchedule[activeDay].topics?.length || 1}</span>
                        <span className="target-label">Topics</span>
                      </div>
                      <div className="target-item">
                        <span className="target-number">~{30 + (parsedSchedule[activeDay].questionsCount || 10) * 2}</span>
                        <span className="target-label">Minutes</span>
                      </div>
                    </div>
                  </div>

                  <div className="content-section">
                    <h5>✅ Activities</h5>
                    <ul className="activity-list">
                      {parsedSchedule[activeDay].activities?.map((activity, i) => (
                        <li key={i}>
                          <input type="checkbox" id={`activity-${i}`} />
                          <label htmlFor={`activity-${i}`}>{activity}</label>
                        </li>
                      )) || (
                        <>
                          <li><input type="checkbox" /> <label>Read theory</label></li>
                          <li><input type="checkbox" /> <label>Solve examples</label></li>
                          <li><input type="checkbox" /> <label>Practice questions</label></li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {schedule.recommendations && (
            <div className="recommendations-card">
              <h3>💡 AI Recommendations</h3>
              <div className="recommendations-content">
                {typeof schedule.recommendations === 'string' ? (
                  <p>{schedule.recommendations}</p>
                ) : (
                  <ul>
                    {Array.isArray(schedule.recommendations) && schedule.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Quick Overview */}
          <div className="schedule-overview">
            <h3>📋 Week at a Glance</h3>
            <div className="overview-grid">
              {parsedSchedule.map((day, index) => (
                <div 
                  key={index}
                  className={`overview-card ${activeDay === index ? 'active' : ''}`}
                  onClick={() => setActiveDay(index)}
                  style={{ borderLeftColor: getDifficultyColor(day.difficulty) }}
                >
                  <div className="overview-header">
                    <span className="overview-day">Day {day.day}</span>
                    <span 
                      className="overview-difficulty"
                      style={{ color: getDifficultyColor(day.difficulty) }}
                    >
                      {day.difficulty}
                    </span>
                  </div>
                  <p className="overview-topic">
                    {getTopicName(day.topics?.[0])?.substring(0, 30) || 'Study'}
                    {getTopicName(day.topics?.[0])?.length > 30 ? '...' : ''}
                  </p>
                  <span className="overview-questions">
                    {day.questionsCount || 10} questions
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!schedule && !loading && !error && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Create Your Study Schedule</h3>
          <p>Select a student, subject, and chapter to generate a personalized 7-day study plan.</p>
          <div className="feature-list">
            <div className="feature-item">
              <span>🎯</span>
              <p><strong>Adaptive Learning</strong> - Schedule adjusts based on performance</p>
            </div>
            <div className="feature-item">
              <span>📊</span>
              <p><strong>Daily Targets</strong> - Clear goals with 10 questions per day</p>
            </div>
            <div className="feature-item">
              <span>🧠</span>
              <p><strong>Smart Pacing</strong> - Weak students get more time, strong students advance faster</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedule;
