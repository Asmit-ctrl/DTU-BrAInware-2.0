const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const API_KEY = process.env.ONDEMAND_API_KEY || "<your_api_key>";
console.log('📌 Schedule Agent API Key configured:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

const BASE_URL = "https://api.on-demand.io/chat/v1";

// ==================== SCHEDULE AGENT CONFIGURATION ====================
// Using the same agents as Teacher/Exam/Assignment services (agent-1768589843 instead of agent-1768610649)
const SCHEDULE_AGENT_IDS = ["agent-1712327325", "agent-1713962163", "agent-1768589843"];
const ENDPOINT_ID = "predefined-xai-grok4.1-fast";
const REASONING_MODE = "grok-4-fast";
const RESPONSE_MODE = "stream";

// Model Configuration
const TEMPERATURE = 0.6;
const TOP_P = 1;
const MAX_TOKENS = 6400;

/**
 * Fulfillment prompt for schedule generation
 */
const getScheduleFulfillmentPrompt = (studentProfile, chapterInfo) => `
Role: You are an Adaptive Learning Schedule Planner for Indian students (Classes 6-12, NCERT curriculum).
Your task is to create a personalized weekly study schedule for a chapter based on student's performance level.

Student Profile:
- Name: ${studentProfile.name || 'Student'}
- Class: ${studentProfile.class || 9} (NCERT)
- Subject: ${studentProfile.subject || 'Mathematics'}
- Performance Status: ${studentProfile.performanceStatus || 'Moderate'} (Improvement/Stagnation/Decline)
- Mastery Level: ${studentProfile.masteryLevel || 'MODERATE'} (WEAK/MODERATE/STRONG)
- Concept Accuracy: ${studentProfile.conceptAccuracy || 50}%
- Risk Level: ${studentProfile.riskLevel || 'Medium'} (Low/Medium/High)
- Weak Concepts: ${studentProfile.weakConcepts?.join(', ') || 'Not identified'}
- Strengths: ${studentProfile.strengths?.join(', ') || 'Not identified'}

Chapter to Schedule:
- Chapter Name: ${chapterInfo.chapterName}
- Subject: ${chapterInfo.subject || studentProfile.subject}
- Total Topics: ${chapterInfo.topics?.length || 'Auto-determine based on NCERT'}
- Topics List: ${chapterInfo.topics?.join(', ') || 'Generate from NCERT syllabus'}

SCHEDULING RULES:
1. WEAK Students (High Risk / Decline / <40% accuracy):
   - Allocate 3 DAYS for difficult/complex topics
   - Allocate 2 DAYS for moderate topics
   - Include revision days
   - Add extra practice sessions
   - Focus on fundamentals first

2. MODERATE Students (Medium Risk / Stagnation / 40-70% accuracy):
   - Allocate 2 DAYS for difficult topics
   - Allocate 1 DAY for moderate topics
   - Balance theory and practice

3. STRONG Students (Low Risk / Improvement / >70% accuracy):
   - Allocate 1 DAY for most topics
   - Focus on advanced problems
   - Include challenge problems
   - Add enrichment activities

RESPONSE FORMAT (Return ONLY valid JSON):
{
  "scheduleId": "unique-schedule-id",
  "studentLevel": "WEAK/MODERATE/STRONG",
  "chapterName": "Chapter Name",
  "subject": "Subject",
  "totalDays": 7,
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "dailySchedule": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "dayType": "Learning/Practice/Revision/Assessment",
      "topics": [
        {
          "topicName": "Topic 1",
          "duration": "45 mins",
          "difficulty": "Easy/Moderate/Hard",
          "objectives": ["Objective 1", "Objective 2"],
          "activities": ["Read theory", "Watch video", "Solve 5 problems"]
        }
      ],
      "dailyGoal": "What student should achieve by end of day",
      "questionsCount": 10,
      "questionDistribution": {
        "easy": 6,
        "moderate": 3,
        "hard": 1
      },
      "estimatedTime": "2 hours",
      "breakReminder": "Take a 10-min break after each topic"
    }
  ],
  "weeklyGoals": ["Goal 1", "Goal 2", "Goal 3"],
  "assessmentDay": 7,
  "revisionTopics": ["Topic that needs extra focus"],
  "parentTips": ["Tip for parents to help"],
  "motivationalMessage": "Encouraging message for the student"
}

IMPORTANT: Generate a realistic, NCERT-aligned schedule. Your response MUST be ONLY valid JSON.
`;

/**
 * Create schedule session
 */
async function createScheduleSession(studentId, studentName) {
    const url = `${BASE_URL}/sessions`;
    const externalUserId = `schedule_${studentId}_${Date.now()}`;

    const body = {
        agentIds: SCHEDULE_AGENT_IDS,
        externalUserId: externalUserId,
        contextMetadata: [
            { key: "studentId", value: studentId },
            { key: "studentName", value: studentName },
            { key: "sessionType", value: "schedule_generation" }
        ]
    };

    console.log(`\n📅 Creating schedule session for ${studentName}...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.status === 201) {
            const data = await response.json();
            console.log(`✅ Schedule session created: ${data.data.id}`);
            return {
                sessionId: data.data.id,
                externalUserId: externalUserId
            };
        } else {
            const error = await response.text();
            console.error(`❌ Failed to create schedule session: ${error}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Exception creating schedule session: ${error.message}`);
        return null;
    }
}

/**
 * Generate weekly schedule
 */
async function generateWeeklySchedule(sessionId, studentProfile, chapterInfo) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;

    const query = `Generate a personalized weekly study schedule for:

Chapter: "${chapterInfo.chapterName}"
Subject: ${chapterInfo.subject || studentProfile.subject}
${chapterInfo.topics?.length ? `Topics to cover: ${chapterInfo.topics.join(', ')}` : 'Determine topics from NCERT syllabus'}

Student Performance:
- Mastery Level: ${studentProfile.masteryLevel || 'MODERATE'}
- Accuracy: ${studentProfile.conceptAccuracy || 50}%
- Risk Level: ${studentProfile.riskLevel || 'Medium'}
- Performance Trend: ${studentProfile.performanceStatus || 'Stable'}

Create a detailed day-by-day schedule for one week with:
1. Topics to cover each day (based on student's level)
2. Daily questions (10 questions with easy/moderate/hard distribution)
3. Time allocation for each topic
4. Learning activities and objectives
5. Assessment plan

Return ONLY valid JSON in the specified format.`;

    const body = {
        endpointId: ENDPOINT_ID,
        query: query,
        agentIds: SCHEDULE_AGENT_IDS,
        responseMode: RESPONSE_MODE,
        reasoningMode: REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: getScheduleFulfillmentPrompt(studentProfile, chapterInfo),
            stopSequences: [],
            temperature: TEMPERATURE,
            topP: TOP_P,
            maxTokens: MAX_TOKENS,
            presencePenalty: 0,
            frequencyPenalty: 0
        }
    };

    console.log(`\n📅 Generating weekly schedule for "${chapterInfo.chapterName}"...`);
    console.log(`📊 Student Level: ${studentProfile.masteryLevel || 'MODERATE'}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API error (${response.status}):`, errorText);
            return { success: false, error: `API error: ${response.status}` };
        }

        // Handle streaming response
        return new Promise((resolve, reject) => {
            let buffer = '';
            let fullAnswer = "";

            response.body.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        const dataStr = line.slice(5).trim();
                        if (dataStr === "[DONE]") continue;

                        try {
                            const event = JSON.parse(dataStr);
                            if (event.answer) {
                                fullAnswer += event.answer;
                            }
                        } catch (e) {
                            // Skip malformed events
                        }
                    }
                }
            });

            response.body.on('end', () => {
                console.log(`✅ Schedule generated (${fullAnswer.length} chars)`);

                try {
                    // Extract JSON from response
                    const jsonMatch = fullAnswer.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        
                        // Add metadata
                        parsed.generatedAt = new Date().toISOString();
                        parsed.studentId = studentProfile.id;
                        
                        resolve({
                            success: true,
                            schedule: parsed,
                            rawResponse: fullAnswer
                        });
                    } else {
                        resolve({
                            success: false,
                            error: 'No valid JSON in response',
                            rawResponse: fullAnswer
                        });
                    }
                } catch (parseError) {
                    console.error('❌ JSON parse error:', parseError.message);
                    resolve({
                        success: false,
                        error: 'Failed to parse schedule',
                        rawResponse: fullAnswer
                    });
                }
            });

            response.body.on('error', (err) => {
                reject({ success: false, error: err.message });
            });
        });

    } catch (error) {
        console.error(`❌ Exception generating schedule: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Get daily questions for a specific day
 */
async function getDailyQuestions(sessionId, studentProfile, daySchedule, historyLog = []) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;

    const query = `Generate ${daySchedule.questionsCount || 10} practice questions for today's study session.

Today's Topics: ${daySchedule.topics.map(t => t.topicName).join(', ')}
Difficulty Distribution: Easy: ${daySchedule.questionDistribution?.easy || 6}, Moderate: ${daySchedule.questionDistribution?.moderate || 3}, Hard: ${daySchedule.questionDistribution?.hard || 1}

Student Info:
- Class: ${studentProfile.class}
- Subject: ${studentProfile.subject}
- Weak Concepts: ${studentProfile.weakConcepts?.join(', ') || 'None'}

${historyLog.length > 0 ? `
Previously Asked Questions (EXCLUDE these):
${historyLog.slice(-20).join('\n')}
` : ''}

Generate questions in this JSON format:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "difficulty": "Easy/Moderate/Hard",
      "topic": "Topic name",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "Why this is correct",
      "hint": "Helpful hint"
    }
  ]
}

Return ONLY valid JSON.`;

    const body = {
        endpointId: ENDPOINT_ID,
        query: query,
        agentIds: SCHEDULE_AGENT_IDS,
        responseMode: RESPONSE_MODE,
        reasoningMode: REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: `You are a question generator for NCERT ${studentProfile.subject} Class ${studentProfile.class}. Generate practice questions aligned with NCERT curriculum. Ensure questions are unique and not repeated from history.`,
            temperature: 0.7,
            topP: TOP_P,
            maxTokens: 4000
        }
    };

    console.log(`\n📝 Generating daily questions...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            return { success: false, error: `API error: ${response.status}` };
        }

        return new Promise((resolve, reject) => {
            let buffer = '';
            let fullAnswer = "";

            response.body.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        const dataStr = line.slice(5).trim();
                        if (dataStr === "[DONE]") continue;

                        try {
                            const event = JSON.parse(dataStr);
                            if (event.answer) {
                                fullAnswer += event.answer;
                            }
                        } catch (e) {}
                    }
                }
            });

            response.body.on('end', () => {
                try {
                    const jsonMatch = fullAnswer.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        resolve({
                            success: true,
                            questions: parsed.questions || [],
                            rawResponse: fullAnswer
                        });
                    } else {
                        resolve({ success: false, error: 'No valid JSON' });
                    }
                } catch (e) {
                    resolve({ success: false, error: e.message });
                }
            });

            response.body.on('error', (err) => {
                reject({ success: false, error: err.message });
            });
        });

    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Main function to create a complete weekly schedule
 */
async function createWeeklySchedule(studentId, studentName, studentProfile, chapterInfo) {
    console.log('\n' + '='.repeat(60));
    console.log('📅 SCHEDULE AGENT - Creating Weekly Study Schedule');
    console.log('='.repeat(60));

    // Create session
    const session = await createScheduleSession(studentId, studentName);
    if (!session) {
        return { success: false, error: 'Failed to create session' };
    }

    // Generate schedule
    const scheduleResult = await generateWeeklySchedule(
        session.sessionId,
        { ...studentProfile, id: studentId, name: studentName },
        chapterInfo
    );

    if (!scheduleResult.success) {
        return { 
            success: false, 
            error: scheduleResult.error, 
            sessionId: session.sessionId 
        };
    }

    return {
        success: true,
        sessionId: session.sessionId,
        schedule: scheduleResult.schedule,
        rawResponse: scheduleResult.rawResponse
    };
}

/**
 * Simple wrapper function for generating schedule from student context
 * This is the main function called from the API
 */
async function generateScheduleFromContext(studentContext) {
    console.log('\n' + '='.repeat(60));
    console.log('📅 SCHEDULE AGENT - Generating Weekly Study Schedule');
    console.log('='.repeat(60));
    console.log('Student:', studentContext.studentName);
    console.log('Subject:', studentContext.subject);
    console.log('Chapter:', studentContext.chapter);

    // Determine performance level based on analytics
    let performanceLevel = 'moderate';
    let masteryLevel = 'MODERATE';
    
    if (studentContext.analytics) {
        const avgScore = studentContext.analytics.averageScore || 50;
        if (avgScore < 40) {
            performanceLevel = 'weak';
            masteryLevel = 'STRUGGLING';
        } else if (avgScore < 60) {
            performanceLevel = 'moderate';
            masteryLevel = 'MODERATE';
        } else if (avgScore < 80) {
            performanceLevel = 'good';
            masteryLevel = 'PROFICIENT';
        } else {
            performanceLevel = 'excellent';
            masteryLevel = 'MASTERED';
        }
    }

    // Create session
    const session = await createScheduleSession(
        studentContext.studentId || 'student_' + Date.now(),
        studentContext.studentName
    );

    if (!session) {
        return { 
            success: false, 
            error: 'Failed to create session',
            performanceLevel,
            schedule: generateFallbackSchedule(studentContext, performanceLevel),
            recommendations: getDefaultRecommendations(performanceLevel)
        };
    }

    // Build student profile
    const studentProfile = {
        name: studentContext.studentName,
        class: studentContext.grade || 'Class 9',
        subject: studentContext.subject,
        masteryLevel: masteryLevel,
        conceptAccuracy: studentContext.analytics?.averageScore || 50,
        riskLevel: performanceLevel === 'weak' ? 'High' : (performanceLevel === 'moderate' ? 'Medium' : 'Low'),
        performanceStatus: performanceLevel,
        weakConcepts: studentContext.analytics?.weakTopics || [],
        strongConcepts: studentContext.analytics?.strongTopics || []
    };

    // Build chapter info
    const chapterInfo = {
        chapterName: studentContext.chapter,
        subject: studentContext.subject,
        topics: studentContext.chapterTopics || []
    };

    console.log('📊 Performance Level:', performanceLevel);
    console.log('📖 Chapter Info:', chapterInfo);

    // Generate schedule
    const scheduleResult = await generateWeeklySchedule(
        session.sessionId,
        studentProfile,
        chapterInfo
    );

    if (!scheduleResult.success) {
        console.log('⚠️ Schedule generation failed, using fallback');
        return {
            success: true,
            performanceLevel,
            schedule: generateFallbackSchedule(studentContext, performanceLevel),
            recommendations: getDefaultRecommendations(performanceLevel),
            sessionId: session.sessionId
        };
    }

    return {
        success: true,
        performanceLevel,
        schedule: scheduleResult.schedule,
        recommendations: extractRecommendations(scheduleResult.schedule),
        sessionId: session.sessionId,
        rawResponse: scheduleResult.rawResponse
    };
}

/**
 * Generate fallback schedule if API fails
 */
function generateFallbackSchedule(studentContext, performanceLevel) {
    const topics = studentContext.chapterTopics || ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4'];
    const chapter = studentContext.chapter || 'Chapter';
    
    // Weak students get more days per topic
    const daysPerTopic = performanceLevel === 'weak' ? 2 : (performanceLevel === 'moderate' ? 1 : 1);
    
    const schedule = [];
    let topicIndex = 0;
    
    for (let day = 1; day <= 7; day++) {
        const isRevisionDay = day === 7;
        const currentTopic = topics[topicIndex % topics.length];
        
        let difficulty = 'Moderate';
        let questionDistribution = { easy: 4, moderate: 4, hard: 2 };
        
        if (performanceLevel === 'weak') {
            difficulty = day <= 3 ? 'Easy' : 'Moderate';
            questionDistribution = { easy: 6, moderate: 3, hard: 1 };
        } else if (performanceLevel === 'excellent') {
            difficulty = day <= 2 ? 'Moderate' : 'Hard';
            questionDistribution = { easy: 2, moderate: 4, hard: 4 };
        }

        const dayDate = new Date();
        dayDate.setDate(dayDate.getDate() + day - 1);

        schedule.push({
            day: day,
            date: dayDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            topics: isRevisionDay 
                ? [{ topicName: `${chapter} - Complete Revision`, duration: '90 mins', difficulty: 'Mixed' }]
                : [{ topicName: currentTopic, duration: '45 mins', difficulty }],
            dailyGoal: isRevisionDay 
                ? 'Review all concepts and prepare for assessment'
                : `Master ${currentTopic} through practice`,
            questionsCount: 10,
            questionDistribution,
            estimatedTime: isRevisionDay ? '2.5 hours' : '1.5 hours',
            focusArea: isRevisionDay ? 'Complete chapter review' : currentTopic,
            activities: isRevisionDay
                ? ['Review notes', 'Solve practice paper', 'Clear doubts']
                : ['Read theory', 'Watch examples', 'Solve problems', 'Self-test']
        });

        // Move to next topic based on performance level
        if (!isRevisionDay && (day % daysPerTopic === 0)) {
            topicIndex++;
        }
    }

    return schedule;
}

/**
 * Extract recommendations from schedule
 */
function extractRecommendations(schedule) {
    if (!schedule) return getDefaultRecommendations('moderate');
    
    if (typeof schedule === 'object' && schedule.weeklyGoals) {
        return schedule.weeklyGoals;
    }
    
    return getDefaultRecommendations('moderate');
}

/**
 * Get default recommendations based on performance level
 */
function getDefaultRecommendations(performanceLevel) {
    const recommendations = {
        weak: [
            'Focus on understanding basic concepts before moving to advanced topics',
            'Practice at least 10 questions daily with focus on easy problems',
            'Review previous day\'s topics before starting new ones',
            'Take short breaks every 30 minutes to maintain focus',
            'Ask for help when stuck - don\'t skip difficult concepts'
        ],
        moderate: [
            'Balance between theory and practice - 40% reading, 60% solving',
            'Attempt moderate difficulty questions to build confidence',
            'Create summary notes for quick revision',
            'Practice time-bound problem solving',
            'Review weak areas identified in previous assessments'
        ],
        good: [
            'Challenge yourself with harder problems',
            'Help others learn - teaching reinforces understanding',
            'Explore advanced applications of concepts',
            'Practice mixed difficulty sets',
            'Focus on speed and accuracy both'
        ],
        excellent: [
            'Attempt olympiad-level problems for deeper understanding',
            'Create your own questions and solutions',
            'Explore real-world applications of mathematical concepts',
            'Help classmates with difficult topics',
            'Maintain consistency - don\'t get overconfident'
        ]
    };
    
    return recommendations[performanceLevel] || recommendations.moderate;
}

module.exports = {
    createScheduleSession,
    generateWeeklySchedule,
    getDailyQuestions,
    createWeeklySchedule,
    generateScheduleFromContext,
    getScheduleRecommendation: getDefaultRecommendations
};
