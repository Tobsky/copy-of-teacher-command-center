import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ListChecks, Plus, X, Check, AlertTriangle, BookOpen, ChevronDown } from 'lucide-react';
import { SyllabusTopic } from '../types';

const SyllabusTracker: React.FC = () => {
    const { classes, syllabusTopics, lessons, fetchClasses, fetchSyllabusTopics, fetchLessons, addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic } = useAppContext();

    useEffect(() => {
        fetchClasses();
        fetchSyllabusTopics();
        fetchLessons();
    }, []);

    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<'Semester 1' | 'Semester 2' | 'all'>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicSemester, setNewTopicSemester] = useState<'Semester 1' | 'Semester 2'>('Semester 1');

    // Set default class on load
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    // Filter topics by class and semester
    const filteredTopics = syllabusTopics.filter(t => {
        if (t.classId !== selectedClassId) return false;
        if (selectedSemester !== 'all' && t.semester !== selectedSemester) return false;
        return true;
    });

    // Calculate semester progress
    const getProgress = (semester: 'Semester 1' | 'Semester 2') => {
        const semesterTopics = syllabusTopics.filter(t => t.classId === selectedClassId && t.semester === semester);
        if (semesterTopics.length === 0) return 0;
        const completed = semesterTopics.filter(t => t.isCompleted).length;
        return Math.round((completed / semesterTopics.length) * 100);
    };

    // Check if a topic has a linked lesson
    const hasLinkedLesson = (topicId: string) => {
        return lessons.some(l => l.syllabusTopicId === topicId);
    };

    // Gap Discovery: topics without linked lessons
    const unlinkedTopics = syllabusTopics.filter(t => t.classId === selectedClassId && !hasLinkedLesson(t.id) && !t.isCompleted);

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle || !selectedClassId) return;

        await addSyllabusTopic({
            classId: selectedClassId,
            title: newTopicTitle,
            semester: newTopicSemester,
            isCompleted: false,
            userId: ''
        });

        setNewTopicTitle('');
        setShowAddForm(false);
    };

    const toggleCompleted = async (topic: SyllabusTopic) => {
        await updateSyllabusTopic({ ...topic, isCompleted: !topic.isCompleted });
    };

    const handleDeleteTopic = async (id: string) => {
        if (window.confirm('Delete this topic? Linked lessons will be unlinked.')) {
            await deleteSyllabusTopic(id);
        }
    };

    const sem1Progress = getProgress('Semester 1');
    const sem2Progress = getProgress('Semester 2');

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in relative pb-6">
            <header className="flex justify-between items-end flex-wrap gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                            <ListChecks size={24} />
                        </div>
                        Syllabus Tracker
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Define, track, and link curriculum topics to your lesson plans.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus size={18} /> Add Topic
                </button>
            </header>

            {/* Filters & Progress */}
            <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[180px]">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Class</label>
                            <div className="relative">
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => setSelectedClassId(e.target.value)}
                                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
                                >
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="min-w-[160px]">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Semester</label>
                            <div className="relative">
                                <select
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value as any)}
                                    className="w-full appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
                                >
                                    <option value="all">All Semesters</option>
                                    <option value="Semester 1">Semester 1</option>
                                    <option value="Semester 2">Semester 2</option>
                                </select>
                                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Summary */}
                <div className="flex gap-4">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-w-[180px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Semester 1</p>
                        <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{sem1Progress}%</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${sem1Progress}%` }} />
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-w-[180px]">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Semester 2</p>
                        <div className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">{sem2Progress}%</div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${sem2Progress}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Gap Discovery Alert */}
            {unlinkedTopics.length > 0 && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl p-5">
                    <div className="flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">Attention Needed: {unlinkedTopics.length} Topics Without Lesson Plans</h4>
                            <p className="text-amber-700 dark:text-amber-400 text-xs">
                                {unlinkedTopics.slice(0, 3).map(t => t.title).join(', ')}{unlinkedTopics.length > 3 ? ` and ${unlinkedTopics.length - 3} more...` : ''}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Topics List */}
            <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                    Topics ({filteredTopics.length})
                </h3>
                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                    {filteredTopics.length > 0 ? filteredTopics.map(topic => (
                        <div
                            key={topic.id}
                            className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${topic.isCompleted
                                    ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30'
                                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => toggleCompleted(topic)}
                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${topic.isCompleted
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-slate-300 dark:border-slate-600 hover:border-violet-500 dark:hover:border-violet-400'
                                        }`}
                                >
                                    {topic.isCompleted && <Check size={14} />}
                                </button>
                                <div>
                                    <p className={`font-bold text-sm ${topic.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800 dark:text-white'}`}>{topic.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-slate-400 font-medium">{topic.semester}</span>
                                        {hasLinkedLesson(topic.id) && (
                                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                                <BookOpen size={10} /> Lesson Planned
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => handleDeleteTopic(topic.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    )) : (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                            <ListChecks size={32} className="opacity-50 mb-2" />
                            <p>No topics yet. Add one to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Topic Modal */}
            {showAddForm && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                                    <Plus size={20} />
                                </div>
                                Add Topic
                            </h3>
                            <button onClick={() => setShowAddForm(false)} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleAddTopic} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Topic Title</label>
                                <input
                                    value={newTopicTitle}
                                    onChange={e => setNewTopicTitle(e.target.value)}
                                    placeholder="e.g. 1.1 Data Representation"
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all placeholder-slate-400"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Semester</label>
                                <div className="relative">
                                    <select
                                        value={newTopicSemester}
                                        onChange={e => setNewTopicSemester(e.target.value as any)}
                                        className="w-full appearance-none bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white text-sm font-medium rounded-xl px-4 py-3 pr-10 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
                                    >
                                        <option value="Semester 1">Semester 1</option>
                                        <option value="Semester 2">Semester 2</option>
                                    </select>
                                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-violet-600/20 hover:shadow-violet-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                            >
                                Add Topic
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusTracker;
