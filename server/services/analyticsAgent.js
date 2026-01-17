const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');

const API_KEY = process.env.ONDEMAND_API_KEY || "<your_api_key>";
console.log('📌 Analytics Agent API Key configured:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

const BASE_URL = "https://api.on-demand.io/chat/v1";

const AGENT_IDS = ["agent-1712327325", "agent-1713962163"];
const ENDPOINT_ID = "predefined-openai-gpt5.2";
const REASONING_MODE = "grok-4-fast";
const RESPONSE_MODE = "stream";

const FULFILLMENT_PROMPT = `You are an Analytics Agent that interprets student learning behavior
for an AI-powered adaptive learning platform (Classes 6–12, NCERT).

Inputs:
- Accuracy Change Over Time
- Mistake Repetition Count
- Hint Usage Count
- Consecutive Wrong Answers
- Post-Revision Accuracy
- Time Taken per Question (seconds)

Your Tasks:

1. Performance Detection
- Detect IMPROVEMENT if accuracy is increasing and time per question is stable or decreasing.
- Detect STAGNATION if accuracy is flat and time per question remains high.
- Detect DECLINE if accuracy decreases and mistakes repeat.

2. Struggle Identification
- Mark a concept as WEAK if:
  - Mistake Repetition Count ≥ 2 OR
  - Consecutive Wrong Answers ≥ 2 OR
  - Hint Usage Count is high AND time per question is high.

3. Risk Classification
- LOW RISK:
  - Accuracy improving
  - Few hints used
  - Time per question within expected range
- MEDIUM RISK:
  - High time per question
  - Repeated hints
  - Accuracy not improving
- HIGH RISK:
  - Consecutive wrong answers ≥ 3
  - Low post-revision accuracy
  - Repeated mistakes across sessions

4. Action Triggers
- If LOW RISK → Continue current learning path
- If MEDIUM RISK → Trigger targeted practice and revision
- If HIGH RISK → Escalate to human mentor or teacher agent

Output Format:
- Performance Status: Improvement / Stagnation / Decline
- Identified Weak Concepts
- Risk Level: Low / Medium / High
- Recommended Next Action
`;

/**
 * Create a chat session with the analytics agent
 */
async function createChatSession(studentId, studentName) {
    const url = `${BASE_URL}/sessions`;
    
    const contextMetadata = [
        { key: "userId", value: studentId },
        { key: "name", value: studentName }
    ];

    const body = {
        agentIds: AGENT_IDS,
        externalUserId: studentId,
        contextMetadata: contextMetadata,
    };

    console.log(`Creating analytics session for student: ${studentName} (${studentId})`);

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
            const sessionRespData = await response.json();
            console.log(`✅ Analytics session created: ${sessionRespData.data.id}`);
            return {
                sessionId: sessionRespData.data.id,
                contextMetadata
            };
        } else {
            const respBody = await response.text();
            console.error(`❌ Error creating analytics session: ${response.status} - ${respBody}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Exception creating session: ${error.message}`);
        return null;
    }
}

/**
 * Submit quiz performance data to analytics agent
 */
async function submitQueryToAgent(sessionId, query, contextMetadata) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;
    
    const body = {
        endpointId: ENDPOINT_ID,
        query: query,
        agentIds: AGENT_IDS,
        responseMode: RESPONSE_MODE,
        reasoningMode: REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: FULFILLMENT_PROMPT,
            stopSequences: [],
            temperature: 0.7,
            topP: 1,
            maxTokens: 2560,
            presencePenalty: 0,
            frequencyPenalty: 0,
        },
    };

    console.log(`🚀 Submitting analytics query...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (RESPONSE_MODE === "stream") {
            if (!response.body) {
                console.error("❌ No response body for streaming.");
                return null;
            }

            let fullAnswer = "";
            let finalSessionId = "";
            let finalMessageId = "";
            let metrics = {};

            // Node.js streaming with node-fetch v2
            return new Promise((resolve, reject) => {
                let buffer = '';

                response.body.on('data', (chunk) => {
                    buffer += chunk.toString();
                    const lines = buffer.split('\n');
                    
                    // Keep the last incomplete line in buffer
                    buffer = lines.pop() || '';

                    for (const line of lines) {
                        if (line.startsWith("data:")) {
                            const dataStr = line.slice(5).trim();
                            if (dataStr === "[DONE]") continue;

                            try {
                                const event = JSON.parse(dataStr);
                                if (event.eventType === "fulfillment") {
                                    if (event.answer) fullAnswer += event.answer;
                                    if (event.sessionId) finalSessionId = event.sessionId;
                                    if (event.messageId) finalMessageId = event.messageId;
                                } else if (event.eventType === "metricsLog") {
                                    if (event.publicMetrics) metrics = event.publicMetrics;
                                }
                            } catch (e) {
                                // Skip invalid JSON
                                continue;
                            }
                        }
                    }
                });

                response.body.on('end', () => {
                    console.log(`✅ Streaming complete. Answer length: ${fullAnswer.length} characters`);
                    resolve({
                        sessionId: finalSessionId,
                        messageId: finalMessageId,
                        answer: fullAnswer,
                        metrics: metrics,
                        status: "completed",
                        contextMetadata: contextMetadata,
                    });
                });

                response.body.on('error', (error) => {
                    console.error(`❌ Stream error: ${error.message}`);
                    reject(error);
                });
            });
        } else {
            // Sync mode
            if (response.status === 200) {
                const original = await response.json();
                if (original.data) {
                    original.data.contextMetadata = contextMetadata;
                }
                return original.data;
            } else {
                const respBody = await response.text();
                console.error(`❌ Error submitting query: ${response.status} - ${respBody}`);
                return null;
            }
        }
    } catch (error) {
        console.error(`❌ Exception during query submission: ${error.message}`);
        return null;
    }
}

/**
 * Format quiz attempt data for analytics agent
 */
function formatQuizDataForAnalytics(quizAttempts) {
    // Calculate aggregated metrics
    const totalAttempts = quizAttempts.length;
    
    if (totalAttempts === 0) {
        return "No quiz attempts available for analysis.";
    }

    // Sort by date to track trends
    const sortedAttempts = [...quizAttempts].sort((a, b) => 
        new Date(a.completedAt) - new Date(b.completedAt)
    );

    // Calculate metrics
    const accuracies = sortedAttempts.map(a => a.accuracy);
    const avgAccuracy = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    
    const totalMistakeRepetitions = sortedAttempts.reduce((sum, a) => sum + a.mistakeRepetitionCount, 0);
    const avgMistakeRepetitions = totalMistakeRepetitions / totalAttempts;
    
    const totalHintUsage = sortedAttempts.reduce((sum, a) => sum + a.hintUsageCount, 0);
    const avgHintUsage = totalHintUsage / totalAttempts;
    
    const maxConsecutiveWrong = Math.max(...sortedAttempts.map(a => a.consecutiveWrongAnswers));
    
    const avgPostRevisionAccuracy = sortedAttempts
        .filter(a => a.postRevisionAccuracy !== undefined)
        .reduce((sum, a, _, arr) => sum + a.postRevisionAccuracy / arr.length, 0);
    
    const avgTimePerQuestion = sortedAttempts.reduce((sum, a) => {
        const totalTime = a.timePerQuestion.reduce((s, t) => s + t, 0);
        return sum + (totalTime / a.timePerQuestion.length);
    }, 0) / totalAttempts;

    // Track accuracy change
    let accuracyTrend = "STABLE";
    if (accuracies.length >= 2) {
        const firstHalf = accuracies.slice(0, Math.floor(accuracies.length / 2));
        const secondHalf = accuracies.slice(Math.floor(accuracies.length / 2));
        const firstAvg = firstHalf.reduce((s, a) => s + a, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((s, a) => s + a, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 5) accuracyTrend = "IMPROVING";
        else if (secondAvg < firstAvg - 5) accuracyTrend = "DECLINING";
    }

    // Format the query
    const query = `
Analyze this student's learning performance:

**Performance Metrics:**
- Total Quiz Attempts: ${totalAttempts}
- Average Accuracy: ${avgAccuracy.toFixed(2)}%
- Accuracy Trend: ${accuracyTrend}
- Mistake Repetition Count: ${avgMistakeRepetitions.toFixed(2)} per quiz
- Average Hint Usage: ${avgHintUsage.toFixed(2)} per quiz
- Max Consecutive Wrong Answers: ${maxConsecutiveWrong}
- Post-Revision Accuracy: ${avgPostRevisionAccuracy.toFixed(2)}%
- Average Time per Question: ${avgTimePerQuestion.toFixed(2)} seconds

**Recent Quiz Results:**
${sortedAttempts.slice(-5).map((attempt, idx) => `
Quiz ${idx + 1}: ${attempt.quizTitle}
- Date: ${new Date(attempt.completedAt).toLocaleDateString()}
- Score: ${attempt.score}/${attempt.totalQuestions} (${attempt.accuracy.toFixed(1)}%)
- Hints Used: ${attempt.hintUsageCount}
- Consecutive Wrong: ${attempt.consecutiveWrongAnswers}
- Mistake Repetitions: ${attempt.mistakeRepetitionCount}
`).join('\n')}

**Question-Level Details (Last Quiz):**
${sortedAttempts[sortedAttempts.length - 1].answers.map((answer, idx) => `
Q${idx + 1}: ${answer.isCorrect ? '✓' : '✗'} | Time: ${sortedAttempts[sortedAttempts.length - 1].timePerQuestion[idx]}s | Hints: ${answer.hintsUsed ? 'Yes' : 'No'}
`).join('')}

Please provide:
1. Performance Status (Improvement/Stagnation/Decline)
2. Identified Weak Concepts
3. Risk Level (Low/Medium/High)
4. Recommended Next Action
`;

    return query;
}

/**
 * Main function to analyze student performance
 */
async function analyzeStudentPerformance(studentId, studentName, quizAttempts) {
    console.log(`\n=== Starting Analytics for ${studentName} ===`);
    
    // Create session
    const sessionData = await createChatSession(studentId, studentName);
    if (!sessionData) {
        console.error("Failed to create analytics session");
        return null;
    }

    // Format quiz data
    const query = formatQuizDataForAnalytics(quizAttempts);
    console.log("Query prepared for analytics agent");

    // Submit query
    const analyticsResult = await submitQueryToAgent(
        sessionData.sessionId, 
        query, 
        sessionData.contextMetadata
    );

    if (analyticsResult) {
        console.log(`✅ Analytics completed successfully`);
        console.log(`Analysis: ${analyticsResult.answer?.substring(0, 200)}...`);
        return analyticsResult;
    } else {
        console.error("Failed to get analytics result");
        return null;
    }
}

module.exports = {
    analyzeStudentPerformance,
    formatQuizDataForAnalytics
};
