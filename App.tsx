import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import AuthPage from './components/AuthPage';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ClassManager from './components/ClassManager';
import Attendance from './components/Attendance';
import Gradebook from './components/Gradebook';
import SnippetBank from './components/SnippetBank';
import SmartFeedback from './components/SmartFeedback';
import LessonPlanner from './components/LessonPlanner';
import GradeCurving from './components/GradeCurving';
import LandingPage from './components/LandingPage';
import { ThemeProvider } from './context/ThemeContext';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<any>(null); // Type 'any' for simplicity with Supabase session
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Define public routes where sidebar should NOT appear
  const isPublicRoute = !session && (location.pathname === '/' || location.pathname === '/login');

  return (
    <ThemeProvider>
      <div className="flex min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 relative transition-colors duration-300">

        {/* Only show Sidebar if we are authenticated */}
        {session && (
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        )}

        <main className={`flex-1 overflow-y-auto h-screen w-full transition-all duration-300 ${session ? 'p-4 md:p-8 md:ml-72' : ''}`}>

          {/* Mobile Menu Button - Only show if authenticated */}
          {session && (
            <div className="md:hidden mb-6 flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
              >
                <Menu size={24} />
              </button>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">Boundaries</span>
            </div>
          )}

          <Routes>
            {/* Public Routes */}
            <Route path="/" element={!session ? <LandingPage /> : <Navigate to="/dashboard" replace />} />
            <Route path="/login" element={!session ? <AuthPage /> : <Navigate to="/dashboard" replace />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" replace />} />
            <Route path="/classes" element={session ? <ClassManager /> : <Navigate to="/login" replace />} />
            <Route path="/attendance" element={session ? <Attendance /> : <Navigate to="/login" replace />} />
            <Route path="/gradebook" element={session ? <Gradebook /> : <Navigate to="/login" replace />} />
            <Route path="/curving" element={session ? <GradeCurving /> : <Navigate to="/login" replace />} />
            <Route path="/planner" element={session ? <LessonPlanner /> : <Navigate to="/login" replace />} />
            <Route path="/snippets" element={session ? <SnippetBank /> : <Navigate to="/login" replace />} />
            <Route path="/feedback" element={session ? <SmartFeedback /> : <Navigate to="/login" replace />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;