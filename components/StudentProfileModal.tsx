import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAppContext } from '../context/AppContext';
import { Student, Assignment, AttendanceRecord } from '../types';
import { X, User, Calendar, FileText, Activity, Clock, CheckCircle, XCircle } from 'lucide-react';
import PerformanceChart from './PerformanceChart';

interface StudentProfileModalProps {
    student: Student;
    initialTab?: 'overview' | 'attendance' | 'notes';
    onClose: () => void;
}

const StudentProfileModal: React.FC<StudentProfileModalProps> = ({ student, initialTab = 'overview', onClose }) => {
    const { assignments, grades, attendance, classes } = useAppContext();
    const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'notes'>(initialTab);
    const [notes, setNotes] = useState(''); // Local state for now

    // --- Helpers for Overview Tab (Replicated from Gradebook) ---
    const activeClass = classes.find(c => c.id === student.classId);
    const classAssignments = assignments.filter(a => a.classId === student.classId);

    // Load weights from local storage
    const [weights, setWeights] = useState<Record<string, number>>({});
    useEffect(() => {
        if (student.classId) {
            const saved = localStorage.getItem(`grade_weights_${student.classId}`);
            if (saved) {
                try { setWeights(JSON.parse(saved)); } catch (e) {
                    console.error("Failed to parse weights", e);
                }
            } else {
                setWeights({ 'Homework': 20, 'Test': 30, 'Midterm Exam': 20, 'End Semester Exam': 30 });
            }
        }

        // Load notes if persistent storage existed
        const savedNotes = localStorage.getItem(`student_notes_${student.id}`);
        if (savedNotes) setNotes(savedNotes);
    }, [student.id, student.classId]);

    const handleSaveNotes = () => {
        localStorage.setItem(`student_notes_${student.id}`, notes);
        // Optional: Add toast notification
    };

    const calculateAverage = () => {
        const studentGrades = grades.filter(g => g.studentId === student.id && classAssignments.some(a => a.id === g.assignmentId));
        const categoryTotals: Record<string, { earned: number, max: number }> = {};

        Object.keys(weights).forEach(cat => { categoryTotals[cat] = { earned: 0, max: 0 }; });

        studentGrades.forEach(g => {
            const assign = assignments.find(a => a.id === g.assignmentId);
            if (assign) {
                const cat = assign.category || 'Homework';
                if (!categoryTotals[cat]) categoryTotals[cat] = { earned: 0, max: 0 };
                categoryTotals[cat].earned += g.score;
                categoryTotals[cat].max += assign.maxPoints;
            }
        });

        let totalWeightedScore = 0;
        let totalWeightUsed = 0;

        Object.entries(weights).forEach(([cat, weight]) => {
            const totals = categoryTotals[cat];
            if (totals && totals.max > 0) {
                const catPercentage = (totals.earned / totals.max) * 100;
                totalWeightedScore += catPercentage * ((weight as number) / 100);
                totalWeightUsed += ((weight as number) / 100);
            }
        });

        if (totalWeightUsed === 0) return 'N/A';
        return (totalWeightedScore / totalWeightUsed).toFixed(1);
    };

    const getPerformanceData = () => {
        const sortedAssignments = classAssignments
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return sortedAssignments.map(assign => {
            const grade = grades.find(g => g.studentId === student.id && g.assignmentId === assign.id);
            const score = grade ? grade.score : 0;
            const percentage = assign.maxPoints > 0 ? (score / assign.maxPoints) * 100 : 0;
            return {
                label: new Date(assign.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
                value: parseFloat(percentage.toFixed(1)),
                subLabel: assign.title
            };
        }).filter(d => d.value > 0);
    };

    // --- Attendance Helpers ---
    const studentAttendance = attendance.filter(a => a.studentId === student.id && a.classId === student.classId);
    const presentCount = studentAttendance.filter(a => a.status === 'Present').length;
    const lateCount = studentAttendance.filter(a => a.status === 'Late').length;
    const absentCount = studentAttendance.filter(a => a.status === 'Absent').length;
    const attendanceRate = studentAttendance.length > 0
        ? (((presentCount + lateCount) / studentAttendance.length) * 100).toFixed(1)
        : '100.0';

    return createPortal(
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up overflow-hidden">

                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                                <User size={24} />
                            </div>
                            {student.name}
                        </h2>
                        <div className="flex items-center gap-3 mt-2 ml-14">
                            <span className="text-slate-500 dark:text-slate-400 text-sm font-mono">{student.email}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">ID: {student.id.substring(0, 8)}...</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-6">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'overview' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <Activity size={18} /> Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'attendance' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <Calendar size={18} /> Attendance
                    </button>
                    <button
                        onClick={() => setActiveTab('notes')}
                        className={`py-4 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'notes' ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                    >
                        <FileText size={18} /> Notes
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30 dark:bg-slate-900/10">

                    {/* OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            <PerformanceChart
                                data={getPerformanceData()}
                                title="Performance Timeline"
                                subtitle={`Grade history for ${student.name}`}
                                color="#34d399"
                            />

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Current Average</span>
                                    <div className="text-4xl font-extrabold text-emerald-500 dark:text-emerald-400">{calculateAverage()}%</div>
                                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${parseFloat(calculateAverage())}%` }}></div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Completion Rate</span>
                                    <div className="text-4xl font-extrabold text-blue-500 dark:text-blue-400">
                                        {classAssignments.length > 0 ? Math.round((getPerformanceData().length / classAssignments.length) * 100) : 0}%
                                    </div>
                                    <div className="text-xs text-slate-400 mt-3 font-medium">
                                        {getPerformanceData().length} of {classAssignments.length} Assignments
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center shadow-sm">
                                    <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Attendance Rate</span>
                                    <div className="text-4xl font-extrabold text-purple-500 dark:text-purple-400">{attendanceRate}%</div>
                                    <div className="text-xs text-slate-400 mt-3 font-medium">
                                        {presentCount} Present • {lateCount} Late • {absentCount} Absent
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ATTENDANCE TAB */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-600 dark:text-emerald-400"><CheckCircle size={24} /></div>
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{presentCount}</div>
                                        <div className="text-xs font-bold text-emerald-600/70 dark:text-emerald-500 uppercase">Days Present</div>
                                    </div>
                                </div>
                                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600 dark:text-amber-400"><Clock size={24} /></div>
                                    <div>
                                        <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">{lateCount}</div>
                                        <div className="text-xs font-bold text-amber-600/70 dark:text-amber-500 uppercase">Days Late</div>
                                    </div>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-4 rounded-xl flex items-center gap-4">
                                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400"><XCircle size={24} /></div>
                                    <div>
                                        <div className="text-2xl font-bold text-red-700 dark:text-red-400">{absentCount}</div>
                                        <div className="text-xs font-bold text-red-600/70 dark:text-red-500 uppercase">Days Absent</div>
                                    </div>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Attendance Log</h3>
                            {studentAttendance.length > 0 ? (
                                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                                            <tr>
                                                <th className="py-3 px-6 font-bold text-slate-500">Date</th>
                                                <th className="py-3 px-6 font-bold text-slate-500">Status</th>
                                                <th className="py-3 px-6 font-bold text-slate-500 text-right">Day</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                            {studentAttendance
                                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                                .map(record => (
                                                    <tr key={record.date} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                                        <td className="py-3 px-6 font-medium text-slate-700 dark:text-slate-200">
                                                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}
                                                        </td>
                                                        <td className="py-3 px-6">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide
                                                    ${record.status === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : ''}
                                                    ${record.status === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : ''}
                                                    ${record.status === 'Absent' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : ''}
                                                    ${record.status === 'Excused' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                                                `}>
                                                                {record.status === 'Present' && <CheckCircle size={12} />}
                                                                {record.status === 'Late' && <Clock size={12} />}
                                                                {record.status === 'Absent' && <XCircle size={12} />}
                                                                {record.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-6 text-right text-slate-400 font-mono text-xs">
                                                            {new Date(record.date).toLocaleDateString(undefined, { weekday: 'long' })}
                                                        </td>
                                                    </tr>
                                                ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-slate-400 italic bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    No attendance records found for this student.
                                </div>
                            )}
                        </div>
                    )}

                    {/* NOTES TAB */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4 animate-fade-in h-full flex flex-col">
                            <p className="text-slate-500 dark:text-slate-400 text-sm">
                                Use this space to keep private notes about {student.name}. These notes are only visible to you.
                            </p>
                            <textarea
                                className="flex-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none leading-relaxed shadow-inner"
                                placeholder="Type observation notes here..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                onBlur={handleSaveNotes}
                            />
                            <div className="text-right text-xs text-slate-400 italic">
                                Notes are saved automatically.
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>,
        document.body
    );
};

export default StudentProfileModal;
