import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { useAppContext } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppView } from './types';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  // const { currentView } = useAppContext(); // Removed in favor of router
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <ThemeProvider>
      <div className="flex min-h-screen font-sans bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 relative transition-colors duration-300">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-screen w-full md:ml-72 transition-all duration-300">
          <div className="md:hidden mb-6 flex items-center justify-between">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-indigo-600 dark:text-blue-400 font-mono">DEV.TEACH_</span>
          </div>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/classes" element={<ClassManager />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/gradebook" element={<Gradebook />} />
            <Route path="/curving" element={<GradeCurving />} />
            <Route path="/planner" element={<LessonPlanner />} />
            <Route path="/snippets" element={<SnippetBank />} />
            <Route path="/feedback" element={<SmartFeedback />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;