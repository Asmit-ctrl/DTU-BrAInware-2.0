# 🧠 BIBO – AI-Powered Adaptive Learning Platform

**For Classes 6–12 | NCERT-Aligned | India-Focused**

## 📌 Overview

BIBO is a hybrid AI + Human adaptive learning platform designed to personalize education for Indian students in classes 6–12.  
Unlike traditional one-size-fits-all learning apps, BIBO dynamically adapts to each student's knowledge level, learning pace, and weaknesses using AI-driven diagnostics, personalized learning paths, and human mentor support.

BIBO is built with scalability, affordability, and real academic impact in mind, making personalized education accessible to middle-class families across India.

---

## 🧪 DTU BrAInware 2.0 – Hackathon Requirements Compliance

This section explicitly documents how BIBO satisfies all mandatory hackathon requirements.

### ✅ 1. Prototype Requirement

**Prototype Type**: Full-Stack Web Application  
**Status**: ✅ Working & Demonstrable

**Prototype Includes**:
- **Frontend**: Next.js 14 web application
- **Backend**: Node.js + Express REST API
- **AI Layer**: Python + FastAPI multi-agent system

**Demonstrable Features**:
- Student onboarding & authentication
- AI-powered diagnostic test
- Personalized learning path creation
- AI tutor chat interface
- Adaptive practice questions
- Gamification (streaks, coins, mastery)
- Parent & student dashboards
- External API-powered notifications and media

---

### 🧩 2. Custom Tool Integrations (Minimum 3 – All Custom Built)

#### 🔧 Tool 1: AI Diagnostic Assessment Engine
**Purpose**: Identify concept-level knowledge gaps

- Adaptive question selection
- Real-time weakness detection
- Confidence & mastery scoring
- NCERT chapter mapping

#### 🔧 Tool 2: Personalized Learning Path Generator
**Purpose**: Decide what the student learns next

- Dependency-aware topic sequencing
- Dynamic difficulty adjustment
- Spaced repetition scheduling
- Continuous path re-evaluation

#### 🔧 Tool 3: Gamification & Analytics Engine
**Purpose**: Engagement and learning insights

- Learning streak tracking
- Achievement & badge system
- Performance analytics
- Parent & teacher reports

**All tools are fully custom-built by the team and not plug-and-play solutions.**

---

### 🤖 3. Multi-Agent Architecture (Minimum 6 Agents)

BIBO uses a modular multi-agent architecture where each agent has a clear role.

#### Implemented Agents

1. **Diagnostic Agent** 🔍 – Gap analysis & mastery scoring
2. **Learning Path Agent** 🗺️ – Curriculum sequencing
3. **Tutor Agent** 👨‍🏫 – Step-by-step explanations (Chat API)
4. **Practice Generator Agent** 📝 – Adaptive question creation
5. **Mentor Support Agent** 💬 – Motivation & escalation
6. **Analytics Agent** 📊 – Performance insights & predictions

Each agent is:
- Independently deployable
- Stateless and scalable
- Coordinated via orchestration logic

---

### 🔌 4. API Integrations (Mandatory Compliance)

#### ✅ Chat API (MANDATORY)
**API Used**: OnDemand Chat API / OpenAI GPT-4

**Usage**:
- AI tutor conversations
- Mentor support interactions
- Context-aware explanations

**Implementation Highlights**:
- Chat history management
- Prompt engineering
- Context window optimization
- Error handling & rate limiting

#### ✅ Media API (MANDATORY)
**API Used**: AWS Polly (Text-to-Speech) + YouTube Data API

**Usage**:
- Audio explanations (Text-to-Speech)
- Video recommendations
- Audio summaries

**Implementation Highlights**:
- Multi-language support
- Custom voice profiles
- Educational content curation

#### ✅ Plugin / External Service API (OPTIONAL – INCLUDED)
**API Used**: Twilio API + Email Service

**Usage**:
- Parent alerts & reminders
- Achievement notifications
- Mentor escalation alerts

---

### ⚙️ 5. Meaningful Technology Usage

**Core Technologies Used**:
- **OnDemand / LLM APIs** – Streaming, reasoning, function calls
- **LangGraph** – Multi-agent workflows & routing
- **FastAPI** – High-performance AI services
- **Next.js 14** – SSR & App Router
- **MongoDB** – Aggregations for analytics
- **Redis** – Sessions, caching, pub/sub notifications

**APIs and frameworks are used beyond basic calls, with real orchestration and logic.**

---

## 🎯 Problem Statement

❌ Students have uneven conceptual understanding, especially in Maths and Science.  
❌ Existing platforms focus on content delivery, not learning gaps.  
❌ Personalized coaching is expensive and inaccessible.  
❌ Parents and schools lack real-time visibility into concept mastery.  
❌ Students lose motivation due to low engagement and delayed feedback.

## 💡 Solution

BIBO solves these problems by combining:

✅ **AI-driven diagnostic assessments**  
✅ **Personalized learning path generation**  
✅ **Step-by-step AI tutoring (chat-based)**  
✅ **Human mentor intervention**  
✅ **Gamified learning mechanics**  
✅ **Real-time dashboards for parents & schools**

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        BIBO PLATFORM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐     ┌──────────────┐     ┌─────────────────┐ │
│  │   Next.js    │     │   Node.js    │     │   Python AI     │ │
│  │   Frontend   │ ──▶ │   Backend    │ ──▶ │   Services      │ │
│  │              │     │   (API)      │     │   (FastAPI)     │ │
│  └──────────────┘     └──────────────┘     └─────────────────┘ │
│         │                     │                      │          │
│         │                     │                      │          │
│    ┌────▼─────────────────────▼──────────────────────▼───────┐ │
│    │              External API Integrations                   │ │
│    ├──────────────────────────────────────────────────────────┤ │
│    │  OnDemand Chat │ AWS Polly │ YouTube │ Twilio │ Email   │ │
│    └──────────────────────────────────────────────────────────┘ │
│                                │                                │
│                     ┌──────────▼──────────┐                    │
│                     │  MongoDB + Redis    │                    │
│                     └─────────────────────┘                    │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │               CUSTOM TOOLS (3)                              ││
│  ├────────────────────────────────────────────────────────────┤│
│  │  1. AI Diagnostic Engine                                   ││
│  │  2. Learning Path Generator                                ││
│  │  3. Gamification & Analytics Engine                        ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │               AI AGENTS (6)                                 ││
│  ├────────────────────────────────────────────────────────────┤│
│  │  1. Diagnostic Agent      4. Practice Generator Agent      ││
│  │  2. Learning Path Agent   5. Mentor Support Agent          ││
│  │  3. Tutor Agent          6. Analytics Agent                ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
bibo/
├── backend/              # Node.js + Express API
├── frontend/             # Next.js React Application
├── ai-agent/             # Python FastAPI AI Services
├── shared/               # Shared configs & types
└── docs/                 # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+
- MongoDB
- Redis
- AWS OnDemand / LLM access

### Installation

#### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-org/bibo.git
cd bibo
```

#### 2️⃣ Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

# AI Agent
cd ../ai-agent
pip install -r requirements.txt
```

#### 3️⃣ Environment Configuration
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp ai-agent/.env.example ai-agent/.env
```

Set values for:
- Database URI
- Redis host
- JWT secret
- AI agent credentials

#### 4️⃣ Run Services
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev

# AI Agent
cd ai-agent && uvicorn main:app --reload
```

## 🧩 Core Modules

### 1️⃣ AI Diagnostic Assessment Engine (Custom Tool #1)

**Custom-built adaptive assessment system**

- NCERT-aligned chapter-wise questions
- Adaptive difficulty selection algorithm
- Concept-level weakness identification
- Confidence scoring and mastery calculation
- Real-time performance tracking

**Why Custom?** Standard quiz tools don't provide granular concept mapping or adaptive difficulty based on Indian curriculum.

---

### 2️⃣ Personalized Learning Path Generator (Custom Tool #2)

**Custom curriculum sequencing engine**

- Dynamic chapter sequencing based on prerequisites
- Difficulty tuning per student performance
- Revision vs practice balancing logic
- Continuous re-evaluation and path adjustment
- Spaced repetition scheduling

**Why Custom?** No existing tool maps NCERT dependencies or creates truly personalized paths for Indian students.

---

### 3️⃣ Gamification & Analytics Engine (Custom Tool #3)

**Custom engagement and insights platform**

- 🔥 Daily learning streak tracking
- 🪙 Coin rewards for consistency
- 🏆 Subject-wise levels and progression
- 🎯 Chapter mastery badges
- 📊 Multi-dimensional analytics dashboard

**Why Custom?** Built specifically for Indian education context with meaningful metrics beyond generic gamification.

---

### 4️⃣ AI Tutor (OnDemand Agent with Chat API)

**Integrated with mandatory Chat API**

- Step-by-step explanations using conversational AI
- Progressive hint system
- Concept-focused reasoning
- Mistake-specific feedback with context
- Chat history and context management

**API**: OnDemand Chat API / OpenAI GPT-4

---

### 5️⃣ Adaptive Practice Engine

**Powered by Practice Generator Agent**

- Smart repetition for weak concepts
- Spaced repetition logic
- Similar question generation
- Performance-based progression

---

### 6️⃣ Human Mentor Layer

**Powered by Mentor Support Agent with Chat API**

- Chat-based mentor support
- Escalation for repeated failures
- Motivation and study guidance
- AI + human collaboration

---

### 7️⃣ Media Integration (Mandatory Media API)

**Audio & Video Learning Support**

- Text-to-speech explanations (AWS Polly)
- Audio summaries of concepts
- Educational video recommendations (YouTube API)
- Multi-language voice support

**APIs**: AWS Polly + YouTube Data API

---

### 8️⃣ Notification System (Plugin/External Service API)

**Multi-channel communication**

- SMS/WhatsApp alerts to parents (Twilio)
- Email progress reports
- Achievement notifications
- Reminder system

**API**: Twilio + Email Service

## 🤖 AI Agent Orchestration

BIBO uses **OnDemand AI agents** for modular intelligence with **LangGraph** for orchestration.

### Agent Architecture Details

#### 1. Diagnostic Agent 🔍
- **Role**: Assessment & Gap Analysis
- **Technology**: Python + LangGraph + OnDemand API
- **Responsibilities**:
  - Conduct adaptive assessments
  - Identify knowledge gaps at concept level
  - Calculate mastery scores
  - Generate diagnostic reports

#### 2. Learning Path Agent 🗺️
- **Role**: Curriculum Personalization
- **Technology**: Python + LangGraph + Graph Algorithms
- **Responsibilities**:
  - Generate personalized learning paths
  - Sequence topics based on prerequisites
  - Adjust difficulty dynamically
  - Balance revision vs new content

#### 3. Tutor Agent 👨‍🏫
- **Role**: Interactive Teaching (Chat API)
- **Technology**: Python + OnDemand Chat API + RAG
- **Responsibilities**:
  - Provide step-by-step explanations
  - Offer progressive hints
  - Answer student queries in real-time
  - Maintain conversation context

#### 4. Practice Generator Agent 📝
- **Role**: Question Generation
- **Technology**: Python + OnDemand API + Template Engine
- **Responsibilities**:
  - Generate similar practice questions
  - Create variations based on weak concepts
  - Ensure NCERT alignment
  - Adjust difficulty based on performance

#### 5. Mentor Support Agent 💬
- **Role**: Human-like Guidance (Chat API)
- **Technology**: Python + OnDemand Chat API + Sentiment Analysis
- **Responsibilities**:
  - Provide motivational support
  - Escalate complex queries to human mentors
  - Track student engagement and mood
  - Send encouragement messages

#### 6. Analytics Agent 📊
- **Role**: Data Processing & Insights
- **Technology**: Python + Pandas + ML Models
- **Responsibilities**:
  - Process student performance data
  - Generate insights for parents/teachers
  - Predict learning outcomes
  - Identify intervention needs

**Each agent is stateless, scalable, and independently deployable with clear boundaries.**

## 🎮 Gamification Rules

✓ Rewards consistency over speed  
✓ Improvement-based bonuses  
✓ Daily streak multipliers  
✓ Mastery > completion focus

---

## 📋 Hackathon Requirements Summary

| Requirement | Status | Implementation |
|------------|--------|----------------|
| **Working Prototype** | ✅ Complete | Full-stack web application |
| **Custom Tool #1** | ✅ Complete | AI Diagnostic Engine |
| **Custom Tool #2** | ✅ Complete | Learning Path Generator |
| **Custom Tool #3** | ✅ Complete | Gamification & Analytics |
| **Agent #1** | ✅ Complete | Diagnostic Agent |
| **Agent #2** | ✅ Complete | Learning Path Agent |
| **Agent #3** | ✅ Complete | Tutor Agent |
| **Agent #4** | ✅ Complete | Practice Generator Agent |
| **Agent #5** | ✅ Complete | Mentor Support Agent |
| **Agent #6** | ✅ Complete | Analytics Agent |
| **Chat API (Mandatory)** | ✅ Complete | OnDemand/OpenAI for Tutor & Mentor |
| **Media API (Mandatory)** | ✅ Complete | AWS Polly + YouTube API |
| **Plugin API (Optional)** | ✅ Complete | Twilio + Email Service |
| **Meaningful Tech Usage** | ✅ Complete | Advanced implementations, not basic calls |

**All hackathon requirements met! 🎉**

---

## 🛠️ API Reference

### Backend API
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/student/profile
POST   /api/diagnostic/start
POST   /api/diagnostic/submit
GET    /api/learning-path
POST   /api/practice/question
GET    /api/progress
GET    /api/gamification/status
```

### AI Agent API
```
POST   /agent/diagnose
POST   /agent/generate-path
POST   /agent/explain
POST   /agent/hint
POST   /agent/generate-question
```

## 📊 Tech Stack

| Layer | Technology | Usage |
|-------|-----------|-------|
| **Frontend** | Next.js 14, React, Tailwind CSS | Server-side rendering, App Router |
| **Backend** | Node.js, Express | REST API, Authentication |
| **Database** | MongoDB | Document storage, Aggregations |
| **Cache** | Redis | Sessions, Pub/sub, Real-time data |
| **AI/ML** | Python, FastAPI, LangGraph | Multi-agent orchestration |
| **Chat API** | OnDemand Chat API / OpenAI GPT-4 | Tutor & Mentor agents |
| **Media API** |  | read data from images and pdf  |
| **Plugin API** | Twilio, Email Service | Notifications, Alerts |
| **Auth** | JWT, bcrypt | Secure authentication |
| **Deployment** | Docker, AWS / Render | Containerization, Hosting |

### Meaningful Technology Usage

- **OnDemand API**: Streaming responses, function calling, context management, custom prompt engineering
- **LangGraph**: Complex multi-agent workflows with state management and conditional routing
- **MongoDB**: Advanced aggregation pipelines for analytics and performance optimization
- **Redis**: Pub/sub for real-time notifications, session management, and intelligent caching
- **FastAPI**: High-performance async endpoints with WebSocket support for real-time features

## 🇮🇳 India-First Design

✓ NCERT-aligned syllabus  
✓ Affordable pricing vision  
✓ Hinglish support (planned)  
✓ Middle-class focused UX  
✓ Low-bandwidth friendly design

## 📈 Success Metrics

- Daily Active Users (DAU)
- Learning streak retention
- Concept mastery improvement
- Reduction in repeated mistakes
- Parent engagement rate

## 🔮 Future Roadmap

- [ ] Voice-based AI tutor
- [ ] Offline mode
- [ ] Regional language support (Hindi, Tamil, Telugu, etc.)
- [ ] Teacher authoring tools
- [ ] School LMS integration
- [ ] Mobile application (iOS & Android)
- [ ] Advanced analytics with ML predictions

---

## 🚀 Demo Flow

### Complete User Journey

1. **Student Login** → Next.js frontend with authentication
2. **Take Diagnostic Test** → Diagnostic Agent + OnDemand API analyzes responses
3. **Receive Personalized Path** → Learning Path Agent generates custom curriculum
4. **Start Learning** → Tutor Agent provides explanations (Chat API)
5. **Get Audio Explanation** → Media API (AWS Polly) converts text to speech
6. **Watch Related Video** → YouTube API recommends educational content
7. **Practice Questions** → Practice Generator Agent creates adaptive questions
8. **Receive Progress Alert** → Twilio API sends SMS to parent
9. **View Analytics** → Analytics Agent processes data for dashboard
10. **Earn Achievement** → Gamification Engine updates streaks and badges

---

## 👥 Team

Built with ❤️ to make personalized education accessible for every Indian student.

---

## 🌟 BIBO

**"Learning that adapts to you."**
