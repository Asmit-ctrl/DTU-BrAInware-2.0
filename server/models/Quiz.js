const mongoose = require('mongoose');

// Question Schema
const questionSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number, required: true }, // Index of correct option
  hint: { type: String },
  subject: { type: String },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

// Quiz Schema (Quiz Template)
const quizSchema = new mongoose.Schema({
  quizId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  subject: { type: String, required: true },
  grade: { type: String, required: true },
  questions: [questionSchema],
  totalQuestions: { type: Number },
  timeLimit: { type: Number }, // in minutes
  createdAt: { type: Date, default: Date.now }
});

// Quiz Attempt/Result Schema
const quizAttemptSchema = new mongoose.Schema({
  attemptId: { type: String, required: true, unique: true },
  quizId: { type: String, required: true },
  studentId: { type: String, required: true },
  studentName: { type: String },
  
  // Quiz Performance Metrics
  score: { type: Number, default: 0 }, // Number of correct answers
  accuracy: { type: Number, default: 0 }, // Percentage
  totalQuestions: { type: Number },
  correctAnswers: { type: Number, default: 0 },
  wrongAnswers: { type: Number, default: 0 },
  
  // Detailed Metrics
  mistakeRepetitionCount: { type: Number, default: 0 }, // Questions answered wrong multiple times
  hintUsageCount: { type: Number, default: 0 },
  consecutiveWrongAnswers: { type: Number, default: 0 }, // Max consecutive wrong
  postRevisionAccuracy: { type: Number, default: 0 }, // Accuracy after reviewing hints
  
  // Time Tracking
  totalTimeTaken: { type: Number }, // in seconds
  timePerQuestion: [Number], // Array of time taken per question in seconds
  
  // Question-wise details (stored as 'answers' to match analytics agent expectations)
  answers: [{
    questionId: String,
    questionText: String,
    selectedAnswer: Number,
    correctAnswer: Number,
    isCorrect: Boolean,
    hintUsed: Boolean,
    timeTaken: Number,
    attemptCount: Number
  }],
  
  // Quiz Info
  quizTitle: { type: String },
  subject: { type: String },
  grade: { type: String },
  
  // Timestamps
  startedAt: { type: Date },
  completedAt: { type: Date },
  date: { type: Date, default: Date.now }
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
  analyticsId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  
  // OnDemand.io Session Info
  sessionId: { type: String },
  messageId: { type: String },
  
  // Analysis Results
  performanceStatus: { type: String, enum: ['Improvement', 'Stagnation', 'Decline'] },
  weakConcepts: [{ type: String }],
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'] },
  recommendedAction: { type: String },
  fullAnalysis: { type: String }, // Complete AI response
  
  // Metrics at time of analysis
  totalAttempts: { type: Number },
  averageAccuracy: { type: Number },
  averageHintUsage: { type: Number },
  averageMistakeRepetitions: { type: Number },
  maxConsecutiveWrong: { type: Number },
  averageTimePerQuestion: { type: Number },
  
  // Metadata
  createdAt: { type: Date, default: Date.now },
  analyzedQuizzes: [{ type: String }] // Quiz IDs included in analysis
});

// Teaching Lesson Schema
const lessonSchema = new mongoose.Schema({
  lessonId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String },
  
  // Lesson Content
  topic: { type: String, required: true },
  masteryLevel: { type: String, enum: ['WEAK', 'MEDIUM', 'STRONG'], default: 'MEDIUM' },
  teachingSummary: { type: String },
  teacherGuidance: { type: String },
  fullResponse: { type: String }, // Complete AI response
  
  // Manim Animation
  manimCode: { type: String },
  scriptPath: { type: String },
  videoUrl: { type: String },
  renderStatus: { 
    type: String, 
    enum: ['pending', 'rendering', 'completed', 'failed', 'skipped', 'no_code', 'error'],
    default: 'pending'
  },
  renderError: { type: String },
  
  // Session Info
  sessionId: { type: String },
  
  // Analytics Reference
  analyticsId: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['generating', 'ready', 'viewed', 'completed'],
    default: 'generating'
  },
  viewCount: { type: Number, default: 0 },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  viewedAt: { type: Date },
  completedAt: { type: Date }
});

// Chapter Schema (collection of lessons for weak concepts)
const chapterSchema = new mongoose.Schema({
  chapterId: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String },
  
  // Chapter Content
  title: { type: String, required: true },
  description: { type: String },
  masteryLevel: { type: String, enum: ['WEAK', 'MEDIUM', 'STRONG'] },
  
  // Lessons in this chapter
  lessons: [{
    lessonId: String,
    topic: String,
    order: Number,
    status: String
  }],
  
  // Progress
  totalLessons: { type: Number, default: 0 },
  completedLessons: { type: Number, default: 0 },
  progressPercent: { type: Number, default: 0 },
  
  // Analytics Reference
  analyticsId: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  completedAt: { type: Date }
});

const Quiz = mongoose.model('Quiz', quizSchema);
const QuizAttempt = mongoose.model('QuizAttempt', quizAttemptSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);
const Lesson = mongoose.model('Lesson', lessonSchema);
const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = { Quiz, QuizAttempt, Analytics, Lesson, Chapter };
