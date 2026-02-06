import React from 'react';
import { Student, ClassGroup, Grade, Assignment, AttendanceRecord } from '../types';
import { School, CheckCircle, Clock, XCircle, Calendar } from 'lucide-react';

interface ReportCardProps {
    student: Student;
    clazz: ClassGroup;
    assignments: Assignment[];
    grades: Grade[];
    attendance: AttendanceRecord[];
    feedback: string;
    onClose: () => void;
}

const ReportCard: React.FC<ReportCardProps> = ({ student, clazz, assignments, grades, attendance, feedback, onClose }) => {
    // Filter data for this class
    const classAssignments = assignments.filter(a => a.classId === clazz.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const classAttendance = attendance.filter(a => a.studentId === student.id && a.classId === clazz.id);

    // Calculate Overall Grade
    let totalMax = 0;
    let totalEarned = 0;

    // Create a map for quick grade lookup
    const gradeMap = new Map();
    grades.forEach(g => {
        if (g.studentId === student.id) gradeMap.set(g.assignmentId, g.score);
    });

    classAssignments.forEach(a => {
        const score = gradeMap.get(a.id);
        if (score !== undefined) {
            totalEarned += score;
            totalMax += a.maxPoints;
        }
    });

    const overallGrade = totalMax > 0 ? (totalEarned / totalMax) * 100 : 0;

    // Calculate Attendance Stats
    const present = classAttendance.filter(a => a.status === 'Present').length;
    const late = classAttendance.filter(a => a.status === 'Late').length;
    const absent = classAttendance.filter(a => a.status === 'Absent').length;
    const totalDays = classAttendance.length;
    const attendanceRate = totalDays > 0 ? ((present + late) / totalDays) * 100 : 100;

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:fixed print:inset-0">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl print:shadow-none print:w-full print:max-w-none print:max-h-none print:rounded-none print:h-auto">

                {/* Print Action Bar - Hidden when printing */}
                <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-slate-100 p-4 flex justify-between items-center print:hidden">
                    <h2 className="text-lg font-bold text-slate-800">Student Report Preview</h2>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                            Close
                        </button>
                        <button onClick={() => window.print()} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                            <School size={18} />
                            Print Official Report
                        </button>
                    </div>
                </div>

                {/* Report Content */}
                <div className="p-12 print:p-8 space-y-8 text-slate-900">

                    {/* Header */}
                    <header className="border-b-2 border-slate-900 pb-6 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <School size={32} className="text-slate-900" />
                                <h1 className="text-3xl font-bold uppercase tracking-tight">Official Academic Report</h1>
                            </div>
                            <p className="text-slate-500 font-medium">Academic Progress Report • {new Date().getFullYear()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500 uppercase tracking-wider font-bold mb-1">Date</div>
                            <div className="text-lg font-bold">{new Date().toLocaleDateString()}</div>
                        </div>
                    </header>

                    {/* Student Info */}
                    <section className="grid grid-cols-2 gap-12">
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Student Name</div>
                            <div className="text-2xl font-bold">{student.name}</div>
                            <div className="text-sm text-slate-500 mt-1">{student.email}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Class</div>
                            <div className="text-2xl font-bold">{clazz.name}</div>
                            <div className="text-sm text-slate-500 mt-1">Section: {clazz.section}</div>
                        </div>
                    </section>

                    {/* Key Metrics */}
                    <section className="grid grid-cols-3 gap-6">
                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl print:border-slate-200">
                            <div className="text-sm font-bold text-slate-500 mb-2">Overall Grade</div>
                            <div className={`text-4xl font-black ${overallGrade >= 60 ? 'text-emerald-600' : 'text-amber-500'}`}>
                                {overallGrade.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">
                                Based on {classAssignments.length} Assignments
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl print:border-slate-200">
                            <div className="text-sm font-bold text-slate-500 mb-2">Attendance Rate</div>
                            <div className={`text-4xl font-black ${attendanceRate >= 90 ? 'text-blue-600' : 'text-amber-500'}`}>
                                {attendanceRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-wide">
                                {totalDays} Days Recorded
                            </div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl print:border-slate-200 flex flex-col justify-center gap-2">
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="flex items-center gap-2 text-emerald-600"><CheckCircle size={16} /> Present</span>
                                <span>{present}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="flex items-center gap-2 text-amber-500"><Clock size={16} /> Late</span>
                                <span>{late}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm font-bold">
                                <span className="flex items-center gap-2 text-red-500"><XCircle size={16} /> Absent</span>
                                <span>{absent}</span>
                            </div>
                        </div>
                    </section>

                    {/* Teacher's Remarks */}
                    <section>
                        <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wide">Teacher's Comments</h3>
                        <div className="bg-purple-50 p-8 rounded-2xl border border-purple-100 text-slate-800 leading-relaxed text-lg print:bg-transparent print:border-slate-200 print:p-0">
                            {feedback ? feedback : <span className="text-slate-400 italic">No feedback generated for this report.</span>}
                        </div>
                    </section>

                    {/* Recent Grades Table */}
                    <section>
                        <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wide flex items-center gap-2">
                            <Calendar size={20} className="text-slate-400" /> Recent Activity
                        </h3>
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-200 text-slate-500">
                                    <th className="py-3 font-bold">Date</th>
                                    <th className="py-3 font-bold">Assignment</th>
                                    <th className="py-3 font-bold">Category</th>
                                    <th className="py-3 font-bold text-right">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {classAssignments.slice(0, 8).map(assign => {
                                    const score = gradeMap.get(assign.id);
                                    return (
                                        <tr key={assign.id}>
                                            <td className="py-3 text-slate-500">{new Date(assign.date).toLocaleDateString()}</td>
                                            <td className="py-3 font-bold text-slate-800">{assign.title}</td>
                                            <td className="py-3">
                                                <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase">{assign.category || 'General'}</span>
                                            </td>
                                            <td className="py-3 text-right font-mono font-bold">
                                                {score !== undefined ? (
                                                    <span className={score / assign.maxPoints < 0.6 ? 'text-red-500' : 'text-emerald-600'}>
                                                        {score} <span className="text-xs text-slate-400">/ {assign.maxPoints}</span>
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </section>

                    {/* Footer / Signatures */}
                    <footer className="pt-16 grid grid-cols-2 gap-24 print:pt-24">
                        <div className="border-t border-slate-300 pt-4">
                            <div className="text-sm font-bold text-slate-900 uppercase">Teacher Signature</div>
                            <div className="h-4"></div>
                        </div>
                        <div className="border-t border-slate-300 pt-4">
                            <div className="text-sm font-bold text-slate-900 uppercase">Parent Signature</div>
                            <div className="h-4"></div>
                        </div>
                    </footer>

                </div>
            </div>
        </div>
    );
};

export default ReportCard;
