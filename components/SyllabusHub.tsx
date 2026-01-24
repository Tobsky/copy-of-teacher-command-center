import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { ListChecks, Plus, X, Check, AlertTriangle, BookOpen, ChevronDown, Library, BarChart3, Edit3, Trash2 } from 'lucide-react';
import { SyllabusTopic, Curriculum, SyllabusProgress, SyllabusStatus } from '../types';

type ViewMode = 'tracker' | 'library';

const SyllabusHub: React.FC = () => {
    const {
        classes, curriculums, syllabusTopics, syllabusProgress, lessons,
        fetchClasses, fetchCurriculums, fetchSyllabusTopics, fetchSyllabusProgress, fetchLessons,
        addCurriculum, updateCurriculum, deleteCurriculum,
        addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic,
        upsertSyllabusProgress,
        updateClass
    } = useAppContext();

    useEffect(() => {
        fetchClasses();
        fetchCurriculums();
        fetchSyllabusTopics();
        fetchSyllabusProgress();
        fetchLessons();
    }, []);

    const [viewMode, setViewMode] = useState<ViewMode>('tracker');

    // ===== TRACKER VIEW STATE =====
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedSemester, setSelectedSemester] = useState<'Semester 1' | 'Semester 2' | 'all'>('all');

    // ===== LIBRARY VIEW STATE =====
    const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>('');
    const [showAddCurriculumModal, setShowAddCurriculumModal] = useState(false);
    const [showAddTopicModal, setShowAddTopicModal] = useState(false);
    const [newCurriculumName, setNewCurriculumName] = useState('');
    const [newCurriculumBoardCode, setNewCurriculumBoardCode] = useState('');
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicSemester, setNewTopicSemester] = useState<'Semester 1' | 'Semester 2'>('Semester 1');

    // Set defaults on load
    useEffect(() => {
        if (classes.length > 0 && !selectedClassId) {
            setSelectedClassId(classes[0].id);
        }
    }, [classes]);

    useEffect(() => {
        if (curriculums.length > 0 && !selectedCurriculumId) {
            setSelectedCurriculumId(curriculums[0].id);
        }
    }, [curriculums]);

    // ===== TRACKER VIEW LOGIC =====
    const selectedClass = classes.find(c => c.id === selectedClassId);
    const classCurriculum = selectedClass?.curriculumId ? curriculums.find(c => c.id === selectedClass.curriculumId) : null;

    const trackerTopics = useMemo(() => {
        if (!classCurriculum) return [];
        return syllabusTopics.filter(t => t.curriculumId === classCurriculum.id);
    }, [classCurriculum, syllabusTopics]);

    const filteredTrackerTopics = useMemo(() => {
        if (selectedSemester === 'all') return trackerTopics;
        return trackerTopics.filter(t => t.semester === selectedSemester);
    }, [trackerTopics, selectedSemester]);

    const getTopicStatus = (topicId: string): SyllabusStatus => {
        const progress = syllabusProgress.find(p => p.classId === selectedClassId && p.topicId === topicId);
        return progress?.status || 'not_started';
    };

    const hasLinkedLesson = (topicId: string) => lessons.some(l => l.syllabusTopicId === topicId);

    const getProgress = (semester: 'Semester 1' | 'Semester 2') => {
        const semesterTopics = trackerTopics.filter(t => t.semester === semester);
        if (semesterTopics.length === 0) return 0;
        const completed = semesterTopics.filter(t => getTopicStatus(t.id) === 'completed').length;
        return Math.round((completed / semesterTopics.length) * 100);
    };

    const unlinkedTopics = trackerTopics.filter(t => !hasLinkedLesson(t.id) && getTopicStatus(t.id) === 'not_started');

    const updateStatus = async (topicId: string, status: SyllabusStatus) => {
        await upsertSyllabusProgress({
            classId: selectedClassId,
            topicId,
            status,
            userId: ''
        });
    };

    const handleLinkCurriculum = async (curriculumId: string) => {
        if (!selectedClass) return;
        await updateClass({ ...selectedClass, curriculumId: curriculumId || null });
    };

    // ===== LIBRARY VIEW LOGIC =====
    const libraryTopics = useMemo(() => {
        return syllabusTopics.filter(t => t.curriculumId === selectedCurriculumId).sort((a, b) => a.orderIndex - b.orderIndex);
    }, [selectedCurriculumId, syllabusTopics]);

    const handleAddCurriculum = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCurriculumName) return;
        const newCurr = await addCurriculum({ name: newCurriculumName, boardCode: newCurriculumBoardCode || undefined, userId: '' });
        if (newCurr) setSelectedCurriculumId(newCurr.id);
        setNewCurriculumName('');
        setNewCurriculumBoardCode('');
        setShowAddCurriculumModal(false);
    };

    const handleDeleteCurriculum = async (id: string) => {
        if (window.confirm('Delete this curriculum? All topics will be removed.')) {
            await deleteCurriculum(id);
            if (selectedCurriculumId === id && curriculums.length > 1) {
                setSelectedCurriculumId(curriculums.find(c => c.id !== id)?.id || '');
            }
        }
    };

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopicTitle || !selectedCurriculumId) return;
        await addSyllabusTopic({
            curriculumId: selectedCurriculumId,
            title: newTopicTitle,
            semester: newTopicSemester,
            orderIndex: libraryTopics.length,
            userId: ''
        });
        setNewTopicTitle('');
        setShowAddTopicModal(false);
    };

    const handleDeleteTopic = async (id: string) => {
        if (window.confirm('Delete this topic?')) {
            await deleteSyllabusTopic(id);
        }
    };

    const statusColors: Record<SyllabusStatus, string> = {
        not_started: 'bg-slate-200 dark:bg-slate-700',
        taught: 'bg-blue-500',
        assessed: 'bg-amber-500',
        completed: 'bg-emerald-500'
    };

    const sem1Progress = getProgress('Semester 1');
    const sem2Progress = getProgress('Semester 2');

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in relative pb-6">
            {/* Header */}
            <header className="flex justify-between items-end flex-wrap gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
                        <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                            <ListChecks size={24} />
                        </div>
                        Syllabus Hub
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        {viewMode === 'tracker' ? 'Track mastery progress by class' : 'Manage curriculum templates'}
                    </p>
                </div>

                {/* Glassmorphism Toggle */}
                <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/30 dark:border-slate-700/50 rounded-2xl p-1.5 flex shadow-lg">
                    <button
                        onClick={() => setViewMode('tracker')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'tracker'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <BarChart3 size={16} /> Tracker
                    </button>
                    <button
                        onClick={() => setViewMode('library')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'library'
                            ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Library size={16} /> Library
                    </button>
                </div>
            </header>

            {/* ===== TRACKER VIEW ===== */}
            {viewMode === 'tracker' && (
                <>
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
                                    {classCurriculum && (
                                        <div className="mt-4 p-3 bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-900/30 rounded-xl">
                                            <p className="text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide mb-1">Linked Curriculum</p>
                                            <div className="flex justify-between items-center">
                                                <p className="text-sm font-bold text-slate-700 dark:text-white">{classCurriculum.name}</p>
                                                <button
                                                    onClick={() => handleLinkCurriculum('')}
                                                    className="text-xs text-slate-400 hover:text-red-500 transition-colors"
                                                    title="Unlink Curriculum"
                                                >
                                                    Unlink
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                    {!classCurriculum && selectedClassId && (
                                        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                                            <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-2">No Curriculum Linked</p>
                                            <select
                                                onChange={(e) => handleLinkCurriculum(e.target.value)}
                                                className="w-full bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 text-slate-700 dark:text-white text-xs rounded-lg px-2 py-2 outline-none focus:ring-2 focus:ring-amber-500/20"
                                                defaultValue=""
                                            >
                                                <option value="" disabled>Select a Template...</option>
                                                {curriculums.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                            {curriculums.length === 0 && (
                                                <p className="text-xs text-slate-400 mt-2 italic">
                                                    No templates available. Create one in the Library view.
                                                </p>
                                            )}
                                        </div>
                                    )}
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
                                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-1">Gap Analysis: {unlinkedTopics.length} Topics Not Started</h4>
                                    <p className="text-amber-700 dark:text-amber-400 text-xs">
                                        {unlinkedTopics.slice(0, 3).map(t => t.title).join(', ')}{unlinkedTopics.length > 3 ? ` and ${unlinkedTopics.length - 3} more...` : ''}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mastery Tracker List */}
                    <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            Topics ({filteredTrackerTopics.length})
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                            {filteredTrackerTopics.length > 0 ? filteredTrackerTopics.map(topic => {
                                const status = getTopicStatus(topic.id);
                                return (
                                    <div
                                        key={topic.id}
                                        className="flex items-center justify-between p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-4 h-4 rounded-full ${statusColors[status]}`} />
                                            <div>
                                                <p className="font-bold text-sm text-slate-800 dark:text-white">{topic.title}</p>
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
                                        <div className="flex gap-1">
                                            {(['not_started', 'taught', 'assessed', 'completed'] as SyllabusStatus[]).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => updateStatus(topic.id, s)}
                                                    className={`px-2 py-1 text-xs font-bold rounded-lg transition-all ${status === s
                                                        ? `${statusColors[s]} text-white`
                                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                                                        }`}
                                                >
                                                    {s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                    <ListChecks size={32} className="opacity-50 mb-2" />
                                    <p>{classCurriculum ? 'No topics in this curriculum yet.' : 'Select a class with a linked curriculum.'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* ===== LIBRARY VIEW ===== */}
            {viewMode === 'library' && (
                <>
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Curriculum Selector */}
                        <div className="w-full lg:w-1/3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Templates</h3>
                                <button
                                    onClick={() => setShowAddCurriculumModal(true)}
                                    className="p-2 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {curriculums.map(c => (
                                    <div
                                        key={c.id}
                                        onClick={() => setSelectedCurriculumId(c.id)}
                                        className={`p-3 rounded-xl cursor-pointer transition-all flex justify-between items-center group ${selectedCurriculumId === c.id
                                            ? 'bg-violet-100 dark:bg-violet-900/30 border border-violet-300 dark:border-violet-700'
                                            : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{c.name}</p>
                                            {c.boardCode && <p className="text-xs text-slate-400">{c.boardCode}</p>}
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteCurriculum(c.id); }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {curriculums.length === 0 && (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-4">No templates yet.</p>
                                )}
                            </div>
                        </div>

                        {/* Topic Editor */}
                        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Topics {selectedCurriculumId && `(${libraryTopics.length})`}
                                </h3>
                                {selectedCurriculumId && (
                                    <button
                                        onClick={() => setShowAddTopicModal(true)}
                                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Plus size={16} /> Add Topic
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {libraryTopics.map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700 group">
                                        <div>
                                            <p className="font-bold text-sm text-slate-800 dark:text-white">{t.title}</p>
                                            <p className="text-xs text-slate-400">{t.semester}</p>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteTopic(t.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                                {libraryTopics.length === 0 && selectedCurriculumId && (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-8">No topics yet. Add one!</p>
                                )}
                                {!selectedCurriculumId && (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-8">Select a template to view topics.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Add Curriculum Modal */}
            {showAddCurriculumModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">New Curriculum</h3>
                            <button onClick={() => setShowAddCurriculumModal(false)} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddCurriculum} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Name</label>
                                <input
                                    value={newCurriculumName}
                                    onChange={e => setNewCurriculumName(e.target.value)}
                                    placeholder="e.g. IGCSE Computer Science 2026"
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all placeholder-slate-400"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Board Code (Optional)</label>
                                <input
                                    value={newCurriculumBoardCode}
                                    onChange={e => setNewCurriculumBoardCode(e.target.value)}
                                    placeholder="e.g. 0478"
                                    className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-700 dark:text-white focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all placeholder-slate-400"
                                />
                            </div>
                            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-violet-600/20 transition-all">
                                Create Template
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Topic Modal */}
            {showAddTopicModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-full max-w-md shadow-2xl p-8 animate-slide-up">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Topic</h3>
                            <button onClick={() => setShowAddTopicModal(false)} className="p-2 bg-slate-100 dark:bg-slate-700/50 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddTopic} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Title</label>
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
                            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white py-3 rounded-xl font-bold shadow-lg shadow-violet-600/20 transition-all">
                                Add Topic
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusHub;
