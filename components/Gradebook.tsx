import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, X, User, Edit2, Trash2, CheckCircle, Download } from 'lucide-react';
import PerformanceChart from './PerformanceChart';
import { Student, Assignment } from '../types';

const Gradebook: React.FC = () => {
  const { classes, students, assignments, grades, updateGrade, addAssignment, updateAssignment, deleteAssignment, fetchClasses, fetchStudents, fetchAssignments, fetchGrades } = useAppContext();

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

  // Edit Assignment State
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [editAssignTitle, setEditAssignTitle] = useState('');
  const [editAssignPoints, setEditAssignPoints] = useState('');
  const [editAssignCompleted, setEditAssignCompleted] = useState(false);
  const [editAssignDate, setEditAssignDate] = useState('');

  // Student Detail Modal State
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const activeStudents = students.filter(s => s.classId === selectedClassId);
  const activeAssignments = assignments.filter(a => a.classId === selectedClassId);
  const activeClass = classes.find(c => c.id === selectedClassId);

  const getStudentGrade = (studentId: string, assignmentId: string) => {
    return grades.find(g => g.studentId === studentId && g.assignmentId === assignmentId)?.score || '';
  };

  const handleGradeChange = (studentId: string, assignmentId: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      updateGrade({ studentId, assignmentId, score: numValue });
    }
  };

  const calculateAverage = (studentId: string) => {
    const studentGrades = grades.filter(g => g.studentId === studentId && activeAssignments.some(a => a.id === g.assignmentId));
    let totalEarned = 0;
    let totalMax = 0;

    studentGrades.forEach(g => {
      const assign = assignments.find(a => a.id === g.assignmentId);
      if (assign) {
        totalEarned += g.score;
        totalMax += assign.maxPoints;
      }
    });

    return totalMax > 0 ? ((totalEarned / totalMax) * 100).toFixed(1) : 'N/A';
  };

  const handleAddAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAssignTitle && newAssignPoints && newAssignDate) {
      addAssignment({
        classId: selectedClassId,
        title: newAssignTitle,
        maxPoints: parseInt(newAssignPoints),
        date: newAssignDate,
        completed: false
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
  };

  const handleUpdateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAssignment && editAssignTitle && editAssignPoints && editAssignDate) {
      updateAssignment({
        ...editingAssignment,
        title: editAssignTitle,
        maxPoints: parseInt(editAssignPoints),
        date: editAssignDate,
        completed: editAssignCompleted
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

  const getStudentPerformanceData = () => {
    if (!selectedStudent) return [];

    const classAssignments = assignments
      .filter(a => a.classId === selectedStudent.classId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return classAssignments.map(assign => {
      const grade = grades.find(g => g.studentId === selectedStudent.id && g.assignmentId === assign.id);
      const score = grade ? grade.score : 0;
      const percentage = assign.maxPoints > 0 ? (score / assign.maxPoints) * 100 : 0;

      return {
        label: new Date(assign.date).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' }),
        value: parseFloat(percentage.toFixed(1)),
        subLabel: assign.title
      };
    }).filter(d => d.value > 0);
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
            onClick={() => setShowAddAssign(!showAddAssign)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus size={18} /> New Assignment
          </button>
        </div>
      </header>

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
                <th className="sticky left-0 bg-slate-50 dark:bg-slate-900 z-20 px-6 py-5 border-r border-slate-200 dark:border-slate-700 min-w-[220px] shadow-[4px_0_12px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)]">Student Name</th>
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
                      <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-1.5 py-0.5 rounded font-mono">
                        {a.maxPoints} pts
                      </span>
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
                    <td className="sticky left-0 bg-white dark:bg-slate-800 group-hover:bg-slate-50 dark:group-hover:bg-slate-800/80 px-6 py-3 border-r border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-200 shadow-[4px_0_12px_rgba(0,0,0,0.05)] dark:shadow-[4px_0_24px_rgba(0,0,0,0.3)] z-10">
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
                        <div className="relative w-full h-full group/cell">
                          <input
                            type="number"
                            value={getStudentGrade(student.id, a.id)}
                            onChange={(e) => handleGradeChange(student.id, a.id, e.target.value)}
                            className={`w-full h-full py-4 bg-transparent text-center hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-600 focus:ring-2 focus:ring-inset focus:ring-blue-500 focus:outline-none font-mono font-medium text-slate-700 dark:text-slate-200 transition-all
                                ${a.completed ? 'opacity-60 focus:opacity-100' : ''}`}
                            placeholder="-"
                          />
                        </div>
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] animate-slide-up">
            <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/30">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
                    <User size={24} />
                  </div>
                  {selectedStudent.name}
                </h2>
                <div className="flex items-center gap-3 mt-2 ml-14">
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-mono">{selectedStudent.email}</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="text-slate-400 text-xs uppercase font-bold tracking-wider">ID: {selectedStudent.id.substring(0, 8)}...</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              <PerformanceChart
                data={getStudentPerformanceData()}
                title="Performance Timeline"
                subtitle={`Grade history for ${selectedStudent.name}`}
                color="#34d399" // Emerald-400
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Current Average</span>
                  <div className="text-4xl font-extrabold text-emerald-500 dark:text-emerald-400">{calculateAverage(selectedStudent.id)}%</div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${parseFloat(calculateAverage(selectedStudent.id))}%` }}></div>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Assignments Submitted</span>
                  <div className="text-4xl font-extrabold text-blue-500 dark:text-blue-400">
                    {getStudentPerformanceData().filter(d => d.value > 0).length} <span className="text-xl text-slate-400 font-medium">/ {activeAssignments.length}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-3 font-medium">
                    Completion Rate: {activeAssignments.length > 0 ? Math.round((getStudentPerformanceData().filter(d => d.value > 0).length / activeAssignments.length) * 100) : 0}%
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center hover:shadow-lg transition-shadow">
                  <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold tracking-wider mb-2">Class Rank</span>
                  <div className="text-4xl font-extrabold text-purple-500 dark:text-purple-400">Top 15%</div>
                  <div className="text-xs text-slate-400 mt-3 font-medium">
                    Percentile: 85th
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gradebook;