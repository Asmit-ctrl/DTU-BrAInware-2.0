const mongoose = require('mongoose');

// Assignment Question Schema
const AssignmentQuestionSchema = new mongoose.Schema({
    id: Number,
    question: String,
    options: [String],
    correctAnswer: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard']
    },
    marks: Number,
    concept: String,
    explanation: String
});

// Assignment Schema
const AssignmentSchema = new mongoose.Schema({
    assignmentId: {
        type: String,
        required: true,
        unique: true
    },
    studentId: {
        type: String,
        required: true
    },
    studentName: String,
    topic: {
        type: String,
        required: true
    },
    assignmentTitle: String,
    totalQuestions: {
        type: Number,
        default: 10
    },
    totalMarks: {
        type: Number,
        default: 30
    },
    estimatedTime: {
        type: String,
        default: '20 minutes'
    },
    difficultyBreakdown: {
        easy: { type: Number, default: 6 },
        medium: { type: Number, default: 3 },
        hard: { type: Number, default: 1 }
    },
    questions: [AssignmentQuestionSchema],
    analyticsBasedFeedback: String,
    predictedOutcome: {
        expectedPerformance: String,
        focusConcepts: [String],
        riskLevel: String,
        nextRecommendation: String
    },
    analyticsUsed: {
        performanceStatus: String,
        weakConcepts: [String],
        riskLevel: String,
        averageScore: Number,
        recommendedAction: String
    },
    sessionId: String,
    status: {
        type: String,
        enum: ['generated', 'in_progress', 'completed', 'expired'],
        default: 'generated'
    },
    dueDate: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Assignment Attempt Schema
const AssignmentAttemptSchema = new mongoose.Schema({
    attemptId: {
        type: String,
        required: true,
        unique: true
    },
    assignmentId: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    answers: {
        type: Map,
        of: String,
        default: {}
    },
    questionResults: [{
        questionId: Number,
        selectedAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        marksAwarded: Number,
        concept: String
    }],
    score: {
        type: Number,
        default: 0
    },
    totalMarks: Number,
    percentage: Number,
    timeTaken: Number, // in seconds
    status: {
        type: String,
        enum: ['in_progress', 'completed', 'abandoned'],
        default: 'in_progress'
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    feedback: {
        performanceLevel: String,
        conceptsToReview: [String],
        nextAssignmentFocus: String
    }
});

const Assignment = mongoose.model('Assignment', AssignmentSchema);
const AssignmentAttempt = mongoose.model('AssignmentAttempt', AssignmentAttemptSchema);

module.exports = { Assignment, AssignmentAttempt };
