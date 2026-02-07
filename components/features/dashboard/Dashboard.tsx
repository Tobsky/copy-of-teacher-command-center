import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../../context/AppContext';
import { CheckSquare, Clock, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PerformanceChart from './PerformanceChart';

const Dashboard: React.FC = () => {
  const {
    todos, toggleTodo, addTodo, deleteTodo, classes, assignments, grades,
    fetchTodos, fetchClasses, fetchAssignments, fetchGrades
  } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodos();
    fetchClasses();
    fetchAssignments();
    fetchGrades();
  }, []);
  const [newTodo, setNewTodo] = useState('');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      addTodo(newTodo);
      setNewTodo('');
    }
  };

  // Calculate today's attendance summary (mock logic for "Today")
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // --- Prepare Data for Chart ---
  // Sort assignments by date
  const sortedAssignments = [...assignments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Calculate average grade for each assignment across all students
  const chartData = sortedAssignments.map(assign => {
    const assignGrades = grades.filter(g => g.assignmentId === assign.id);
    const totalPoints = assignGrades.reduce((acc, curr) => acc + curr.score, 0);
    const count = assignGrades.length;

    // Normalize to percentage
    const avgScore = count > 0 ? (totalPoints / count) : 0;
    const percentage = assign.maxPoints > 0 ? (avgScore / assign.maxPoints) * 100 : 0;

    return {
      label: new Date(assign.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: parseFloat(percentage.toFixed(1)),
      subLabel: assign.title
    };
  }).filter(d => d.value > 0); // Only show assignments with grades

  return (
    <div className="space-y-8 animate-fade-in max-w-7xl mx-auto">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h2>
        <p className="text-slate-500 dark:text-slate-400">Welcome back, Professor. Here is your daily overview.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

        {/* Quick Stats Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
                <Clock size={20} />
              </div>
              Today's Schedule
            </h3>
            <span className="text-xs font-medium px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">{today}</span>
          </div>
          <div className="space-y-4">
            {classes.length > 0 ? classes.map(cls => (
              <div key={cls.id} className="group flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/30 rounded-2xl hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-none transition-all duration-300">
                <div>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{cls.name}</p>
                  <p className="text-xs text-slate-500">{cls.section}</p>
                </div>
                <span className="text-xs font-mono font-medium bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700">
                  {cls.schedule}
                </span>
              </div>
            )) : (
              <p className="text-sm text-slate-500 italic text-center py-4">No classes scheduled today.</p>
            )}
            <button
              onClick={() => navigate('/attendance')}
              className="w-full mt-2 py-3 bg-slate-100 dark:bg-slate-700/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Take Attendance <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Pending Grading Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-100 border border-slate-100 dark:border-slate-700/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <GraduationCap size={20} />
              </div>
              Pending Grading
            </h3>
          </div>
          <div className="flex flex-col items-center justify-center h-52 relative overflow-hidden rounded-2xl bg-slate-50 dark:bg-slate-700/20 border border-slate-100 dark:border-slate-700/30">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>

            <div className="text-5xl font-black text-slate-800 dark:text-white mb-1 relative z-10">{assignments.length}</div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Assignments</p>
            <div className="text-xs text-slate-400 mt-4 text-center px-4">
              <span className="font-semibold text-purple-600 dark:text-purple-400">{grades.length}</span> grades recorded
            </div>
            <button
              onClick={() => navigate('/gradebook')}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-0.5 transition-all duration-300"
            >
              Go to Gradebook
            </button>
          </div>
        </div>

        {/* Todo List Widget */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none animate-slide-up delay-200 border border-slate-100 dark:border-slate-700/50 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
                <CheckSquare size={20} />
              </div>
              Quick Tasks
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-52 space-y-3 mb-4 pr-2 custom-scrollbar">
            {todos.map(todo => (
              <div key={todo.id} className="flex items-start gap-3 group bg-slate-50 dark:bg-slate-700/20 p-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all duration-200
                    ${todo.completed
                      ? 'bg-emerald-500 border-emerald-500 shadow-sm shadow-emerald-500/30'
                      : 'border-slate-300 dark:border-slate-500 hover:border-emerald-400'}`}
                >
                  {todo.completed && <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>}
                </button>
                <span className={`text-sm flex-1 font-medium transition-colors ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                  {todo.text}
                </span>
                <button onClick={() => deleteTodo(todo.id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all p-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {todos.length === 0 && (
              <p className="text-sm text-slate-400 italic text-center mt-8">No tasks. Enjoy your day!</p>
            )}
          </div>

          <form onSubmit={handleAddTodo} className="flex gap-2 mt-auto">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add new task..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 placeholder-slate-400 transition-all shadow-inner"
            />
            <button type="submit" className="bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white p-2.5 rounded-xl transition-colors shadow-lg shadow-slate-200/20 dark:shadow-none">
              <Plus size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Class Performance Infographic */}
      <div className="mt-6 animate-slide-up delay-300">
        <PerformanceChart
          data={chartData}
          title="Global Class Performance"
          subtitle="Average assignment scores over time across all classes."
          color="#818cf8" // Indigo-400
        />
      </div>
    </div>
  );
};


export default Dashboard;