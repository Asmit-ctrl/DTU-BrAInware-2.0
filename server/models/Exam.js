const mongoose = require('mongoose');

const ExamQuestionSchema = new mongoose.Schema({
    id: Number,
    question: String,
    options: [String],
    correctAnswer: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    marks: Number,
    concept: String,
    explanation: String
});

const ExamAttemptAnswerSchema = new mongoose.Schema({
    questionId: Number,
    selectedAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number // seconds spent on this question
});

const ExamSchema = new mongoose.Schema({
    examId: {
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
    examTitle: String,
    totalQuestions: {
        type: Number,
        default: 15
    },
    totalMarks: {
        type: Number,
        default: 60
    },
    duration: {
        type: String,
        default: '35 minutes'
    },
    durationMinutes: {
        type: Number,
        default: 35
    },
    questions: [ExamQuestionSchema],
    sessionId: String,
    status: {
        type: String,
        enum: ['generated', 'in_progress', 'submitted', 'evaluated'],
        default: 'generated'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ExamAttemptSchema = new mongoose.Schema({
    attemptId: {
        type: String,
        required: true,
        unique: true
    },
    examId: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    studentName: String,
    topic: String,
    answers: [ExamAttemptAnswerSchema],
    
    // Scoring
    totalScore: Number,
    maxScore: Number,
    percentage: Number,
    performanceLevel: {
        type: String,
        enum: ['WEAK', 'MEDIUM', 'STRONG']
    },
    
    // Difficulty-wise breakdown
    easyScore: { scored: Number, total: Number, count: Number },
    mediumScore: { scored: Number, total: Number, count: Number },
    hardScore: { scored: Number, total: Number, count: Number },
    
    // Summary
    correctCount: Number,
    incorrectCount: Number,
    unansweredCount: Number,
    
    // Timing
    startedAt: Date,
    submittedAt: Date,
    timeTaken: Number, // total seconds
    
    // Detailed results
    questionResults: [{
        questionId: Number,
        question: String,
        studentAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean,
        marks: Number,
        scored: Number,
        explanation: String,
        difficulty: String
    }],
    
    status: {
        type: String,
        enum: ['in_progress', 'submitted', 'evaluated'],
        default: 'in_progress'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Exam = mongoose.model('Exam', ExamSchema);
const ExamAttempt = mongoose.model('ExamAttempt', ExamAttemptSchema);

module.exports = { Exam, ExamAttempt };
