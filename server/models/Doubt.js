const mongoose = require('mongoose');

// Individual message in a doubt conversation
const MessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageBase64: {
    type: String,
    default: null
  },
  manimCode: {
    type: String,
    default: null
  },
  videoUrl: {
    type: String,
    default: null
  },
  audioUrl: {
    type: String,
    default: null
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Main Doubt Schema
const DoubtSchema = new mongoose.Schema({
  doubtId: {
    type: String,
    required: true,
    unique: true
  },
  studentId: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    default: null
  },
  
  // Student Profile
  studentProfile: {
    class: { type: Number, default: 9 },
    subject: { type: String, default: 'Mathematics' },
    chapter: { type: String },
    topic: { type: String },
    conceptAccuracy: { type: Number, default: 50 },
    masteryLevel: { type: String, enum: ['WEAK', 'MODERATE', 'STRONG'], default: 'MODERATE' },
    timePerQuestion: { type: Number, default: 60 },
    numberOfAttempts: { type: Number, default: 1 },
    firstAttemptCorrectRate: { type: Number, default: 50 }
  },
  
  // Conversation messages
  messages: [MessageSchema],
  
  // Status
  status: {
    type: String,
    enum: ['active', 'resolved', 'pending_video'],
    default: 'active'
  },
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
DoubtSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Doubt = mongoose.model('Doubt', DoubtSchema);

module.exports = { Doubt };
