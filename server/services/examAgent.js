const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const API_KEY = process.env.ONDEMAND_API_KEY || "<your_api_key>";
console.log('📌 Exam Agent API Key configured:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

const BASE_URL = "https://api.on-demand.io/chat/v1";

// Exam Agent Configuration
const EXAM_AGENT_IDS = ["agent-1712327325", "agent-1713962163", "agent-1768589843"];
const ENDPOINT_ID = "predefined-xai-grok4.1-fast";
const REASONING_MODE = "grok-4-fast";
const RESPONSE_MODE = "stream";  // Changed from "sync" to "stream" to match teacherAgent

// Model Configuration
const TEMPERATURE = 0.5;  // Reduced for more consistent results
const TOP_P = 1;
const MAX_TOKENS = 8000;  // Increased from 4000 to accommodate full exam

const EXAM_FULFILLMENT_PROMPT = `Role: You are an Adaptive Assessment Specialist for Indian students (Classes 6-12, NCERT curriculum).

Objective: Create a balanced examination that is accessible to "weak learners" while remaining challenging for "strong learners" by adhering to a specific difficulty distribution.

Test Construction Parameters:

1. **Total Questions: 15**
   - Easy Tier (5 Questions): Fundamental definitions, direct recall, basic concepts
   - Medium Tier (6 Questions): Application of concepts, multi-step problem solving
   - Hard Tier (4 Questions): Synthesis, critical evaluation, complex problem-solving

2. **Question Format - MUST follow this EXACT JSON structure:**
{
  "examTitle": "Topic Name Examination",
  "totalQuestions": 15,
  "totalMarks": 60,
  "duration": "35 minutes",
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
  ]
}

3. **Marks Distribution:**
   - Easy questions: 2 marks each (5 × 2 = 10 marks)
   - Medium questions: 4 marks each (6 × 4 = 24 marks)
   - Hard questions: 6 marks each (4 × 6 = 24 marks)
   - Total: 60 marks

4. **NCERT Alignment:**
   - All questions must align with NCERT syllabus
   - Use Indian context and examples where applicable
   - Follow standard mathematical notation

5. **Quality Requirements:**
   - No overlapping concepts
   - Clear, unambiguous language
   - Each question tests a distinct skill
   - All options should be plausible

IMPORTANT: Your response MUST be ONLY valid JSON. Do not include any text before or after the JSON.`;

/**
 * Create exam session
 */
async function createExamSession(studentId, studentName) {
    const url = `${BASE_URL}/sessions`;
    const externalUserId = `exam_${studentId}_${Date.now()}`;

    const body = {
        agentIds: EXAM_AGENT_IDS,
        externalUserId: externalUserId,
        contextMetadata: [
            { key: "studentId", value: studentId },
            { key: "studentName", value: studentName },
            { key: "examType", value: "adaptive_assessment" }
        ]
    };

    console.log(`\n📝 Creating exam session for ${studentName}...`);

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
            console.log(`✅ Exam session created: ${data.data.id}`);
            return {
                sessionId: data.data.id,
                externalUserId: externalUserId,
                contextMetadata: body.contextMetadata
            };
        } else {
            const error = await response.text();
            console.error(`❌ Failed to create exam session: ${error}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Exception creating exam session: ${error.message}`);
        return null;
    }
}

/**
 * Generate exam questions for a topic
 */
async function generateExamQuestions(sessionId, topic, difficulty = 'mixed') {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;

    const query = `Generate a 15-question examination paper on the topic: "${topic}"

The exam should include:
- 5 Easy questions (basic definitions, direct recall) - 2 marks each
- 6 Medium questions (application, multi-step problems) - 4 marks each  
- 4 Hard questions (analysis, synthesis, complex problems) - 6 marks each

Total: 15 questions worth 60 marks

Make sure questions cover all aspects of ${topic} as per NCERT syllabus.
Include proper mathematical notation using LaTeX where needed.

Return ONLY valid JSON in the exact format specified.`;

    const body = {
        endpointId: ENDPOINT_ID,
        query: query,
        agentIds: EXAM_AGENT_IDS,
        responseMode: RESPONSE_MODE,
        reasoningMode: REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: EXAM_FULFILLMENT_PROMPT,
            temperature: TEMPERATURE,
            topP: TOP_P,
            maxTokens: MAX_TOKENS
        }
    };

    console.log(`\n🎯 Generating exam questions for: ${topic}...`);
    console.log(`📡 Using endpoint: ${ENDPOINT_ID}`);
    console.log(`🤖 Agent IDs:`, EXAM_AGENT_IDS);

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
        console.log(`📊 Response headers:`, response.headers.raw());

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API error (${response.status}):`, errorText);
            return { success: false, error: `API error: ${response.status}` };
        }

        if (!response.body) {
            console.error("❌ No response body for streaming.");
            return { success: false, error: 'No response body' };
        }

        // Handle streaming response like teacherAgent
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
                            console.log(`📨 Full event:`, JSON.stringify(event).substring(0, 200));
                            
                            // Handle both old and new formats
                            if (event.answer) {
                                fullAnswer += event.answer;
                                console.log(`✍️ Received ${event.answer.length} chars (total: ${fullAnswer.length})`);
                            }
                            if (event.sessionId) finalSessionId = event.sessionId;
                            if (event.messageId) finalMessageId = event.messageId;
                            
                        } catch (e) {
                            console.warn('⚠️ Failed to parse event:', dataStr.substring(0, 100));
                        }
                    }
                }
            });

            response.body.on('end', () => {
                console.log(`✅ Exam questions generated successfully`);
                console.log(`📏 Total answer length: ${fullAnswer.length} characters`);
                
                // Parse the JSON response
                let examData;
                try {
                    // Try to extract JSON from the answer
                    if (!fullAnswer) {
                        throw new Error('No answer content received');
                    }
                    
                    console.log('📝 Raw answer (first 500 chars):', fullAnswer.substring(0, 500));
                    console.log('📝 Raw answer (last 200 chars):', fullAnswer.substring(fullAnswer.length - 200));
                    
                    // Try multiple JSON extraction strategies
                    let jsonMatch;
                    
                    // Strategy 1: Look for JSON object
                    jsonMatch = fullAnswer.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        console.log('✅ Found JSON using regex');
                        const jsonStr = jsonMatch[0];
                        
                        // Check if JSON appears complete (ends with }])
                        if (!jsonStr.trim().endsWith('}')) {
                            console.warn('⚠️ JSON may be incomplete - does not end with }');
                        }
                        
                        examData = JSON.parse(jsonStr);
                    } else {
                        // Strategy 2: Try parsing entire answer as JSON
                        console.log('🔄 Trying to parse entire answer as JSON');
                        examData = JSON.parse(fullAnswer);
                    }
                    
                    // Validate exam data
                    if (!examData.questions || !Array.isArray(examData.questions)) {
                        throw new Error('Invalid exam format: questions array missing');
                    }
                    
                
                console.log('✅ Successfully parsed exam data:', {
                    title: examData.examTitle,
                    totalQuestions: examData.totalQuestions,
                    actualQuestions: examData.questions.length,
                    totalMarks: examData.totalMarks
                });
                
                // Warn if question count doesn't match
                if (examData.questions.length < 15) {
                    console.warn(`⚠️ Only ${examData.questions.length} questions generated instead of 15`);
                }
                
                resolve({
                    success: true,
                    sessionId: finalSessionId,
                    examData: examData,
                    messageId: finalMessageId
                });                } catch (parseError) {
                    console.error(`⚠️ Failed to parse exam JSON: ${parseError.message}`);
                    console.error('Full answer length:', fullAnswer.length);
                    console.error('First 500 chars:', fullAnswer.substring(0, 500));
                    console.error('Last 500 chars:', fullAnswer.substring(Math.max(0, fullAnswer.length - 500)));
                    
                    resolve({
                        success: false,
                        error: 'Failed to parse exam data',
                        rawAnswer: fullAnswer
                    });
                }
            });

            response.body.on('error', (err) => {
                console.error('❌ Stream error:', err.message);
                reject(err);
            });
        });

    } catch (error) {
        console.error(`❌ Exception generating exam: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Generate a complete exam for a student
 */
async function generateExam(studentId, studentName, topic) {
    console.log(`\n=== 📋 Generating Exam for ${studentName} ===`);
    console.log(`Topic: ${topic}`);

    // Create session
    const session = await createExamSession(studentId, studentName);
    if (!session) {
        return {
            success: false,
            error: 'Failed to create exam session'
        };
    }

    // Generate questions
    const result = await generateExamQuestions(session.sessionId, topic);
    
    if (result.success) {
        return {
            success: true,
            examId: `EXAM-${Date.now()}`,
            sessionId: session.sessionId,
            studentId: studentId,
            studentName: studentName,
            topic: topic,
            examData: result.examData,
            createdAt: new Date().toISOString()
        };
    }

    return result;
}

/**
 * Calculate exam score
 */
function calculateScore(examData, answers) {
    let totalScore = 0;
    let maxScore = 0;
    const results = [];

    examData.questions.forEach((question, index) => {
        const studentAnswer = answers[question.id] || answers[index + 1];
        const isCorrect = studentAnswer === question.correctAnswer;
        const marks = question.marks || (question.difficulty === 'easy' ? 2 : question.difficulty === 'medium' ? 3 : 5.5);
        
        maxScore += marks;
        if (isCorrect) {
            totalScore += marks;
        }

        results.push({
            questionId: question.id,
            question: question.question,
            studentAnswer: studentAnswer || 'Not answered',
            correctAnswer: question.correctAnswer,
            isCorrect: isCorrect,
            marks: marks,
            scored: isCorrect ? marks : 0,
            explanation: question.explanation,
            difficulty: question.difficulty
        });
    });

    // Determine performance level
    const percentage = (totalScore / maxScore) * 100;
    let performanceLevel;
    if (percentage >= 80) performanceLevel = 'STRONG';
    else if (percentage >= 50) performanceLevel = 'MEDIUM';
    else performanceLevel = 'WEAK';

    // Calculate difficulty-wise scores
    const difficultyScores = {
        easy: { total: 0, scored: 0, count: 0 },
        medium: { total: 0, scored: 0, count: 0 },
        hard: { total: 0, scored: 0, count: 0 }
    };

    results.forEach(r => {
        const diff = r.difficulty || 'medium';
        if (difficultyScores[diff]) {
            difficultyScores[diff].total += r.marks;
            difficultyScores[diff].scored += r.scored;
            difficultyScores[diff].count++;
        }
    });

    return {
        totalScore,
        maxScore,
        percentage: Math.round(percentage * 100) / 100,
        performanceLevel,
        difficultyScores,
        results,
        summary: {
            correct: results.filter(r => r.isCorrect).length,
            incorrect: results.filter(r => !r.isCorrect && r.studentAnswer !== 'Not answered').length,
            unanswered: results.filter(r => r.studentAnswer === 'Not answered').length,
            total: results.length
        }
    };
}

module.exports = {
    createExamSession,
    generateExamQuestions,
    generateExam,
    calculateScore
};
