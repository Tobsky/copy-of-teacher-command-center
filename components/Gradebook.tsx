import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, X, User, Edit2, Trash2, CheckCircle, Download, Settings } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import StudentProfileModal from './StudentProfileModal';
import { Student, Assignment } from '../types';


// Optimized Cell Component to prevent re-renders on every keystroke
const GradeCell = React.memo(({
  studentId,
  assignmentId,
  initialScore,
  onSave,
  onDelete,
  isCompleted
}: {
  studentId: string,
  assignmentId: string,
  initialScore: number | string,
  onSave: (val: number) => void,
  onDelete: () => void,
  isCompleted: boolean
}) => {
  const [value, setValue] = useState(initialScore.toString());

  // Sync with prop if it changes externally
  useEffect(() => {
    setValue(initialScore.toString());
  }, [initialScore]);

  const handleBlur = () => {
    const num = parseFloat(value);
    if (!isNaN(num) && num !== initialScore) {
      onSave(num);
    } else if (value === '' && initialScore !== '') {
      onDelete();
      setValue(''); // Clear local immediately
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  return (
    <div className="relative w-full h-full group/cell">
      <input
        type="number"
        value={value === 'NaN' ? '' : value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`w-full h-full py-4 bg-transparent text-center hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:outline-none font-mono font-medium text-slate-700 dark:text-slate-200 transition-all
            ${isCompleted ? 'opacity-60 focus:opacity-100' : ''}`}
        placeholder="-"
      />
    </div>
  );
});
const Gradebook: React.FC = () => {
  const { classes, students, assignments, grades, updateGrade, deleteGrade, purgeEmptyGrades, addAssignment, updateAssignment, deleteAssignment, fetchClasses, fetchStudents, fetchAssignments, fetchGrades } = useAppContext();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchAssignments();
    fetchGrades();
  }, []);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');

  // New Assignment State
  const [showAddAssign, setShowAddAssign] = useState(false);
  const [newAssignTitle, setNewAssignTitle] = useState('');
  const [newAssignPoints, setNewAssignPoints] = useState('100');
  const [newAssignDate, setNewAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [newAssignCategory, setNewAssignCategory] = useState('Homework');

  // Edit Assignment State
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editAssignTitle, setEditAssignTitle] = useState('');
  const [editAssignPoints, setEditAssignPoints] = useState('');
  const [editAssignCompleted, setEditAssignCompleted] = useState(false);
  const [editAssignDate, setEditAssignDate] = useState('');
  const [editAssignCategory, setEditAssignCategory] = useState('Homework');

  // Weight Configuration State
  const [showWeightConfig, setShowWeightConfig] = useState(false);
  const [classWeights, setClassWeights] = useState<Record<string, number>>({
    'Homework': 20,
    'Test': 30,
    'Midterm Exam': 20,
    'End Semester Exam': 30
  });

  // Load weights from local storage when class changes
  useEffect(() => {
    if (selectedClassId) {
      const saved = localStorage.getItem(`grade_weights_${selectedClassId}`);
      if (saved) {
        try {
          setClassWeights(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse weights", e);
        }
      } else {
        // Defaults
        setClassWeights({
          'Homework': 20,
          'Test': 30,
          'Midterm Exam': 20,
          'End Semester Exam': 30
        });
      }
    }
  }, [selectedClassId]);

  const saveWeights = () => {
    if (selectedClassId) {
      localStorage.setItem(`grade_weights_${selectedClassId}`, JSON.stringify(classWeights));
      setShowWeightConfig(false);
      // Force re-render/re-calc happen naturally via state change
    }
  };


  // Student Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const activeStudents = students.filter(s => s.classId === selectedClassId);
  const activeAssignments = assignments.filter(a => a.classId === selectedClassId);
  const activeClass = classes.find(c => c.id === selectedClassId);

  const getStudentGrade = (studentId: string, assignmentId: string) => {
    return grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId)?.score || '';
  };

  /* Removed handleGradeChange - moved to GradeCell onSave */

  const calculateAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && activeAssignments.some(a => a.id === g.assignmentId));

    // Group by category
    const categoryTotals: Record<string, { earned: number, max: number }> = {};

    // Initialize base on known categories to ensure we cover them if they exist in weights
    Object.keys(classWeights).forEach(cat => {
      categoryTotals[cat] = { earned: 0, max: 0 };
    });

    studentGrades.forEach(g => {
      const assign = assignments.find(a => a.id === g.assignmentId);
      if (assign) {
        const cat = assign.category || 'Homework'; // Default to Homework if missing
        if (!categoryTotals[cat]) categoryTotals[cat] = { earned: 0, max: 0 };

        categoryTotals[cat].earned += g.score;
        categoryTotals[cat].max += assign.maxPoints;
      }
    });

    let totalWeightedScore = 0;
    let totalWeightUsed = 0;

    Object.entries(classWeights).forEach(([cat, weight]) => {
      const totals = categoryTotals[cat];
      if (totals && totals.max > 0) {
        const catPercentage = (totals.earned / totals.max) * 100;
        totalWeightedScore += catPercentage * ((weight as number) / 100);
        totalWeightUsed += ((weight as number) / 100);
      }
    });

    // If no weights matched or no assignments, fall back to simple average logic strictly? 
    // Or just re-normalize.
    if (totalWeightUsed === 0) return 'N/A';

    // Normalize to 100% based on used weights (so if only Homework exists (20%), grade isn't capped at 20%)
    const finalScore = (totalWeightedScore / totalWeightUsed);
    return finalScore.toFixed(1);
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignTitle && newAssignPoints && newAssignDate) {
      addAssignment({
        classId: selectedClassId,
        title: newAssignTitle,
        maxPoints: parseInt(newAssignPoints),
        date: newAssignDate,
        completed: false,
        category: newAssignCategory
      });

      setNewAssignTitle('');
      setNewAssignDate(new Date().toISOString().split('T')[0]);
      setShowAddAssign(false);
    }
  };

  const handleEditClick = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setEditAssignTitle(assignment.title);
    setEditAssignPoints(assignment.maxPoints.toString());
    setEditAssignCompleted(assignment.completed);
    setEditAssignDate(assignment.date);
    setEditAssignCategory(assignment.category || 'Homework');
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssignment && editAssignTitle && editAssignPoints && editAssignDate) {
      updateAssignment({
        ...editingAssignment,
        title: editAssignTitle,
        maxPoints: parseInt(editAssignPoints),
        date: editAssignDate,
        completed: editAssignCompleted,
        category: editAssignCategory
      });
      setEditingAssignment(null);
    }
  };

  const handleDeleteAssignment = () => {
    if (editingAssignment) {
      if (window.confirm("Are you sure you want to delete this assignment? All associated grades will be lost.")) {
        deleteAssignment(editingAssignment.id);
        setEditingAssignment(null);
      }
    }
  };

  const handleExportCSV = () => {
    if (!activeClass) return;

    // 1. Prepare Headers
    const csvHeaders = [
      'Student Name',
      'Student ID',
      'Email',
      ...activeAssignments.map(a => `${a.title} (${a.maxPoints} pts)`),
      'Average (%)'
    ];

    // 2. Prepare Rows
    const csvRows = activeStudents.map(student => {
      const studentGrades = activeAssignments.map(a => {
        const grade = grades.find(g => g.studentId === student.id && g.assignmentId === a.id);
        return grade ? grade.score : '';
      });
      const avg = calculateAverage(student.id);

      return [
        student.name,
        student.id,
        student.email,
        ...studentGrades,
        avg
      ];
    });

    // 3. Construct CSV String
    const escapeCsv = (val: string | number) => {
      const str = String(val);
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      csvHeaders.map(escapeCsv).join(','),
      ...csvRows.map(row => row.map(escapeCsv).join(','))
    ].join('\n');

    // 4. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${activeClass.name.replace(/\s+/g, '_')}_Grades.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };




  const handlePurge = async () => {
    if (confirm("Are you sure you want to delete all '0' grades? This will make them 'missing' (empty) instead of zero.")) {
      const success = await purgeEmptyGrades();
      if (success) {
        alert("Cleanup complete! 0 grades have been removed.");
      }
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 relative animate-fade-in pb-6">
      <header className="flex justify-between items-end flex-wrap gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Gradebook</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage assignments, track student progress, and analyze performance.</p>
        </div>

        <div className="flex gap-3 flex-wrap items-center">
          <div className="relative group">
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-5 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer min-w-[200px]"
            >
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 transition-transform group-hover:translate-y-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
            </div>
          </div>

          <button
            onClick={handleExportCSV}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            title="Export as CSV"
          >
            <Download size={18} className="text-slate-400 dark:text-slate-400" /> Export CSV
          </button>

          <button
            onClick={handlePurge}
            className="bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/10 text-slate-600 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            title="Remove all 0 grades"
          >
            <Trash2 size={18} className="text-slate-400 dark:text-slate-400 group-hover:text-red-500" />
            <span className="hidden sm:inline">Clean Data</span>
          </button>

          <button
            onClick={() => setShowWeightConfig(true)}
            className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-sm hover:shadow-md"
            title="Configure Grade Weights"
          >
            <Settings size={18} className="text-slate-400 dark:text-slate-400" /> Weights
          </button>

          <button
            onClick={() => setShowAddAssign(!showAddAssign)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} /> New Assignment
          </button>
        </div>
      </header>

      {/* Grade Weights Modal */}
      {showWeightConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-sm shadow-2xl p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                  <Settings size={20} />
                </div>
                Grade Weights
              </h3>
              <button onClick={() => setShowWeightConfig(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X size={20} /></button>
            </div>

            <div className="space-y-4 mb-6">
              {Object.entries(classWeights).map(([cat, weight]) => (
                <div key={cat} className="flex items-center gap-3">
                  <label className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300">{cat}</label>
                  <div className="relative w-24">
                    <input
                      type="number"
                      value={weight}
                      onChange={(e) => setClassWeights({ ...classWeights, [cat]: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-right text-sm font-bold text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold uppercase text-slate-500">Total</span>
                <span className={`text-sm font-bold ${(Object.values(classWeights) as number[]).reduce((a, b) => a + b, 0) === 100 ? 'text-emerald-500' : 'text-amber-500'}`}>
                  {(Object.values(classWeights) as number[]).reduce((a, b) => a + b, 0)}%
                </span>
              </div>
            </div>

            <button onClick={saveWeights} className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-600/20 transition-all">
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Add Assignment Form */}
      {showAddAssign && (
        <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-500/50"></div>
          <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Plus size={16} />
            </div>
            Create New Assignment
          </h4>
          <form onSubmit={handleAddAssignment} className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Title</label>
              <input
                value={newAssignTitle}
                onChange={e => setNewAssignTitle(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                placeholder="e.g. Unit 3 Quiz"
                autoFocus
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Max Points</label>
              <input
                type="number"
                value={newAssignPoints}
                onChange={e => setNewAssignPoints(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Category</label>
              <select
                value={newAssignCategory}
                onChange={e => setNewAssignCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
              >
                {Object.keys(classWeights).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <div className="w-48">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Date</label>
              <input
                type="date"
                value={newAssignDate}
                onChange={e => setNewAssignDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Create Assignment
            </button>
          </form>
        </div>
      )}

      {/* Grade Table */}
      <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl overflow-hidden flex flex-col shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-100">
        <div className="overflow-x-auto custom-scrollbar flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase border-b border-slate-200 dark:border-slate-700">
                <th className="sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 px-3 md:px-6 py-5 border-r border-slate-200 dark:border-slate-700 min-w-[140px] md:min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)]">Student Name</th>
                <th className="px-6 py-5 min-w-[100px] text-center bg-slate-100/50 dark:bg-slate-900/80 border-r border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 font-extrabold tracking-wider">Average</th>
                {activeAssignments.map(a => (
                  <th
                    key={a.id}
                    onClick={() => handleEditClick(a)}
                    className={`px-4 py-4 min-w-[140px] text-center border-r border-slate-100 dark:border-slate-700/50 group relative cursor-pointer transition-all
                      ${a.completed ? 'bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/20' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className={`truncate max-w-[120px] font-bold text-sm ${a.completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`} title={a.title}>{a.title}</span>
                        {a.completed && <CheckCircle size={14} className="text-emerald-500" />}
                      </div>
                      <div className="flex items-center gap-1.5 opacity-70">
                        <span className="text-[9px] uppercase tracking-wide font-bold bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
                          {a.category?.substring(0, 2) || 'HW'}
                        </span>
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                          {a.maxPoints} pts
                        </span>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Edit2 size={12} className="text-slate-400" />
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm text-slate-600 dark:text-slate-300">
              {activeStudents.map(student => {
                const avg = calculateAverage(student.id);
                let avgColor = 'text-slate-600 dark:text-slate-300';
                if (avg !== 'N/A') {
                  const numAvg = parseFloat(avg);
                  if (numAvg >= 90) avgColor = 'text-emerald-600 dark:text-emerald-400';
                  else if (numAvg < 70) avgColor = 'text-red-600 dark:text-red-400';
                  else if (numAvg < 80) avgColor = 'text-amber-600 dark:text-yellow-400';
                }

                return (
                  <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 group transition-colors">
                    <td className="sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 px-3 md:px-6 py-3 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-10">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="hover:text-blue-500 hover:underline flex items-center gap-3 text-left w-full truncate transition-colors"
                      >
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
                          {student.name.charAt(0)}
                        </div>
                        {student.name}
                      </button>
                    </td>
                    <td className={`px-4 py-3 text-center border-r border-slate-100 dark:border-slate-700/50 font-mono font-bold text-lg ${avgColor} bg-slate-50/30 dark:bg-slate-900/20`}>
                      {avg}%
                    </td>
                    {activeAssignments.map(a => (
                      <td key={a.id} className={`px-0 py-0 text-center border-r border-slate-100 dark:border-slate-700/50 p-0 ${a.completed ? 'bg-slate-50/50 dark:bg-slate-900/30' : ''}`}>
                        <GradeCell
                          studentId={student.id}
                          assignmentId={a.id}
                          initialScore={getStudentGrade(student.id, a.id)}
                          onSave={(score) => updateGrade({ studentId: student.id, assignmentId: a.id, score })}
                          onDelete={() => deleteGrade(student.id, a.id)}
                          isCompleted={a.completed}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {activeStudents.length === 0 && (
                <tr>
                  <td colSpan={activeAssignments.length + 2} className="px-6 py-12 text-center text-slate-400 italic">
                    <div className="flex flex-col items-center gap-2 opacity-60">
                      <User size={32} />
                      <p>No students enrolled in this class yet.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Assignment Modal */}
      {editingAssignment && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  <Edit2 size={20} />
                </div>
                Edit Assignment
              </h3>
              <button
                onClick={() => setEditingAssignment(null)}
                className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateAssignment} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Title</label>
                <input
                  value={editAssignTitle}
                  onChange={e => setEditAssignTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                />
              </div>
              {editingAssignment.createdAt && (
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Created: {new Date(editingAssignment.createdAt).toLocaleString()}
                </div>
              )}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Max Points</label>
                  <input
                    type="number"
                    value={editAssignPoints}
                    onChange={e => setEditAssignPoints(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Category</label>
                    <select
                      value={editAssignCategory}
                      onChange={e => setEditAssignCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all cursor-pointer appearance-none"
                    >
                      {Object.keys(classWeights).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Date</label>
                    <input
                      type="date"
                      value={editAssignDate}
                      onChange={e => setEditAssignDate(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-3 cursor-pointer p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <input
                    type="checkbox"
                    checked={editAssignCompleted}
                    onChange={e => setEditAssignCompleted(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 select-none">Completed</span>
                </label>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleDeleteAssignment}
                  className="px-4 py-3 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Trash2 size={18} /> Delete
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          initialTab="overview"
        />
      )}
    </div>
  );
};

export default Gradebook;