import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Analytics.css';

const Analytics = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  useEffect(() => {
    if (user?.studentId) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/analytics/${user.studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAnalytics(response.data.data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const generateAnalytics = async () => {
    setGenerating(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/analytics/generate',
        {
          studentId: user.studentId,
          studentName: user.name
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Analytics generated successfully!');
      fetchAnalytics(); // Refresh the list
    } catch (err) {
      console.error('Error generating analytics:', err);
      setError(err.response?.data?.message || 'Failed to generate analytics');
      alert(err.response?.data?.message || 'Failed to generate analytics. Make sure you have taken at least one quiz.');
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low': return '#4caf50';
      case 'Medium': return '#ff9800';
      case 'High': return '#f44336';
      default: return '#666';
    }
  };

  const getPerformanceIcon = (status) => {
    switch (status) {
      case 'Improvement': return '📈';
      case 'Stagnation': return '📊';
      case 'Decline': return '📉';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="analytics-container">
        <h2>📊 Learning Analytics</h2>
        <div className="loading-spinner">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 AI-Powered Learning Analytics</h2>
        <p className="analytics-subtitle">
          Get personalized insights about your learning progress powered by AI
        </p>
        <button
          onClick={generateAnalytics}
          disabled={generating}
          className="generate-btn"
        >
          {generating ? '⏳ Analyzing...' : '🤖 Generate New Analysis'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {analytics.length === 0 ? (
        <div className="no-analytics">
          <div className="empty-state">
            <span className="empty-icon">📋</span>
            <h3>No Analytics Available</h3>
            <p>Take some quizzes and then generate your first analytics report!</p>
          </div>
        </div>
      ) : (
        <div className="analytics-grid">
          {analytics.map((analysis) => (
            <div key={analysis.analyticsId} className="analytics-card">
              <div className="card-header">
                <div className="card-date">
                  {new Date(analysis.createdAt).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                <div
                  className="risk-badge"
                  style={{ backgroundColor: getRiskColor(analysis.riskLevel) }}
                >
                  {analysis.riskLevel} Risk
                </div>
              </div>

              <div className="performance-status">
                <span className="status-icon">
                  {getPerformanceIcon(analysis.performanceStatus)}
                </span>
                <span className="status-text">{analysis.performanceStatus}</span>
              </div>

              <div className="metrics-summary">
                <div className="metric">
                  <span className="metric-label">Quizzes Analyzed</span>
                  <span className="metric-value">{analysis.totalAttempts}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Avg Accuracy</span>
                  <span className="metric-value">{analysis.averageAccuracy.toFixed(1)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Avg Time/Q</span>
                  <span className="metric-value">{analysis.averageTimePerQuestion.toFixed(1)}s</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Hints Used</span>
                  <span className="metric-value">{analysis.averageHintUsage.toFixed(1)}</span>
                </div>
              </div>

              {analysis.weakConcepts && analysis.weakConcepts.length > 0 && (
                <div className="weak-concepts">
                  <h4>🎯 Areas to Focus:</h4>
                  <div className="concepts-tags">
                    {analysis.weakConcepts.map((concept, idx) => (
                      <span key={idx} className="concept-tag">{concept}</span>
                    ))}
                  </div>
                </div>
              )}

      <div className="recommended-action">
        <h4>💡 Recommended Actions:</h4>
        <div className="action-content">
          {analysis.recommendedAction.split('\n').filter(line => line.trim()).map((line, idx) => {
            // Check if it's a numbered or bulleted list item
            const isListItem = /^[\d\-\*•]/.test(line.trim());
            const cleanLine = line.trim().replace(/^[\d\-\*•]+\.?\s*/, '');
            
            if (isListItem) {
              return <li key={idx}>{cleanLine}</li>;
            }
            return cleanLine ? <p key={idx}>{cleanLine}</p> : null;
          })}
        </div>
      </div>              <button
                onClick={() => setSelectedAnalysis(analysis)}
                className="view-details-btn"
              >
                View Full Analysis
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedAnalysis && (
        <div className="modal-overlay" onClick={() => setSelectedAnalysis(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>📊 Detailed Analysis Report</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedAnalysis(null)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="analysis-full">
                {selectedAnalysis.fullAnalysis.split(/\n*---+\n*/).map((section, sectionIdx) => {
                  if (!section.trim()) return null;
                  
                  const lines = section.split('\n').filter(line => line.trim());
                  const elements = [];
                  
                  lines.forEach((line, lineIdx) => {
                    const trimmed = line.trim();
                    
                    // Section headers (e.g., "Performance Status: **text**")
                    if (trimmed.match(/^[A-Z][^:]+:\s*\*\*/)) {
                      const [header, ...rest] = trimmed.split(':');
                      const content = rest.join(':').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      elements.push(
                        <div key={`${sectionIdx}-h-${lineIdx}`} className="analysis-heading">
                          <strong>{header}:</strong>
                          <span dangerouslySetInnerHTML={{ __html: content }} />
                        </div>
                      );
                    }
                    // Numbered list items (e.g., "1. text")
                    else if (trimmed.match(/^\d+\.\s+/)) {
                      const text = trimmed.replace(/^\d+\.\s+/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      if (elements[elements.length - 1]?.type !== 'ol') {
                        elements.push(<ol key={`${sectionIdx}-ol-${lineIdx}`} className="analysis-list">{[]}</ol>);
                      }
                      const lastOl = elements[elements.length - 1];
                      lastOl.props.children.push(
                        <li key={lineIdx} className="analysis-bullet" dangerouslySetInnerHTML={{ __html: text }} />
                      );
                    }
                    // Bullet points (e.g., "- text" or "• text")
                    else if (trimmed.match(/^[-•]\s+/)) {
                      const text = trimmed.replace(/^[-•]\s+/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      if (elements[elements.length - 1]?.type !== 'ul') {
                        elements.push(<ul key={`${sectionIdx}-ul-${lineIdx}`} className="analysis-list">{[]}</ul>);
                      }
                      const lastUl = elements[elements.length - 1];
                      lastUl.props.children.push(
                        <li key={lineIdx} className="analysis-bullet" dangerouslySetInnerHTML={{ __html: text }} />
                      );
                    }
                    // Regular text
                    else if (trimmed) {
                      const content = trimmed.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      elements.push(
                        <p key={`${sectionIdx}-p-${lineIdx}`} className="analysis-paragraph">
                          <span dangerouslySetInnerHTML={{ __html: content }} />
                        </p>
                      );
                    }
                  });
                  
                  return (
                    <div key={`section-${sectionIdx}`} className="analysis-section">
                      {elements}
                      {sectionIdx < selectedAnalysis.fullAnalysis.split(/\n*---+\n*/).length - 1 && (
                        <hr className="section-divider" />
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="analysis-metadata">
                <p><strong>Analysis ID:</strong> {selectedAnalysis.analyticsId}</p>
                <p><strong>Session ID:</strong> {selectedAnalysis.sessionId}</p>
                <p><strong>Generated:</strong> {new Date(selectedAnalysis.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
