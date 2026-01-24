import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, Plus, Link as LinkIcon, Trash2, ExternalLink, ChevronRight, X, BookOpen, FileText, Video, Image as ImageIcon, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { Lesson, LessonResource, ResourceType } from '../types';
import { generateLessonPlan } from '../services/geminiService';

const LessonPlanner: React.FC = () => {
    const { lessons, classes, syllabusTopics, curriculums, addLesson, updateLesson, deleteLesson, fetchLessons, fetchSyllabusTopics, fetchClasses, fetchCurriculums } = useAppContext();

    useEffect(() => {
        fetchLessons();
        fetchSyllabusTopics();
        fetchClasses();
        fetchCurriculums();
    }, []);

    const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [showForm, setShowForm] = useState(false);
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [classId, setClassId] = useState('');
    const [resources, setResources] = useState<LessonResource[]>([]);
    const [syllabusTopicId, setSyllabusTopicId] = useState('');

    // Resource Input State
    const [resType, setResType] = useState<ResourceType>('link');
    const [resLabel, setResLabel] = useState('');
    const [resUrl, setResUrl] = useState('');
    const [resError, setResError] = useState('');

    // AI Generation State
    const [showAiModal, setShowAiModal] = useState(false);
    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const dailyLessons = lessons.filter(l => l.date === selectedDate);
    const upcomingLessons = lessons
        .filter(l => l.date > selectedDate)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);

    const handleEditClick = (lesson: Lesson) => {
        setEditingLesson(lesson);
        setTitle(lesson.title);
        setContent(lesson.content);
        setClassId(lesson.classId || '');
        setResources(lesson.resources || []);
        setSyllabusTopicId(lesson.syllabusTopicId || '');
        setSelectedDate(lesson.date);
        setShowForm(true);
    };

    const resetForm = () => {
        setTitle('');
        setContent('');
        setClassId('');
        setResources([]);
        setSyllabusTopicId('');
        setEditingLesson(null);
        setResLabel('');
        setResUrl('');
        setResType('link');
        setResError('');
        setShowForm(false);
    };

    const handleAddResource = () => {
        if (!resLabel || !resUrl) {
            setResError('Label and URL are required');
            return;
        }

        const newResource: LessonResource = {
            id: crypto.randomUUID(),
            type: resType,
            label: resLabel,
            url: resUrl
        };

        setResources([...resources, newResource]);
        setResLabel('');
        setResUrl('');
        setResType('link');
        setResError('');
    };

    const removeResource = (id: string) => {
        setResources(resources.filter(r => r.id !== id));
    };

    const getResourceIcon = (type: ResourceType) => {
        switch (type) {
            case 'pdf': return <FileText size={14} className="text-red-400" />;
            case 'video': return <Video size={14} className="text-purple-400" />;
            case 'image': return <ImageIcon size={14} className="text-orange-400" />;
            default: return <LinkIcon size={14} className="text-blue-400" />;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return;

        const payload = {
            title,
            date: selectedDate,
            content,
            classId: classId || undefined,
            resources,
            syllabusTopicId: syllabusTopicId || undefined
        };

        if (editingLesson) {
            await updateLesson({ ...editingLesson, ...payload });
        } else {
            await addLesson(payload);
        }

        resetForm();
    };

    const handleGenerate = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        const result = await generateLessonPlan(aiTopic);
        setIsGenerating(false);

        if (result) {
            setTitle(result.title);
            setContent(result.content);
            setShowAiModal(false);
            setAiTopic('');
        }
    };

    return (
        <div className="h-full flex flex-col space-y-8 animate-fade-in relative pb-6">
            <header className="flex justify-between items-end flex-wrap gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                            <BookOpen size={24} />
                        </div>
                        Lesson Planner
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Organize your curriculum, manage resources, and plan ahead.</p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                    <Plus size={18} /> Plan Lesson
                </button>
            </header>

            <div className="flex flex-col lg:flex-row gap-8 h-full min-h-0">
                {/* Left: Calendar & Upcoming */}
                <div className="w-full lg:w-1/3 flex flex-col gap-8">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                <Calendar size={18} />
                            </div>
                            Select Date
                        </h3>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 font-medium transition-all cursor-pointer"
                        />
                    </div>

                    <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col min-h-0">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Upcoming</h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {upcomingLessons.length > 0 ? upcomingLessons.map(l => (
                                <div
                                    key={l.id}
                                    onClick={() => { setSelectedDate(l.date); }}
                                    className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-blue-400/50 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{l.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{new Date(l.date).toLocaleDateString()}</span>
                                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full"></span>
                                                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[100px]">{classes.find(c => c.id === l.classId)?.name || 'General'}</span>
                                            </div>
                                        </div>
                                        <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                </div>
                            )) : (
                                <div className="text-center py-8 opacity-60">
                                    <p className="text-sm text-slate-500 dark:text-slate-400 italic">No upcoming lessons.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Daily Schedule */}
                <div className="w-full lg:w-2/3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col h-full min-h-0">
                    <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                            Schedule for <span className="text-blue-600 dark:text-blue-400">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                        </h3>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full">{dailyLessons.length} Lessons</span>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-4">
                        {dailyLessons.length > 0 ? dailyLessons.map(lesson => (
                            <div key={lesson.id} className="bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 group hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-sm">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white">{lesson.title}</h4>
                                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-1 rounded-md mt-2 inline-block">
                                            {classes.find(c => c.id === lesson.classId)?.name || 'General / No Class'}
                                        </span>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEditClick(lesson)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shadow-sm">
                                            <BookOpen size={16} />
                                        </button>
                                        <button onClick={() => deleteLesson(lesson.id)} className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-slate-600 dark:text-slate-300 text-sm whitespace-pre-wrap mb-6 leading-relaxed font-medium">{lesson.content}</p>

                                {lesson.resources && lesson.resources.length > 0 && (
                                    <div className="border-t border-slate-200 dark:border-slate-700/50 pt-4">
                                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold mb-3 flex items-center gap-2">
                                            <LinkIcon size={12} /> Resources
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {lesson.resources.map((res) => (
                                                <a
                                                    key={res.id || Math.random()}
                                                    href={res.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-2 text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all shadow-sm"
                                                >
                                                    {getResourceIcon(res.type)}
                                                    <span>{res.label}</span>
                                                    <ExternalLink size={10} className="opacity-50" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )) : (
                            <div className="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl bg-slate-50/50 dark:bg-slate-900/20">
                                <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
                                    <BookOpen size={32} className="opacity-50" />
                                </div>
                                <p>No lessons planned for this day.</p>
                                <button onClick={() => setShowForm(true)} className="mt-4 text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                                    Create a Lesson Plan
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Slide-over Form */}
            {showForm && (
                <div className="fixed inset-0 bg-slate-900/50 dark:bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-fade-in">
                    <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-100 dark:border-slate-700 p-8 overflow-y-auto animate-slide-in-right">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{editingLesson ? 'Edit Lesson' : 'Plan Lesson'}</h3>
                            <button onClick={() => setShowAiModal(true)} className="flex items-center gap-2 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-3 py-1.5 rounded-full border border-purple-100 dark:border-purple-500/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors font-bold">
                                <Sparkles size={14} /> Auto-Generate
                            </button>
                            <button onClick={resetForm} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={e => setSelectedDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Title</label>
                                <input
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. Intro to React Hooks"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Class (Optional)</label>
                                <div className="relative">
                                    <select
                                        value={classId}
                                        onChange={e => setClassId(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">-- General / No Class --</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>

                            {/* Link to Syllabus Topic */}
                            {classId && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Link to Topic (Optional)</label>
                                    <div className="relative">
                                        <select
                                            value={syllabusTopicId}
                                            onChange={e => setSyllabusTopicId(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">-- No Topic Linked --</option>
                                            {(() => {
                                                const selectedClass = classes.find(c => c.id === classId);
                                                const curriculumId = selectedClass?.curriculumId;
                                                if (!curriculumId) return null;

                                                const topics = syllabusTopics
                                                    .filter(t => t.curriculumId === curriculumId)
                                                    .sort((a, b) => a.orderIndex - b.orderIndex);

                                                const childrenMap: Record<string, typeof topics> = {};
                                                topics.forEach(t => {
                                                    if (t.parentId) {
                                                        if (!childrenMap[t.parentId]) childrenMap[t.parentId] = [];
                                                        childrenMap[t.parentId].push(t);
                                                    }
                                                });

                                                const roots = topics.filter(t => !t.parentId);

                                                return roots.map(root => {
                                                    const children = childrenMap[root.id];
                                                    if (children && children.length > 0) {
                                                        return (
                                                            <optgroup key={root.id} label={`${root.title} (${root.semester})`}>
                                                                {children.sort((a, b) => a.orderIndex - b.orderIndex).map(child => (
                                                                    <option key={child.id} value={child.id}>{child.title}</option>
                                                                ))}
                                                            </optgroup>
                                                        );
                                                    }
                                                    return (
                                                        <option key={root.id} value={root.id}>{root.title} ({root.semester})</option>
                                                    );
                                                });
                                            })()}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Lesson Plan / Notes</label>
                                <textarea
                                    value={content}
                                    onChange={e => setContent(e.target.value)}
                                    rows={8}
                                    placeholder="Outline topics, activities, and homework..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400 custom-scrollbar"
                                />
                            </div>

                            <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Resources & Materials</label>

                                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex gap-3">
                                            <select
                                                value={resType}
                                                onChange={(e) => setResType(e.target.value as ResourceType)}
                                                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                                            >
                                                <option value="link">Link</option>
                                                <option value="pdf">PDF</option>
                                                <option value="video">Video</option>
                                                <option value="image">Image</option>
                                            </select>
                                            <input
                                                placeholder="Label (e.g. Slide Deck)"
                                                value={resLabel}
                                                onChange={e => setResLabel(e.target.value)}
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                        </div>
                                        <div className="flex gap-3">
                                            <input
                                                placeholder="URL (https://...)"
                                                value={resUrl}
                                                onChange={e => setResUrl(e.target.value)}
                                                className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleAddResource}
                                                className="bg-slate-800 hover:bg-emerald-600 dark:bg-slate-700 dark:hover:bg-emerald-600 text-white px-4 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center"
                                            >
                                                <Plus size={18} />
                                            </button>
                                        </div>
                                        {resError && <p className="text-red-500 dark:text-red-400 text-xs flex items-center gap-1 font-medium"><AlertCircle size={12} /> {resError}</p>}
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {resources.map((res) => (
                                        <div key={res.id} className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs group shadow-sm hover:border-blue-400/50 transition-colors">
                                            <div className="flex items-center gap-3 truncate">
                                                <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-300">
                                                    {getResourceIcon(res.type)}
                                                </div>
                                                <div className="flex flex-col truncate">
                                                    <span className="text-slate-800 dark:text-slate-200 font-bold truncate">{res.label}</span>
                                                    <a href={res.url} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 truncate max-w-[200px] flex items-center gap-1">
                                                        {res.url} <ExternalLink size={10} />
                                                    </a>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeResource(res.id)}
                                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 flex gap-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-3 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Save Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Generation Modal */}
            {showAiModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl animate-scale-in">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                    <Sparkles size={20} />
                                </div>
                                Generate Lesson
                            </h3>
                            <button onClick={() => setShowAiModal(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                            Enter a topic or paste a syllabus item, and our AI will create a structured lesson plan for you efficiently.
                        </p>

                        <div className="space-y-5">
                            <textarea
                                value={aiTopic}
                                onChange={(e) => setAiTopic(e.target.value)}
                                placeholder="e.g. Introduction to Photosynthesis, focusing on the light-dependent reactions."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 outline-none h-40 resize-none placeholder-slate-400"
                            />

                            <button
                                onClick={handleGenerate}
                                disabled={isGenerating || !aiTopic}
                                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/20 hover:shadow-purple-600/40 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> Generating Plan...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} /> Generate Plan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LessonPlanner;
