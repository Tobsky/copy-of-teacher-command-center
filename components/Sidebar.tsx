import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Code2,
  Sparkles,
  LogOut,
  X,
  BookOpen,
  Calculator,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import SessionManager from './SessionManager';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, activeSession } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [showSessionManager, setShowSessionManager] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/classes', label: 'Classes & Roster', icon: <Users size={20} /> },
    { path: '/attendance', label: 'Attendance', icon: <ClipboardCheck size={20} /> },
    { path: '/gradebook', label: 'Gradebook', icon: <GraduationCap size={20} /> },
    { path: '/curving', label: 'Grade Curving', icon: <Calculator size={20} /> },
    { path: '/planner', label: 'Lesson Planner', icon: <BookOpen size={20} /> },
    { path: '/syllabus', label: 'Syllabus Hub', icon: <ClipboardCheck size={20} /> },
    { path: '/snippets', label: 'Snippet Bank', icon: <Code2 size={20} /> },
    { path: '/feedback', label: 'Smart Feedback', icon: <Sparkles size={20} /> },
  ];

  const handleNavClick = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      <div className={`
        fixed top-0 left-0 z-50 h-[calc(100vh-2rem)] w-64 m-4 rounded-3xl flex flex-col
        transform transition-all duration-300 ease-in-out shadow-2xl shadow-slate-200/50 dark:shadow-slate-900/50
        bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-800
        ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'} lg:translate-x-0
      `}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent tracking-tighter">
              Boundaries
            </h1>
            <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase mt-1">Command Center v1.0</p>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Active Session Display */}
        <div className="px-6 mb-4">
          <button
            onClick={() => setShowSessionManager(true)}
            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl p-3 flex items-center justify-between group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
          >
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-0.5">Academic Session</p>
              <div className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-1.5">
                {activeSession ? activeSession.name : <span className="text-amber-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Set Session</span>}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-700 p-1.5 rounded-lg text-slate-400 group-hover:text-indigo-500 transition-colors shadow-sm">
              <Calendar size={14} />
            </div>
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto custom-scrollbar">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <button
                    onClick={() => handleNavClick(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden
                      ${isActive
                        ? 'text-white shadow-lg shadow-indigo-500/25'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl" />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 mt-auto space-y-4">
          {/* Theme Toggle */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-1 flex relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-slate-700 rounded-lg shadow-sm transition-all duration-300 left-1 ${theme === 'dark' ? 'translate-x-[100%]' : ''}`}
            />
            {/* ... (Theme buttons kept same, using simpler syntax for brevity if needed or just copy paste) */}
            <button
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg relative z-10 transition-colors ${theme === 'light' ? 'text-indigo-600' : 'text-slate-500'}`}
            >
              <Sun size={14} /> Light
            </button>
            <button
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-medium rounded-lg relative z-10 transition-colors ${theme === 'dark' ? 'text-indigo-400' : 'text-slate-500'}`}
            >
              <Moon size={14} /> Dark
            </button>
          </div>

          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors duration-200 rounded-xl"
          >
            <LogOut size={20} />
            Log Out
          </button>

          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-medium text-slate-400">System Online</span>
          </div>
        </div>

        {/* Session Manager Modal */}
        {showSessionManager && (
          <SessionManager onClose={() => setShowSessionManager(false)} />
        )}

      </div>
    </>
  );
};

export default Sidebar;