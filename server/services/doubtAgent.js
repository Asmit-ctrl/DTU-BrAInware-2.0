const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const API_KEY = process.env.ONDEMAND_API_KEY || "<your_api_key>";
console.log('📌 Doubt Agent API Key configured:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

const BASE_URL = "https://api.on-demand.io/chat/v1";
const MEDIA_BASE_URL = "https://api.on-demand.io/media/v1";

// ==================== IMAGE AGENT CONFIGURATION ====================
// For extracting data/questions from images
const IMAGE_AGENT_IDS = ["agent-1712327325", "agent-1713962163"];
const IMAGE_FILE_AGENTS = ["agent-1713954536", "agent-1713958591", "agent-1713958830", "agent-1713961903", "agent-1713967141"];
const IMAGE_ENDPOINT_ID = "predefined-xai-grok4.1-fast";
const IMAGE_REASONING_MODE = "grok-4-fast";
const IMAGE_FULFILLMENT_PROMPT = "extract data from image and give it as output";
const IMAGE_TEMPERATURE = 0.5;
const IMAGE_TOP_P = 1;
const IMAGE_MAX_TOKENS = 2839;

// ==================== MANIM SOLUTION AGENT CONFIGURATION ====================
// For generating Manim-based visual solutions
const MANIM_AGENT_IDS = ["agent-1712327325", "agent-1713962163", "agent-1768589843"];
const MANIM_ENDPOINT_ID = "predefined-xai-grok4.1-fast";
const MANIM_REASONING_MODE = "grok-4-fast";
const MANIM_RESPONSE_MODE = "stream";

// Model Configuration for Manim
const MANIM_TEMPERATURE = 0.6;
const MANIM_TOP_P = 1;
const MANIM_MAX_TOKENS = 8000;

// Paths for video generation
const OUTPUT_DIR = path.join(__dirname, '..', 'output', 'videos');
const MANIM_DIR = path.join(__dirname, '..', 'output', 'manim');
const AUDIO_DIR = path.join(__dirname, '..', 'output', 'audio');
const TEMP_DIR = path.join(__dirname, '..', 'output', 'temp');

// Ensure directories exist
[OUTPUT_DIR, MANIM_DIR, AUDIO_DIR, TEMP_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

/**
 * Upload image to Media API
 */
async function uploadImageToMedia(imageBase64, sessionId, fileName = 'question_image.png') {
    const url = `${MEDIA_BASE_URL}/public/file/raw`;

    // Clean the base64 string
    let cleanBase64 = imageBase64;
    if (imageBase64.includes(',')) {
        cleanBase64 = imageBase64.split(',')[1];
    }

    // Convert base64 to buffer and save temporarily
    const imageBuffer = Buffer.from(cleanBase64, 'base64');
    const tempFilePath = path.join(TEMP_DIR, `${Date.now()}_${fileName}`);
    fs.writeFileSync(tempFilePath, imageBuffer);

    console.log(`\n📤 MEDIA API - Uploading image...`);
    console.log(`📁 Temp file: ${tempFilePath}`);
    console.log(`📏 Size: ${imageBuffer.length} bytes`);

    try {
        const formData = new FormData();
        
        // Add file
        formData.append('file', fs.createReadStream(tempFilePath));
        
        // Add form fields
        formData.append('sessionId', sessionId);
        formData.append('createdBy', 'EduPortal');
        formData.append('updatedBy', 'EduPortal');
        formData.append('name', fileName);
        formData.append('responseMode', 'stream');
        
        // Add file agents for image processing
        IMAGE_FILE_AGENTS.forEach(agent => {
            formData.append('agents', agent);
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                ...formData.getHeaders()
            },
            body: formData
        });

        // Clean up temp file
        try { fs.unlinkSync(tempFilePath); } catch (e) {}

        if (response.status === 201 || response.status === 200) {
            const mediaResponse = await response.json();
            console.log(`✅ Image uploaded successfully!`);
            console.log(`📄 File ID: ${mediaResponse.data?.id}`);
            console.log(`🔗 URL: ${mediaResponse.data?.url}`);
            
            if (mediaResponse.data?.context) {
                console.log(`📋 Context extracted: ${mediaResponse.data.context.substring(0, 200)}...`);
            }

            return {
                success: true,
                fileId: mediaResponse.data?.id,
                url: mediaResponse.data?.url,
                context: mediaResponse.data?.context || null
            };
        } else {
            const errorText = await response.text();
            console.error(`❌ Media upload error (${response.status}):`, errorText);
            return { success: false, error: errorText };
        }
    } catch (error) {
        // Clean up temp file on error
        try { fs.unlinkSync(tempFilePath); } catch (e) {}
        console.error(`❌ Exception during media upload: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Extract data/question from image using Image Agent (with Media upload)
 */
async function extractDataFromImage(sessionId, imageBase64, additionalContext = '') {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📷 IMAGE AGENT - Starting image analysis`);
    console.log(`${'='.repeat(60)}`);

    // Step 1: Upload image to Media API
    const uploadResult = await uploadImageToMedia(imageBase64, sessionId);
    
    // If the Media API already extracted context, use it
    if (uploadResult.success && uploadResult.context) {
        console.log(`✅ Image context extracted by Media API`);
        return {
            success: true,
            extractedData: uploadResult.context,
            error: null
        };
    }

    // Step 2: If no context from upload, query the Image Agent
    const url = `${BASE_URL}/sessions/${sessionId}/query`;

    const query = additionalContext 
        ? `The image has been uploaded. ${additionalContext}. Please analyze the uploaded image and extract all text, mathematical expressions, formulas, diagrams, and questions. Provide a clear structured output.`
        : `The image has been uploaded. Please analyze the uploaded image and extract all text, mathematical expressions, formulas, diagrams, and questions. Provide a clear structured output of everything visible.`;

    const body = {
        endpointId: IMAGE_ENDPOINT_ID,
        query: query,
        agentIds: IMAGE_AGENT_IDS,
        responseMode: "stream",
        reasoningMode: IMAGE_REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: IMAGE_FULFILLMENT_PROMPT,
            stopSequences: [],
            temperature: IMAGE_TEMPERATURE,
            topP: IMAGE_TOP_P,
            maxTokens: IMAGE_MAX_TOKENS,
            presencePenalty: 0,
            frequencyPenalty: 0
        }
    };

    console.log(`\n� Querying Image Agent for analysis...`);

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
            console.error(`❌ Image extraction error (${response.status}):`, errorText);
            return { success: false, error: `API error: ${response.status}`, extractedData: null };
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
                console.log(`✅ Image data extracted (${fullAnswer.length} chars)`);
                console.log(`📝 Extracted content preview: "${fullAnswer.substring(0, 200)}..."`);
                
                resolve({
                    success: true,
                    extractedData: fullAnswer,
                    error: null
                });
            });

            response.body.on('error', (err) => {
                reject({ success: false, error: err.message, extractedData: null });
            });
        });

    } catch (error) {
        console.error(`❌ Exception extracting image data: ${error.message}`);
        return { success: false, error: error.message, extractedData: null };
    }
}

/**
 * Fulfillment prompt for Manim-based doubt resolution
 */
const getManimFulfillmentPrompt = (studentProfile, extractedImageData = null) => `
Role: You are a Doubt Resolution Specialist for Indian students (Classes 6-12, NCERT curriculum).
You combine patient teaching with visual explanations using Manim animations.

Student Profile:
- Class: ${studentProfile.class || 9} (NCERT)
- Subject: ${studentProfile.subject || 'Mathematics'}
- Chapter: ${studentProfile.chapter || 'Not specified'}
- Topic: ${studentProfile.topic || 'Not specified'}
- Concept Accuracy: ${studentProfile.conceptAccuracy || 50}%
- Mastery Level: ${studentProfile.masteryLevel || 'MODERATE'}
- Time per Question: ${studentProfile.timePerQuestion || 60} seconds
- Number of Attempts: ${studentProfile.numberOfAttempts || 1}
- First-Attempt Correct Rate: ${studentProfile.firstAttemptCorrectRate || 50}%

${extractedImageData ? `
EXTRACTED IMAGE DATA:
${extractedImageData}
---
Use the above extracted image data as the basis for your explanation.
` : ''}

Instructions:
1. Restate the confusion in simple words that match student's level.
2. Explain using step-by-step logical hints (not the full proof directly for weak learners).
3. Use VERY SIMPLE language suitable for ${studentProfile.masteryLevel === 'WEAK' ? 'a struggling learner' : 'the student level'}.
4. Use NCERT-aligned reasoning only.
5. Avoid mathematical jargon unless necessary.
6. Use visual reasoning concepts that can be animated.

Response Format (ALWAYS use this exact JSON structure):
{
  "doubtClarification": "1-2 lines restating the confusion simply",
  "guidedExplanation": {
    "hints": ["hint 1", "hint 2", "hint 3"],
    "visualConcepts": ["concept that can be shown visually"]
  },
  "manimCode": "Complete Manim Community Edition code for animation",
  "narration": ["narration text 1 synced with scene 1", "narration text 2 synced with scene 2"],
  "reflectiveQuestion": "One question to make student think",
  "encouragement": "Supportive closing line"
}

Manim Code Requirements:
- Use Manim Community Edition (manim) syntax ONLY
- Create a class named 'DoubtAnimation' extending Scene
- Keep animations SLOW and clear (use run_time=2 or more)
- Include text explanations within the animation
- Use colors to highlight key concepts
- Add pauses between steps (self.wait(1) or self.wait(2))
- Maximum animation duration: 45 seconds total
- DO NOT use FadeOut(VGroup(*self.mobjects)) - instead use self.clear() or remove specific objects
- For clearing screen, use: self.play(*[FadeOut(mob) for mob in self.mobjects])
- Use MathTex for math formulas (NOT Text with LaTeX)
- For fractions use MathTex(r"\\frac{a}{b}") with raw strings
- Always use raw strings (r"...") for LaTeX in MathTex
- Keep the animation simple - maximum 10-12 animations
- End with self.wait(2) to hold final frame

IMPORTANT: Your response MUST be ONLY valid JSON. Do not include any text before or after the JSON.
`;

/**
 * Create doubt session
 */
async function createDoubtSession(studentId, studentName) {
    const url = `${BASE_URL}/sessions`;
    const externalUserId = `doubt_${studentId}_${Date.now()}`;

    const body = {
        agentIds: [...new Set([...IMAGE_AGENT_IDS, ...MANIM_AGENT_IDS])], // Combine both agent sets
        externalUserId: externalUserId,
        contextMetadata: [
            { key: "studentId", value: studentId },
            { key: "studentName", value: studentName },
            { key: "sessionType", value: "doubt_resolution" }
        ]
    };

    console.log(`\n🤔 Creating doubt session for ${studentName}...`);

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
            console.log(`✅ Doubt session created: ${data.data.id}`);
            return {
                sessionId: data.data.id,
                externalUserId: externalUserId
            };
        } else {
            const error = await response.text();
            console.error(`❌ Failed to create doubt session: ${error}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Exception creating doubt session: ${error.message}`);
        return null;
    }
}

/**
 * Process image and analyze doubt using TWO-STEP approach:
 * Step 1: Use Image Agent to extract data/question from image
 * Step 2: Use Manim Agent to generate visual solution
 */
async function analyzeDoubtWithImage(sessionId, doubtText, imageBase64, studentProfile) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;
    
    let extractedImageData = null;
    
    // ==================== STEP 1: EXTRACT DATA FROM IMAGE ====================
    if (imageBase64) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📷 STEP 1: IMAGE DATA EXTRACTION`);
        console.log(`${'='.repeat(60)}`);
        
        const imageResult = await extractDataFromImage(sessionId, imageBase64, doubtText);
        
        if (imageResult.success && imageResult.extractedData) {
            extractedImageData = imageResult.extractedData;
            console.log(`✅ Image data extracted successfully`);
        } else {
            console.log(`⚠️ Could not extract image data, proceeding with text only`);
        }
    }

    // ==================== STEP 2: GENERATE MANIM SOLUTION ====================
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎬 STEP 2: MANIM SOLUTION GENERATION`);
    console.log(`${'='.repeat(60)}`);

    // Build the query with extracted image data
    let query = `Analyze and resolve this student doubt:\n\n`;
    
    if (extractedImageData) {
        query += `EXTRACTED FROM IMAGE:\n${extractedImageData}\n\n`;
    }
    
    if (doubtText && doubtText !== '[Image uploaded]') {
        query += `STUDENT'S QUESTION: "${doubtText}"\n\n`;
    }

    query += `
Generate a complete explanation with Manim animation code.
The animation should visually demonstrate the concept and solve the problem step by step.
Include narration text that will be converted to audio and synced with the video.

Return ONLY valid JSON in the specified format.`;

    const body = {
        endpointId: MANIM_ENDPOINT_ID,
        query: query,
        agentIds: MANIM_AGENT_IDS,
        responseMode: MANIM_RESPONSE_MODE,
        reasoningMode: MANIM_REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: getManimFulfillmentPrompt(studentProfile, extractedImageData),
            temperature: MANIM_TEMPERATURE,
            topP: MANIM_TOP_P,
            maxTokens: MANIM_MAX_TOKENS
        }
    };

    console.log(`\n🔍 Generating Manim solution...`);
    console.log(`📝 Using extracted image data: ${extractedImageData ? 'Yes' : 'No'}`);
    console.log(`❓ Student question: "${doubtText?.substring(0, 50) || 'From image'}..."`);

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

        if (!response.body) {
            return { success: false, error: 'No response body' };
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
                        if (dataStr === "[DONE]") {
                            continue;
                        }

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
                console.log(`✅ Manim solution generated (${fullAnswer.length} chars)`);
                
                try {
                    // Extract JSON from response
                    const jsonMatch = fullAnswer.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        const parsed = JSON.parse(jsonMatch[0]);
                        
                        // Include extracted image data in response
                        if (extractedImageData) {
                            parsed.extractedImageData = extractedImageData;
                        }
                        
                        resolve({
                            success: true,
                            data: parsed,
                            rawResponse: fullAnswer,
                            extractedImageData: extractedImageData
                        });
                    } else {
                        // If no JSON, return as plain text response
                        resolve({
                            success: true,
                            data: {
                                doubtClarification: fullAnswer,
                                guidedExplanation: { hints: [], visualConcepts: [] },
                                manimCode: null,
                                narration: [],
                                reflectiveQuestion: "",
                                encouragement: "",
                                extractedImageData: extractedImageData
                            },
                            rawResponse: fullAnswer,
                            extractedImageData: extractedImageData
                        });
                    }
                } catch (parseError) {
                    console.error('❌ JSON parse error:', parseError.message);
                    resolve({
                        success: true,
                        data: {
                            doubtClarification: fullAnswer,
                            guidedExplanation: { hints: [], visualConcepts: [] },
                            manimCode: null,
                            narration: [],
                            reflectiveQuestion: "",
                            encouragement: "",
                            extractedImageData: extractedImageData
                        },
                        rawResponse: fullAnswer,
                        extractedImageData: extractedImageData
                    });
                }
            });

            response.body.on('error', (err) => {
                reject({ success: false, error: err.message });
            });
        });

    } catch (error) {
        console.error(`❌ Exception generating Manim solution: ${error.message}`);
        return { success: false, error: error.message };
    }
}

/**
 * Follow-up question in same session (maintains context)
 */
async function followUpDoubt(sessionId, followUpText, studentProfile) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;

    const query = `Follow-up question from student:

"${followUpText}"

Please continue explaining based on our previous conversation.
If this requires a new visual explanation, provide updated Manim code.
Maintain simple language appropriate for the student's level.

Return ONLY valid JSON in the specified format.`;

    const body = {
        endpointId: MANIM_ENDPOINT_ID,
        query: query,
        agentIds: MANIM_AGENT_IDS,
        responseMode: MANIM_RESPONSE_MODE,
        reasoningMode: MANIM_REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: getManimFulfillmentPrompt(studentProfile),
            temperature: MANIM_TEMPERATURE,
            topP: MANIM_TOP_P,
            maxTokens: MANIM_MAX_TOKENS
        }
    };

    console.log(`\n💬 Processing follow-up: "${followUpText.substring(0, 50)}..."`);

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
                        resolve({ success: true, data: parsed, rawResponse: fullAnswer });
                    } else {
                        resolve({
                            success: true,
                            data: {
                                doubtClarification: fullAnswer,
                                guidedExplanation: { hints: [], visualConcepts: [] },
                                manimCode: null,
                                narration: [],
                                reflectiveQuestion: "",
                                encouragement: ""
                            },
                            rawResponse: fullAnswer
                        });
                    }
                } catch (e) {
                    resolve({
                        success: true,
                        data: { doubtClarification: fullAnswer },
                        rawResponse: fullAnswer
                    });
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
 * Generate video from Manim code with audio
 */
async function generateVideo(manimCode, narration, doubtId) {
    const timestamp = Date.now();
    const manimFile = path.join(MANIM_DIR, `doubt_${doubtId}_${timestamp}.py`);
    const outputVideo = path.join(OUTPUT_DIR, `doubt_${doubtId}_${timestamp}.mp4`);
    const audioFile = path.join(AUDIO_DIR, `doubt_${doubtId}_${timestamp}.mp3`);
    const finalVideo = path.join(OUTPUT_DIR, `doubt_${doubtId}_${timestamp}_final.mp4`);

    // Path to virtual environment Python/Manim
    const venvPath = path.join(__dirname, '..', '..', '.venv');
    const isWindows = process.platform === 'win32';
    const pythonPath = isWindows 
        ? path.join(venvPath, 'Scripts', 'python.exe')
        : path.join(venvPath, 'bin', 'python');
    const manimPath = isWindows
        ? path.join(venvPath, 'Scripts', 'manim.exe')
        : path.join(venvPath, 'bin', 'manim');

    try {
        // Step 1: Write Manim code to file
        const fullManimCode = `
from manim import *

${manimCode}

# Render command will be: manim -pql ${manimFile} DoubtAnimation
`;
        fs.writeFileSync(manimFile, fullManimCode);
        console.log(`📝 Manim code written to: ${manimFile}`);

        // Step 2: Generate video using Manim from virtual environment
        console.log(`🎬 Generating Manim animation...`);
        console.log(`📍 Using Manim from: ${manimPath}`);
        
        try {
            // Use the virtual environment's manim
            let manimCmd;
            if (fs.existsSync(manimPath)) {
                manimCmd = `"${manimPath}" -qm "${manimFile}" DoubtAnimation`;
            } else {
                // Fallback: try using python -m manim
                manimCmd = `"${pythonPath}" -m manim -qm "${manimFile}" DoubtAnimation`;
            }
            
            console.log(`🔧 Running: ${manimCmd}`);
            
            try {
                await execPromise(manimCmd, { 
                    cwd: path.dirname(manimFile),
                    timeout: 180000, // 3 minute timeout
                    shell: true
                });
                console.log(`✅ Manim completed successfully`);
            } catch (execError) {
                console.log(`⚠️ Manim execution warning (may still have generated video): ${execError.message}`);
            }
            
            // Manim outputs to media/videos folder, find the actual output
            const mediaDir = path.join(path.dirname(manimFile), 'media', 'videos');
            console.log(`🔍 Looking for video in: ${mediaDir}`);
            
            if (fs.existsSync(mediaDir)) {
                // Find the generated video (look for the most recent DoubtAnimation.mp4)
                const findVideo = (dir, depth = 0) => {
                    if (depth > 5) return null; // Prevent infinite recursion
                    
                    try {
                        const items = fs.readdirSync(dir);
                        let mostRecentVideo = null;
                        let mostRecentTime = 0;
                        
                        for (const item of items) {
                            const fullPath = path.join(dir, item);
                            const stat = fs.statSync(fullPath);
                            
                            if (stat.isDirectory()) {
                                const found = findVideo(fullPath, depth + 1);
                                if (found) {
                                    const foundStat = fs.statSync(found);
                                    if (foundStat.mtimeMs > mostRecentTime) {
                                        mostRecentVideo = found;
                                        mostRecentTime = foundStat.mtimeMs;
                                    }
                                }
                            } else if (item.endsWith('.mp4') && item.includes('DoubtAnimation')) {
                                if (stat.mtimeMs > mostRecentTime) {
                                    mostRecentVideo = fullPath;
                                    mostRecentTime = stat.mtimeMs;
                                }
                            }
                        }
                        
                        return mostRecentVideo;
                    } catch (e) {
                        console.log(`Error reading directory: ${e.message}`);
                        return null;
                    }
                };
                
                const generatedVideo = findVideo(mediaDir);
                if (generatedVideo) {
                    // Copy to output directory
                    fs.copyFileSync(generatedVideo, outputVideo);
                    console.log(`✅ Video found and copied to: ${outputVideo}`);
                } else {
                    console.log(`⚠️ No DoubtAnimation.mp4 found in media directory`);
                }
            } else {
                console.log(`⚠️ Media directory not found: ${mediaDir}`);
            }
        } catch (manimError) {
            console.log(`⚠️ Manim error: ${manimError.message}`);
            // Return the code without video for now
            return {
                success: true,
                manimCode: manimCode,
                manimFile: manimFile,
                videoUrl: null,
                audioUrl: null,
                message: 'Manim code generated. Video rendering failed: ' + manimError.message
            };
        }

        // Step 3: Generate audio from narration (using TTS)
        if (narration && narration.length > 0) {
            console.log(`🔊 Generating audio narration...`);
            const narrationText = Array.isArray(narration) ? narration.join(' ') : narration;
            
            // Try to use edge-tts from virtual environment
            try {
                const edgeTtsPath = isWindows
                    ? path.join(venvPath, 'Scripts', 'edge-tts.exe')
                    : path.join(venvPath, 'bin', 'edge-tts');
                
                let ttsCmd;
                if (fs.existsSync(edgeTtsPath)) {
                    ttsCmd = `"${edgeTtsPath}" --text "${narrationText.replace(/"/g, '\\"')}" --write-media "${audioFile}"`;
                } else {
                    ttsCmd = `"${pythonPath}" -m edge_tts --text "${narrationText.replace(/"/g, '\\"')}" --write-media "${audioFile}"`;
                }
                
                await execPromise(ttsCmd, { timeout: 60000, shell: true });
                console.log(`✅ Audio generated: ${audioFile}`);
            } catch (ttsError) {
                console.log(`⚠️ TTS not available: ${ttsError.message}`);
            }
        }

        // Step 4: Combine video and audio using ffmpeg
        if (fs.existsSync(outputVideo) && fs.existsSync(audioFile)) {
            console.log(`🎥 Combining video and audio...`);
            try {
                const ffmpegCmd = `ffmpeg -i "${outputVideo}" -i "${audioFile}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${finalVideo}"`;
                await execPromise(ffmpegCmd, { timeout: 60000, shell: true });
                console.log(`✅ Final video with audio: ${finalVideo}`);
                
                return {
                    success: true,
                    manimCode: manimCode,
                    manimFile: manimFile,
                    videoUrl: `/videos/${path.basename(finalVideo)}`,
                    audioUrl: `/audio/${path.basename(audioFile)}`
                };
            } catch (ffmpegError) {
                console.log(`⚠️ FFmpeg error: ${ffmpegError.message}`);
            }
        }

        // Return video without audio if audio failed
        if (fs.existsSync(outputVideo)) {
            return {
                success: true,
                manimCode: manimCode,
                manimFile: manimFile,
                videoUrl: `/videos/${path.basename(outputVideo)}`,
                audioUrl: null
            };
        }

        return {
            success: true,
            manimCode: manimCode,
            manimFile: manimFile,
            videoUrl: null,
            audioUrl: null,
            message: 'Manim code generated. Install Manim and FFmpeg for video rendering.'
        };

    } catch (error) {
        console.error(`❌ Video generation error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            manimCode: manimCode
        };
    }
}

/**
 * Main function to resolve doubt
 */
async function resolveDoubt(studentId, studentName, doubtText, imageBase64 = null, studentProfile = {}) {
    console.log('\n' + '='.repeat(60));
    console.log('🎓 DOUBT AGENT - Starting doubt resolution');
    console.log('='.repeat(60));

    // Create session
    const session = await createDoubtSession(studentId, studentName);
    if (!session) {
        return { success: false, error: 'Failed to create session' };
    }

    // Analyze doubt
    const analysis = await analyzeDoubtWithImage(
        session.sessionId,
        doubtText,
        imageBase64,
        studentProfile
    );

    if (!analysis.success) {
        return { success: false, error: analysis.error, sessionId: session.sessionId };
    }

    // Generate video if Manim code is available
    let videoResult = null;
    if (analysis.data.manimCode) {
        videoResult = await generateVideo(
            analysis.data.manimCode,
            analysis.data.narration,
            `${studentId}_${Date.now()}`
        );
    }

    return {
        success: true,
        sessionId: session.sessionId,
        response: analysis.data,
        video: videoResult,
        rawResponse: analysis.rawResponse
    };
}

/**
 * Continue conversation with follow-up
 */
async function continueDoubt(sessionId, followUpText, studentProfile = {}) {
    console.log('\n' + '='.repeat(60));
    console.log('💬 DOUBT AGENT - Processing follow-up');
    console.log('='.repeat(60));

    const analysis = await followUpDoubt(sessionId, followUpText, studentProfile);

    if (!analysis.success) {
        return { success: false, error: analysis.error };
    }

    // Generate video if new Manim code is provided
    let videoResult = null;
    if (analysis.data.manimCode) {
        videoResult = await generateVideo(
            analysis.data.manimCode,
            analysis.data.narration,
            `followup_${Date.now()}`
        );
    }

    return {
        success: true,
        response: analysis.data,
        video: videoResult,
        rawResponse: analysis.rawResponse
    };
}

/**
 * Get default Manim code for common topics
 */
function getDefaultManimCode(topic) {
    const templates = {
        'irrational': `
class DoubtAnimation(Scene):
    def construct(self):
        # Title
        title = Text("Understanding √2 is Irrational", font_size=36)
        title.to_edge(UP)
        self.play(Write(title), run_time=2)
        self.wait(1)
        
        # Number line
        number_line = NumberLine(
            x_range=[0, 2, 0.5],
            length=10,
            include_numbers=True,
            include_tip=True
        )
        self.play(Create(number_line), run_time=2)
        self.wait(1)
        
        # Show √2 position
        sqrt2_point = Dot(number_line.n2p(1.414), color=RED)
        sqrt2_label = MathTex(r"\\sqrt{2} \\approx 1.414...", font_size=30, color=RED)
        sqrt2_label.next_to(sqrt2_point, UP)
        
        self.play(Create(sqrt2_point), Write(sqrt2_label), run_time=2)
        self.wait(2)
        
        # Show fractions trying to reach √2
        fractions = [
            ("1/1", 1.0),
            ("3/2", 1.5),
            ("7/5", 1.4),
            ("99/70", 1.414285),
            ("577/408", 1.41421568)
        ]
        
        explanation = Text("Fractions get close, but never exactly equal √2!", 
                          font_size=24).to_edge(DOWN)
        self.play(Write(explanation), run_time=2)
        
        for frac_text, frac_value in fractions:
            frac_dot = Dot(number_line.n2p(frac_value), color=BLUE)
            frac_label = MathTex(frac_text, font_size=24, color=BLUE)
            frac_label.next_to(frac_dot, DOWN)
            self.play(Create(frac_dot), Write(frac_label), run_time=1)
            self.wait(0.5)
        
        self.wait(2)
        
        # Final message
        final = Text("The decimals of √2 go on forever without repeating!", 
                    font_size=28, color=YELLOW)
        final.next_to(explanation, UP)
        self.play(Write(final), run_time=2)
        self.wait(3)
`,
        'default': `
class DoubtAnimation(Scene):
    def construct(self):
        # Title
        title = Text("Let's Understand This Concept", font_size=40)
        self.play(Write(title), run_time=2)
        self.wait(1)
        self.play(title.animate.to_edge(UP))
        
        # Main explanation
        explanation = Text("Breaking down the concept step by step...", font_size=30)
        self.play(Write(explanation), run_time=2)
        self.wait(2)
        
        # Visual representation
        circle = Circle(radius=2, color=BLUE)
        self.play(Create(circle), run_time=2)
        self.wait(2)
        
        # Add points or labels as needed
        point = Dot(color=RED)
        self.play(Create(point), run_time=1)
        self.wait(2)
`
    };

    // Check if topic matches any template
    for (const [key, code] of Object.entries(templates)) {
        if (topic.toLowerCase().includes(key)) {
            return code;
        }
    }
    return templates.default;
}

module.exports = {
    createDoubtSession,
    analyzeDoubtWithImage,
    followUpDoubt,
    generateVideo,
    resolveDoubt,
    continueDoubt,
    getDefaultManimCode
};
