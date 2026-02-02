import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator, Download, Plus, X, Settings, BarChart3, RefreshCw, Trash2, Edit2 } from 'lucide-react';
import { ExamBoard, SchoolGradingSystem, CurvedGradeResult } from '../types';
import { curveGrades } from '../utils/gradeCurving';
import { PRESET_BOARDS, DEFAULT_SCHOOL_GRADING, IB_SCHOOL_GRADING } from '../utils/examBoards';

interface StudentScore {
    studentId: string;
    studentName: string;
    rawScore: number;
}

const GradeCurving: React.FC = () => {
    const {
        classes, students, assignments, grades, examBoards,
        fetchClasses, fetchStudents, fetchAssignments, fetchGrades, fetchExamBoards,
        addExamBoard, updateExamBoard, deleteExamBoard, restoreDefaultExamBoards
    } = useAppContext();

    useEffect(() => {
        fetchClasses();
        fetchStudents();
        fetchAssignments();
        fetchGrades();
        fetchExamBoards();
    }, []);

    // Configuration State
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');
    const [internalMax, setInternalMax] = useState<number>(100);

    // Board Management
    // We now rely solely on DB boards. 
    const allBoards = examBoards;

    const [selectedBoardId, setSelectedBoardId] = useState<string>('');

    const [schoolGrading, setSchoolGrading] = useState<SchoolGradingSystem>(DEFAULT_SCHOOL_GRADING);

    // Manual score entry
    const [manualScores, setManualScores] = useState<StudentScore[]>([]);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [newStudentName, setNewStudentName] = useState('');
    const [newStudentScore, setNewStudentScore] = useState('');

    // Grading system editor
    const [showGradingEditor, setShowGradingEditor] = useState(false);

    // Board editor
    const [showBoardEditor, setShowBoardEditor] = useState(false);
    const [editingBoard, setEditingBoard] = useState<ExamBoard | null>(null);

    // Ensure selected board is valid
    useEffect(() => {
        if (!selectedBoardId && allBoards.length > 0) {
            setSelectedBoardId(allBoards[0].id);
        } else if (selectedBoardId && !allBoards.find(b => b.id === selectedBoardId)) {
            if (allBoards.length > 0) setSelectedBoardId(allBoards[0].id);
            else setSelectedBoardId('');
        }
    }, [allBoards, selectedBoardId]);

    const activeBoard = useMemo(() => {
        return allBoards.find(b => b.id === selectedBoardId) || (allBoards.length > 0 ? allBoards[0] : null);
    }, [allBoards, selectedBoardId]);

    const handleRestoreDefaults = async () => {
        if (confirm("This will add the standard examination boards (IGCSE, Cambridge, IB) to your list. Continue?")) {
            // We strip IDs so they get new UUIDs from DB
            const boardsToRestore = PRESET_BOARDS.map(({ id, ...rest }) => rest);
            await restoreDefaultExamBoards(boardsToRestore);
        }
    };

    const handleSaveBoard = async () => {
        if (editingBoard) {
            if (editingBoard.maxScore <= 0) {
                alert("Max score must be greater than 0");
                return;
            }

            // Sort boundaries before saving to ensure consistency
            const sortedBoundaries = [...editingBoard.boundaries].sort((a, b) => b.minScore - a.minScore);
            const boardToSave = { ...editingBoard, boundaries: sortedBoundaries };

            let result: ExamBoard | null = null;

            if (boardToSave.id.startsWith('new-')) {
                // New board from "Create New"
                const { id, ...boardPayload } = boardToSave;
                result = await addExamBoard(boardPayload);
            } else {
                // Existing board
                result = await updateExamBoard(boardToSave);
            }

            if (result) {
                setSelectedBoardId(result.id);
            }

            setShowBoardEditor(false);
        }
    };

    const handleDeleteBoard = async () => {
        if (!activeBoard) return;

        if (confirm(`Are you sure you want to permanently delete the board "${activeBoard.name}"? This cannot be undone.`)) {
            await deleteExamBoard(activeBoard.id);
            // Fallback handled by useEffect
        }
    };

    const handleCreateNewBoard = () => {
        if (!activeBoard && allBoards.length === 0) {
            // Logic if no boards exist
            setEditingBoard({
                id: `new-${Date.now()}`,
                name: 'New Exam Board',
                maxScore: 100,
                boundaries: []
            });
        } else if (activeBoard) {
            setEditingBoard({
                ...activeBoard,
                id: `new-${Date.now()}`,
                name: `${activeBoard.name} (Copy)`
            });
        }
        setShowBoardEditor(true);
    };

    const handleAddBoundary = () => {
        if (editingBoard) {
            setEditingBoard({
                ...editingBoard,
                boundaries: [
                    ...editingBoard.boundaries,
                    { grade: 'New', minScore: 0 }
                ].sort((a, b) => b.minScore - a.minScore)
            });
        }
    };

    const handleRemoveBoundary = (index: number) => {
        if (editingBoard) {
            const newBoundaries = [...editingBoard.boundaries];
            newBoundaries.splice(index, 1);
            setEditingBoard({
                ...editingBoard,
                boundaries: newBoundaries
            });
        }
    };

    const handleResetBoard = () => {
        if (activeBoard) {
            setEditingBoard(JSON.parse(JSON.stringify(activeBoard)));
        } else {
            // Fallback if creating the first board ever
            setEditingBoard({
                id: `new-${Date.now()}`,
                name: 'New Exam Board',
                maxScore: 100,
                boundaries: []
            });
        }
    };

    // Update activeSchoolGrading to depend on activeBoard null check
    const activeSchoolGrading = useMemo(() => {
        if (!activeBoard) return schoolGrading;
        if (activeBoard.name.includes('IB')) {
            return IB_SCHOOL_GRADING;
        }
        return schoolGrading;
    }, [activeBoard, schoolGrading]);

    // Get students and their grades for the selected assignment
    const studentScores: StudentScore[] = useMemo(() => {
        if (showManualEntry && manualScores.length > 0) {
            return manualScores;
        }

        if (!selectedAssignmentId) return [];

        const classStudents = students.filter(s => s.classId === selectedClassId);

        return classStudents.map(student => {
            const grade = grades.find(g => g.studentId === student.id && g.assignmentId === selectedAssignmentId);
            return {
                studentId: student.id,
                studentName: student.name,
                rawScore: grade?.score || 0
            };
        });
    }, [selectedClassId, selectedAssignmentId, students, grades, showManualEntry, manualScores]);

    // Update curvedResults to depend on activeBoard null check
    const curvedResults = useMemo(() => {
        if (studentScores.length === 0 || !activeBoard) return [];
        return curveGrades(studentScores, internalMax, activeBoard, activeSchoolGrading);
    }, [studentScores, internalMax, activeBoard, activeSchoolGrading]);


    // ... inside return ...

    // Replace Board Selector UI
    /* 
    ...
    */


    // Grade distribution stats
    const gradeDistribution = useMemo(() => {
        const distribution: Record<string, number> = {};
        curvedResults.forEach(result => {
            distribution[result.schoolGrade] = (distribution[result.schoolGrade] || 0) + 1;
        });
        return distribution;
    }, [curvedResults]);

    // Class average
    const classAverage = useMemo(() => {
        if (curvedResults.length === 0) return 0;
        const sum = curvedResults.reduce((acc, r) => acc + r.schoolPercent, 0);
        return Math.round((sum / curvedResults.length) * 10) / 10;
    }, [curvedResults]);

    // Handlers
    const handleAddManualScore = () => {
        if (newStudentName && newStudentScore) {
            setManualScores([
                ...manualScores,
                {
                    studentId: `manual-${Date.now()}`,
                    studentName: newStudentName,
                    rawScore: parseFloat(newStudentScore) || 0
                }
            ]);
            setNewStudentName('');
            setNewStudentScore('');
        }
    };

    const handleRemoveManualScore = (studentId: string) => {
        setManualScores(manualScores.filter(s => s.studentId !== studentId));
    };

    const handleExportCSV = () => {
        if (curvedResults.length === 0) return;

        const headers = ['Student Name', 'Raw Score', 'Scaled Score', 'Board Grade', 'School %', 'School Grade'];
        const rows = curvedResults.map(r => [
            r.studentName,
            r.rawScore,
            r.scaledScore,
            r.boardGrade,
            r.schoolPercent,
            r.schoolGrade
        ]);

        const escapeCsv = (val: string | number) => {
            const str = String(val);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };

        const csvContent = [
            headers.map(escapeCsv).join(','),
            ...rows.map(row => row.map(escapeCsv).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `curved_grades_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Auto-set internal max from assignment
    useEffect(() => {
        if (selectedAssignmentId) {
            const assignment = assignments.find(a => a.id === selectedAssignmentId);
            if (assignment) {
                setInternalMax(assignment.maxPoints);
            }
        }
    }, [selectedAssignmentId, assignments]);

    const activeAssignments = assignments.filter(a => a.classId === selectedClassId);

    // Grading colors
    const getGradeColor = (grade: string) => {
        if (['A*', 'A', '7', '6'].includes(grade)) return 'text-emerald-400';
        if (['B', '5'].includes(grade)) return 'text-blue-400';
        if (['C', '4'].includes(grade)) return 'text-yellow-400';
        if (['D', '3'].includes(grade)) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <header className="flex justify-between items-end flex-wrap gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-2xl text-purple-600 dark:text-purple-400">
                            <Calculator size={24} />
                        </div>
                        Grade Curving
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Curve exam scores to examination board standards.</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <button
                        onClick={handleExportCSV}
                        disabled={curvedResults.length === 0}
                        className="px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm
                        bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 
                        text-slate-600 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400
                        disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                    >
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </header>

            {/* Configuration Panel */}
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                    <Settings size={18} className="text-slate-400" />
                    Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Class Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Class</label>
                        <div className="relative">
                            <select
                                value={selectedClassId}
                                onChange={(e) => {
                                    setSelectedClassId(e.target.value);
                                    setSelectedAssignmentId('');
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all appearance-none"
                            >
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Assignment Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Assignment (Optional)</label>
                        <div className="relative">
                            <select
                                value={selectedAssignmentId}
                                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all appearance-none"
                            >
                                <option value="">-- Select Assignment --</option>
                                {activeAssignments.map(a => (
                                    <option key={a.id} value={a.id}>{a.title} ({a.maxPoints} pts)</option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                    </div>

                    {/* Internal Max */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Internal Maximum</label>
                        <input
                            type="number"
                            value={internalMax}
                            onChange={(e) => setInternalMax(parseInt(e.target.value) || 0)}
                            min={1}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                        />
                    </div>

                    {/* Board Selector */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Examination Board</label>

                        {allBoards.length === 0 ? (
                            <div className="p-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-center">
                                <p className="text-xs text-slate-500 mb-2">No boards found</p>
                                <button
                                    onClick={handleRestoreDefaults}
                                    className="text-xs text-purple-600 hover:text-purple-700 font-bold uppercase tracking-wide"
                                >
                                    Load Defaults
                                </button>
                            </div>
                        ) : (
                            <div className="relative">
                                <select
                                    value={selectedBoardId}
                                    onChange={(e) => setSelectedBoardId(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    {allBoards.map(b => (
                                        <option key={b.id} value={b.id}>{b.name} (max: {b.maxScore})</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Row */}
                <div className="flex gap-3 mt-6 flex-wrap">
                    <button
                        onClick={() => setShowManualEntry(!showManualEntry)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm ${showManualEntry
                            ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25 shadow-md'
                            : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Plus size={16} /> {showManualEntry ? 'Using Manual Entry' : 'Manual Score Entry'}
                    </button>

                    <button
                        onClick={() => setShowGradingEditor(!showGradingEditor)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                    >
                        <Settings size={16} /> Edit School Grading
                    </button>

                    <button
                        onClick={() => {
                            setEditingBoard(JSON.parse(JSON.stringify(activeBoard)));
                            setShowBoardEditor(true);
                        }}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-sm"
                    >
                        <Edit2 size={16} /> Edit Board
                    </button>

                    <div className="flex-1"></div>

                    <button
                        onClick={handleDeleteBoard}
                        title="Delete current board"
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all shadow-sm"
                    >
                        <Trash2 size={18} />
                    </button>

                    <button
                        onClick={handleCreateNewBoard}
                        className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 dark:hover:bg-slate-600 text-white border border-transparent rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-md"
                    >
                        <Plus size={16} /> New Board
                    </button>

                    {allBoards.length > 0 && (
                        <button
                            onClick={handleRestoreDefaults}
                            className="px-3 py-2.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl text-xs font-medium transition-all"
                            title="Restore Default Boards"
                        >
                            <RefreshCw size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Manual Score Entry */}
            {showManualEntry && (
                <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wide">Manual Score Entry</h4>
                    <div className="flex gap-4 items-end flex-wrap mb-6">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Student Name</label>
                            <input
                                value={newStudentName}
                                onChange={(e) => setNewStudentName(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-slate-400"
                                placeholder="Student name"
                            />
                        </div>
                        <div className="w-32">
                            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase">Score</label>
                            <input
                                type="number"
                                value={newStudentScore}
                                onChange={(e) => setNewStudentScore(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all placeholder-slate-400"
                                placeholder="0"
                            />
                        </div>
                        <button
                            onClick={handleAddManualScore}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/40"
                        >
                            Add
                        </button>
                    </div>

                    {manualScores.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {manualScores.map(s => (
                                <div key={s.studentId} className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm flex items-center gap-3">
                                    <span className="text-slate-700 dark:text-slate-300 font-medium">{s.studentName}: <span className="font-mono ml-1">{s.rawScore}</span></span>
                                    <button
                                        onClick={() => handleRemoveManualScore(s.studentId)}
                                        className="text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => setManualScores([])}
                                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-sm flex items-center gap-1 px-2 py-1.5 transition-colors font-medium"
                            >
                                <RefreshCw size={14} /> Clear All
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Results Section */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Results Table */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-100">
                    <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg">Curved Results</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                {curvedResults.length} student{curvedResults.length !== 1 ? 's' : ''} •
                                {activeBoard ? ` Board: ${activeBoard.name} (max: ${activeBoard.maxScore})` : ' No Board Selected'}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1 custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/30 text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase border-b border-slate-100 dark:border-slate-700">
                                    <th className="px-6 py-4">Student</th>
                                    <th className="px-4 py-4 text-center">Raw</th>
                                    <th className="px-4 py-4 text-center">Scaled</th>
                                    <th className="px-4 py-4 text-center">Board Grade</th>
                                    <th className="px-4 py-4 text-center">School %</th>
                                    <th className="px-4 py-4 text-center">School Grade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                                {curvedResults.map((result, idx) => (
                                    <tr key={result.studentId || idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-3 font-medium text-slate-900 dark:text-slate-200">{result.studentName}</td>
                                        <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400">{result.rawScore}</td>
                                        <td className="px-4 py-3 text-center font-mono text-blue-600 dark:text-blue-400 font-medium">{result.scaledScore}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getGradeColor(result.boardGrade)} bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
                                                {result.boardGrade}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-slate-600 dark:text-slate-400">{result.schoolPercent}%</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-bold ${getGradeColor(result.schoolGrade)} bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700`}>
                                                {result.schoolGrade}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {curvedResults.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500 italic">
                                            {showManualEntry
                                                ? 'Add student scores above to see curved results.'
                                                : 'Select an assignment or use manual entry to curve grades.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Analytics Panel */}
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-200">
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                                <BarChart3 size={18} />
                            </div>
                            Statistics
                        </h4>

                        <div className="space-y-4">
                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Class Average</span>
                                <div className={`text-4xl font-bold mt-2 ${classAverage >= 70 ? 'text-emerald-500 dark:text-emerald-400' : classAverage >= 50 ? 'text-yellow-500 dark:text-yellow-400' : 'text-red-500 dark:text-red-400'}`}>
                                    {classAverage}%
                                </div>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-700/50">
                                <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider">Total Students</span>
                                <div className="text-4xl font-bold mt-2 text-blue-600 dark:text-blue-400">
                                    {curvedResults.length}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grade Distribution */}
                    {curvedResults.length > 0 && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-300">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-6">Grade Distribution</h4>
                            <div className="space-y-3">
                                {Object.entries(gradeDistribution)
                                    .sort(([a], [b]) => {
                                        const order = ['A*', 'A', 'B', 'C', 'D', 'E', 'F', 'U', '7', '6', '5', '4', '3', '2', '1', '0'];
                                        return order.indexOf(a) - order.indexOf(b);
                                    })
                                    .map(([grade, count]: [string, number]) => {
                                        const percent = (count / curvedResults.length) * 100;
                                        return (
                                            <div key={grade} className="flex items-center gap-3">
                                                <span className={`w-8 font-bold ${getGradeColor(grade)}`}>{grade}</span>
                                                <div className="flex-1 bg-slate-100 dark:bg-slate-900 rounded-full h-3 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${['A*', 'A', '7', '6'].includes(grade) ? 'bg-emerald-500' :
                                                            ['B', '5'].includes(grade) ? 'bg-blue-500' :
                                                                ['C', '4'].includes(grade) ? 'bg-yellow-500' :
                                                                    ['D', '3'].includes(grade) ? 'bg-orange-500' : 'bg-red-500'
                                                            } transition-all duration-500`}
                                                        style={{ width: `${percent}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs text-slate-400 font-medium w-8 text-right">{count}</span>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}

                    {/* Board Boundaries Reference */}
                    {activeBoard && (
                        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-400">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wide opacity-80">{activeBoard.name} Boundaries</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                {activeBoard.boundaries.map(b => (
                                    <div key={b.grade} className="flex justify-between py-2 px-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                                        <span className={`font-bold ${getGradeColor(b.grade)}`}>{b.grade}</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-mono">≥{b.minScore}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Board Editor Modal */}
            {showBoardEditor && editingBoard && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl p-8 animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Edit Examination Board</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure grading boundaries and max scores.</p>
                            </div>
                            <button
                                onClick={() => setShowBoardEditor(false)}
                                className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-6 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Board Name</label>
                                    <input
                                        value={editingBoard.name}
                                        onChange={(e) => setEditingBoard({ ...editingBoard, name: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                                        placeholder="e.g. Custom Board"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Max Score</label>
                                    <input
                                        type="number"
                                        value={editingBoard.maxScore}
                                        onChange={(e) => setEditingBoard({ ...editingBoard, maxScore: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Grade Boundaries</h4>
                                    <button
                                        onClick={handleAddBoundary}
                                        className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-3 py-1.5 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1 font-medium"
                                    >
                                        <Plus size={14} /> Add Grade
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {editingBoard.boundaries.map((boundary, idx) => (
                                        <div key={idx} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50 group hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                                            <input
                                                value={boundary.grade}
                                                onChange={(e) => {
                                                    const newBoundaries = [...editingBoard.boundaries];
                                                    newBoundaries[idx] = { ...boundary, grade: e.target.value };
                                                    setEditingBoard({ ...editingBoard, boundaries: newBoundaries });
                                                }}
                                                className={`w-14 font-bold bg-transparent text-center border-b-2 border-transparent focus:border-purple-500 outline-none ${getGradeColor(boundary.grade)}`}
                                                placeholder="G"
                                            />
                                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">min:</span>
                                            <input
                                                type="number"
                                                value={boundary.minScore}
                                                onChange={(e) => {
                                                    const newBoundaries = [...editingBoard.boundaries];
                                                    newBoundaries[idx] = { ...boundary, minScore: parseInt(e.target.value) || 0 };
                                                    // Don't sort on change to prevent UI jumping
                                                    setEditingBoard({ ...editingBoard, boundaries: newBoundaries });
                                                }}
                                                className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-sm text-center text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-purple-500/20"
                                            />
                                            <div className="flex-1 text-xs text-slate-500 dark:text-slate-400 text-right font-mono">
                                                {idx > 0 && boundary.minScore >= editingBoard.boundaries[idx - 1].minScore && (
                                                    <span className="text-red-500 mr-2 font-sans font-bold">Invalid Order!</span>
                                                )}
                                                {Math.round((Number(boundary.minScore) / (editingBoard?.maxScore || 100)) * 100)}%
                                            </div>
                                            <button
                                                onClick={() => handleRemoveBoundary(idx)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={handleResetBoard}
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-all shadow-sm"
                            >
                                Reset
                            </button>
                            <button
                                onClick={handleSaveBoard}
                                className="flex-1 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                            >
                                Save as Custom Board
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Grading System Editor Modal */}
            {showGradingEditor && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-lg shadow-2xl p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">School Grading System</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Define internal school grade boundaries.</p>
                            </div>
                            <button
                                onClick={() => setShowGradingEditor(false)}
                                className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {schoolGrading.grades.map((grade, idx) => (
                                <div key={grade.label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                    <span className={`font-bold w-10 text-center ${getGradeColor(grade.label)}`}>{grade.label}</span>
                                    <input
                                        type="number"
                                        value={grade.minPercent}
                                        onChange={(e) => {
                                            const newGrades = [...schoolGrading.grades];
                                            newGrades[idx] = { ...grade, minPercent: parseFloat(e.target.value) || 0 };
                                            setSchoolGrading({ ...schoolGrading, grades: newGrades });
                                        }}
                                        className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    />
                                    <span className="text-slate-400">-</span>
                                    <input
                                        type="number"
                                        value={grade.maxPercent}
                                        onChange={(e) => {
                                            const newGrades = [...schoolGrading.grades];
                                            newGrades[idx] = { ...grade, maxPercent: parseFloat(e.target.value) || 0 };
                                            setSchoolGrading({ ...schoolGrading, grades: newGrades });
                                        }}
                                        className="w-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 text-sm text-center text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-purple-500/20 outline-none"
                                    />
                                    <span className="text-slate-500 text-sm">%</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                            <button
                                onClick={() => setSchoolGrading(DEFAULT_SCHOOL_GRADING)}
                                className="flex-1 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl text-sm font-medium transition-all shadow-sm"
                            >
                                Reset to Default
                            </button>
                            <button
                                onClick={() => setShowGradingEditor(false)}
                                className="flex-1 px-4 py-2.5 bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GradeCurving;
