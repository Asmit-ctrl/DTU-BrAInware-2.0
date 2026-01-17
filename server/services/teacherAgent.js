const fetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.ONDEMAND_API_KEY || "<your_api_key>";
console.log('📌 Teacher Agent API Key configured:', API_KEY ? `${API_KEY.substring(0, 10)}...` : 'NOT SET');

const BASE_URL = "https://api.on-demand.io/chat/v1";

// Teacher Agent Configuration
const TEACHER_AGENT_IDS = ["agent-1712327325", "agent-1713962163", "agent-1768589843"];
const ENDPOINT_ID = "predefined-claude-4-5-sonnet";
const REASONING_MODE = "grok-4-fast";
const RESPONSE_MODE = "stream";

const TEACHER_FULFILLMENT_PROMPT = `You are a Teacher Agent for Indian students (Classes 6–12, NCERT).
Your role is to teach concepts visually using Manim animations with RICH VISUAL DIAGRAMS,
adapting explanations based on student learning analytics.

Inputs:
- Concept Accuracy (%)
- Chapter Mastery Level (Weak / Medium / Strong)
- Topics for Today (from curriculum)
- Learning Pace:
  - Time per Question
  - Number of Attempts
- Engagement:
  - Study Streak
  - Session Duration
- Confidence:
  - First-Attempt Correct Rate

Your Responsibilities:

1. Teaching Strategy Adaptation
- If Chapter Mastery Level = WEAK:
  - Use very simple language
  - Explain one idea at a time
  - Use real-life, NCERT-aligned examples
  - Keep animations slow and minimal
- If Chapter Mastery Level = MEDIUM:
  - Explain concepts step-by-step
  - Use guided visuals and comparisons
  - Slightly increase animation pace
- If Chapter Mastery Level = STRONG:
  - Focus on concept intuition and applications
  - Use faster animations and problem-based visuals
  - Highlight shortcuts and patterns

2. Explanation Rules
- Never directly give final answers unless explicitly asked
- Do not overwhelm the student
- Encourage understanding, not memorization
- Praise effort, improvement, and consistency
- Be supportive and calm, never strict or judgmental

3. **MANDATORY VISUALIZATION REQUIREMENTS (Manim with LaTeX)**
- Generate Manim code only (Python)
- **COMPULSORY: Every lesson MUST include animated visual diagrams:**

  a) **Mathematical Formulas with MathTex/Tex:**
     - Use MathTex() for inline math: \`MathTex(r"x^2 + y^2 = r^2")\`
     - Use Tex() for text with math: \`Tex(r"Area = ", r"$\\pi r^2$")\`
     - Animate formulas appearing, transforming, highlighting
     - Example: \`self.play(Write(MathTex(r"E = mc^2")))\`

  b) **Geometric Diagrams (REQUIRED for math/science):**
     - Use Circle(), Square(), Triangle(), Polygon(), Line(), Arrow()
     - Use NumberLine() for number concepts
     - Use Axes(), NumberPlane() for coordinate geometry
     - Use always_redraw() for dynamic diagrams
     - Example: \`circle = Circle(radius=2, color=BLUE); self.play(Create(circle))\`

  c) **Animated Transformations (REQUIRED):**
     - Transform one shape into another: \`self.play(Transform(shape1, shape2))\`
     - Morph text/equations: \`self.play(TransformMatchingTex(eq1, eq2))\`
     - Use ReplacementTransform for smooth transitions
     - Highlight important parts: \`self.play(Indicate(element))\`

  d) **Color-coded Visual Elements:**
     - Use different colors: BLUE, RED, GREEN, YELLOW, PURPLE, ORANGE, GOLD
     - Highlight key parts with \`SurroundingRectangle()\` or \`Circumscribe()\`
     - Use \`set_color()\` to emphasize important elements

  e) **Animated Diagrams Examples to Include:**
     - Number lines with points moving
     - Venn diagrams for sets
     - Geometric constructions step-by-step
     - Graphs with animated plotting
     - Flowcharts for processes
     - Tables with animated cell highlights

  f) **LaTeX Mathematical Symbols to Use:**
     - Fractions: \`\\frac{a}{b}\`
     - Square root: \`\\sqrt{x}\`
     - Powers: \`x^{2}\`, \`x^{n}\`
     - Greek letters: \`\\pi\`, \`\\alpha\`, \`\\beta\`, \`\\theta\`
     - Summation: \`\\sum_{i=1}^{n}\`
     - Integrals: \`\\int_{a}^{b}\`
     - Sets: \`\\mathbb{N}\`, \`\\mathbb{Z}\`, \`\\mathbb{R}\`
     - Arrows: \`\\rightarrow\`, \`\\Rightarrow\`

4. **MINIMUM VISUAL REQUIREMENTS per Lesson:**
   - At least 3 MathTex/Tex formulas with animations
   - At least 2 geometric shapes/diagrams
   - At least 1 transformation animation
   - At least 1 number line or coordinate system (if applicable)
   - Color coding throughout

5. Analytics-Based Adjustments
- If Time per Question is high → slow animation pace, more visual steps
- If Attempts > 2 → repeat explanation with different visual approach
- If First-Attempt Correct Rate is low → use simpler diagrams, more colors
- If Engagement is high → add advanced visual patterns

Output Format:

A. Short Teaching Intent Summary
- Topic
- Student Level (Weak / Medium / Strong)
- Teaching Style Used
- Visual Elements Included (list the diagrams/formulas)

B. Manim Code
- Complete Python Manim script
- MUST include: MathTex, geometric shapes, transformations
- Includes scene class inheriting from Scene
- Includes comments explaining visuals
- IMPORTANT: The code block must start with \`\`\`python and end with \`\`\`
- Use proper LaTeX escaping (double backslash in Python strings)

C. Teacher Voice Guidance (comments only)
- Explain what the teacher is saying during animations
- Reference the visual elements being shown

**EXAMPLE CODE STRUCTURE (MUST FOLLOW):**
\`\`\`python
from manim import *

class ConceptLesson(Scene):
    def construct(self):
        # Title with nice styling
        title = Text("Topic Name", font_size=48, color=YELLOW)
        self.play(Write(title))
        self.wait(1)
        self.play(title.animate.to_edge(UP))
        
        # REQUIRED: Mathematical formula with MathTex
        formula = MathTex(r"a^2 + b^2 = c^2", font_size=48)
        self.play(Write(formula))
        self.wait(1)
        
        # REQUIRED: Geometric diagram
        triangle = Polygon(
            ORIGIN, RIGHT*3, RIGHT*3 + UP*2,
            color=BLUE, fill_opacity=0.3
        )
        self.play(Create(triangle))
        
        # REQUIRED: Labels with Tex
        label_a = MathTex("a", color=RED).next_to(triangle, LEFT)
        label_b = MathTex("b", color=GREEN).next_to(triangle, DOWN)
        self.play(Write(label_a), Write(label_b))
        
        # REQUIRED: Transformation/Animation
        self.play(Indicate(formula))
        self.play(triangle.animate.set_fill(YELLOW, opacity=0.5))
        
        # Continue with more visuals...
\`\`\`
`;

// Ensure directories exist
const MANIM_SCRIPTS_DIR = path.join(__dirname, '..', 'manim_scripts');
const MANIM_OUTPUT_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'videos');

function ensureDirectories() {
    if (!fs.existsSync(MANIM_SCRIPTS_DIR)) {
        fs.mkdirSync(MANIM_SCRIPTS_DIR, { recursive: true });
    }
    if (!fs.existsSync(MANIM_OUTPUT_DIR)) {
        fs.mkdirSync(MANIM_OUTPUT_DIR, { recursive: true });
    }
}

/**
 * Create a chat session with the teacher agent
 */
async function createTeacherSession(studentId, studentName) {
    const url = `${BASE_URL}/sessions`;
    
    const contextMetadata = [
        { key: "userId", value: studentId },
        { key: "name", value: studentName },
        { key: "role", value: "student" }
    ];

    const body = {
        agentIds: TEACHER_AGENT_IDS,
        externalUserId: studentId,
        contextMetadata: contextMetadata,
    };

    console.log(`📚 Creating teacher session for student: ${studentName} (${studentId})`);

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
            console.log(`✅ Teacher session created: ${sessionRespData.data.id}`);
            return {
                sessionId: sessionRespData.data.id,
                contextMetadata
            };
        } else {
            const respBody = await response.text();
            console.error(`❌ Error creating teacher session: ${response.status} - ${respBody}`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Exception creating session: ${error.message}`);
        return null;
    }
}

/**
 * Submit teaching request to teacher agent
 */
async function submitTeachingQuery(sessionId, query, contextMetadata) {
    const url = `${BASE_URL}/sessions/${sessionId}/query`;
    
    const body = {
        endpointId: ENDPOINT_ID,
        query: query,
        agentIds: TEACHER_AGENT_IDS,
        responseMode: RESPONSE_MODE,
        reasoningMode: REASONING_MODE,
        modelConfigs: {
            fulfillmentPrompt: TEACHER_FULFILLMENT_PROMPT,
            stopSequences: [],
            temperature: 0.7,
            topP: 1,
            maxTokens: 5427,
            presencePenalty: 0,
            frequencyPenalty: 0,
        },
    };

    console.log(`🎓 Submitting teaching query...`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'apikey': API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

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
                            continue;
                        }
                    }
                }
            });

            response.body.on('end', () => {
                console.log(`✅ Teacher response complete. Length: ${fullAnswer.length} characters`);
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
    } catch (error) {
        console.error(`❌ Exception during query submission: ${error.message}`);
        return null;
    }
}

/**
 * Determine mastery level based on analytics
 */
function determineMasteryLevel(analytics) {
    if (!analytics) return 'WEAK';
    
    const riskLevel = analytics.riskLevel?.toLowerCase() || 'medium';
    const performanceStatus = analytics.performanceStatus?.toLowerCase() || 'stagnation';
    
    if (riskLevel === 'high' || performanceStatus === 'decline') {
        return 'WEAK';
    } else if (riskLevel === 'low' && performanceStatus === 'improvement') {
        return 'STRONG';
    } else {
        return 'MEDIUM';
    }
}

/**
 * Format teaching query based on student analytics and weak concepts
 */
function formatTeachingQuery(analytics, quizAttempts, specificTopic = null) {
    const masteryLevel = determineMasteryLevel(analytics);
    const weakConcepts = analytics?.weakConcepts || ['General Mathematics'];
    const topic = specificTopic || weakConcepts[0] || 'Polynomials';
    
    // Calculate metrics from quiz attempts
    let avgTimePerQuestion = 30;
    let avgAttempts = 1;
    let firstAttemptCorrectRate = 50;
    
    if (quizAttempts && quizAttempts.length > 0) {
        const totalTime = quizAttempts.reduce((sum, a) => {
            const times = a.timePerQuestion || [];
            return sum + times.reduce((s, t) => s + t, 0) / (times.length || 1);
        }, 0);
        avgTimePerQuestion = totalTime / quizAttempts.length;
        
        avgAttempts = quizAttempts.length;
        
        const correctFirstAttempts = quizAttempts.filter(a => a.accuracy >= 70).length;
        firstAttemptCorrectRate = (correctFirstAttempts / quizAttempts.length) * 100;
    }
    
    const query = `
Create a teaching lesson with Manim animation for this student:

**Student Analytics:**
- Chapter Mastery Level: ${masteryLevel}
- Concept Accuracy: ${analytics?.metrics?.avgAccuracy?.toFixed(1) || 50}%
- Time per Question: ${avgTimePerQuestion.toFixed(1)} seconds
- Number of Attempts: ${avgAttempts}
- First-Attempt Correct Rate: ${firstAttemptCorrectRate.toFixed(1)}%
- Weak Concepts: ${weakConcepts.join(', ')}

**Topic to Teach:** ${topic}

**Requirements:**
1. Create a complete Manim Python script that teaches "${topic}"
2. Adapt the teaching style for a ${masteryLevel} level student
3. Use NCERT-aligned examples for Indian students (Classes 6-12)
4. Include clear visual explanations with text, diagrams, and transformations
5. The animation should be educational and engaging

Please provide:
A. Teaching Intent Summary
B. Complete Manim Python Code (inside \`\`\`python code block)
C. Teacher Voice Guidance
`;

    return { query, masteryLevel, topic };
}

/**
 * Extract Manim code from AI response
 */
function extractManimCode(response) {
    // Try to find code between ```python and ```
    const pythonMatch = response.match(/```python\s*([\s\S]*?)```/);
    if (pythonMatch) {
        return pythonMatch[1].trim();
    }
    
    // Try generic code block
    const codeMatch = response.match(/```\s*([\s\S]*?)```/);
    if (codeMatch) {
        return codeMatch[1].trim();
    }
    
    // Try to find code starting with 'from manim import'
    const manimMatch = response.match(/(from manim import[\s\S]*?(?=\n\n[A-Z]|\n\n---|\Z))/);
    if (manimMatch) {
        return manimMatch[1].trim();
    }
    
    return null;
}

/**
 * Extract teaching summary from AI response
 */
function extractTeachingSummary(response) {
    const summaryMatch = response.match(/(?:Teaching Intent Summary|A\.\s*(?:Short )?Teaching Intent Summary)[:\s]*([\s\S]*?)(?=B\.|Manim Code|```)/i);
    if (summaryMatch) {
        return summaryMatch[1].trim();
    }
    
    // Extract first few lines as summary
    const lines = response.split('\n').slice(0, 10);
    return lines.join('\n').substring(0, 500);
}

/**
 * Extract teacher guidance from AI response
 */
function extractTeacherGuidance(response) {
    const guidanceMatch = response.match(/(?:Teacher Voice Guidance|C\.\s*Teacher Voice Guidance)[:\s]*([\s\S]*?)(?=\n\n---|\Z)/i);
    if (guidanceMatch) {
        return guidanceMatch[1].trim();
    }
    return '';
}

/**
 * Save Manim script to file
 */
function saveManimScript(code, lessonId) {
    ensureDirectories();
    const filename = `lesson_${lessonId}.py`;
    const filepath = path.join(MANIM_SCRIPTS_DIR, filename);
    fs.writeFileSync(filepath, code);
    console.log(`📝 Manim script saved: ${filepath}`);
    return filepath;
}

/**
 * Render Manim animation
 */
async function renderManimAnimation(scriptPath, lessonId) {
    return new Promise((resolve, reject) => {
        // Extract scene class name from the script
        const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
        const sceneMatch = scriptContent.match(/class\s+(\w+)\s*\(\s*Scene\s*\)/);
        const sceneName = sceneMatch ? sceneMatch[1] : 'TeachingScene';
        
        console.log(`🎬 Rendering Manim animation: ${sceneName}`);
        
        const outputDir = path.join(MANIM_OUTPUT_DIR, lessonId);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // Use the virtual environment Python if available, otherwise fall back to system python
        let pythonPath = 'python';
        const venvPath = path.join(__dirname, '..', '..', '.venv', 'Scripts', 'python.exe');
        if (fs.existsSync(venvPath)) {
            pythonPath = venvPath;
            console.log(`📦 Using virtual environment Python: ${pythonPath}`);
        } else {
            console.log(`📦 Using system Python`);
        }
        
        // FFmpeg path - required for Manim video rendering
        const ffmpegDir = 'C:\\Users\\asmit\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-8.0.1-full_build\\bin';
        const envPath = process.env.PATH || '';
        const newPath = ffmpegDir + ';' + envPath;
        
        console.log(`🎞️ FFmpeg path added to environment`);
        
        // Use python -m manim to run manim module directly
        const pythonProcess = spawn(pythonPath, [
            '-m', 'manim',
            '-ql',                          // Low quality for faster rendering
            scriptPath,                     // The Python script
            sceneName,                      // Scene class name
            '--media_dir', outputDir,       // Output directory
        ], {
            shell: true,
            stdio: ['pipe', 'pipe', 'pipe'],
            cwd: path.dirname(scriptPath),   // Run in the script's directory
            env: { ...process.env, PATH: newPath }  // Include FFmpeg in PATH
        });
        
        let stdout = '';
        let stderr = '';
        
        pythonProcess.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            // Only log progress lines
            if (output.includes('Rendering') || output.includes('Scene') || output.includes('Writing') || output.includes('Animation')) {
                console.log(`📹 ${output.trim()}`);
            }
        });
        
        pythonProcess.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            // Log progress from stderr (Manim writes progress here)
            if (output.includes('Rendering') || output.includes('Scene') || output.includes('Writing')) {
                console.log(`📹 ${output.trim()}`);
            }
        });
        
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                // Find the generated video file
                const videoResult = findGeneratedVideo(outputDir, sceneName, lessonId);
                if (videoResult) {
                    console.log(`✅ Animation rendered successfully: ${videoResult.absolutePath}`);
                    resolve({
                        success: true,
                        videoPath: videoResult.absolutePath,
                        relativePath: videoResult.relativePath
                    });
                } else {
                    console.log(`⚠️ Video not found after rendering`);
                    resolve({
                        success: false,
                        error: 'Video file not found after rendering. Check output directory.',
                        outputDir,
                        stdout,
                        stderr
                    });
                }
            } else {
                // Check if it's a module not found error
                const errorMsg = (stderr + stdout).toLowerCase();
                
                if (errorMsg.includes('no module named') || errorMsg.includes('modulenotfounderror')) {
                    console.log(`❌ Manim Python module not found. Install with: pip install manim`);
                    resolve({
                        success: false,
                        error: 'Manim module not found. Install with: pip install manim',
                        notInstalled: true,
                        stdout,
                        stderr
                    });
                } else if (errorMsg.includes('not recognized') || errorMsg.includes('command not found')) {
                    console.log(`❌ Python command not found in PATH`);
                    resolve({
                        success: false,
                        error: 'Python not found in PATH. Ensure Python is installed and in PATH.',
                        notInstalled: true,
                        stdout,
                        stderr
                    });
                } else {
                    console.error(`❌ Manim rendering failed with code ${code}`);
                    console.error(`Error output: ${stderr.substring(0, 300)}`);
                    resolve({
                        success: false,
                        error: `Rendering failed: ${stderr.substring(0, 200) || stdout.substring(0, 200)}`,
                        stdout,
                        stderr
                    });
                }
            }
        });
        
        pythonProcess.on('error', (error) => {
            console.error(`❌ Failed to start Manim: ${error.message}`);
            reject(error);
        });
    });
}

/**
 * Find generated video file in output directory
 */
function findGeneratedVideo(outputDir, sceneName, lessonId) {
    console.log(`🔍 Searching for video in: ${outputDir}, scene: ${sceneName}`);
    
    // Recursive search for the final mp4 file (not partial files)
    function findFinalMp4(dir, depth = 0) {
        if (!fs.existsSync(dir) || depth > 10) return null;
        
        const items = fs.readdirSync(dir, { withFileTypes: true });
        
        // First, check current directory for mp4 files matching scene name
        for (const item of items) {
            if (!item.isDirectory() && item.name.endsWith('.mp4')) {
                // Skip partial movie files
                if (dir.includes('partial_movie_files')) continue;
                
                const fullPath = path.join(dir, item.name);
                console.log(`📹 Found video: ${fullPath}`);
                
                // Prefer files matching the scene name
                if (sceneName && item.name.includes(sceneName)) {
                    return fullPath;
                }
            }
        }
        
        // Then search subdirectories
        for (const item of items) {
            if (item.isDirectory() && item.name !== 'partial_movie_files') {
                const found = findFinalMp4(path.join(dir, item.name), depth + 1);
                if (found) return found;
            }
        }
        
        return null;
    }
    
    const videoPath = findFinalMp4(outputDir);
    
    if (videoPath) {
        // Calculate relative path from client/public/videos
        const videosDir = path.join(__dirname, '..', '..', 'client', 'public', 'videos');
        const relativePath = path.relative(videosDir, videoPath).replace(/\\/g, '/');
        console.log(`✅ Video relative path: /videos/${relativePath}`);
        return {
            absolutePath: videoPath,
            relativePath: `/videos/${relativePath}`
        };
    }
    
    return null;
}

/**
 * Main function to generate teaching lesson with Manim animation
 */
async function generateTeachingLesson(studentId, studentName, analytics, quizAttempts, specificTopic = null, skipRendering = false) {
    console.log(`\n=== 📚 Generating Teaching Lesson for ${studentName} ===`);
    
    const lessonId = `lesson_${Date.now()}`;
    
    // Create teacher session
    const sessionData = await createTeacherSession(studentId, studentName);
    if (!sessionData) {
        return {
            success: false,
            error: 'Failed to create teacher session'
        };
    }
    
    // Format and submit teaching query
    const { query, masteryLevel, topic } = formatTeachingQuery(analytics, quizAttempts, specificTopic);
    console.log(`📊 Student Level: ${masteryLevel}, Topic: ${topic}`);
    
    const teacherResponse = await submitTeachingQuery(
        sessionData.sessionId,
        query,
        sessionData.contextMetadata
    );
    
    if (!teacherResponse || !teacherResponse.answer) {
        return {
            success: false,
            error: 'Failed to get teaching response'
        };
    }
    
    // Extract components from response
    const manimCode = extractManimCode(teacherResponse.answer);
    const teachingSummary = extractTeachingSummary(teacherResponse.answer);
    const teacherGuidance = extractTeacherGuidance(teacherResponse.answer);
    
    const result = {
        success: true,
        lessonId,
        sessionId: sessionData.sessionId,
        topic,
        masteryLevel,
        teachingSummary,
        teacherGuidance,
        fullResponse: teacherResponse.answer,
        manimCode: manimCode,
        videoUrl: null,
        renderStatus: 'pending'
    };
    
    // If Manim code was extracted, save script and optionally render
    if (manimCode) {
        console.log(`✅ Manim code extracted (${manimCode.length} chars)`);
        
        try {
            const scriptPath = saveManimScript(manimCode, lessonId);
            result.scriptPath = scriptPath;
            
            // If skipRendering is true, just return with 'rendering' status (will be done in background)
            if (skipRendering) {
                result.renderStatus = 'rendering';
                console.log(`⏳ Manim rendering will be done in background`);
            } else {
                // Attempt rendering (this may fail if Manim is not installed)
                try {
                    const renderResult = await renderManimAnimation(scriptPath, lessonId);
                    if (renderResult.success) {
                        result.videoUrl = renderResult.relativePath;
                        result.renderStatus = 'completed';
                    } else {
                        result.renderStatus = 'failed';
                        result.renderError = renderResult.error;
                    }
                } catch (renderError) {
                    console.log(`⚠️ Manim rendering skipped: ${renderError.message}`);
                    result.renderStatus = 'skipped';
                    result.renderError = 'Manim not installed or not available';
                }
            }
        } catch (saveError) {
            console.error(`❌ Failed to save script: ${saveError.message}`);
            result.renderStatus = 'error';
        }
    } else {
        console.log(`⚠️ No Manim code found in response`);
        result.renderStatus = 'no_code';
    }
    
    console.log(`✅ Teaching lesson generated: ${lessonId}`);
    return result;
}

/**
 * Generate chapter content based on weak concepts
 */
async function generateChapterContent(studentId, studentName, analytics) {
    const weakConcepts = analytics?.weakConcepts || [];
    const chapters = [];
    
    for (const concept of weakConcepts.slice(0, 3)) { // Limit to 3 chapters
        console.log(`\n📖 Generating chapter for: ${concept}`);
        
        const lesson = await generateTeachingLesson(
            studentId,
            studentName,
            analytics,
            [],
            concept
        );
        
        if (lesson.success) {
            chapters.push({
                concept,
                lesson
            });
        }
    }
    
    return {
        success: true,
        studentId,
        studentName,
        masteryLevel: determineMasteryLevel(analytics),
        chapters,
        generatedAt: new Date().toISOString()
    };
}

module.exports = {
    generateTeachingLesson,
    generateChapterContent,
    determineMasteryLevel,
    extractManimCode,
    renderManimAnimation
};
