# 🧠 BIBO – AI-Powered Adaptive Learning Platform

**For Classes 6–12 | NCERT-Aligned | India-Focused**

## 📌 Overview

BIBO is a hybrid AI + Human adaptive learning platform designed to personalize education for Indian students in classes 6–12.  
Unlike traditional one-size-fits-all learning apps, BIBO dynamically adapts to each student's knowledge level, learning pace, and weaknesses using AI-driven diagnostics, personalized learning paths, and human mentor support.

BIBO is built with scalability, affordability, and real academic impact in mind, making personalized education accessible to middle-class families across India.

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
✅ **Step-by-step AI tutoring**  
✅ **Human mentor intervention**  
✅ **Gamified learning**  
✅ **Actionable dashboards for parents & schools**

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                       BIBO PLATFORM                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐     ┌──────────────┐     ┌────────────┐ │
│  │   Next.js    │     │   Node.js    │     │   Python   │ │
│  │   Frontend   │ ──▶ │   Backend    │ ──▶ │ AI Agents  │ │
│  │              │     │   API        │     │ (OnDemand) │ │
│  └──────────────┘     └──────────────┘     └────────────┘ │
│                            │                     │        │
│                    ┌───────▼─────────────────────▼──────┐ │
│                    │         MongoDB + Redis             │ │
│                    └────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
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

### 1️⃣ AI Diagnostic Assessment Engine

- NCERT-aligned chapter-wise questions
- Adaptive difficulty selection
- Concept-level weakness identification
- Confidence scoring

### 2️⃣ Personalized Learning Path Generator

- Dynamic chapter sequencing
- Difficulty tuning
- Revision vs practice balancing
- Continuous re-evaluation

### 3️⃣ AI Tutor (OnDemand Agent)

- Step-by-step explanations
- Progressive hint system
- Concept-focused reasoning
- Mistake-specific feedback

### 4️⃣ Adaptive Practice Engine

- Smart repetition for weak concepts
- Spaced repetition logic
- Similar question generation
- Performance-based progression

### 5️⃣ Human Mentor Layer

- Chat-based mentor support
- Escalation for repeated failures
- Motivation and study guidance
- AI + human collaboration

### 6️⃣ Gamification System

- 🔥 Daily learning streaks
- 🪙 Coins for consistency
- 🏆 Subject-wise levels
- 🎯 Chapter mastery badges

### 7️⃣ Dashboards

#### Student Dashboard
- Progress tracking
- Weak vs strong concepts
- Daily goals
- Gamification stats

#### Parent Dashboard
- Time spent studying
- Chapter mastery levels
- Improvement trends
- Performance alerts

#### School Dashboard
- Class analytics
- Chapter heatmaps
- Students needing intervention

## 🤖 AI Agent Orchestration

BIBO uses **OnDemand AI agents** for modular intelligence.

### Implemented Agents

1. **Diagnostic Agent**
2. **Learning Path Agent**
3. **Tutor Agent**
4. **Practice Generator Agent**
5. **Mentor Support Agent**

Each agent is stateless, scalable, and independently deployable.

## 🎮 Gamification Rules

✓ Rewards consistency over speed  
✓ Improvement-based bonuses  
✓ Daily streak multipliers  
✓ Mastery > completion focus

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

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React, Tailwind CSS |
| **Backend** | Node.js, Express |
| **Database** | MongoDB |
| **Cache** | Redis |
| **AI/ML** | Python, FastAPI, OnDemand LLMs |
| **Auth** | JWT, bcrypt |
| **Deployment** | Docker, AWS / Render |

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
- [ ] Regional language support
- [ ] Teacher authoring tools
- [ ] School LMS integration

## 👥 Team

Built with ❤️ to make personalized education accessible for every Indian student.

---

## 🌟 BIBO

**"Learning that adapts to you."**
