import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Calendar, Plus, Trash2, Check, AlertTriangle, X } from 'lucide-react';
import { AcademicSession } from '../types';

interface SessionManagerProps {
    onClose: () => void;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onClose }) => {
    const { academicSessions, activeSession, addAcademicSession, deleteAcademicSession, setActiveSession, createSessionFromLegacy, fetchAcademicSessions } = useAppContext();
    const [showAddForm, setShowAddForm] = useState(false);
    const [isConvertingLegacy, setIsConvertingLegacy] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<'semester' | 'trimester'>('semester');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState<string | null>(null);

    console.log("DEBUG: SessionManager academicSessions:", academicSessions);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;

        const sessionData = {
            name,
            type,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            isActive: true // Always activate if explicitly creating/converting
        };

        if (isConvertingLegacy) {
            await createSessionFromLegacy(sessionData);
        } else {
            await addAcademicSession({
                ...sessionData,
                isActive: academicSessions.length === 0 // Auto-activate only if first one
            });
        }

        // Reset
        setName('');
        setType('semester');
        setStartDate('');
        setEndDate('');
        setShowAddForm(false);
        setIsConvertingLegacy(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Are you sure? Deleting a session will not delete classes but will unlink them.')) {
            await deleteAcademicSession(id);
        }
    };

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                            <Calendar size={24} />
                        </div>
                        Academic Sessions
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <X size={24} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">

                    {/* Active Session Banner */}
                    {activeSession ? (
                        <div className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-indigo-500/20">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Current Active Session</p>
                                    <h3 className="text-3xl font-black">{activeSession.name}</h3>
                                    <p className="text-indigo-100 mt-2 flex items-center gap-2">
                                        <span className="bg-white/20 px-2 py-0.5 rounded text-sm font-medium">
                                            {activeSession.type === 'semester' ? '2 Semesters' : '3 Trimesters'}
                                        </span>
                                        {activeSession.startDate && activeSession.endDate && (
                                            <span className="text-sm opacity-80">
                                                {new Date(activeSession.startDate).getFullYear()} - {new Date(activeSession.endDate).getFullYear()}
                                            </span>
                                        )}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <Check size={32} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-6 mb-8 flex gap-4">
                            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0" />
                            <div>
                                <h4 className="font-bold text-amber-800 dark:text-amber-300">No Active Session</h4>
                                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                                    Please select or create an academic session to organize your classes.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Session List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-bold text-slate-700 dark:text-slate-200">All Sessions</h3>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => fetchAcademicSessions()}
                                    className="text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1"
                                    title="Refresh List"
                                >
                                    Refresh
                                </button>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
                                >
                                    <Plus size={16} /> New Session
                                </button>
                            </div>
                        </div>

                        {/* Legacy / Unassigned Session Card */}
                        <div
                            onClick={() => activeSession && setActiveSession(null)}
                            className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${!activeSession
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/50 ring-1 ring-amber-500/50'
                                : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                                }`}
                        >
                            <div>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold ${!activeSession ? 'text-amber-700 dark:text-amber-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        Legacy / Unassigned
                                    </span>
                                    {!activeSession && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>}
                                </div>
                                <div className="text-xs text-slate-500 mt-1">
                                    Contains classes created before sessions were added.
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAddForm(true); // Open form
                                        // We need a way to tell the form this is a "Legacy Conversion"
                                        // For now, let's just use a simple quick prop or state? 
                                        // Better: Set a state 'isConvertingLegacy'
                                        setIsConvertingLegacy(true);
                                    }}
                                    className="px-3 py-1.5 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400 dark:hover:bg-indigo-900/40 rounded-lg transition-colors"
                                >
                                    Name & Save
                                </button>

                                {!activeSession ? (
                                    <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
                                        <Check size={16} />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 group-hover:border-amber-400 transition-colors"></div>
                                )}
                            </div>
                        </div>

                        {academicSessions.map(session => (
                            <div
                                key={session.id}
                                onClick={() => !session.isActive && setActiveSession(session.id)}
                                className={`group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${session.isActive
                                    ? 'bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-900/50 ring-1 ring-indigo-500/50'
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md'
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className={`font-bold ${session.isActive ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {session.name}
                                        </span>
                                        {session.isActive && <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Active</span>}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1 flex gap-3">
                                        <span>{session.type === 'semester' ? '2 Semesters' : '3 Trimesters'}</span>
                                        {session.startDate && <span>Started: {new Date(session.startDate).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {!session.isActive && (
                                        <button
                                            onClick={(e) => handleDelete(session.id, e)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                    {session.isActive ? (
                                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                            <Check size={16} />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-slate-600 group-hover:border-indigo-400 transition-colors"></div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {academicSessions.length === 0 && !showAddForm && (
                            <div className="text-center py-8 text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                                No sessions found. Create one to get started.
                            </div>
                        )}
                    </div>

                    {/* Add Form */}
                    {showAddForm && (
                        <form onSubmit={handleSubmit} className="mt-6 bg-slate-50 dark:bg-slate-900/30 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 animate-slide-up">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4">
                                {isConvertingLegacy ? 'Name & Save Legacy Session' : 'Create New Session'}
                            </h4>
                            {isConvertingLegacy && (
                                <div className="mb-4 p-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-lg">
                                    This will create a new session and move all currently "Unassigned" classes into it.
                                </div>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Session Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. 2024-2025"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Structure type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setType('semester')}
                                            className={`py-2 px-4 rounded-xl text-sm font-bold border transition-all ${type === 'semester'
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                                }`}
                                        >
                                            Semesters (2)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('trimester')}
                                            className={`py-2 px-4 rounded-xl text-sm font-bold border transition-all ${type === 'trimester'
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                                                }`}
                                        >
                                            Trimesters (3)
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Start Date</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={e => setStartDate(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">End Date</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={e => setEndDate(e.target.value)}
                                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddForm(false);
                                        setIsConvertingLegacy(false);
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
                                >
                                    Create Session
                                </button>
                            </div>
                        </form>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
};

export default SessionManager;
