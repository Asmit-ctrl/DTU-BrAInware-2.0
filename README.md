# 🎓 EduPortal - AI-Powered Adaptive Learning Platform

**Hackathon Submission | Multi-Agent Educational System**

A comprehensive educational platform leveraging OnDemand.io APIs to create a personalized, adaptive learning experience for students (Classes 6-12, NCERT curriculum) through intelligent multi-agent orchestration.

---

## 📋 Table of Contents
- [Hackathon Compliance](#-hackathon-compliance-checklist)
- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Multi-Agent System](#-multi-agent-system-6-agents)
- [Custom Tool Integrations](#-custom-tool-integrations-3-tools)
- [API Integrations](#-api-integrations-mandatory)
- [Technology Stack](#-technology-stack)
- [Setup Instructions](#-setup-instructions)
- [Features Demonstration](#-features-demonstration)

---

## ✅ Hackathon Compliance Checklist

### ✓ Prototype Requirement
- **Status**: ✅ COMPLETE
- **Type**: Full-stack Web Application
- **URL**: `http://localhost:3000` (React) + `http://localhost:5000` (Express)
- **Deployment**: Working prototype with complete user flows

### ✓ Custom Tool Integrations (Minimum 3)
- **Status**: ✅ EXCEEDS (6 Tools)
1. **AI Analytics Engine** - Performance analysis with risk assessment
2. **Adaptive Teaching System** - Visual learning with Manim animations
3. **Smart Exam Generator** - Dynamic assessment creation
4. **Personalized Assignment Builder** - Analytics-driven questions
5. **Intelligent Doubt Resolver** - Image + AI + Video pipeline
6. **Weekly Schedule Planner** - Performance-based planning

### ✓ Multi-Agent Architecture (Minimum 6)
- **Status**: ✅ MEETS (6 Agents)
1. **Analytics Agent** - Performance tracking & risk detection
2. **Teacher Agent** - Adaptive teaching & Manim videos
3. **Exam Agent** - Dynamic exam creation
4. **Assignment Agent** - Personalized assignments
5. **Doubt Resolution Agent** - Multi-modal doubt solving
6. **Schedule Agent** - Weekly study planning

### ✓ API Integrations (Minimum 2)
- **Status**: ✅ COMPLETE (3 APIs)
1. **Chat API** ✅ MANDATORY - OnDemand Chat (`https://api.on-demand.io/chat/v1`)
2. **Media API** ✅ MANDATORY - OnDemand Media (`https://api.on-demand.io/media/v1`)
3. **External Service** ✅ OPTIONAL - Edge TTS + Manim + FFmpeg

### ✓ Technology Usage
- **Status**: ✅ COMPLETE
- **Primary API**: OnDemand.io Multi-Agent System
- **Depth**: Custom fulfillment prompts, streaming, session management

---

## 🌟 Project Overview

**EduPortal** adapts to each student's learning pace using a sophisticated multi-agent system:

- 📊 Real-time performance analytics with AI insights
- 🎓 Personalized teaching with visual Manim animations
- 📝 Adaptive quizzes, exams, and assignments
- 🤔 Intelligent doubt resolution with image analysis
- 📅 Smart weekly study schedules
- 👨‍👩‍👧‍👦 Parent dashboard with student insights

### Key Differentiators
- **Adaptive Learning**: Every feature adjusts to performance
- **Visual Learning**: Manim-powered animations
- **Risk Detection**: Early struggling student identification
- **Multi-Modal**: Text + Images + Video + Audio
- **NCERT Aligned**: Indian curriculum standards

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React)                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │Analytics │  │ Lessons  │  │ Schedule │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Quizzes │  │  Exams   │  │Assignments│  │  Doubts  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Express.js)                         │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         OnDemand Chat API Integration                  │ │
│  │      (https://api.on-demand.io/chat/v1)                │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                  │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐│
│  │Analytics  │  │ Teacher   │  │   Exam    │  │Assignment││
│  │  Agent    │  │  Agent    │  │  Agent    │  │  Agent   ││
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘│
│  ┌───────────┐  ┌───────────┐                               │
│  │  Doubt    │  │ Schedule  │                               │
│  │  Agent    │  │  Agent    │                               │
│  └───────────┘  └───────────┘                               │
│                            ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │       OnDemand Media API Integration                   │ │
│  │      (https://api.on-demand.io/media/v1)               │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │      External Service Integrations                     │ │
│  │    • Manim Animation Engine (Python)                   │ │
│  │    • Edge TTS (Text-to-Speech)                         │ │
│  │    • FFmpeg (Video Processing)                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                            ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │           MongoDB Database                             │ │
│  │  Users | Quiz | Exam | Assignment | Doubt | Analytics │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🤖 Multi-Agent System (6 Agents)

### 1. Analytics Agent 📊
**File**: `server/services/analyticsAgent.js`

**Configuration**:
```javascript
Agent IDs: ["agent-1712327325", "agent-1713962163"]
Endpoint: "predefined-openai-gpt5.2"
```

**Capabilities**:
- Performance trend detection (Improvement/Stagnation/Decline)
- Weak concept identification
- Risk classification (Low/Medium/High)
- Adaptive recommendations
- Mistake pattern analysis

---

### 2. Teacher Agent 🎓
**File**: `server/services/teacherAgent.js`

**Configuration**:
```javascript
Agent IDs: ["agent-1712327325", "agent-1713962163", "agent-1768589843"]
Endpoint: "predefined-claude-4-5-sonnet"
```

**Capabilities**:
- Mastery-based teaching (Weak/Medium/Strong)
- Manim code generation
- Animated video rendering
- NCERT-aligned explanations

**Innovation**: AI → Manim → Video pipeline

---

### 3. Exam Agent 📝
**File**: `server/services/examAgent.js`

**Configuration**:
```javascript
Agent IDs: ["agent-1712327325", "agent-1713962163", "agent-1768589843"]
Endpoint: "predefined-xai-grok4.1-fast"
```

**Capabilities**:
- 15-question generation (5 easy, 6 medium, 4 hard)
- 60-mark total with weighted scoring
- NCERT syllabus alignment
- Automatic grading

---

### 4. Assignment Agent 📋
**File**: `server/services/assignmentAgent.js`

**Capabilities**:
- Performance-driven question distribution
- High Risk: 6 Easy / 3 Medium / 1 Hard
- Low Risk: 2 Easy / 4 Medium / 4 Hard
- Weak concept targeting

---

### 5. Doubt Resolution Agent 🤔
**File**: `server/services/doubtAgent.js`

**Pipeline**:
1. Image upload to Media API
2. Text extraction
3. AI solution generation
4. Manim video creation
5. Edge TTS narration
6. FFmpeg video merging

**APIs**: Chat API + Media API

---

### 6. Schedule Agent 📅
**File**: `server/services/scheduleAgent.js`

**Capabilities**:
- 7-day weekly schedules
- Weak students: 3 days per topic
- Mid-level: 1 day per topic
- Daily goals (10 questions/day)

---

## 🛠️ Custom Tool Integrations (3+ Tools)

### Tool 1: AI Analytics Engine
**Innovation**: Converts raw quiz data into actionable insights

```javascript
async function analyzeStudentPerformance(studentId, quizAttempts) {
    const sessionData = await createChatSession(studentId);
    const query = formatQuizDataForAnalytics(quizAttempts);
    const result = await submitQueryToAgent(sessionData.sessionId, query);
    return { performanceStatus, riskLevel, weakConcepts };
}
```

### Tool 2: Adaptive Teaching with Manim
**Innovation**: First AI → Manim → Video pipeline

```javascript
async function generateTeachingLesson(studentId, analytics) {
    const masteryLevel = determineMasteryLevel(analytics);
    const teachingResult = await submitTeachingQuery(sessionId, query);
    const manimCode = extractManimCode(teachingResult.answer);
    const videoPath = await executeManimScript(manimCode);
    return { videoUrl, summary, guidance };
}
```

### Tool 3: Smart Exam Generator
**Innovation**: AI-powered assessment with auto-balancing

```javascript
async function generateExam(studentId, topic) {
    const sessionId = await createExamSession(studentId);
    const examResult = await generateExamQuestions(sessionId, topic);
    // Returns 15 questions: 5-6-4 distribution
}
```

### Tool 4: Personalized Assignment Builder
**Innovation**: Analytics-driven question targeting

### Tool 5: Intelligent Doubt Resolver
**Innovation**: Multi-agent orchestration (Image + Chat + Manim)

### Tool 6: Weekly Schedule Planner
**Innovation**: Performance-based time allocation

---

## 🔌 API Integrations (Mandatory)

### 1. Chat API ✅ MANDATORY
**Endpoint**: `https://api.on-demand.io/chat/v1`

**Usage Across All 6 Agents**:
- `/sessions` - Create dedicated agent sessions
- `/sessions/:id/query` - Submit queries with streaming

**Configuration**:
```javascript
{
    agentIds: ["agent-1712327325", "agent-1713962163"],
    endpointId: "predefined-openai-gpt5.2",
    reasoningMode: "grok-4-fast",
    responseMode: "stream",
    modelConfigs: {
        fulfillmentPrompt: "Custom prompt",
        temperature: 0.6,
        maxTokens: 6400
    }
}
```

---

### 2. Media API ✅ MANDATORY
**Endpoint**: `https://api.on-demand.io/media/v1`

**Usage** (`doubtAgent.js`):
```javascript
async function uploadImageToMedia(imageBase64, filename) {
    const url = `${MEDIA_BASE_URL}/public/file/raw`;
    const formData = new FormData();
    formData.append('file', buffer, { filename });
    
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'apikey': API_KEY },
        body: formData
    });
    
    return data.data.url;  // Public URL
}
```

**Integration**: Image upload → OCR → AI solution → Video

---

### 3. External Services ✅ OPTIONAL

#### Manim Animation Engine
```javascript
async function executeManimScript(manimCode, sceneName) {
    const manim = spawn('manim', ['-pql', '--format=mp4', scriptPath]);
    // Returns rendered video path
}
```

#### Edge TTS
```javascript
async function generateAudioNarration(text, audioPath) {
    const pythonProcess = spawn('python', ['-m', 'edge_tts',
        '--voice', 'en-IN-NeerjaNeural',
        '--text', text
    ]);
}
```

#### FFmpeg
```javascript
async function mergeVideoAudio(videoPath, audioPath, outputPath) {
    await execPromise(`ffmpeg -i "${videoPath}" -i "${audioPath}" "${outputPath}"`);
}
```

---

## 💻 Technology Stack

**Frontend**: React 18.2, React Router, Context API, Axios
**Backend**: Node.js, Express.js, MongoDB, Mongoose
**AI**: OnDemand.io (GPT-5.2, Claude 4.5, Grok 4.1)
**External**: Manim, Edge TTS, FFmpeg
**Auth**: JWT + bcryptjs

---

## 🚀 Setup Instructions

### Prerequisites
```bash
node --version  # 18+
python --version  # 3.8+
mongod --version
ffmpeg -version
```

### Installation

```bash
# Clone repository
git clone <repo-url>
cd OnDemand

# Backend setup
cd server
npm install

# Frontend setup
cd ../client
npm install

# Python setup
python -m venv .venv
.venv\Scripts\activate  # Windows
pip install manim edge-tts
```

### Configuration

Create `server/.env`:
```env
ONDEMAND_API_KEY=your_api_key_here
MONGODB_URI=mongodb://localhost:27017/parentStudentPortal
JWT_SECRET=your_secret_key
```

### Start Services

```bash
# Terminal 1: MongoDB
mongod

# Terminal 2: Backend
cd server
node index.js

# Terminal 3: Frontend
cd client
npm start
```

**Access**: http://localhost:3000

---

## 📸 Features Demonstration

### 1. Analytics Dashboard (`/dashboard/analytics`)
- Click "Analyze Performance" → Analytics Agent
- View performance status, weak concepts, risk level
- Get actionable recommendations

### 2. AI Lessons (`/dashboard/lessons`)
- Select chapter → "Generate Lesson" → Teacher Agent
- AI generates Manim code → Auto-renders video
- Watch personalized animated explanation

### 3. Dynamic Exams (`/dashboard/exam`)
- Enter topic → Exam Agent creates 15 questions
- Take 60-mark exam → AI grading with explanations

### 4. Personalized Assignments (`/dashboard/assignment`)
- "Generate Assignment" → 10 targeted questions
- Based on your weak concepts and risk level

### 5. Doubt Resolution (`/dashboard/doubt`)
1. Upload question image → Media API
2. Image Agent extracts text
3. Doubt Agent provides solution
4. Manim generates video explanation
5. TTS adds narration

### 6. Weekly Schedules (`/dashboard/schedule`)
- Select subject/chapter → Schedule Agent
- 7-day plan with daily goals
- Adapts to your performance level

---

## 📁 Project Structure

```
OnDemand/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── Analytics.js         # ✅ Analytics Agent UI
│   │   │   ├── Lessons.js           # ✅ Teacher Agent UI
│   │   │   ├── Exam.js              # ✅ Exam Agent UI
│   │   │   ├── Assignment.js        # ✅ Assignment Agent UI
│   │   │   ├── Doubt.js             # ✅ Doubt Agent UI
│   │   │   ├── Schedule.js          # ✅ Schedule Agent UI
│   │   │   └── ParentsZone.js       # Parent Dashboard
│   │   └── pages/
│   │       └── Dashboard.js
│   └── package.json
│
├── server/                          # Express Backend
│   ├── services/
│   │   ├── analyticsAgent.js        # ✅ Agent 1
│   │   ├── teacherAgent.js          # ✅ Agent 2
│   │   ├── examAgent.js             # ✅ Agent 3
│   │   ├── assignmentAgent.js       # ✅ Agent 4
│   │   ├── doubtAgent.js            # ✅ Agent 5
│   │   └── scheduleAgent.js         # ✅ Agent 6
│   ├── models/
│   │   ├── Quiz.js
│   │   ├── Exam.js
│   │   ├── Assignment.js
│   │   └── Doubt.js
│   ├── output/
│   │   ├── videos/                  # Generated videos
│   │   └── audio/                   # TTS files
│   └── index.js                     # API Routes
│
├── .venv/                           # Python environment
└── README.md
```

---

## 🎯 Key Technical Achievements

1. **Multi-Agent Orchestration** - 6 agents working in harmony
2. **AI → Code → Video** - First Manim automation in education
3. **Adaptive Learning** - Performance-based difficulty adjustment
4. **Multi-Modal Processing** - Image + Text + Video + Audio
5. **Production Architecture** - RESTful, JWT auth, MongoDB

---

## 📊 Hackathon Metrics

| Criterion | Requirement | Implementation | Status |
|-----------|------------|----------------|--------|
| **Prototype** | Web app | Full-stack React + Express | ✅ EXCEEDS |
| **Custom Tools** | Min 3 | 6 AI tools | ✅ EXCEEDS |
| **Multi-Agent** | Min 6 | 6 specialized agents | ✅ MEETS |
| **Chat API** | Mandatory | OnDemand Chat (6 agents) | ✅ MEETS |
| **Media API** | Mandatory | OnDemand Media (uploads) | ✅ MEETS |
| **External API** | Optional | Manim + TTS + FFmpeg | ✅ EXCEEDS |

---

## 🏆 Innovation Highlights

1. **World's First AI → Manim Pipeline** for education
2. **Adaptive Multi-Agent System** with 6 specialized agents
3. **Risk-Based Learning** with early intervention
4. **Multi-Modal Doubt Resolution** (Image → Video)
5. **NCERT Curriculum Alignment** for Indian students
6. **Parent AI Insights** with contextual explanations

---

## 📞 Credits

**Project**: EduPortal - AI-Powered Adaptive Learning
**Built For**: OnDemand.io Hackathon 2026
**Technology Partner**: OnDemand.io Multi-Agent System

---

## 🎓 Conclusion

**EduPortal** demonstrates the power of multi-agent AI in education through:

- ✅ All mandatory hackathon criteria met
- ✅ 6 custom tools exceeding requirement
- ✅ Cutting-edge AI → Video pipeline
- ✅ Measurable learning outcomes
- ✅ Scalable for thousands of students

**This is the future of personalized education.**

---

**Made with ❤️ using OnDemand.io APIs**
