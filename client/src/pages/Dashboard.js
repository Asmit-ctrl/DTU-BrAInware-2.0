import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import DashboardHome from '../components/DashboardHome';
import Profile from '../components/Profile';
import Students from '../components/Students';
import Quizzes from '../components/Quizzes';
import QuizTaker from '../components/QuizTaker';
import QuizResult from '../components/QuizResult';
import QuizHistory from '../components/QuizHistory';
import Analytics from '../components/Analytics';
import Lessons from '../components/Lessons';
import Exam from '../components/Exam';
import Assignment from '../components/Assignment';
import Doubt from '../components/Doubt';
import ParentsZone from '../components/ParentsZone';
import Schedule from '../components/Schedule';

function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();

  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/students')) return 'students';
    if (path.includes('/quiz')) return 'quizzes';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/lessons')) return 'lessons';
    if (path.includes('/exam')) return 'exam';
    if (path.includes('/assignment')) return 'assignment';
    if (path.includes('/doubt')) return 'doubt';
    if (path.includes('/parents-zone')) return 'parents-zone';
    if (path.includes('/schedule')) return 'schedule';
    return 'dashboard';
  };

  return (
    <div className="dashboard">
      <Sidebar currentPage={getCurrentPage()} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/students" element={<Students />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/quiz/:quizId" element={<QuizTaker />} />
          <Route path="/quiz-result" element={<QuizResult />} />
          <Route path="/quiz-history" element={<QuizHistory />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/lessons" element={<Lessons />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/assignment" element={<Assignment />} />
          <Route path="/doubt" element={<Doubt />} />
          <Route path="/parents-zone" element={<ParentsZone />} />
          <Route path="/schedule" element={<Schedule />} />
        </Routes>
      </main>
    </div>
  );
}

export default Dashboard;
