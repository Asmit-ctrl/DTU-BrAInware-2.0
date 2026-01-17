require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const path = require('path');
const { Quiz, QuizAttempt, Analytics, Lesson, Chapter } = require('./models/Quiz');
const { Exam, ExamAttempt } = require('./models/Exam');
const { Assignment, AssignmentAttempt } = require('./models/Assignment');
const { Doubt } = require('./models/Doubt');
const class9Quizzes = require('./data/quizData');
const { analyzeStudentPerformance } = require('./services/analyticsAgent');
const { generateTeachingLesson, generateChapterContent, determineMasteryLevel } = require('./services/teacherAgent');
const { generateExam, calculateScore } = require('./services/examAgent');
const { generateAssignment, calculateStudentAnalytics } = require('./services/assignmentAgent');
const { resolveDoubt, continueDoubt, generateVideo, getDefaultManimCode } = require('./services/doubtAgent');
const { generateScheduleFromContext, getScheduleRecommendation } = require('./services/scheduleAgent');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key-change-in-production';

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/parentStudentPortal';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await initializeQuizzes();
  })
  .catch(err => {
    console.log('MongoDB connection error:', err.message);
    console.log('Running without MongoDB - quiz data will not persist');
  });

// Initialize quizzes in database
async function initializeQuizzes() {
  try {
    // Check if quizzes already exist
    const existingCount = await Quiz.countDocuments();
    
    // Only create quizzes if none exist
    if (existingCount === 0) {
      for (const quizData of class9Quizzes) {
        await Quiz.create(quizData);
        console.log(`Quiz created: ${quizData.title}`);
      }
      console.log('Quiz initialization complete');
    } else {
      console.log(`Found ${existingCount} existing quizzes in database`);
    }
  } catch (error) {
    console.log('Error initializing quizzes:', error.message);
  }
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increased limit for image uploads
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files for generated videos and audio
app.use('/videos', express.static(path.join(__dirname, 'output', 'videos')));
app.use('/audio', express.static(path.join(__dirname, 'output', 'audio')));

// In-memory database (replace with real database in production)
let parents = [];
let students = [];

// In-memory quiz storage (fallback if MongoDB not available)
let inMemoryQuizzes = [...class9Quizzes];
let inMemoryAttempts = [];

// Generate unique ID
const generateId = () => {
  return 'P' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const generateStudentId = () => {
  return 'S' + Math.random().toString(36).substr(2, 8).toUpperCase();
};

const generateAttemptId = () => {
  return 'ATT' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Parent Registration
app.post('/api/parent/register', async (req, res) => {
  try {
    const { name, password, email, phone } = req.body;
    
    // Check if parent already exists
    const existingParent = parents.find(p => p.name === name);
    if (existingParent) {
      return res.status(400).json({ message: 'Parent with this name already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const parentId = generateId();
    
    const newParent = {
      id: uuidv4(),
      parentId,
      name,
      password: hashedPassword,
      email: email || '',
      phone: phone || '',
      profile: {
        address: '',
        city: '',
        state: '',
        zipCode: '',
        profileImage: ''
      },
      students: [],
      createdAt: new Date()
    };
    
    parents.push(newParent);
    
    res.status(201).json({ 
      message: 'Registration successful', 
      parentId,
      name 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Parent Login
app.post('/api/parent/login', async (req, res) => {
  try {
    const { parentId, password } = req.body;
    
    const parent = parents.find(p => p.parentId === parentId);
    if (!parent) {
      return res.status(400).json({ message: 'Invalid Parent ID or password' });
    }
    
    const isMatch = await bcrypt.compare(password, parent.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Parent ID or password' });
    }
    
    const token = jwt.sign(
      { id: parent.id, parentId: parent.parentId, role: 'parent' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: parent.id,
        parentId: parent.parentId, 
        name: parent.name,
        email: parent.email,
        phone: parent.phone,
        profile: parent.profile,
        role: 'parent'
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Registration (by Parent)
app.post('/api/student/register', verifyToken, async (req, res) => {
  try {
    const { name, password, grade, dateOfBirth } = req.body;
    const parentId = req.user.id;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = generateStudentId();
    
    const newStudent = {
      id: uuidv4(),
      studentId,
      name,
      password: hashedPassword,
      grade: grade || '',
      dateOfBirth: dateOfBirth || '',
      parentId,
      profile: {
        school: '',
        class: '',
        section: '',
        profileImage: ''
      },
      createdAt: new Date()
    };
    
    students.push(newStudent);
    
    // Add student to parent's students list
    const parent = parents.find(p => p.id === parentId);
    if (parent) {
      parent.students.push(studentId);
    }
    
    res.status(201).json({ 
      message: 'Student registered successfully', 
      studentId,
      name 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Student Login
app.post('/api/student/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    
    const student = students.find(s => s.studentId === studentId);
    if (!student) {
      return res.status(400).json({ message: 'Invalid Student ID or password' });
    }
    
    const isMatch = await bcrypt.compare(password, student.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Student ID or password' });
    }
    
    const token = jwt.sign(
      { id: student.id, studentId: student.studentId, role: 'student' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ 
      token, 
      user: { 
        id: student.id,
        studentId: student.studentId, 
        name: student.name,
        grade: student.grade,
        profile: student.profile,
        role: 'student'
      } 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Parent Profile
app.get('/api/parent/profile', verifyToken, async (req, res) => {
  try {
    const parent = parents.find(p => p.id === req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    res.json({
      parentId: parent.parentId,
      name: parent.name,
      email: parent.email,
      phone: parent.phone,
      profile: parent.profile,
      students: parent.students
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Parent Profile
app.put('/api/parent/profile', verifyToken, async (req, res) => {
  try {
    const { name, email, phone, profile } = req.body;
    const parentIndex = parents.findIndex(p => p.id === req.user.id);
    
    if (parentIndex === -1) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    parents[parentIndex] = {
      ...parents[parentIndex],
      name: name || parents[parentIndex].name,
      email: email || parents[parentIndex].email,
      phone: phone || parents[parentIndex].phone,
      profile: { ...parents[parentIndex].profile, ...profile }
    };
    
    res.json({ message: 'Profile updated successfully', profile: parents[parentIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Student Profile
app.get('/api/student/profile', verifyToken, async (req, res) => {
  try {
    const student = students.find(s => s.id === req.user.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({
      studentId: student.studentId,
      name: student.name,
      grade: student.grade,
      dateOfBirth: student.dateOfBirth,
      profile: student.profile
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Student Profile
app.put('/api/student/profile', verifyToken, async (req, res) => {
  try {
    const { name, grade, dateOfBirth, profile } = req.body;
    const studentIndex = students.findIndex(s => s.id === req.user.id);
    
    if (studentIndex === -1) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    students[studentIndex] = {
      ...students[studentIndex],
      name: name || students[studentIndex].name,
      grade: grade || students[studentIndex].grade,
      dateOfBirth: dateOfBirth || students[studentIndex].dateOfBirth,
      profile: { ...students[studentIndex].profile, ...profile }
    };
    
    res.json({ message: 'Profile updated successfully', profile: students[studentIndex] });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Parent's Students
app.get('/api/parent/students', verifyToken, async (req, res) => {
  try {
    const parent = parents.find(p => p.id === req.user.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    const parentStudents = students.filter(s => s.parentId === req.user.id);
    res.json(parentStudents.map(s => ({
      studentId: s.studentId,
      name: s.name,
      grade: s.grade
    })));
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comprehensive student context for Parent's chatbot
app.get('/api/parent/student-context/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    const parent = parents.find(p => p.id === req.user.id);
    
    if (!parent) {
      return res.status(404).json({ message: 'Parent not found' });
    }
    
    // Find the student
    const student = students.find(s => s.studentId === studentId || s.id === studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Verify parent has access to this student
    if (student.parentId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied to this student' });
    }
    
    // Fetch quiz results from MongoDB
    let quizResults = [];
    if (mongoose.connection.readyState === 1) {
      quizResults = await Quiz.find({ 
        'results.studentId': studentId 
      }).select('title subject grade results');
      
      // Extract only this student's results
      quizResults = quizResults.map(quiz => {
        const studentResult = quiz.results.find(r => r.studentId === studentId);
        return {
          quizTitle: quiz.title,
          subject: quiz.subject,
          grade: quiz.grade,
          score: studentResult?.score || 0,
          totalQuestions: studentResult?.totalQuestions || 0,
          percentage: studentResult?.percentage || 0,
          completedAt: studentResult?.completedAt
        };
      }).filter(r => r.completedAt);
    }
    
    // Fetch exam results
    let examResults = [];
    if (mongoose.connection.readyState === 1) {
      examResults = await Exam.find({ studentId }).select('subject topic score totalQuestions percentage completedAt weakAreas strengths');
    }
    
    // Fetch assignment results
    let assignmentResults = [];
    if (mongoose.connection.readyState === 1) {
      assignmentResults = await Assignment.find({ studentId }).select('title subject score totalMarks percentage completedAt feedback');
    }
    
    // Fetch doubt history
    let doubtHistory = [];
    if (mongoose.connection.readyState === 1) {
      doubtHistory = await Doubt.find({ studentId }).select('messages status createdAt').sort({ createdAt: -1 }).limit(10);
    }
    
    // Calculate overall statistics
    const allScores = [
      ...quizResults.map(r => r.percentage),
      ...examResults.map(r => r.percentage),
      ...assignmentResults.map(r => r.percentage)
    ].filter(s => s > 0);
    
    const averageScore = allScores.length > 0 
      ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) 
      : 0;
    
    // Identify weak areas and strengths from exams
    const weakAreas = [...new Set(examResults.flatMap(e => e.weakAreas || []))];
    const strengths = [...new Set(examResults.flatMap(e => e.strengths || []))];
    
    // Build comprehensive context
    const studentContext = {
      studentInfo: {
        id: student.studentId || student.id,
        name: student.name,
        grade: student.grade,
        dateOfBirth: student.dateOfBirth,
        profile: student.profile || {}
      },
      academicSummary: {
        totalQuizzesTaken: quizResults.length,
        totalExamsTaken: examResults.length,
        totalAssignments: assignmentResults.length,
        averageScore: averageScore,
        recentDoubts: doubtHistory.length
      },
      quizPerformance: quizResults.slice(0, 5).map(r => ({
        title: r.quizTitle,
        subject: r.subject,
        score: `${r.score}/${r.totalQuestions}`,
        percentage: r.percentage,
        date: r.completedAt
      })),
      examPerformance: examResults.slice(0, 5).map(e => ({
        subject: e.subject,
        topic: e.topic,
        score: `${e.score}/${e.totalQuestions}`,
        percentage: e.percentage,
        date: e.completedAt
      })),
      assignmentPerformance: assignmentResults.slice(0, 5).map(a => ({
        title: a.title,
        subject: a.subject,
        score: `${a.score}/${a.totalMarks}`,
        percentage: a.percentage,
        feedback: a.feedback,
        date: a.completedAt
      })),
      learningInsights: {
        weakAreas: weakAreas.slice(0, 5),
        strengths: strengths.slice(0, 5),
        recentTopics: examResults.slice(0, 3).map(e => e.topic)
      },
      recentDoubts: doubtHistory.slice(0, 3).map(d => ({
        question: d.messages?.[0]?.content?.substring(0, 100) || 'Image-based doubt',
        status: d.status,
        date: d.createdAt
      }))
    };
    
    res.json(studentContext);
  } catch (error) {
    console.error('Error fetching student context:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== QUIZ ROUTES ====================

// Get all available quizzes
app.get('/api/quizzes', verifyToken, async (req, res) => {
  try {
    let quizzes;
    if (mongoose.connection.readyState === 1) {
      quizzes = await Quiz.find({}, { questions: 0 });
    } else {
      quizzes = inMemoryQuizzes.map(q => ({
        quizId: q.quizId,
        title: q.title,
        description: q.description,
        subject: q.subject,
        grade: q.grade,
        totalQuestions: q.totalQuestions,
        timeLimit: q.timeLimit
      }));
    }
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz by ID (for taking quiz)
app.get('/api/quizzes/:quizId', verifyToken, async (req, res) => {
  try {
    let quiz;
    if (mongoose.connection.readyState === 1) {
      quiz = await Quiz.findOne({ quizId: req.params.quizId });
    } else {
      quiz = inMemoryQuizzes.find(q => q.quizId === req.params.quizId);
    }
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const quizForStudent = {
      ...(quiz.toObject ? quiz.toObject() : quiz),
      questions: quiz.questions.map(q => ({
        questionId: q.questionId,
        questionText: q.questionText,
        options: q.options,
        hint: q.hint,
        difficulty: q.difficulty
      }))
    };
    
    res.json(quizForStudent);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit quiz and save results
app.post('/api/quizzes/:quizId/submit', verifyToken, async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, startedAt, completedAt } = req.body;
    
    let quiz;
    if (mongoose.connection.readyState === 1) {
      quiz = await Quiz.findOne({ quizId });
    } else {
      quiz = inMemoryQuizzes.find(q => q.quizId === quizId);
    }
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    const student = students.find(s => s.id === req.user.id);
    
    let correctAnswers = 0;
    let wrongAnswers = 0;
    let hintUsageCount = 0;
    let mistakeRepetitionCount = 0;
    let maxConsecutiveWrong = 0;
    let currentConsecutiveWrong = 0;
    let totalTimeTaken = 0;
    let hintsUsedCorrect = 0;
    let hintsUsedTotal = 0;
    
    const questionResults = [];
    const timePerQuestion = [];
    
    for (const answer of answers) {
      const question = quiz.questions.find(q => q.questionId === answer.questionId);
      if (!question) continue;
      
      const isCorrect = question.correctAnswer === answer.selectedAnswer;
      
      if (isCorrect) {
        correctAnswers++;
        currentConsecutiveWrong = 0;
        if (answer.hintUsed) hintsUsedCorrect++;
      } else {
        wrongAnswers++;
        currentConsecutiveWrong++;
        maxConsecutiveWrong = Math.max(maxConsecutiveWrong, currentConsecutiveWrong);
      }
      
      if (answer.hintUsed) {
        hintUsageCount++;
        hintsUsedTotal++;
      }
      
      if (answer.attemptCount > 1) {
        mistakeRepetitionCount++;
      }
      
      totalTimeTaken += answer.timeTaken || 0;
      
      questionResults.push({
        questionId: answer.questionId,
        questionText: question.questionText,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        hintUsed: answer.hintUsed || false,
        timeTaken: answer.timeTaken || 0,
        attemptCount: answer.attemptCount || 1
      });
      
      timePerQuestion.push({
        questionId: answer.questionId,
        timeTaken: answer.timeTaken || 0,
        isCorrect,
        selectedAnswer: answer.selectedAnswer,
        hintUsed: answer.hintUsed || false,
        attempts: answer.attemptCount || 1
      });
    }
    
    const totalQuestions = quiz.questions.length;
    const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const postRevisionAccuracy = hintsUsedTotal > 0 ? Math.round((hintsUsedCorrect / hintsUsedTotal) * 100) : 0;
    
    const attemptData = {
      attemptId: generateAttemptId(),
      quizId,
      studentId: req.user.studentId || req.user.id,
      studentName: student?.name || 'Unknown',
      score: correctAnswers,  // Add score field
      accuracy,
      totalQuestions,
      correctAnswers,
      wrongAnswers,
      mistakeRepetitionCount,
      hintUsageCount,
      consecutiveWrongAnswers: maxConsecutiveWrong,
      postRevisionAccuracy,
      totalTimeTaken,
      timePerQuestion: timePerQuestion.map(q => q.timeTaken), // Store just the time values as array
      answers: questionResults, // Store as 'answers' field
      quizTitle: quiz.title,
      subject: quiz.subject,
      grade: quiz.grade,
      startedAt: new Date(startedAt),
      completedAt: new Date(completedAt),
      date: new Date()
    };
    
    if (mongoose.connection.readyState === 1) {
      await QuizAttempt.create(attemptData);
    } else {
      inMemoryAttempts.push(attemptData);
    }
    
    res.json({
      message: 'Quiz submitted successfully',
      result: {
        attemptId: attemptData.attemptId,
        accuracy,
        correctAnswers,
        wrongAnswers,
        totalQuestions,
        hintUsageCount,
        mistakeRepetitionCount,
        consecutiveWrongAnswers: maxConsecutiveWrong,
        postRevisionAccuracy,
        totalTimeTaken,
        questionResults
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student's quiz history
app.get('/api/quiz-history', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.id;
    
    let attempts;
    if (mongoose.connection.readyState === 1) {
      attempts = await QuizAttempt.find({ studentId }).sort({ date: -1 });
    } else {
      attempts = inMemoryAttempts.filter(a => a.studentId === studentId).sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific quiz attempt details
app.get('/api/quiz-history/:attemptId', verifyToken, async (req, res) => {
  try {
    let attempt;
    if (mongoose.connection.readyState === 1) {
      attempt = await QuizAttempt.findOne({ attemptId: req.params.attemptId });
    } else {
      attempt = inMemoryAttempts.find(a => a.attemptId === req.params.attemptId);
    }
    
    if (!attempt) {
      return res.status(404).json({ message: 'Quiz attempt not found' });
    }
    
    res.json(attempt);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get quiz statistics for a student
app.get('/api/quiz-stats', verifyToken, async (req, res) => {
  try {
    const studentId = req.user.studentId || req.user.id;
    
    let attempts;
    if (mongoose.connection.readyState === 1) {
      attempts = await QuizAttempt.find({ studentId });
    } else {
      attempts = inMemoryAttempts.filter(a => a.studentId === studentId);
    }
    
    if (attempts.length === 0) {
      return res.json({
        totalQuizzesTaken: 0,
        averageAccuracy: 0,
        totalQuestionsAnswered: 0,
        totalCorrect: 0,
        totalHintsUsed: 0,
        subjectWiseStats: {}
      });
    }
    
    const totalQuizzesTaken = attempts.length;
    const totalAccuracy = attempts.reduce((sum, a) => sum + a.accuracy, 0);
    const averageAccuracy = Math.round(totalAccuracy / totalQuizzesTaken);
    const totalQuestionsAnswered = attempts.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalCorrect = attempts.reduce((sum, a) => sum + a.correctAnswers, 0);
    const totalHintsUsed = attempts.reduce((sum, a) => sum + a.hintUsageCount, 0);
    
    const subjectWiseStats = {};
    for (const attempt of attempts) {
      if (!subjectWiseStats[attempt.subject]) {
        subjectWiseStats[attempt.subject] = {
          quizzesTaken: 0,
          totalAccuracy: 0,
          totalCorrect: 0,
          totalQuestions: 0
        };
      }
      subjectWiseStats[attempt.subject].quizzesTaken++;
      subjectWiseStats[attempt.subject].totalAccuracy += attempt.accuracy;
      subjectWiseStats[attempt.subject].totalCorrect += attempt.correctAnswers;
      subjectWiseStats[attempt.subject].totalQuestions += attempt.totalQuestions;
    }
    
    for (const subject in subjectWiseStats) {
      subjectWiseStats[subject].averageAccuracy = Math.round(
        subjectWiseStats[subject].totalAccuracy / subjectWiseStats[subject].quizzesTaken
      );
    }
    
    res.json({
      totalQuizzesTaken,
      averageAccuracy,
      totalQuestionsAnswered,
      totalCorrect,
      totalHintsUsed,
      subjectWiseStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student analytics report
app.get('/api/analytics/:studentId', verifyToken, async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get latest analytics for this student
    const analytics = await Analytics.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      message: 'Analytics retrieved successfully',
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Trigger analytics generation for a student
app.post('/api/analytics/generate', verifyToken, async (req, res) => {
  try {
    const { studentId, studentName } = req.body;
    
    if (!studentId || !studentName) {
      return res.status(400).json({ message: 'studentId and studentName are required' });
    }

    // Get all quiz attempts for this student
    const quizAttempts = await QuizAttempt.find({ studentId })
      .sort({ completedAt: 1 });

    if (quizAttempts.length === 0) {
      return res.status(400).json({ 
        message: 'No quiz attempts found for this student. Take at least one quiz first.' 
      });
    }

    console.log(`\nGenerating analytics for ${studentName} (${studentId}) with ${quizAttempts.length} attempts`);

    // Call analytics agent
    const analyticsResult = await analyzeStudentPerformance(
      studentId, 
      studentName, 
      quizAttempts
    );

    if (!analyticsResult) {
      return res.status(500).json({ 
        message: 'Failed to generate analytics. Check server logs.' 
      });
    }

    // Parse AI response to extract structured data
    const fullAnalysis = analyticsResult.answer || '';
    
    // Enhanced parsing logic with robust regex patterns
    let performanceStatus = 'Stagnation';
    const perfMatch = fullAnalysis.match(/Performance Status:\s*\*?\*?([^*\n-]+)/i);
    if (perfMatch) {
      const perfText = perfMatch[1].toLowerCase();
      if (perfText.includes('improvement')) performanceStatus = 'Improvement';
      else if (perfText.includes('decline')) performanceStatus = 'Decline';
      else if (perfText.includes('stagnation')) performanceStatus = 'Stagnation';
    }
    
    let riskLevel = 'Medium';
    const riskMatch = fullAnalysis.match(/Risk Level:\s*\*?\*?(HIGH|MEDIUM|LOW|High|Medium|Low)/i);
    if (riskMatch) {
      const riskText = riskMatch[1].toUpperCase();
      if (riskText === 'HIGH') riskLevel = 'High';
      else if (riskText === 'LOW') riskLevel = 'Low';
      else riskLevel = 'Medium';
    }
    
    // Extract weak concepts more intelligently
    const weakConcepts = [];
    const weakSection = fullAnalysis.match(/Identified Weak Concepts:([^]*?)(?=Risk Level:|---|\n\n##)/i);
    if (weakSection) {
      const conceptText = weakSection[1];
      // Look for specific mentions with WEAK tag or in bold
      if (/Polynomial.*WEAK/i.test(conceptText)) weakConcepts.push('Polynomials');
      if (/Number System.*WEAK/i.test(conceptText)) weakConcepts.push('Number System');
      if (/Algebra.*WEAK/i.test(conceptText)) weakConcepts.push('Algebraic Expressions');
      
      // Also check for general mentions if no WEAK tag found
      if (weakConcepts.length === 0) {
        if (/polynomial/i.test(conceptText)) weakConcepts.push('Polynomials');
        if (/number system/i.test(conceptText)) weakConcepts.push('Number System');
        if (/algebra/i.test(conceptText)) weakConcepts.push('Algebraic Expressions');
      }
    }
    
    // Extract recommended action with complete context
    let recommendedAction = 'Continue practice and review weak areas.';
    const actionMatch = fullAnalysis.match(/Recommended Next Action:([^]*?)(?=If you can share|$)/i);
    if (actionMatch) {
      recommendedAction = actionMatch[1]
        .replace(/\*\*/g, '')
        .replace(/^\s*-+\s*/gm, '')
        .replace(/\n{3,}/g, '\n\n')
        .trim()
        .substring(0, 1500); // Increased limit
    }
    
    // Format the full analysis for beautiful display with section breaks
    const formattedAnalysis = fullAnalysis
      .split(/---+/)
      .map(section => section.trim())
      .filter(section => section.length > 0)
      .join('\n\n---\n\n');
    
    // Calculate metrics
    const totalAttempts = quizAttempts.length;
    const averageAccuracy = quizAttempts.reduce((sum, a) => sum + a.accuracy, 0) / totalAttempts;
    const averageHintUsage = quizAttempts.reduce((sum, a) => sum + a.hintUsageCount, 0) / totalAttempts;
    const averageMistakeRepetitions = quizAttempts.reduce((sum, a) => sum + a.mistakeRepetitionCount, 0) / totalAttempts;
    const maxConsecutiveWrong = Math.max(...quizAttempts.map(a => a.consecutiveWrongAnswers));
    const averageTimePerQuestion = quizAttempts.reduce((sum, a) => {
      const totalTime = a.timePerQuestion.reduce((s, t) => s + t, 0);
      return sum + (totalTime / a.timePerQuestion.length);
    }, 0) / totalAttempts;

    // Save analytics to database
    const newAnalytics = new Analytics({
      analyticsId: 'ANL-' + Date.now(),
      studentId,
      studentName,
      sessionId: analyticsResult.sessionId,
      messageId: analyticsResult.messageId,
      performanceStatus,
      weakConcepts,
      riskLevel,
      recommendedAction,
      fullAnalysis: formattedAnalysis,
      totalAttempts,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      averageHintUsage: Math.round(averageHintUsage * 100) / 100,
      averageMistakeRepetitions: Math.round(averageMistakeRepetitions * 100) / 100,
      maxConsecutiveWrong,
      averageTimePerQuestion: Math.round(averageTimePerQuestion * 100) / 100,
      analyzedQuizzes: quizAttempts.map(a => a.quizId)
    });

    await newAnalytics.save();

    console.log(`✅ Analytics saved with ID: ${newAnalytics.analyticsId}`);

    res.json({
      message: 'Analytics generated successfully',
      data: newAnalytics
    });

  } catch (error) {
    console.error('Analytics generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== TEACHER/LESSON ENDPOINTS ====================

// Generate a teaching lesson based on student analytics
app.post('/api/lessons/generate', async (req, res) => {
  try {
    const { studentId, topic } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    console.log(`\n📚 Generating lesson for student: ${studentId}, topic: ${topic || 'auto'}`);

    // Get student info
    const student = students.find(s => s.id === studentId);
    const studentName = student ? student.name : 'Student';

    // Get latest analytics for the student - try multiple ID formats
    let analytics = await Analytics.findOne({ studentId }).sort({ createdAt: -1 });
    
    // If not found, also try with the raw studentId
    if (!analytics) {
      console.log(`Analytics not found for studentId: ${studentId}`);
      // List all analytics for debugging
      const allAnalytics = await Analytics.find({});
      console.log(`Available analytics studentIds: ${allAnalytics.map(a => a.studentId).join(', ')}`);
      
      // Try to find by partial match
      if (allAnalytics.length > 0) {
        analytics = allAnalytics[0]; // Use the first one available for now
        console.log(`Using analytics: ${analytics.analyticsId} (studentId: ${analytics.studentId})`);
      }
    }
    
    if (!analytics) {
      return res.status(400).json({ 
        message: 'No analytics found. Please generate analytics first before creating lessons.' 
      });
    }

    // Get quiz attempts for additional context
    const quizAttempts = await QuizAttempt.find({ studentId }).sort({ completedAt: -1 }).limit(5);

    // Generate the teaching lesson (WITHOUT waiting for Manim rendering)
    const lessonResult = await generateTeachingLesson(
      studentId,
      studentName,
      analytics,
      quizAttempts,
      topic,
      false  // Don't render Manim yet - we'll do it in background
    );

    if (!lessonResult.success) {
      return res.status(500).json({ 
        message: 'Failed to generate lesson', 
        error: lessonResult.error 
      });
    }

    // Save lesson to database
    const newLesson = new Lesson({
      lessonId: lessonResult.lessonId,
      studentId,
      studentName,
      topic: lessonResult.topic,
      masteryLevel: lessonResult.masteryLevel,
      teachingSummary: lessonResult.teachingSummary,
      teacherGuidance: lessonResult.teacherGuidance,
      fullResponse: lessonResult.fullResponse,
      manimCode: lessonResult.manimCode,
      scriptPath: lessonResult.scriptPath,
      videoUrl: lessonResult.videoUrl,
      renderStatus: lessonResult.renderStatus,
      renderError: lessonResult.renderError,
      sessionId: lessonResult.sessionId,
      analyticsId: analytics.analyticsId,
      status: 'ready'
    });

    await newLesson.save();

    console.log(`✅ Lesson saved with ID: ${newLesson.lessonId}`);

    // Return immediately - don't wait for Manim rendering
    const response = res.json({
      message: 'Lesson generated successfully',
      data: newLesson
    });

    // Render Manim animation in the background
    if (newLesson.manimCode && newLesson.scriptPath) {
      console.log(`⏳ Starting background Manim rendering for lesson: ${newLesson.lessonId}`);
      (async () => {
        try {
          const { renderManimAnimation } = require('./services/teacherAgent');
          const renderResult = await renderManimAnimation(newLesson.scriptPath, newLesson.lessonId);
          
          if (renderResult.success) {
            newLesson.videoUrl = renderResult.relativePath;
            newLesson.renderStatus = 'completed';
            console.log(`✅ Animation rendered: ${newLesson.videoUrl}`);
          } else {
            newLesson.renderStatus = 'failed';
            newLesson.renderError = renderResult.error;
            console.log(`⚠️ Animation rendering failed: ${renderResult.error}`);
          }
          
          await newLesson.save();
        } catch (error) {
          console.error(`❌ Background rendering error: ${error.message}`);
          newLesson.renderStatus = 'error';
          newLesson.renderError = error.message;
          await newLesson.save();
        }
      })();
    }

    return response;

  } catch (error) {
    console.error('Lesson generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Generate chapters based on all weak concepts
app.post('/api/chapters/generate', async (req, res) => {
  try {
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    console.log(`\n📖 Generating chapters for student: ${studentId}`);

    // Get student info
    const student = students.find(s => s.id === studentId);
    const studentName = student ? student.name : 'Student';

    // Get latest analytics - try multiple approaches
    let analytics = await Analytics.findOne({ studentId }).sort({ createdAt: -1 });
    
    if (!analytics) {
      console.log(`Analytics not found for studentId: ${studentId}`);
      const allAnalytics = await Analytics.find({});
      console.log(`Available analytics studentIds: ${allAnalytics.map(a => a.studentId).join(', ')}`);
      
      if (allAnalytics.length > 0) {
        analytics = allAnalytics[0];
        console.log(`Using analytics: ${analytics.analyticsId}`);
      }
    }
    
    if (!analytics) {
      return res.status(400).json({ 
        message: 'No analytics found. Please generate analytics first.' 
      });
    }

    const weakConcepts = analytics.weakConcepts || [];
    
    if (weakConcepts.length === 0) {
      return res.status(400).json({ 
        message: 'No weak concepts identified. Great job!' 
      });
    }

    // Create chapter
    const chapterId = 'CHP-' + Date.now();
    const masteryLevel = determineMasteryLevel(analytics);

    const newChapter = new Chapter({
      chapterId,
      studentId,
      studentName,
      title: `Remediation: ${weakConcepts.join(', ')}`,
      description: `Personalized lessons based on your weak areas: ${weakConcepts.join(', ')}`,
      masteryLevel,
      lessons: [],
      totalLessons: weakConcepts.length,
      completedLessons: 0,
      progressPercent: 0,
      analyticsId: analytics.analyticsId
    });

    await newChapter.save();

    // Generate lessons for each weak concept (async - don't wait)
    const quizAttempts = await QuizAttempt.find({ studentId }).sort({ completedAt: -1 }).limit(5);

    // Start generating lessons in background
    (async () => {
      for (let i = 0; i < weakConcepts.length; i++) {
        const concept = weakConcepts[i];
        console.log(`📚 Generating lesson ${i + 1}/${weakConcepts.length}: ${concept}`);

        try {
          const lessonResult = await generateTeachingLesson(
            studentId,
            studentName,
            analytics,
            quizAttempts,
            concept
          );

          if (lessonResult.success) {
            const newLesson = new Lesson({
              lessonId: lessonResult.lessonId,
              studentId,
              studentName,
              topic: concept,
              masteryLevel: lessonResult.masteryLevel,
              teachingSummary: lessonResult.teachingSummary,
              teacherGuidance: lessonResult.teacherGuidance,
              fullResponse: lessonResult.fullResponse,
              manimCode: lessonResult.manimCode,
              scriptPath: lessonResult.scriptPath,
              videoUrl: lessonResult.videoUrl,
              renderStatus: lessonResult.renderStatus,
              renderError: lessonResult.renderError,
              sessionId: lessonResult.sessionId,
              analyticsId: analytics.analyticsId,
              status: 'ready'
            });

            await newLesson.save();

            // Update chapter with lesson
            await Chapter.findOneAndUpdate(
              { chapterId },
              {
                $push: {
                  lessons: {
                    lessonId: newLesson.lessonId,
                    topic: concept,
                    order: i + 1,
                    status: 'ready'
                  }
                },
                updatedAt: new Date()
              }
            );

            console.log(`✅ Lesson saved: ${newLesson.lessonId}`);
          }
        } catch (err) {
          console.error(`❌ Error generating lesson for ${concept}:`, err.message);
        }
      }

      console.log(`✅ All lessons generated for chapter: ${chapterId}`);
    })();

    res.json({
      message: 'Chapter creation started. Lessons are being generated.',
      data: newChapter
    });

  } catch (error) {
    console.error('Chapter generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all lessons for a student
app.get('/api/lessons/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const lessons = await Lesson.find({ studentId }).sort({ createdAt: -1 });

    res.json({
      message: 'Lessons retrieved successfully',
      count: lessons.length,
      data: lessons
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific lesson
app.get('/api/lesson/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findOne({ lessonId });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update view count
    lesson.viewCount += 1;
    lesson.viewedAt = new Date();
    if (lesson.status === 'ready') {
      lesson.status = 'viewed';
    }
    await lesson.save();

    res.json({
      message: 'Lesson retrieved successfully',
      data: lesson
    });
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark lesson as completed
app.post('/api/lesson/:lessonId/complete', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findOne({ lessonId });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    lesson.status = 'completed';
    lesson.completedAt = new Date();
    await lesson.save();

    // Update chapter progress if exists
    if (lesson.analyticsId) {
      const chapter = await Chapter.findOne({ 
        analyticsId: lesson.analyticsId,
        studentId: lesson.studentId 
      });

      if (chapter) {
        const completedCount = await Lesson.countDocuments({
          studentId: lesson.studentId,
          analyticsId: lesson.analyticsId,
          status: 'completed'
        });

        chapter.completedLessons = completedCount;
        chapter.progressPercent = Math.round((completedCount / chapter.totalLessons) * 100);
        
        if (chapter.completedLessons >= chapter.totalLessons) {
          chapter.completedAt = new Date();
        }
        
        await chapter.save();
      }
    }

    res.json({
      message: 'Lesson marked as completed',
      data: lesson
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all chapters for a student
app.get('/api/chapters/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const chapters = await Chapter.find({ studentId }).sort({ createdAt: -1 });

    res.json({
      message: 'Chapters retrieved successfully',
      count: chapters.length,
      data: chapters
    });
  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific chapter with lessons
app.get('/api/chapter/:chapterId', async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await Chapter.findOne({ chapterId });

    if (!chapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    // Get full lesson details
    const lessonIds = chapter.lessons.map(l => l.lessonId);
    const fullLessons = await Lesson.find({ lessonId: { $in: lessonIds } });

    res.json({
      message: 'Chapter retrieved successfully',
      data: {
        ...chapter.toObject(),
        fullLessons
      }
    });
  } catch (error) {
    console.error('Error fetching chapter:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Re-render Manim animation for a lesson
app.post('/api/lesson/:lessonId/render', async (req, res) => {
  try {
    const { lessonId } = req.params;
    const lesson = await Lesson.findOne({ lessonId });

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (!lesson.manimCode) {
      return res.status(400).json({ message: 'No Manim code available for this lesson' });
    }

    // Import render function
    const { renderManimAnimation } = require('./services/teacherAgent');
    const path = require('path');
    const fs = require('fs');

    // Ensure script exists
    const MANIM_SCRIPTS_DIR = path.join(__dirname, 'manim_scripts');
    if (!fs.existsSync(MANIM_SCRIPTS_DIR)) {
      fs.mkdirSync(MANIM_SCRIPTS_DIR, { recursive: true });
    }

    const scriptPath = path.join(MANIM_SCRIPTS_DIR, `lesson_${lessonId}.py`);
    fs.writeFileSync(scriptPath, lesson.manimCode);

    lesson.renderStatus = 'rendering';
    await lesson.save();

    // Render in background
    renderManimAnimation(scriptPath, lessonId)
      .then(async (result) => {
        if (result.success) {
          lesson.videoUrl = result.relativePath;
          lesson.renderStatus = 'completed';
        } else {
          lesson.renderStatus = 'failed';
          lesson.renderError = result.error;
        }
        await lesson.save();
      })
      .catch(async (error) => {
        lesson.renderStatus = 'failed';
        lesson.renderError = error.message;
        await lesson.save();
      });

    res.json({
      message: 'Rendering started',
      data: lesson
    });

  } catch (error) {
    console.error('Error rendering lesson:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== EXAM ENDPOINTS ====================

// Generate a new exam for a topic
app.post('/api/exam/generate', async (req, res) => {
  try {
    const { studentId, topic } = req.body;

    if (!studentId || !topic) {
      return res.status(400).json({ message: 'Student ID and topic are required' });
    }

    const studentName = 'Student'; // Default name, can be enhanced later if user model is added

    console.log(`\n📋 Generating exam for ${studentName} on topic: ${topic}`);

    // Generate exam using AI agent
    const result = await generateExam(studentId, studentName, topic);

    if (!result.success) {
      return res.status(500).json({ 
        message: 'Failed to generate exam', 
        error: result.error,
        rawAnswer: result.rawAnswer 
      });
    }

    // Save exam to database
    const newExam = new Exam({
      examId: result.examId,
      studentId,
      studentName,
      topic: result.topic,
      examTitle: result.examData.examTitle || `${topic} Examination`,
      totalQuestions: result.examData.totalQuestions || 30,
      totalMarks: result.examData.totalMarks || 100,
      duration: result.examData.duration || '45 minutes',
      durationMinutes: parseInt(result.examData.duration) || 45,
      questions: result.examData.questions,
      sessionId: result.sessionId,
      status: 'generated'
    });

    await newExam.save();
    console.log(`✅ Exam saved: ${newExam.examId}`);

    // Return exam without correct answers for taking the exam
    const examForStudent = {
      ...newExam.toObject(),
      questions: newExam.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        marks: q.marks,
        concept: q.concept
        // correctAnswer and explanation hidden
      }))
    };

    res.json({
      message: 'Exam generated successfully',
      data: examForStudent
    });

  } catch (error) {
    console.error('Exam generation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all exams for a student
app.get('/api/exams/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const exams = await Exam.find({ studentId }).sort({ createdAt: -1 });
    
    // Hide answers for pending exams
    const examsForStudent = exams.map(exam => ({
      ...exam.toObject(),
      questions: exam.status === 'generated' ? exam.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        marks: q.marks,
        concept: q.concept
      })) : exam.questions
    }));

    res.json({
      message: 'Exams retrieved successfully',
      count: exams.length,
      data: examsForStudent
    });
  } catch (error) {
    console.error('Error fetching exams:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific exam
app.get('/api/exam/:examId', async (req, res) => {
  try {
    const { examId } = req.params;
    const exam = await Exam.findOne({ examId });
    
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Hide answers if exam not submitted
    const examForStudent = {
      ...exam.toObject(),
      questions: exam.status === 'generated' || exam.status === 'in_progress' 
        ? exam.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            marks: q.marks,
            concept: q.concept
          })) 
        : exam.questions
    };

    res.json({
      message: 'Exam retrieved successfully',
      data: examForStudent
    });
  } catch (error) {
    console.error('Error fetching exam:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start an exam attempt
app.post('/api/exam/:examId/start', async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId } = req.body;

    const exam = await Exam.findOne({ examId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    // Check for existing incomplete attempt
    const existingAttempt = await ExamAttempt.findOne({ 
      examId, 
      studentId, 
      status: 'in_progress' 
    });

    if (existingAttempt) {
      return res.json({
        message: 'Resuming existing attempt',
        data: existingAttempt
      });
    }

    // Create new attempt
    const attempt = new ExamAttempt({
      attemptId: `ATT-${Date.now()}`,
      examId,
      studentId,
      studentName: exam.studentName,
      topic: exam.topic,
      answers: [],
      startedAt: new Date(),
      status: 'in_progress'
    });

    await attempt.save();

    // Update exam status
    exam.status = 'in_progress';
    await exam.save();

    res.json({
      message: 'Exam started',
      data: {
        attemptId: attempt.attemptId,
        examId: exam.examId,
        startedAt: attempt.startedAt,
        durationMinutes: exam.durationMinutes,
        totalQuestions: exam.totalQuestions
      }
    });

  } catch (error) {
    console.error('Error starting exam:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save answer during exam (auto-save)
app.post('/api/exam/:examId/answer', async (req, res) => {
  try {
    const { examId } = req.params;
    const { attemptId, questionId, selectedAnswer, timeTaken } = req.body;

    const attempt = await ExamAttempt.findOne({ attemptId, status: 'in_progress' });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found or already submitted' });
    }

    // Update or add answer
    const existingAnswerIndex = attempt.answers.findIndex(a => a.questionId === questionId);
    if (existingAnswerIndex >= 0) {
      attempt.answers[existingAnswerIndex].selectedAnswer = selectedAnswer;
      attempt.answers[existingAnswerIndex].timeTaken = timeTaken;
    } else {
      attempt.answers.push({ questionId, selectedAnswer, timeTaken });
    }

    await attempt.save();

    res.json({
      message: 'Answer saved',
      answeredCount: attempt.answers.length
    });

  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit exam and get results
app.post('/api/exam/:examId/submit', async (req, res) => {
  try {
    const { examId } = req.params;
    const { attemptId, answers } = req.body;

    const exam = await Exam.findOne({ examId });
    if (!exam) {
      return res.status(404).json({ message: 'Exam not found' });
    }

    let attempt = await ExamAttempt.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    // If answers provided in submission, update them
    if (answers && Object.keys(answers).length > 0) {
      Object.entries(answers).forEach(([qId, answer]) => {
        const existingIndex = attempt.answers.findIndex(a => a.questionId === parseInt(qId));
        if (existingIndex >= 0) {
          attempt.answers[existingIndex].selectedAnswer = answer;
        } else {
          attempt.answers.push({ questionId: parseInt(qId), selectedAnswer: answer });
        }
      });
    }

    // Calculate score
    const answersMap = {};
    attempt.answers.forEach(a => {
      answersMap[a.questionId] = a.selectedAnswer;
    });

    const scoreResult = calculateScore({ questions: exam.questions }, answersMap);

    // Update attempt with results
    attempt.totalScore = scoreResult.totalScore;
    attempt.maxScore = scoreResult.maxScore;
    attempt.percentage = scoreResult.percentage;
    attempt.performanceLevel = scoreResult.performanceLevel;
    attempt.easyScore = scoreResult.difficultyScores.easy;
    attempt.mediumScore = scoreResult.difficultyScores.medium;
    attempt.hardScore = scoreResult.difficultyScores.hard;
    attempt.correctCount = scoreResult.summary.correct;
    attempt.incorrectCount = scoreResult.summary.incorrect;
    attempt.unansweredCount = scoreResult.summary.unanswered;
    attempt.questionResults = scoreResult.results;
    attempt.submittedAt = new Date();
    attempt.timeTaken = Math.round((attempt.submittedAt - attempt.startedAt) / 1000);
    attempt.status = 'submitted';

    // Mark correctness in answers
    attempt.answers.forEach(a => {
      const result = scoreResult.results.find(r => r.questionId === a.questionId);
      if (result) {
        a.isCorrect = result.isCorrect;
      }
    });

    await attempt.save();

    // Update exam status
    exam.status = 'submitted';
    await exam.save();

    res.json({
      message: 'Exam submitted successfully',
      data: {
        attemptId: attempt.attemptId,
        totalScore: attempt.totalScore,
        maxScore: attempt.maxScore,
        percentage: attempt.percentage,
        performanceLevel: attempt.performanceLevel,
        summary: scoreResult.summary,
        difficultyBreakdown: {
          easy: attempt.easyScore,
          medium: attempt.mediumScore,
          hard: attempt.hardScore
        },
        timeTaken: attempt.timeTaken,
        results: scoreResult.results
      }
    });

  } catch (error) {
    console.error('Error submitting exam:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get exam attempt results
app.get('/api/exam/attempt/:attemptId', async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await ExamAttempt.findOne({ attemptId });
    
    if (!attempt) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    res.json({
      message: 'Attempt retrieved successfully',
      data: attempt
    });
  } catch (error) {
    console.error('Error fetching attempt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all attempts for a student
app.get('/api/exam/attempts/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const attempts = await ExamAttempt.find({ studentId }).sort({ createdAt: -1 });

    res.json({
      message: 'Attempts retrieved successfully',
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// ASSIGNMENT AGENT API ENDPOINTS
// ============================================

// Generate a new assignment based on student analytics
app.post('/api/assignment/generate', async (req, res) => {
  try {
    const { studentId, topic } = req.body;

    if (!studentId || !topic) {
      return res.status(400).json({ message: 'Student ID and topic are required' });
    }

    const studentName = 'Student';

    // Get the latest AI-generated analytics for this student
    const latestAnalytics = await Analytics.findOne({ studentId })
      .sort({ createdAt: -1 });

    let analyticsData;
    
    if (latestAnalytics) {
      // Use the real analytics from the Analytics page
      analyticsData = {
        performanceStatus: latestAnalytics.performanceStatus || 'Unknown',
        weakConcepts: latestAnalytics.weakConcepts || [],
        riskLevel: latestAnalytics.riskLevel || 'Medium',
        recentScores: [],  // Will calculate from quiz attempts
        averageScore: Math.round(latestAnalytics.averageAccuracy) || 0,
        recommendedAction: latestAnalytics.recommendedAction || 'Continue practice',
        topicsToImprove: latestAnalytics.weakConcepts?.slice(0, 3) || [],
        fullAnalysis: latestAnalytics.fullAnalysis
      };

      // Get recent quiz scores
      const recentQuizzes = await QuizAttempt.find({ visitorId: studentId })
        .sort({ createdAt: -1 })
        .limit(5);
      analyticsData.recentScores = recentQuizzes.map(q => 
        Math.round((q.score / q.totalQuestions) * 100)
      );

      console.log(`✅ Found existing analytics for student`);
    } else {
      // No analytics found - use defaults
      analyticsData = {
        performanceStatus: 'Unknown',
        weakConcepts: [],
        riskLevel: 'Medium',
        recentScores: [],
        averageScore: 0,
        recommendedAction: 'Start with foundational concepts',
        topicsToImprove: []
      };
      console.log(`⚠️ No analytics found - using defaults. Please generate analytics first.`);
    }

    console.log(`\n📚 Generating assignment for ${studentName} on topic: ${topic}`);
    console.log('📊 Analytics:', analyticsData);

    // Generate assignment using AI agent
    const result = await generateAssignment(studentId, studentName, topic, analyticsData);

    if (!result.success) {
      return res.status(500).json({ 
        message: 'Failed to generate assignment', 
        error: result.error 
      });
    }

    // Save assignment to database
    const newAssignment = new Assignment({
      assignmentId: result.assignmentId,
      studentId,
      studentName,
      topic: result.topic,
      assignmentTitle: result.assignmentData.assignmentTitle || `Daily Practice: ${topic}`,
      totalQuestions: result.assignmentData.totalQuestions || 10,
      totalMarks: result.assignmentData.totalMarks || 30,
      estimatedTime: result.assignmentData.estimatedTime || '20 minutes',
      difficultyBreakdown: result.assignmentData.difficultyBreakdown || { easy: 6, medium: 3, hard: 1 },
      questions: result.assignmentData.questions,
      analyticsBasedFeedback: result.assignmentData.analyticsBasedFeedback,
      predictedOutcome: result.assignmentData.predictedOutcome,
      analyticsUsed: analyticsData,
      sessionId: result.sessionId,
      status: 'generated',
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Due in 24 hours
    });

    await newAssignment.save();
    console.log(`✅ Assignment saved: ${newAssignment.assignmentId}`);

    // Return assignment without correct answers
    const assignmentForStudent = {
      ...newAssignment.toObject(),
      questions: newAssignment.questions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        marks: q.marks,
        concept: q.concept
      }))
    };

    res.status(201).json({
      message: 'Assignment generated successfully',
      data: assignmentForStudent
    });

  } catch (error) {
    console.error('Error generating assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Start an assignment attempt
app.post('/api/assignment/:assignmentId/start', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId } = req.body;

    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check for existing in-progress attempt
    const existingAttempt = await AssignmentAttempt.findOne({
      assignmentId,
      studentId,
      status: 'in_progress'
    });

    if (existingAttempt) {
      return res.json({
        message: 'Resuming existing attempt',
        data: existingAttempt
      });
    }

    // Create new attempt
    const newAttempt = new AssignmentAttempt({
      attemptId: uuidv4(),
      assignmentId,
      studentId,
      totalMarks: assignment.totalMarks,
      status: 'in_progress'
    });

    await newAttempt.save();

    // Update assignment status
    assignment.status = 'in_progress';
    await assignment.save();

    res.status(201).json({
      message: 'Assignment attempt started',
      data: newAttempt
    });

  } catch (error) {
    console.error('Error starting assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Save answer for a question (auto-save)
app.post('/api/assignment/:assignmentId/answer', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, questionId, answer } = req.body;

    const attempt = await AssignmentAttempt.findOne({
      assignmentId,
      studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ message: 'No active attempt found' });
    }

    attempt.answers.set(String(questionId), answer);
    await attempt.save();

    res.json({
      message: 'Answer saved',
      questionId,
      answer
    });

  } catch (error) {
    console.error('Error saving answer:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit assignment for grading
app.post('/api/assignment/:assignmentId/submit', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { studentId, answers, timeTaken } = req.body;

    const assignment = await Assignment.findOne({ assignmentId });
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    const attempt = await AssignmentAttempt.findOne({
      assignmentId,
      studentId,
      status: 'in_progress'
    });

    if (!attempt) {
      return res.status(404).json({ message: 'No active attempt found' });
    }

    // Calculate score
    let totalScore = 0;
    const questionResults = [];

    assignment.questions.forEach(question => {
      const studentAnswer = answers[question.id];
      const isCorrect = studentAnswer === question.correctAnswer;
      const marksAwarded = isCorrect ? question.marks : 0;
      totalScore += marksAwarded;

      questionResults.push({
        questionId: question.id,
        selectedAnswer: studentAnswer || '',
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksAwarded,
        concept: question.concept
      });
    });

    const percentage = Math.round((totalScore / assignment.totalMarks) * 100);

    // Generate feedback
    const incorrectConcepts = questionResults
      .filter(r => !r.isCorrect)
      .map(r => r.concept);

    let performanceLevel = 'Excellent';
    if (percentage < 40) performanceLevel = 'Needs Improvement';
    else if (percentage < 60) performanceLevel = 'Average';
    else if (percentage < 80) performanceLevel = 'Good';

    // Update attempt
    attempt.answers = new Map(Object.entries(answers));
    attempt.questionResults = questionResults;
    attempt.score = totalScore;
    attempt.percentage = percentage;
    attempt.timeTaken = timeTaken;
    attempt.status = 'completed';
    attempt.completedAt = new Date();
    attempt.feedback = {
      performanceLevel,
      conceptsToReview: [...new Set(incorrectConcepts)],
      nextAssignmentFocus: incorrectConcepts.length > 0 
        ? `Focus on: ${incorrectConcepts.slice(0, 3).join(', ')}`
        : 'Continue with next topic'
    };

    await attempt.save();

    // Update assignment status
    assignment.status = 'completed';
    await assignment.save();

    res.json({
      message: 'Assignment submitted successfully',
      data: {
        score: totalScore,
        totalMarks: assignment.totalMarks,
        percentage,
        questionResults,
        feedback: attempt.feedback,
        timeTaken
      }
    });

  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all assignments for a student
app.get('/api/assignments/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const assignments = await Assignment.find({ studentId }).sort({ createdAt: -1 });

    // Hide answers for pending assignments
    const assignmentsForStudent = assignments.map(assignment => ({
      ...assignment.toObject(),
      questions: assignment.status === 'generated' || assignment.status === 'in_progress'
        ? assignment.questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            marks: q.marks,
            concept: q.concept
          }))
        : assignment.questions
    }));

    res.json({
      message: 'Assignments retrieved successfully',
      count: assignments.length,
      data: assignmentsForStudent
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get a specific assignment
app.get('/api/assignment/:assignmentId', async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findOne({ assignmentId });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json({
      message: 'Assignment retrieved successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error fetching assignment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get assignment attempts for a student
app.get('/api/assignment/attempts/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const attempts = await AssignmentAttempt.find({ studentId }).sort({ createdAt: -1 });

    res.json({
      message: 'Assignment attempts retrieved successfully',
      count: attempts.length,
      data: attempts
    });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get student analytics summary
app.get('/api/student/:studentId/analytics', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get the latest AI-generated analytics
    const latestAnalytics = await Analytics.findOne({ studentId })
      .sort({ createdAt: -1 });

    // Get quiz attempts for score history
    const quizAttempts = await QuizAttempt.find({ visitorId: studentId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Build analytics data from stored Analytics
    let quizAnalytics;
    if (latestAnalytics) {
      quizAnalytics = {
        performanceStatus: latestAnalytics.performanceStatus || 'Unknown',
        weakConcepts: latestAnalytics.weakConcepts || [],
        riskLevel: latestAnalytics.riskLevel || 'Medium',
        recentScores: quizAttempts.map(q => Math.round((q.score / q.totalQuestions) * 100)),
        averageScore: Math.round(latestAnalytics.averageAccuracy) || 0,
        recommendedAction: latestAnalytics.recommendedAction || 'Continue practice',
        topicsToImprove: latestAnalytics.weakConcepts?.slice(0, 3) || [],
        lastAnalyzed: latestAnalytics.createdAt
      };
    } else {
      // No analytics - calculate basic stats from quiz attempts
      const scores = quizAttempts.map(q => Math.round((q.score / q.totalQuestions) * 100));
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      
      quizAnalytics = {
        performanceStatus: 'Unknown',
        weakConcepts: [],
        riskLevel: avgScore < 40 ? 'High' : avgScore < 60 ? 'Medium' : 'Low',
        recentScores: scores,
        averageScore: avgScore,
        recommendedAction: 'Generate AI Analytics from the Analytics page first',
        topicsToImprove: [],
        lastAnalyzed: null
      };
    }

    // Get recent assignments
    const assignments = await Assignment.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(5);

    const assignmentAttempts = await AssignmentAttempt.find({ studentId, status: 'completed' })
      .sort({ completedAt: -1 })
      .limit(5);

    res.json({
      message: 'Analytics retrieved successfully',
      data: {
        quizAnalytics,
        totalQuizzes: quizAttempts.length,
        totalAssignments: assignments.length,
        completedAssignments: assignmentAttempts.length,
        recentAssignmentScores: assignmentAttempts.map(a => a.percentage),
        hasAiAnalytics: !!latestAnalytics
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ==================== DOUBT AGENT API ENDPOINTS ====================

/**
 * Start a new doubt conversation
 * POST /api/doubt/start
 */
app.post('/api/doubt/start', async (req, res) => {
  try {
    console.log('📥 Received doubt request body:', JSON.stringify(req.body).substring(0, 500));
    
    const { studentId, doubtText, imageBase64, studentProfile } = req.body;

    console.log('📌 Parsed - studentId:', studentId, 'doubtText:', doubtText?.substring(0, 50), 'hasImage:', !!imageBase64);

    // Allow either text OR image (or both)
    if (!studentId || (!doubtText && !imageBase64)) {
      console.log('❌ Missing required fields - studentId:', !!studentId, 'doubtText:', !!doubtText, 'imageBase64:', !!imageBase64);
      return res.status(400).json({ message: 'Student ID and either doubt text or image are required' });
    }

    // If only image is provided, use a default prompt
    const actualDoubtText = doubtText || "Please analyze this image and help me understand the problem shown. Explain the solution step by step.";

    // Get student info
    const student = students.find(s => s.id === studentId);
    const studentName = student?.name || 'Student';

    // Get student analytics for profile enrichment
    let enrichedProfile = { ...studentProfile };
    try {
      const analytics = await Analytics.findOne({ studentId }).sort({ createdAt: -1 });
      if (analytics) {
        enrichedProfile = {
          ...enrichedProfile,
          conceptAccuracy: analytics.analytics?.averageScore || 50,
          masteryLevel: analytics.analytics?.riskLevel === 'HIGH' ? 'WEAK' : 
                       analytics.analytics?.riskLevel === 'LOW' ? 'STRONG' : 'MODERATE'
        };
      }
    } catch (err) {
      console.log('Could not fetch analytics for doubt profile');
    }

    console.log(`\n🤔 New doubt from ${studentName}: "${actualDoubtText.substring(0, 50)}..."`);

    // Resolve the doubt using AI
    const result = await resolveDoubt(
      studentId,
      studentName,
      actualDoubtText,
      imageBase64,
      enrichedProfile
    );

    if (!result.success) {
      return res.status(500).json({ message: result.error || 'Failed to resolve doubt' });
    }

    // Create doubt record in database
    const doubtId = `DOUBT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    
    const doubt = new Doubt({
      doubtId,
      studentId,
      sessionId: result.sessionId,
      studentProfile: enrichedProfile,
      messages: [
        {
          role: 'user',
          content: actualDoubtText,
          imageBase64: imageBase64 ? imageBase64.substring(0, 100) + '...' : null, // Store truncated reference
          timestamp: new Date()
        },
        {
          role: 'assistant',
          content: JSON.stringify(result.response),
          manimCode: result.response?.manimCode || null,
          videoUrl: result.video?.videoUrl || null,
          audioUrl: result.video?.audioUrl || null,
          timestamp: new Date()
        }
      ],
      status: 'active'
    });

    await doubt.save();

    res.json({
      message: 'Doubt resolved successfully',
      data: {
        doubtId,
        sessionId: result.sessionId,
        response: result.response,
        video: result.video,
        studentProfile: enrichedProfile
      }
    });

  } catch (error) {
    console.error('Error starting doubt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Continue doubt conversation (follow-up)
 * POST /api/doubt/:doubtId/followup
 */
app.post('/api/doubt/:doubtId/followup', async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { followUpText, imageBase64 } = req.body;

    if (!followUpText) {
      return res.status(400).json({ message: 'Follow-up text is required' });
    }

    // Find existing doubt
    const doubt = await Doubt.findOne({ doubtId });
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt conversation not found' });
    }

    console.log(`\n💬 Follow-up on ${doubtId}: "${followUpText.substring(0, 50)}..."`);

    // Continue the conversation
    const result = await continueDoubt(
      doubt.sessionId,
      followUpText,
      doubt.studentProfile
    );

    if (!result.success) {
      return res.status(500).json({ message: result.error || 'Failed to process follow-up' });
    }

    // Add messages to conversation
    doubt.messages.push({
      role: 'user',
      content: followUpText,
      imageBase64: imageBase64 ? imageBase64.substring(0, 100) + '...' : null,
      timestamp: new Date()
    });

    doubt.messages.push({
      role: 'assistant',
      content: JSON.stringify(result.response),
      manimCode: result.response?.manimCode || null,
      videoUrl: result.video?.videoUrl || null,
      audioUrl: result.video?.audioUrl || null,
      timestamp: new Date()
    });

    await doubt.save();

    res.json({
      message: 'Follow-up processed successfully',
      data: {
        response: result.response,
        video: result.video
      }
    });

  } catch (error) {
    console.error('Error processing follow-up:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Generate video from Manim code
 * POST /api/doubt/generate-video
 */
app.post('/api/doubt/generate-video', async (req, res) => {
  try {
    const { manimCode, narration, doubtId } = req.body;

    if (!manimCode) {
      return res.status(400).json({ message: 'Manim code is required' });
    }

    const result = await generateVideo(
      manimCode,
      narration || [],
      doubtId || `manual_${Date.now()}`
    );

    res.json({
      message: result.success ? 'Video generation initiated' : 'Video generation info',
      data: result
    });

  } catch (error) {
    console.error('Error generating video:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get doubt conversation history
 * GET /api/doubt/:doubtId
 */
app.get('/api/doubt/:doubtId', async (req, res) => {
  try {
    const { doubtId } = req.params;
    
    const doubt = await Doubt.findOne({ doubtId });
    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.json({
      message: 'Doubt retrieved successfully',
      data: doubt
    });

  } catch (error) {
    console.error('Error fetching doubt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get all doubts for a student
 * GET /api/doubts/:studentId
 */
app.get('/api/doubts/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const doubts = await Doubt.find({ studentId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      message: 'Doubts retrieved successfully',
      data: doubts
    });

  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Get default Manim template for a topic
 * GET /api/doubt/template/:topic
 */
app.get('/api/doubt/template/:topic', (req, res) => {
  try {
    const { topic } = req.params;
    const manimCode = getDefaultManimCode(topic);

    res.json({
      message: 'Template retrieved',
      data: { manimCode, topic }
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * Mark doubt as resolved
 * PUT /api/doubt/:doubtId/resolve
 */
app.put('/api/doubt/:doubtId/resolve', async (req, res) => {
  try {
    const { doubtId } = req.params;
    
    const doubt = await Doubt.findOneAndUpdate(
      { doubtId },
      { status: 'resolved', updatedAt: new Date() },
      { new: true }
    );

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.json({
      message: 'Doubt marked as resolved',
      data: doubt
    });

  } catch (error) {
    console.error('Error resolving doubt:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ============================================
// SCHEDULE API ENDPOINTS
// ============================================

/**
 * Generate weekly schedule for a student
 * POST /api/schedule/generate
 */
app.post('/api/schedule/generate', async (req, res) => {
  try {
    const { studentId, subject, chapter, chapterTopics, studentName } = req.body;
    
    if (!studentId || !subject || !chapter) {
      return res.status(400).json({ message: 'Missing required fields: studentId, subject, chapter' });
    }

    // Find student - try multiple ID fields
    let student = students.find(s => s.id === studentId || s.studentId === studentId);
    
    // If student not found in memory, create a default context
    if (!student) {
      console.log(`Student ${studentId} not found in memory, using provided name or default`);
      student = {
        id: studentId,
        name: studentName || 'Student',
        grade: 'Class 9'
      };
    }

    // Get student's analytics for performance assessment
    let studentAnalytics = null;
    try {
      const analytics = await Analytics.findOne({ 
        studentId,
        subject: { $regex: new RegExp(subject, 'i') }
      }).sort({ lastUpdated: -1 });
      
      if (analytics) {
        studentAnalytics = {
          averageScore: analytics.averageScore,
          masteryLevel: analytics.masteryLevel,
          weakTopics: analytics.weakTopics || [],
          strongTopics: analytics.strongTopics || [],
          totalQuizzesTaken: analytics.totalQuizzesTaken
        };
      }
    } catch (err) {
      console.log('Could not fetch analytics:', err.message);
    }

    // Get exam performance
    let examPerformance = [];
    try {
      const examAttempts = await ExamAttempt.find({ studentId }).populate('examId').limit(5);
      examPerformance = examAttempts.map(a => ({
        examTitle: a.examId?.title || 'Unknown',
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage
      }));
    } catch (err) {
      console.log('Could not fetch exam performance:', err.message);
    }

    // Get assignment performance
    let assignmentPerformance = [];
    try {
      const assignmentAttempts = await AssignmentAttempt.find({ studentId }).populate('assignmentId').limit(5);
      assignmentPerformance = assignmentAttempts.map(a => ({
        assignmentTitle: a.assignmentId?.title || 'Unknown',
        score: a.score,
        totalMarks: a.totalMarks,
        percentage: a.percentage
      }));
    } catch (err) {
      console.log('Could not fetch assignment performance:', err.message);
    }

    // Build student context for schedule agent
    const studentContext = {
      studentId,
      studentName: student.name,
      grade: student.grade || 'Class 9',
      subject,
      chapter,
      chapterTopics: chapterTopics || [],
      analytics: studentAnalytics,
      recentExamPerformance: examPerformance,
      recentAssignmentPerformance: assignmentPerformance
    };

    console.log('Generating schedule for student:', studentContext);

    // Call Schedule Agent
    const scheduleResult = await generateScheduleFromContext(studentContext);

    res.json({
      message: 'Weekly schedule generated successfully',
      data: {
        studentId,
        studentName: student.name,
        subject,
        chapter,
        performanceLevel: scheduleResult.performanceLevel || 'moderate',
        schedule: scheduleResult.schedule,
        recommendations: scheduleResult.recommendations,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating schedule:', error);
    res.status(500).json({ message: 'Failed to generate schedule', error: error.message });
  }
});

/**
 * Get quick schedule recommendation
 * POST /api/schedule/recommend
 */
app.post('/api/schedule/recommend', async (req, res) => {
  try {
    const { studentId, topic, difficulty } = req.body;
    
    if (!studentId || !topic) {
      return res.status(400).json({ message: 'Missing required fields: studentId, topic' });
    }

    const student = students.find(s => s.id === studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const recommendation = await getScheduleRecommendation({
      studentName: student.name,
      topic,
      difficulty: difficulty || 'moderate'
    });

    res.json({
      message: 'Recommendation generated',
      data: recommendation
    });

  } catch (error) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({ message: 'Failed to get recommendation', error: error.message });
  }
});

/**
 * Get available chapters for scheduling
 * GET /api/schedule/chapters/:subject
 */
app.get('/api/schedule/chapters/:subject', async (req, res) => {
  try {
    const { subject } = req.params;
    
    // Try to get chapters from database
    let chapters = [];
    try {
      const dbChapters = await Chapter.find({ 
        subject: { $regex: new RegExp(subject, 'i') }
      }).select('chapterNumber title topics');
      
      if (dbChapters.length > 0) {
        chapters = dbChapters.map(c => ({
          id: c._id,
          number: c.chapterNumber,
          title: c.title,
          topics: c.topics || []
        }));
      }
    } catch (err) {
      console.log('Could not fetch chapters from DB:', err.message);
    }

    // Fallback chapters if DB is empty
    if (chapters.length === 0) {
      if (subject.toLowerCase().includes('math')) {
        chapters = [
          { number: 1, title: 'Number Systems', topics: ['Real Numbers', 'Irrational Numbers', 'Rationalizing Denominators', 'Laws of Exponents'] },
          { number: 2, title: 'Polynomials', topics: ['Polynomials in One Variable', 'Zeroes of a Polynomial', 'Factorization', 'Algebraic Identities'] },
          { number: 3, title: 'Coordinate Geometry', topics: ['Cartesian System', 'Plotting Points', 'Distance Formula'] },
          { number: 4, title: 'Linear Equations in Two Variables', topics: ['Linear Equations', 'Solution of Linear Equation', 'Graph of Linear Equation'] },
          { number: 5, title: 'Introduction to Euclid\'s Geometry', topics: ['Euclid\'s Definitions', 'Axioms and Postulates', 'Theorems'] },
          { number: 6, title: 'Lines and Angles', topics: ['Basic Terms', 'Intersecting Lines', 'Parallel Lines', 'Angle Sum Property'] },
          { number: 7, title: 'Triangles', topics: ['Congruence of Triangles', 'Criteria for Congruence', 'Properties of Triangles', 'Inequalities'] },
          { number: 8, title: 'Quadrilaterals', topics: ['Angle Sum Property', 'Types of Quadrilaterals', 'Parallelograms', 'Mid-point Theorem'] },
          { number: 9, title: 'Areas of Parallelograms and Triangles', topics: ['Figures on Same Base', 'Area Theorems'] },
          { number: 10, title: 'Circles', topics: ['Circles and Chords', 'Arc and Chord', 'Cyclic Quadrilaterals'] },
          { number: 11, title: 'Constructions', topics: ['Basic Constructions', 'Triangle Constructions'] },
          { number: 12, title: 'Heron\'s Formula', topics: ['Area of Triangle', 'Application of Heron\'s Formula'] },
          { number: 13, title: 'Surface Areas and Volumes', topics: ['Cuboid and Cube', 'Cylinder', 'Cone', 'Sphere'] },
          { number: 14, title: 'Statistics', topics: ['Collection of Data', 'Graphical Representation', 'Measures of Central Tendency'] },
          { number: 15, title: 'Probability', topics: ['Probability - An Experimental Approach'] }
        ];
      } else if (subject.toLowerCase().includes('science')) {
        chapters = [
          { number: 1, title: 'Matter in Our Surroundings', topics: ['Physical Nature of Matter', 'States of Matter', 'Evaporation'] },
          { number: 2, title: 'Is Matter Around Us Pure', topics: ['Mixtures', 'Solutions', 'Separation Techniques'] },
          { number: 3, title: 'Atoms and Molecules', topics: ['Laws of Chemical Combination', 'Atoms', 'Molecules', 'Mole Concept'] },
          { number: 4, title: 'Structure of the Atom', topics: ['Charged Particles', 'Thomson\'s Model', 'Rutherford\'s Model', 'Bohr\'s Model'] },
          { number: 5, title: 'The Fundamental Unit of Life', topics: ['Cell Theory', 'Cell Structure', 'Organelles'] },
          { number: 6, title: 'Tissues', topics: ['Plant Tissues', 'Animal Tissues'] },
          { number: 7, title: 'Diversity in Living Organisms', topics: ['Classification', 'Five Kingdom Classification'] },
          { number: 8, title: 'Motion', topics: ['Distance and Displacement', 'Speed and Velocity', 'Acceleration', 'Equations of Motion'] },
          { number: 9, title: 'Force and Laws of Motion', topics: ['Newton\'s Laws', 'Inertia', 'Momentum', 'Conservation of Momentum'] },
          { number: 10, title: 'Gravitation', topics: ['Universal Law of Gravitation', 'Free Fall', 'Mass and Weight'] }
        ];
      } else {
        chapters = [
          { number: 1, title: 'Chapter 1', topics: ['Topic 1', 'Topic 2', 'Topic 3'] },
          { number: 2, title: 'Chapter 2', topics: ['Topic 1', 'Topic 2', 'Topic 3'] },
          { number: 3, title: 'Chapter 3', topics: ['Topic 1', 'Topic 2', 'Topic 3'] }
        ];
      }
    }

    res.json({
      message: 'Chapters retrieved',
      data: { subject, chapters }
    });

  } catch (error) {
    console.error('Error fetching chapters:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
