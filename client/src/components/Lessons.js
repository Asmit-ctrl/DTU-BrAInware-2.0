import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Lessons.css';

const Lessons = () => {
  const { user } = useAuth();
  const [lessons, setLessons] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingChapters, setGeneratingChapters] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lessons');
  const [customTopic, setCustomTopic] = useState('');

  useEffect(() => {
    if (user?.id) {
      fetchLessons();
      fetchChapters();
    }
  }, [user]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/lessons/${user.id}`);
      setLessons(response.data.data || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
    }
    setLoading(false);
  };

  const fetchChapters = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/chapters/${user.id}`);
      setChapters(response.data.data || []);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const generateLesson = async (topic = null) => {
    setGenerating(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/lessons/generate', {
        studentId: user.id,
        topic: topic || customTopic || null
      });
      
      if (response.data.data) {
        const newLesson = response.data.data;
        setLessons(prev => [newLesson, ...prev]);
        setSelectedLesson(newLesson);
        setCustomTopic('');

        // If rendering is in progress, start polling for completion
        if (newLesson.renderStatus === 'rendering' && newLesson.lessonId) {
          console.log('⏳ Lesson created, polling for video...');
          pollForVideoCompletion(newLesson.lessonId, newLesson._id);
        }
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate lesson');
    }
    setGenerating(false);
  };

  const pollForVideoCompletion = (lessonId, dbId, attempts = 0) => {
    const maxAttempts = 180; // Poll for up to 30 minutes (180 * 10 seconds)
    
    if (attempts >= maxAttempts) {
      console.log('❌ Video rendering timeout');
      setError('Video rendering took too long. Please refresh the page.');
      return;
    }

    // Wait 10 seconds before polling
    setTimeout(async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/lesson/${dbId}`);
        const lesson = response.data.data;

        if (lesson.renderStatus === 'completed' && lesson.videoUrl) {
          console.log('✅ Video ready!');
          setSelectedLesson(lesson);
          setLessons(prev =>
            prev.map(l => (l._id === dbId) ? lesson : l)
          );
        } else if (lesson.renderStatus === 'rendering') {
          console.log(`⏳ Still rendering... (${attempts + 1}/${maxAttempts})`);
          pollForVideoCompletion(lessonId, dbId, attempts + 1);
        } else if (lesson.renderStatus === 'failed' || lesson.renderStatus === 'error') {
          console.log('❌ Rendering failed');
          setError(`Rendering failed: ${lesson.renderError}`);
        } else {
          // Continue polling
          pollForVideoCompletion(lessonId, dbId, attempts + 1);
        }
      } catch (error) {
        console.error('Error polling for video:', error);
        // Continue polling despite errors
        if (attempts < maxAttempts) {
          pollForVideoCompletion(lessonId, dbId, attempts + 1);
        }
      }
    }, 10000); // Poll every 10 seconds
  };

  const generateChapters = async () => {
    setGeneratingChapters(true);
    setError('');
    try {
      const response = await axios.post('http://localhost:5000/api/chapters/generate', {
        studentId: user.id
      });
      
      if (response.data.data) {
        setChapters(prev => [response.data.data, ...prev]);
        setActiveTab('chapters');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to generate chapters');
    }
    setGeneratingChapters(false);
  };

  const viewLesson = async (lessonId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/lesson/${lessonId}`);
      setSelectedLesson(response.data.data);
    } catch (error) {
      console.error('Error fetching lesson:', error);
    }
  };

  const completeLesson = async (lessonId) => {
    try {
      await axios.post(`http://localhost:5000/api/lesson/${lessonId}/complete`);
      fetchLessons();
      fetchChapters();
      if (selectedLesson?.lessonId === lessonId) {
        setSelectedLesson(prev => ({ ...prev, status: 'completed' }));
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const renderManimAnimation = async (lessonId) => {
    try {
      await axios.post(`http://localhost:5000/api/lesson/${lessonId}/render`);
      alert('Rendering started! Please wait...');
      // Poll for completion
      setTimeout(() => viewLesson(lessonId), 10000);
    } catch (error) {
      console.error('Error rendering:', error);
    }
  };

  const getMasteryIcon = (level) => {
    switch (level) {
      case 'WEAK': return '🔴';
      case 'MEDIUM': return '🟡';
      case 'STRONG': return '🟢';
      default: return '⚪';
    }
  };

  const getMasteryColor = (level) => {
    switch (level) {
      case 'WEAK': return '#e74c3c';
      case 'MEDIUM': return '#f39c12';
      case 'STRONG': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      generating: { bg: '#3498db', text: 'Generating...' },
      ready: { bg: '#27ae60', text: 'Ready' },
      viewed: { bg: '#9b59b6', text: 'Viewed' },
      completed: { bg: '#2ecc71', text: 'Completed ✓' }
    };
    const style = styles[status] || styles.ready;
    return (
      <span className="status-badge" style={{ backgroundColor: style.bg }}>
        {style.text}
      </span>
    );
  };

  const renderManimCode = (code) => {
    if (!code) return null;
    return (
      <div className="manim-code-container">
        <div className="code-header">
          <span>🐍 Python (Manim)</span>
          <button 
            className="copy-btn"
            onClick={() => navigator.clipboard.writeText(code)}
          >
            📋 Copy
          </button>
        </div>
        <pre className="manim-code">
          <code>{code}</code>
        </pre>
      </div>
    );
  };

  const renderFormattedContent = (text) => {
    if (!text) return null;
    
    // Split by sections and render
    const sections = text.split(/\n*---+\n*/);
    
    return sections.map((section, idx) => {
      if (!section.trim()) return null;
      
      const lines = section.split('\n');
      const elements = [];
      
      lines.forEach((line, lineIdx) => {
        const trimmed = line.trim();
        if (!trimmed) return;
        
        // Headers with bold
        if (trimmed.match(/^[A-Z][\w\s]+:/)) {
          const content = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          elements.push(
            <h4 key={lineIdx} className="content-header" dangerouslySetInnerHTML={{ __html: content }} />
          );
        }
        // Numbered items
        else if (trimmed.match(/^\d+\./)) {
          const content = trimmed.replace(/^\d+\.\s*/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          elements.push(
            <li key={lineIdx} className="numbered-item" dangerouslySetInnerHTML={{ __html: content }} />
          );
        }
        // Bullet points
        else if (trimmed.match(/^[-•]/)) {
          const content = trimmed.replace(/^[-•]\s*/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          elements.push(
            <li key={lineIdx} className="bullet-item" dangerouslySetInnerHTML={{ __html: content }} />
          );
        }
        // Regular text
        else {
          const content = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
          elements.push(
            <p key={lineIdx} className="content-paragraph" dangerouslySetInnerHTML={{ __html: content }} />
          );
        }
      });
      
      return (
        <div key={idx} className="content-section">
          {elements}
          {idx < sections.length - 1 && <hr className="section-divider" />}
        </div>
      );
    });
  };

  return (
    <div className="lessons-container">
      <div className="lessons-header">
        <h2>📚 AI Teaching Lessons</h2>
        <p className="lessons-subtitle">
          Personalized Manim animations based on your learning analytics
        </p>
        
        <div className="action-buttons">
          <div className="custom-topic-input">
            <input
              type="text"
              placeholder="Enter specific topic (optional)..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
            <button 
              className="generate-btn"
              onClick={() => generateLesson()}
              disabled={generating}
            >
              {generating ? '🔄 Generating...' : '✨ Generate Lesson'}
            </button>
          </div>
          
          <button 
            className="generate-chapters-btn"
            onClick={generateChapters}
            disabled={generatingChapters}
          >
            {generatingChapters ? '🔄 Creating...' : '📖 Generate All Chapters'}
          </button>
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'lessons' ? 'active' : ''}`}
          onClick={() => setActiveTab('lessons')}
        >
          📝 Lessons ({lessons.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chapters' ? 'active' : ''}`}
          onClick={() => setActiveTab('chapters')}
        >
          📖 Chapters ({chapters.length})
        </button>
      </div>

      {loading ? (
        <div className="loading-spinner">🔄 Loading lessons...</div>
      ) : (
        <div className="lessons-content">
          {activeTab === 'lessons' && (
            <>
              {lessons.length === 0 ? (
                <div className="no-lessons">
                  <span className="empty-icon">📚</span>
                  <h3>No Lessons Yet</h3>
                  <p>Generate your first personalized lesson based on your quiz performance!</p>
                </div>
              ) : (
                <div className="lessons-grid">
                  {lessons.map((lesson) => (
                    <div 
                      key={lesson.lessonId} 
                      className="lesson-card"
                      onClick={() => viewLesson(lesson.lessonId)}
                    >
                      <div className="lesson-card-header">
                        <span className="mastery-indicator" style={{ color: getMasteryColor(lesson.masteryLevel) }}>
                          {getMasteryIcon(lesson.masteryLevel)} {lesson.masteryLevel}
                        </span>
                        {getStatusBadge(lesson.status)}
                      </div>
                      
                      <h3 className="lesson-topic">{lesson.topic}</h3>
                      
                      <p className="lesson-summary">
                        {lesson.teachingSummary?.substring(0, 150)}...
                      </p>
                      
                      <div className="lesson-meta">
                        <span>📅 {new Date(lesson.createdAt).toLocaleDateString()}</span>
                        <span>👁️ {lesson.viewCount} views</span>
                      </div>
                      
                      {lesson.videoUrl && (
                        <div className="video-badge">🎬 Animation Ready</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'chapters' && (
            <>
              {chapters.length === 0 ? (
                <div className="no-lessons">
                  <span className="empty-icon">📖</span>
                  <h3>No Chapters Yet</h3>
                  <p>Generate chapters to get a complete learning path for your weak areas!</p>
                </div>
              ) : (
                <div className="chapters-list">
                  {chapters.map((chapter) => (
                    <div key={chapter.chapterId} className="chapter-card">
                      <div className="chapter-header">
                        <h3>{chapter.title}</h3>
                        <span className="mastery-tag" style={{ backgroundColor: getMasteryColor(chapter.masteryLevel) }}>
                          {chapter.masteryLevel}
                        </span>
                      </div>
                      
                      <p className="chapter-description">{chapter.description}</p>
                      
                      <div className="chapter-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${chapter.progressPercent}%` }}
                          />
                        </div>
                        <span className="progress-text">
                          {chapter.completedLessons}/{chapter.totalLessons} lessons completed ({chapter.progressPercent}%)
                        </span>
                      </div>
                      
                      <div className="chapter-lessons">
                        {chapter.lessons.map((lesson, idx) => (
                          <div 
                            key={lesson.lessonId || idx}
                            className="chapter-lesson-item"
                            onClick={() => lesson.lessonId && viewLesson(lesson.lessonId)}
                          >
                            <span className="lesson-number">{idx + 1}</span>
                            <span className="lesson-name">{lesson.topic}</span>
                            <span className={`lesson-status ${lesson.status}`}>
                              {lesson.status === 'completed' ? '✓' : '○'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Lesson Detail Modal */}
      {selectedLesson && (
        <div className="modal-overlay" onClick={() => setSelectedLesson(null)}>
          <div className="modal-content lesson-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h3>📚 {selectedLesson.topic}</h3>
                <span className="mastery-badge" style={{ backgroundColor: getMasteryColor(selectedLesson.masteryLevel) }}>
                  {getMasteryIcon(selectedLesson.masteryLevel)} {selectedLesson.masteryLevel} Level
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedLesson(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Video Player */}
              {selectedLesson.videoUrl ? (
                <div className="video-container">
                  <h4>🎬 Animation</h4>
                  <video 
                    controls 
                    src={selectedLesson.videoUrl}
                    className="lesson-video"
                  >
                    Your browser does not support video playback.
                  </video>
                </div>
              ) : selectedLesson.renderStatus === 'rendering' ? (
                <div className="render-progress">
                  <h4>⏳ Creating Animation...</h4>
                  <div className="spinner"></div>
                  <p>Manim is rendering your personalized animation. This typically takes 5-15 minutes.</p>
                  <p className="progress-hint">🔄 The page will automatically update when the video is ready.</p>
                </div>
              ) : selectedLesson.manimCode ? (
                <div className="render-prompt">
                  <p>Animation code is ready but not rendered yet.</p>
                  <button 
                    className="render-btn"
                    onClick={() => renderManimAnimation(selectedLesson.lessonId)}
                  >
                    🎬 Render Animation
                  </button>
                  <p className="render-note">
                    Note: Rendering requires Manim to be installed on the server.
                  </p>
                </div>
              ) : null}
              
              {/* Teaching Summary */}
              <div className="lesson-section">
                <h4>📋 Teaching Summary</h4>
                <div className="section-content">
                  {renderFormattedContent(selectedLesson.teachingSummary)}
                </div>
              </div>
              
              {/* Teacher Guidance */}
              {selectedLesson.teacherGuidance && (
                <div className="lesson-section">
                  <h4>🎤 Teacher Voice Guidance</h4>
                  <div className="section-content guidance">
                    {renderFormattedContent(selectedLesson.teacherGuidance)}
                  </div>
                </div>
              )}
              
              {/* Manim Code */}
              {selectedLesson.manimCode && (
                <div className="lesson-section">
                  <h4>💻 Manim Animation Code</h4>
                  {renderManimCode(selectedLesson.manimCode)}
                </div>
              )}
              
              {/* Full Response (collapsible) */}
              <details className="full-response-details">
                <summary>📄 View Full AI Response</summary>
                <div className="full-response-content">
                  {renderFormattedContent(selectedLesson.fullResponse)}
                </div>
              </details>
              
              {/* Actions */}
              <div className="lesson-actions">
                {selectedLesson.status !== 'completed' && (
                  <button 
                    className="complete-btn"
                    onClick={() => completeLesson(selectedLesson.lessonId)}
                  >
                    ✅ Mark as Completed
                  </button>
                )}
                
                <div className="lesson-info">
                  <span>ID: {selectedLesson.lessonId}</span>
                  <span>Created: {new Date(selectedLesson.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Lessons;
