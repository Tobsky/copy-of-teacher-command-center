import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { generateStudentFeedback } from '../services/geminiService';
import { Sparkles, Loader2, Copy, Printer } from 'lucide-react';
import ReportCard from './ReportCard';

const SmartFeedback: React.FC = () => {
  const { classes, students, assignments, grades, attendance, fetchClasses, fetchStudents, fetchAssignments, fetchGrades, fetchAttendance } = useAppContext();

  useEffect(() => {
    fetchClasses();
    fetchStudents();
    fetchAssignments();
    fetchGrades();
    fetchAttendance();
  }, []);
  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('');

  // Date range for filtering
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const [feedback, setFeedback] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedBehaviors, setSelectedBehaviors] = useState<string[]>([]);
  const [showReportCard, setShowReportCard] = useState(false);

  const activeStudents = students.filter(s => s.classId === selectedClassId);
  const activeAssignments = assignments.filter(a => a.classId === selectedClassId); // Filter for selector

  const predefinedBehaviors = [
    "Participative", "Hardworking", "Distracted", "Helpful",
    "Creative", "Punctual", "Disruptive", "Consistent",
    "Improving", "Inattentive", "Leader", "Quiet"
  ];

  const toggleBehavior = (behavior: string) => {
    setSelectedBehaviors(prev =>
      prev.includes(behavior)
        ? prev.filter(b => b !== behavior)
        : [...prev, behavior]
    );
  };

  const handleGenerate = async () => {
    if (!selectedStudentId) return;

    const student = students.find(s => s.id === selectedStudentId);
    const clazz = classes.find(c => c.id === selectedClassId);

    if (student && clazz) {
      setLoading(true);
      setFeedback('');
      const result = await generateStudentFeedback(
        student,
        clazz,
        assignments,
        grades,
        attendance,
        startDate,
        endDate,
        selectedBehaviors,
        selectedAssignmentId // Pass focused assignment
      );
      setFeedback(result);
      setLoading(false);
    }
  };

  return (
    <div className="h-auto lg:h-full flex flex-col space-y-8 animate-fade-in relative pb-6">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            <Sparkles size={24} />
          </div>
          Smart Feedback Generator
        </h2>
        <p className="text-slate-500 dark:text-slate-400">Generate AI-powered progress report comments based on student data, effortlessly.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-auto lg:h-full lg:min-h-0">
        {/* Selection Panel */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none h-fit">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">1</div>
            Configuration
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => { setSelectedClassId(e.target.value); setSelectedStudentId(''); }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all cursor-pointer"
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>



            {/* Student Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Student</label>
              <select
                value={selectedStudentId}
                onChange={(e) => { setSelectedStudentId(e.target.value); setSelectedBehaviors([]); }}
                disabled={!selectedClassId}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <option value="">-- Choose Student --</option>
                {activeStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Behavior Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Observed Behaviors (Select Multiple)</label>
              <div className="flex flex-wrap gap-2">
                {predefinedBehaviors.map(behavior => (
                  <button
                    key={behavior}
                    onClick={() => toggleBehavior(behavior)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${selectedBehaviors.includes(behavior)
                      ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-600'
                      : 'bg-slate-50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-600'
                      }`}
                  >
                    {behavior}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Focus on Assignment (Optional)</label>
              <select
                value={selectedAssignmentId}
                onChange={(e) => setSelectedAssignmentId(e.target.value)}
                disabled={!selectedClassId}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all disabled:opacity-50"
              >
                <option value="">-- General Progress Report --</option>
                {activeAssignments.map(a => <option key={a.id} value={a.id}>{a.title} ({a.date})</option>)}
              </select>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-50 dark:bg-slate-900/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50">
              Tip: Leave dates blank to analyze the entire academic year.
            </p>

            <button
              onClick={handleGenerate}
              disabled={!selectedStudentId || loading}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg
                ${!selectedStudentId || loading
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-600/30 hover:shadow-purple-600/50 hover:-translate-y-0.5 active:translate-y-0'}`}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              {loading ? 'Analyzing Data...' : 'Generate Feedback'}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-auto lg:h-full lg:min-h-0 min-h-[500px]">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300">2</div>
            Generated Report
          </h3>

          <div className="flex-1 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 relative overflow-hidden group">
            {feedback ? (
              <div className="h-auto lg:h-full lg:overflow-y-auto custom-scrollbar pr-2 flex flex-col">
                <div className="flex justify-end gap-2 mb-4">
                  <button
                    onClick={() => navigator.clipboard.writeText(feedback)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-600 dark:text-slate-400 dark:hover:text-purple-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Copy size={16} />
                    Copy Text
                  </button>

                  <button
                    onClick={() => setShowReportCard(true)}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Printer size={16} />
                    Print Official Report
                  </button>
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-serif text-lg tracking-wide whitespace-pre-line">{feedback}</p>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 p-8 text-center opacity-60">
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 animate-pulse-slow">
                  <Sparkles size={48} className="text-purple-400/50" />
                </div>
                <p className="text-lg font-medium mb-2">Ready to Generate</p>
                <p className="text-sm max-w-md mx-auto leading-relaxed">
                  Select a student from the configuration panel to let our AI analyze their grades, attendance, and trends to write a personalized report card comment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>


      {/* Report Card Modal */}
      {
        showReportCard && selectedStudentId && selectedClassId && (
          <ReportCard
            student={students.find(s => s.id === selectedStudentId)!}
            clazz={classes.find(c => c.id === selectedClassId)!}
            assignments={assignments}
            grades={grades}
            attendance={attendance}
            feedback={feedback}
            onClose={() => setShowReportCard(false)}
          />
        )
      }
    </div>
  );
};

export default SmartFeedback;