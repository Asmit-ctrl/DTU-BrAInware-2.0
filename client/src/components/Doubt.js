import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Doubt.css';

const Doubt = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentDoubtId, setCurrentDoubtId] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [doubtHistory, setDoubtHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [studentProfile, setStudentProfile] = useState({
    class: 9,
    subject: 'Mathematics',
    chapter: 'Number Systems',
    topic: 'Rational vs Irrational Numbers'
  });
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch doubt history
  useEffect(() => {
    if (user?.id) {
      fetchDoubtHistory();
    }
  }, [user]);

  const fetchDoubtHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/doubts/${user.id}`);
      setDoubtHistory(response.data.data || []);
    } catch (error) {
      console.error('Error fetching doubt history:', error);
    }
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Start new doubt conversation
  const startNewDoubt = () => {
    setMessages([]);
    setCurrentDoubtId(null);
    setSessionId(null);
    setInputText('');
    removeImage();
  };

  // Load previous doubt conversation
  const loadDoubt = async (doubtId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/doubt/${doubtId}`);
      const doubt = response.data.data;
      
      setCurrentDoubtId(doubt.doubtId);
      setSessionId(doubt.sessionId);
      setStudentProfile(doubt.studentProfile);
      
      // Convert stored messages to display format
      const displayMessages = doubt.messages.map(msg => {
        if (msg.role === 'user') {
          return {
            role: 'user',
            content: msg.content,
            hasImage: !!msg.imageBase64
          };
        } else {
          try {
            const parsed = JSON.parse(msg.content);
            return {
              role: 'assistant',
              content: parsed,
              manimCode: msg.manimCode,
              videoUrl: msg.videoUrl,
              audioUrl: msg.audioUrl
            };
          } catch {
            return {
              role: 'assistant',
              content: { doubtClarification: msg.content },
              manimCode: msg.manimCode,
              videoUrl: msg.videoUrl
            };
          }
        }
      });
      
      setMessages(displayMessages);
      setShowHistory(false);
    } catch (error) {
      console.error('Error loading doubt:', error);
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputText.trim() && !imageFile) return;
    
    // Check if user is logged in
    if (!user || !user.id) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: { 
          doubtClarification: 'Please log in to ask doubts.',
          error: 'User not logged in'
        }
      }]);
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputText,
      hasImage: !!imageFile,
      imagePreview: imagePreview
    };

    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      let imageBase64 = null;
      if (imageFile) {
        const reader = new FileReader();
        imageBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result.split(',')[1]);
          reader.readAsDataURL(imageFile);
        });
      }

      let response;
      
      console.log('Sending doubt with studentId:', user.id); // Debug log
      
      if (!currentDoubtId) {
        // Start new doubt conversation
        response = await axios.post('http://localhost:5000/api/doubt/start', {
          studentId: user.id,
          doubtText: inputText,
          imageBase64,
          studentProfile
        });

        setCurrentDoubtId(response.data.data.doubtId);
        setSessionId(response.data.data.sessionId);
      } else {
        // Continue existing conversation
        response = await axios.post(`http://localhost:5000/api/doubt/${currentDoubtId}/followup`, {
          followUpText: inputText,
          imageBase64
        });
      }

      const aiResponse = response.data.data.response;
      const video = response.data.data.video;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        manimCode: aiResponse?.manimCode,
        videoUrl: video?.videoUrl,
        audioUrl: video?.audioUrl
      }]);

      setInputText('');
      removeImage();
      fetchDoubtHistory();

    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: { 
          doubtClarification: 'Sorry, I encountered an error processing your doubt. Please try again.',
          error: error.response?.data?.message || error.message
        }
      }]);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render AI response
  const renderAIResponse = (content, manimCode, videoUrl, audioUrl) => {
    if (!content) return null;

    return (
      <div className="ai-response">
        {/* Extracted Image Data */}
        {content.extractedImageData && (
          <div className="response-section extracted-data">
            <h4>📷 Extracted from Image:</h4>
            <div className="extracted-content">
              <pre>{content.extractedImageData}</pre>
            </div>
          </div>
        )}

        {/* Doubt Clarification */}
        {content.doubtClarification && (
          <div className="response-section clarification">
            <h4>💡 Let me understand your doubt:</h4>
            <p>{content.doubtClarification}</p>
          </div>
        )}

        {/* Error Message */}
        {content.error && (
          <div className="response-section error">
            <p className="error-text">⚠️ {content.error}</p>
          </div>
        )}

        {/* Guided Explanation */}
        {content.guidedExplanation && (
          <div className="response-section explanation">
            <h4>📝 Step-by-Step Hints:</h4>
            {content.guidedExplanation.hints?.length > 0 && (
              <ul className="hints-list">
                {content.guidedExplanation.hints.map((hint, idx) => (
                  <li key={idx}>{hint}</li>
                ))}
              </ul>
            )}
            {content.guidedExplanation.visualConcepts?.length > 0 && (
              <div className="visual-concepts">
                <strong>Visual Concepts:</strong>
                <ul>
                  {content.guidedExplanation.visualConcepts.map((concept, idx) => (
                    <li key={idx}>{concept}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Video Player */}
        {videoUrl && (
          <div className="response-section video-section">
            <h4>🎬 Visual Explanation:</h4>
            <video 
              controls 
              className="doubt-video"
              src={`http://localhost:5000${videoUrl}`}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}

        {/* Manim Code Display */}
        {manimCode && !videoUrl && (
          <div className="response-section manim-section">
            <h4>🎨 Animation Code (Manim):</h4>
            <div className="manim-info">
              <p>📌 Video generation requires Manim to be installed on the server.</p>
              <p>You can run this code locally with: <code>manim -pql script.py DoubtAnimation</code></p>
            </div>
            <details>
              <summary>View Manim Code</summary>
              <pre className="manim-code">{manimCode}</pre>
            </details>
          </div>
        )}

        {/* Narration */}
        {content.narration?.length > 0 && (
          <div className="response-section narration-section">
            <h4>🔊 Audio Narration:</h4>
            {audioUrl && (
              <audio controls src={`http://localhost:5000${audioUrl}`}>
                Your browser does not support the audio element.
              </audio>
            )}
            <div className="narration-text">
              {content.narration.map((text, idx) => (
                <p key={idx}>• {text}</p>
              ))}
            </div>
          </div>
        )}

        {/* Reflective Question */}
        {content.reflectiveQuestion && (
          <div className="response-section reflective">
            <h4>🤔 Think About This:</h4>
            <p className="reflective-question">{content.reflectiveQuestion}</p>
          </div>
        )}

        {/* Encouragement */}
        {content.encouragement && (
          <div className="response-section encouragement">
            <p className="encouragement-text">✨ {content.encouragement}</p>
          </div>
        )}
      </div>
    );
  };

  // Render profile editor
  const renderProfileEditor = () => (
    <div className="profile-editor-overlay" onClick={() => setShowProfileEditor(false)}>
      <div className="profile-editor" onClick={e => e.stopPropagation()}>
        <h3>📚 Update Your Profile</h3>
        <div className="profile-form">
          <label>
            Class:
            <select 
              value={studentProfile.class} 
              onChange={e => setStudentProfile({...studentProfile, class: parseInt(e.target.value)})}
            >
              {[6, 7, 8, 9, 10, 11, 12].map(c => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </label>
          
          <label>
            Subject:
            <select 
              value={studentProfile.subject}
              onChange={e => setStudentProfile({...studentProfile, subject: e.target.value})}
            >
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Biology">Biology</option>
            </select>
          </label>
          
          <label>
            Chapter:
            <input 
              type="text"
              value={studentProfile.chapter}
              onChange={e => setStudentProfile({...studentProfile, chapter: e.target.value})}
              placeholder="e.g., Number Systems"
            />
          </label>
          
          <label>
            Topic:
            <input 
              type="text"
              value={studentProfile.topic}
              onChange={e => setStudentProfile({...studentProfile, topic: e.target.value})}
              placeholder="e.g., Rational vs Irrational Numbers"
            />
          </label>
        </div>
        <button className="save-profile-btn" onClick={() => setShowProfileEditor(false)}>
          Save Profile
        </button>
      </div>
    </div>
  );

  return (
    <div className="doubt-container">
      {/* Sidebar for history */}
      <div className={`doubt-sidebar ${showHistory ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>💬 Chat History</h3>
          <button className="close-sidebar" onClick={() => setShowHistory(false)}>×</button>
        </div>
        <button className="new-chat-btn" onClick={startNewDoubt}>
          + New Doubt
        </button>
        <div className="history-list">
          {doubtHistory.map(doubt => (
            <div 
              key={doubt.doubtId}
              className={`history-item ${currentDoubtId === doubt.doubtId ? 'active' : ''}`}
              onClick={() => loadDoubt(doubt.doubtId)}
            >
              <div className="history-preview">
                {doubt.messages[0]?.content.substring(0, 50)}...
              </div>
              <div className="history-meta">
                <span className={`status ${doubt.status}`}>{doubt.status}</span>
                <span className="date">{new Date(doubt.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
          {doubtHistory.length === 0 && (
            <p className="no-history">No previous doubts found</p>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="doubt-main">
        {/* Header */}
        <div className="doubt-header">
          <button className="toggle-history" onClick={() => setShowHistory(!showHistory)}>
            ☰
          </button>
          <div className="header-info">
            <h1>🤔 Doubt Resolution</h1>
            <p>Ask any question with images - Get visual explanations</p>
          </div>
          <button className="profile-btn" onClick={() => setShowProfileEditor(true)}>
            ⚙️ Profile
          </button>
        </div>

        {/* Profile Banner */}
        <div className="profile-banner">
          <span>📚 Class {studentProfile.class}</span>
          <span>📖 {studentProfile.subject}</span>
          <span>📑 {studentProfile.chapter}</span>
          <span>🎯 {studentProfile.topic}</span>
        </div>

        {/* Messages */}
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h2>👋 Welcome to Doubt Resolution!</h2>
              <p>I'm here to help you understand difficult concepts through:</p>
              <ul>
                <li>📷 <strong>Image Analysis</strong> - Upload photos of problems</li>
                <li>💡 <strong>Step-by-Step Hints</strong> - Guided learning</li>
                <li>🎬 <strong>Visual Animations</strong> - Manim-powered videos</li>
                <li>🔊 <strong>Audio Explanations</strong> - Synced narration</li>
              </ul>
              <div className="example-doubts">
                <p>Try asking:</p>
                <button onClick={() => setInputText("I don't understand why √2 is irrational. If we can calculate its value, why is it not rational?")}>
                  Why is √2 irrational?
                </button>
                <button onClick={() => setInputText("How do I solve quadratic equations using the formula method?")}>
                  Quadratic equations
                </button>
                <button onClick={() => setInputText("What's the difference between velocity and acceleration?")}>
                  Velocity vs Acceleration
                </button>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              {msg.role === 'user' ? (
                <div className="user-message">
                  <div className="message-avatar">👤</div>
                  <div className="message-content">
                    {msg.imagePreview && (
                      <img src={msg.imagePreview} alt="Uploaded" className="message-image" />
                    )}
                    {msg.hasImage && !msg.imagePreview && (
                      <p className="image-indicator">📷 Image attached</p>
                    )}
                    <p>{msg.content}</p>
                  </div>
                </div>
              ) : (
                <div className="assistant-message">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    {renderAIResponse(msg.content, msg.manimCode, msg.videoUrl, msg.audioUrl)}
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="message assistant loading">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Analyzing your doubt and creating visual explanation...</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="input-area">
          {imagePreview && (
            <div className="image-preview-container">
              <img src={imagePreview} alt="Preview" className="preview-image" />
              <button className="remove-image" onClick={removeImage}>×</button>
            </div>
          )}
          
          <div className="input-row">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
            <button 
              className="attach-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Attach Image"
            >
              📷
            </button>
            
            <textarea
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your doubt here... (You can also attach an image of the question)"
              rows={1}
              disabled={loading}
            />
            
            <button 
              className="send-btn"
              onClick={sendMessage}
              disabled={loading || (!inputText.trim() && !imageFile)}
            >
              {loading ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </div>

      {/* Profile Editor Modal */}
      {showProfileEditor && renderProfileEditor()}
    </div>
  );
};

export default Doubt;
