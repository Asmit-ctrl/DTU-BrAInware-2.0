const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const API_KEY = process.env.ONDEMAND_API_KEY || "<your_api_key>";
console.log('📌 Assignment Agent API Key configured:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

const BASE_URL = "https://api.on-demand.io/chat/v1";

// Assignment Agent Configuration
const ASSIGNMENT_AGENT_IDS = ["agent-1712327325", "agent-1713962163", "agent-1768589843"];
const ENDPOINT_ID = "predefined-xai-grok4.1-fast";
const REASONING_MODE = "grok-4-fast";
const RESPONSE_MODE = "stream";

// Model Configuration
const TEMPERATURE = 0.6;
const TOP_P = 1;
const MAX_TOKENS = 6000;
const PRESENCE_PENALTY = 0;
const FREQUENCY_PENALTY = 0;

const ASSIGNMENT_FULFILLMENT_PROMPT = `Role: You are an Adaptive Learning Assistant for Indian students (Classes 6-12, NCERT curriculum).
Your task is to create a personalized daily assignment of 10 questions based on the student's performance analytics.

Task:
1. Analyze the provided Student Analytics Data
2. Select/Create 10 questions customized to the student's needs

Question Distribution Rules:
- If "Stagnation/Decline" or "High Risk": 6 Easy / 3 Medium / 1 Hard (rebuild confidence)
- If "Improvement" or "Low Risk": 2 Easy / 4 Medium / 4 Hard (challenge the fast learner)
- Prioritize "Identified Weak Concepts" when creating questions

Response Format - MUST follow this EXACT JSON structure:
{
  "assignmentTitle": "Daily Practice: [Topic/Focus Area]",
  "totalQuestions": 10,
  "totalMarks": 30,
  "estimatedTime": "20 minutes",
  "difficultyBreakdown": {
    "easy": 6,
    "medium": 3,
    "hard": 1
  },
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correctAnswer": "A",
      "difficulty": "easy",
      "marks": 2,
      "concept": "Concept being tested",
      "explanation": "Why this answer is correct"
    }
  ],
  "analyticsBasedFeedback": "Explanation of why these questions were chosen based on student's analytics",
  "predictedOutcome": {
    "expectedPerformance": "Improvement/Stagnation/Decline",
    "focusConcepts": ["concept1", "concept2"],
    "riskLevel": "Low/Medium/High",
    "nextRecommendation": "Next action recommendation"
  }
}

Marks Distribution:
- Easy questions: 2 marks each
- Medium questions: 3 marks each
- Hard questions: 5 marks each

NCERT Alignment:
- All questions must align with NCERT syllabus
- Use Indian context and examples
- Follow standard mathematical notation

IMPORTANT: Your response MUST be ONLY valid JSON. Do not include any text before or after the JSON.`;

/**
 * Create a chat session for assignment generation
 */
async function createAssignmentSession(studentId, studentName) {
    const url = `${BASE_URL}/sessions`;

    const body = {
        agentIds: ASSIGNMENT_AGENT_IDS,
        externalUserId: studentId || uuidv4(),
        contextMetadata: [
            { key: "userId", value: studentId },
            { key: "name", value: studentName || "Student" },
            { key: "purpose", value: "assignment_generation" }
        ]
    };

    console.log(`\n📝 Creating assignment session for ${studentName}...`);

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
            console.log(`✅ Assignment session created: ${data.data.id}`);
            return data.data.id;
        } else {
            const errorText = await response.text();
            console.error(`❌ Error creating session: ${response.status} - ${errorText}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Exception creating session: ${error.message}`);
        return null;
    }
}

/**
 * Generate assignment questions based on student analytics
 */
async function generateAssignmentQuestions(sessionId, topic, analyticsData) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;

    // Build query with analytics context
    const query = `Generate a personalized 10-question daily assignment on the topic: "${topic}"

Student Analytics Data:
- Performance Status: ${analyticsData.performanceStatus || 'Unknown'}
- Identified Weak Concepts: ${analyticsData.weakConcepts?.join(', ') || 'None identified'}
- Risk Level: ${analyticsData.riskLevel || 'Medium'}
- Recent Quiz Scores: ${analyticsData.recentScores?.join(', ') || 'No data'}
- Average Score: ${analyticsData.averageScore || 'N/A'}%
- Recommended Focus: ${analyticsData.recommendedAction || 'General practice'}
- Topics Needing Improvement: ${analyticsData.topicsToImprove?.join(', ') || topic}

Based on the above analytics, create an adaptive assignment that:
1. Focuses on the student's weak concepts
2. Uses appropriate difficulty distribution based on their performance status
3. Includes questions that will help improve their understanding

Return ONLY valid JSON in the exact format specified.`;

    const body = {
        endpointId: ENDPOINT_ID,
        query: query,
        agentIds: ASSIGNMENT_AGENT_IDS,
        responseMode: RESPONSE_MODE,
        reasoningMode: REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: ASSIGNMENT_FULFILLMENT_PROMPT,
            stopSequences: [],
            temperature: TEMPERATURE,
            topP: TOP_P,
            maxTokens: MAX_TOKENS,
            presencePenalty: PRESENCE_PENALTY,
            frequencyPenalty: FREQUENCY_PENALTY
        }
    };

    console.log(`\n🎯 Generating assignment for: ${topic}...`);
    console.log(`📊 Student Performance: ${analyticsData.performanceStatus || 'Unknown'}`);
    console.log(`⚠️ Risk Level: ${analyticsData.riskLevel || 'Medium'}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log(`📊 Response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API error (${response.status}):`, errorText);
            return { success: false, error: `API error: ${response.status}` };
        }

        if (!response.body) {
            console.error("❌ No response body for streaming.");
            return { success: false, error: 'No response body' };
        }

        // Handle streaming response
        return new Promise((resolve, reject) => {
            let buffer = '';
            let fullAnswer = "";
            let finalSessionId = "";
            let finalMessageId = "";

            response.body.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith("data:")) {
                        const dataStr = line.slice(5).trim();
                        if (dataStr === "[DONE]") {
                            console.log('📌 Received [DONE] signal');
                            continue;
                        }

                        try {
                            const event = JSON.parse(dataStr);
                            
                            // Handle response - check for answer field
                            if (event.answer) {
                                fullAnswer += event.answer;
                            }
                            if (event.sessionId) finalSessionId = event.sessionId;
                            if (event.messageId) finalMessageId = event.messageId;
                            
                        } catch (e) {
                            // Skip malformed lines
                        }
                    }
                }
            });

            response.body.on('end', () => {
                console.log(`✅ Assignment generated successfully`);
                console.log(`📏 Total answer length: ${fullAnswer.length} characters`);
                
                // Parse the JSON response
                let assignmentData;
                try {
                    if (!fullAnswer) {
                        throw new Error('No answer content received');
                    }
                    
                    console.log('📝 Raw answer (first 300 chars):', fullAnswer.substring(0, 300));
                    
                    // Extract JSON from response
                    const jsonMatch = fullAnswer.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        assignmentData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No JSON found in response');
                    }
                    
                    console.log('✅ Successfully parsed assignment data:', {
                        title: assignmentData.assignmentTitle,
                        totalQuestions: assignmentData.totalQuestions,
                        actualQuestions: assignmentData.questions?.length
                    });
                    
                    if (assignmentData.questions?.length < 10) {
                        console.warn(`⚠️ Only ${assignmentData.questions.length} questions generated instead of 10`);
                    }
                    
                    resolve({
                        success: true,
                        sessionId: finalSessionId,
                        assignmentData: assignmentData,
                        messageId: finalMessageId
                    });
                    
                } catch (parseError) {
                    console.error(`⚠️ Failed to parse assignment JSON: ${parseError.message}`);
                    resolve({
                        success: false,
                        error: parseError.message,
                        rawAnswer: fullAnswer
                    });
                }
            });

            response.body.on('error', (error) => {
                console.error(`❌ Stream error: ${error.message}`);
                reject(error);
            });
        });

    } catch (error) {
        console.error(`❌ Exception generating assignment: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Main function to generate a complete assignment
 */
async function generateAssignment(studentId, studentName, topic, analyticsData) {
    console.log(`\n=== 📚 Generating Assignment for ${studentName} ===`);
    console.log(`Topic: ${topic}`);
    console.log(`Analytics:`, JSON.stringify(analyticsData, null, 2));

    // Create session
    const sessionId = await createAssignmentSession(studentId, studentName);
    if (!sessionId) {
        return { success: false, error: 'Failed to create session' };
    }

    // Generate assignment
    const result = await generateAssignmentQuestions(sessionId, topic, analyticsData);
    
    if (result.success) {
        return {
            success: true,
            assignmentId: uuidv4(),
            sessionId: sessionId,
            topic: topic,
            assignmentData: result.assignmentData,
            analyticsUsed: analyticsData
        };
    }

    return result;
}

/**
 * Get student analytics from quiz history
 */
function calculateStudentAnalytics(quizAttempts) {
    if (!quizAttempts || quizAttempts.length === 0) {
        return {
            performanceStatus: 'Unknown',
            weakConcepts: [],
            riskLevel: 'Medium',
            recentScores: [],
            averageScore: 0,
            recommendedAction: 'Start with foundational concepts',
            topicsToImprove: []
        };
    }

    // Get recent scores
    const recentAttempts = quizAttempts.slice(0, 5);
    const recentScores = recentAttempts.map(a => a.percentage || 0);
    const averageScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    // Determine performance trend
    let performanceStatus = 'Stable';
    if (recentScores.length >= 2) {
        const recent = recentScores.slice(0, 2).reduce((a, b) => a + b, 0) / 2;
        const older = recentScores.slice(-2).reduce((a, b) => a + b, 0) / 2;
        if (recent > older + 10) performanceStatus = 'Improvement';
        else if (recent < older - 10) performanceStatus = 'Decline';
        else performanceStatus = 'Stagnation';
    }

    // Determine risk level
    let riskLevel = 'Low';
    if (averageScore < 40) riskLevel = 'High';
    else if (averageScore < 60) riskLevel = 'Medium';

    // Find weak concepts from incorrect answers
    const weakConcepts = [];
    const conceptScores = {};
    
    quizAttempts.forEach(attempt => {
        if (attempt.questionResults) {
            attempt.questionResults.forEach(qr => {
                const concept = qr.concept || 'General';
                if (!conceptScores[concept]) {
                    conceptScores[concept] = { correct: 0, total: 0 };
                }
                conceptScores[concept].total++;
                if (qr.isCorrect) conceptScores[concept].correct++;
            });
        }
    });

    Object.entries(conceptScores).forEach(([concept, scores]) => {
        const accuracy = (scores.correct / scores.total) * 100;
        if (accuracy < 50) {
            weakConcepts.push(concept);
        }
    });

    // Recommended action based on analysis
    let recommendedAction = 'Continue regular practice';
    if (riskLevel === 'High') {
        recommendedAction = 'Focus on foundational concepts and basic formulas';
    } else if (performanceStatus === 'Decline') {
        recommendedAction = 'Review weak concepts and practice more easy questions';
    } else if (performanceStatus === 'Improvement' && riskLevel === 'Low') {
        recommendedAction = 'Challenge yourself with harder problems';
    }

    return {
        performanceStatus,
        weakConcepts,
        riskLevel,
        recentScores,
        averageScore: Math.round(averageScore),
        recommendedAction,
        topicsToImprove: weakConcepts.slice(0, 3)
    };
}

module.exports = {
    generateAssignment,
    calculateStudentAnalytics,
    createAssignmentSession,
    generateAssignmentQuestions
};
