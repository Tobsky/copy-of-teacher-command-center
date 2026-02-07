import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { ListChecks, Plus, X, Check, AlertTriangle, BookOpen, ChevronDown, Library, BarChart3, Edit3, Trash2, ArrowUp, ArrowDown, Printer } from 'lucide-react';
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
    const [addingSubtopicTo, setAddingSubtopicTo] = useState<string | null>(null); // parentId
    const [editingTopic, setEditingTopic] = useState<SyllabusTopic | null>(null);
    const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

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

    const isParentMap = useMemo(() => {
        const map: Record<string, boolean> = {};
        trackerTopics.forEach(t => {
            if (t.parentId) map[t.parentId] = true;
        });
        return map;
    }, [trackerTopics]);

    const filteredTrackerTopics = useMemo(() => {
        if (selectedSemester === 'all') return trackerTopics;
        return trackerTopics.filter(t => t.semester === selectedSemester);
    }, [trackerTopics, selectedSemester]);

    const trackerHierarchy = useMemo(() => {
        const roots = filteredTrackerTopics.filter(t => !t.parentId);
        const childrenMap: Record<string, SyllabusTopic[]> = {};
        filteredTrackerTopics.forEach(t => {
            if (t.parentId) {
                if (!childrenMap[t.parentId]) childrenMap[t.parentId] = [];
                childrenMap[t.parentId].push(t);
            }
        });
        return { roots, childrenMap };
    }, [filteredTrackerTopics]);

    const trackerCount = useMemo(() => {
        // Count trackable items: (Total filtered) - (Roots that act as Chapters/Parents)
        const chaptersCount = trackerHierarchy.roots.filter(r => (trackerHierarchy.childrenMap[r.id]?.length || 0) > 0).length;
        return filteredTrackerTopics.length - chaptersCount;
    }, [filteredTrackerTopics, trackerHierarchy]);

    const getTopicStatus = (topicId: string): SyllabusStatus => {
        const progress = syllabusProgress.find(p => p.classId === selectedClassId && p.topicId === topicId);
        return progress?.status || 'not_started';
    };

    const hasLinkedLesson = (topicId: string) => lessons.some(l => l.syllabusTopicId === topicId);

    const getProgress = (semester: 'Semester 1' | 'Semester 2') => {
        const semesterTopics = trackerTopics.filter(t => t.semester === semester && !isParentMap[t.id]);
        if (semesterTopics.length === 0) return 0;
        const completed = semesterTopics.filter(t => getTopicStatus(t.id) === 'completed').length;
        return Math.round((completed / semesterTopics.length) * 100);
    };

    const unlinkedTopics = trackerTopics.filter(t => !isParentMap[t.id] && !hasLinkedLesson(t.id) && getTopicStatus(t.id) === 'not_started');

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
    // ===== LIBRARY VIEW LOGIC =====
    const topicList = useMemo(() => {
        return syllabusTopics.filter(t => t.curriculumId === selectedCurriculumId).sort((a, b) => a.orderIndex - b.orderIndex);
    }, [selectedCurriculumId, syllabusTopics]);

    const hierarchy = useMemo(() => {
        const roots = topicList.filter(t => !t.parentId);
        const childrenMap: Record<string, SyllabusTopic[]> = {};
        topicList.forEach(t => {
            if (t.parentId) {
                if (!childrenMap[t.parentId]) childrenMap[t.parentId] = [];
                childrenMap[t.parentId].push(t);
            }
        });
        return { roots, childrenMap };
    }, [topicList]);

    const toggleChapter = (id: string) => {
        const next = new Set(expandedChapters);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setExpandedChapters(next);
    };

    const libraryCount = useMemo(() => {
        const chaptersCount = hierarchy.roots.filter(r => (hierarchy.childrenMap[r.id]?.length || 0) > 0).length;
        return topicList.length - chaptersCount;
    }, [topicList, hierarchy]);

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

        if (editingTopic) {
            await updateSyllabusTopic({
                ...editingTopic,
                title: newTopicTitle,
                semester: newTopicSemester
            });
        } else {
            // Calculate order index
            const siblings = addingSubtopicTo
                ? hierarchy.childrenMap[addingSubtopicTo] || []
                : hierarchy.roots;

            await addSyllabusTopic({
                curriculumId: selectedCurriculumId,
                title: newTopicTitle,
                semester: newTopicSemester,
                orderIndex: siblings.length,
                parentId: addingSubtopicTo || null,
                userId: ''
            });
        }
        setNewTopicTitle('');
        setEditingTopic(null);
        setShowAddTopicModal(false);
        if (addingSubtopicTo) {
            setExpandedChapters(new Set(expandedChapters).add(addingSubtopicTo));
        }
    };

    const openAddTopicModal = (parentId: string | null = null) => {
        setEditingTopic(null);
        setAddingSubtopicTo(parentId);
        setNewTopicTitle('');
        // Default semester to parent's if adding subtopic
        if (parentId) {
            const parent = syllabusTopics.find(t => t.id === parentId);
            if (parent) setNewTopicSemester(parent.semester);
        }
        setShowAddTopicModal(true);
    };

    const openEditTopicModal = (topic: SyllabusTopic) => {
        setEditingTopic(topic);
        setNewTopicTitle(topic.title);
        setNewTopicSemester(topic.semester);
        setShowAddTopicModal(true);
    };

    const handleDeleteTopic = async (id: string) => {
        if (window.confirm('Delete this topic?')) {
            await deleteSyllabusTopic(id);
        }
    };

    const handleMoveTopic = async (id: string, direction: 'up' | 'down') => {
        const topic = syllabusTopics.find(t => t.id === id);
        if (!topic) return;

        const siblings = topic.parentId
            ? (hierarchy.childrenMap[topic.parentId] || [])
            : hierarchy.roots;

        // Ensure sorted
        const sortedSiblings = [...siblings].sort((a, b) => a.orderIndex - b.orderIndex);
        const index = sortedSiblings.findIndex(t => t.id === id);
        if (index === -1) return;

        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= sortedSiblings.length) return;

        const sibling = sortedSiblings[swapIndex];

        await Promise.all([
            updateSyllabusTopic({ ...topic, orderIndex: sibling.orderIndex }),
            updateSyllabusTopic({ ...sibling, orderIndex: topic.orderIndex })
        ]);
    };

    const navigate = useNavigate();
    const handleViewLesson = (topicId: string) => {
        // Find ANY lesson linked to this topic (first one found)
        const lesson = lessons.find(l => l.syllabusTopicId === topicId);
        if (lesson) {
            navigate('/planner', { state: { lessonId: lesson.id } });
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

    const handlePrintSchemeOfWork = () => {
        if (!selectedClass) return;

        // 1. Get Lessons for this class
        const classLessons = lessons
            .filter(l => l.classId === selectedClassId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 2. Open Print Window
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('Please allow popups to print the Scheme of Work.');
            return;
        }

        // 3. Build HTML
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Scheme of Work - ${selectedClass.name}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; }
                    h1 { color: #1e293b; border-bottom: 3px solid #6366f1; padding-bottom: 15px; margin-bottom: 5px; }
                    .meta { color: #64748b; margin-bottom: 30px; font-size: 0.9em; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1); }
                    th, td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; vertical-align: top; }
                    th { background-color: #f8fafc; color: #475569; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.05em; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                    .date { white-space: nowrap; color: #64748b; font-weight: 500; font-size: 0.9rem; }
                    .topic { font-weight: 600; color: #4f46e5; }
                    .title { font-weight: 600; color: #0f172a; }
                    .content { color: #334155; font-size: 0.9rem; white-space: pre-wrap; line-height: 1.5; }
                    .no-data { text-align: center; color: #94a3b8; padding: 40px; font-style: italic; }
                    @media print {
                        body { padding: 0; }
                        h1 { border-bottom-color: #000; }
                        .topic { color: #000; }
                        th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
                        tr:nth-child(even) { background-color: #f9f9f9 !important; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <h1>Scheme of Work: ${selectedClass.name}</h1>
                <p class="meta">Generated by Teacher Command Center on ${new Date().toLocaleDateString()}</p>
                
                ${classLessons.length === 0
                ? '<div class="no-data">No lessons scheduled for this class yet. Start planning in the Lesson Planner to populate this scheme of work.</div>'
                : `<table>
                        <thead>
                            <tr>
                                <th width="12%">Date</th>
                                <th width="25%">Syllabus Topic</th>
                                <th width="20%">Lesson</th>
                                <th>Objectives & Content</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${classLessons.map(lesson => {
                    const topic = syllabusTopics.find(t => t.id === lesson.syllabusTopicId);
                    const topicTitle = topic ? topic.title : '<span style="color:#cbd5e1; font-style:italic">No linked topic</span>';

                    // Clean up content - just take the first paragraph or bulletin points
                    let cleanContent = lesson.content || '';
                    if (cleanContent.length > 250) cleanContent = cleanContent.substring(0, 250) + '...';

                    return `
                                    <tr>
                                        <td class="date">${new Date(lesson.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                                        <td class="topic">${topicTitle}</td>
                                        <td class="title">${lesson.title}</td>
                                        <td class="content">${cleanContent}</td>
                                    </tr>
                                `;
                }).join('')}
                        </tbody>
                    </table>`
            }
                
                <script>
                    setTimeout(() => { window.print(); }, 500);
                </script>
            </body>
            </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="h-auto lg:h-full flex flex-col space-y-6 animate-fade-in relative pb-6">
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

                {/* Actions & Toggle */}
                <div className="flex items-center gap-3">
                    {/* Print Scheme of Work Button */}
                    {viewMode === 'tracker' && (
                        <button
                            onClick={handlePrintSchemeOfWork}
                            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 transition-all shadow-sm group"
                            title="Print Scheme of Work"
                        >
                            <Printer size={20} className="group-hover:scale-110 transition-transform" />
                        </button>
                    )}

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
                    <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden flex flex-col min-h-[400px]">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
                            Topics ({trackerCount})
                        </h3>
                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                            {/* Group by Root/Chapter logic for Tracker */}
                            {(() => {
                                if (trackerHierarchy.roots.length === 0 && filteredTrackerTopics.length === 0) {
                                    return (
                                        <div className="h-32 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 italic border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                                            <ListChecks size={32} className="opacity-50 mb-2" />
                                            <p>{classCurriculum ? 'No topics in this curriculum yet.' : 'Select a class with a linked curriculum.'}</p>
                                        </div>
                                    );
                                }

                                return trackerHierarchy.roots.map(root => {
                                    const subtopics = trackerHierarchy.childrenMap[root.id] || [];
                                    const rootStatus = getTopicStatus(root.id);

                                    // If root has no subtopics, it is the trackable item
                                    // If root has subtopics, it is a Chapter Header
                                    const isChapter = subtopics.length > 0;

                                    return (
                                        <div key={root.id} className="space-y-2">
                                            {/* Root Item / Chapter Header */}
                                            <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${isChapter
                                                ? 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                                                : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    {!isChapter && null}
                                                    <div>
                                                        <p className={`font-bold ${isChapter ? 'text-base text-slate-900 dark:text-white' : 'text-sm text-slate-800 dark:text-slate-200'}`}>
                                                            {root.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-xs text-slate-400 font-medium">{root.semester}</span>
                                                            {hasLinkedLesson(root.id) && (
                                                                <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                                                    <BookOpen size={10} /> Lesson Planned
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                {!isChapter && (
                                                    <div className="relative min-w-[140px]">
                                                        <select
                                                            value={rootStatus}
                                                            onChange={(e) => updateStatus(root.id, e.target.value as SyllabusStatus)}
                                                            className={`w-full appearance-none pl-3 pr-8 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-opacity-50 ${rootStatus === 'not_started' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 focus:ring-slate-400' :
                                                                rootStatus === 'taught' ? 'bg-blue-500 text-white border-blue-600 focus:ring-blue-400' :
                                                                    rootStatus === 'assessed' ? 'bg-amber-500 text-white border-amber-600 focus:ring-amber-400' :
                                                                        'bg-emerald-500 text-white border-emerald-600 focus:ring-emerald-400'
                                                                }`}
                                                        >
                                                            <option value="not_started" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Not Started</option>
                                                            <option value="taught" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Taught</option>
                                                            <option value="assessed" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Assessed</option>
                                                            <option value="completed" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Completed</option>
                                                        </select>
                                                        <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${rootStatus === 'not_started' ? 'text-slate-400' : 'text-white/80'
                                                            }`} />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Subtopics List */}
                                            {isChapter && (
                                                <div className="pl-6 space-y-2 border-l-2 border-slate-200 dark:border-slate-700 ml-4">
                                                    {subtopics.map(child => {
                                                        const childStatus = getTopicStatus(child.id);
                                                        return (
                                                            <div key={child.id} className="flex items-center justify-between p-3 rounded-xl border bg-white dark:bg-slate-900/20 border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-900/50 transition-all group">
                                                                <div className="flex items-center gap-3">
                                                                    <div />
                                                                    <p className="font-medium text-sm text-slate-700 dark:text-slate-300">{child.title}</p>
                                                                    {hasLinkedLesson(child.id) && (
                                                                        <button
                                                                            onClick={() => handleViewLesson(child.id)}
                                                                            className="p-1 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                                                                            title="View Lesson Plan"
                                                                        >
                                                                            <BookOpen size={14} className="text-blue-500 hover:text-blue-600" />
                                                                        </button>
                                                                    )}
                                                                </div>
                                                                <div className="relative min-w-[130px]">
                                                                    <select
                                                                        value={childStatus}
                                                                        onChange={(e) => updateStatus(child.id, e.target.value as SyllabusStatus)}
                                                                        className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer outline-none focus:ring-2 focus:ring-opacity-50 ${childStatus === 'not_started' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 focus:ring-slate-400' :
                                                                            childStatus === 'taught' ? 'bg-blue-500 text-white border-blue-600 focus:ring-blue-400' :
                                                                                childStatus === 'assessed' ? 'bg-amber-500 text-white border-amber-600 focus:ring-amber-400' :
                                                                                    'bg-emerald-500 text-white border-emerald-600 focus:ring-emerald-400'
                                                                            }`}
                                                                    >
                                                                        <option value="not_started" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Not Started</option>
                                                                        <option value="taught" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Taught</option>
                                                                        <option value="assessed" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Assessed</option>
                                                                        <option value="completed" className="bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200">Completed</option>
                                                                    </select>
                                                                    <ChevronDown size={14} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${childStatus === 'not_started' ? 'text-slate-400' : 'text-white/80'
                                                                        }`} />
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                });
                            })()}
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
                        <div className="w-full lg:flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                    Topics {selectedCurriculumId && `(${libraryCount})`}
                                </h3>
                                {selectedCurriculumId && (
                                    <button
                                        onClick={() => openAddTopicModal(null)}
                                        className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all"
                                    >
                                        <Plus size={16} /> Add Chapter
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3 lg:max-h-[600px] lg:overflow-y-auto custom-scrollbar pr-2">
                                {hierarchy.roots.map(root => {
                                    const subtopics = hierarchy.childrenMap[root.id] || [];
                                    const isExpanded = expandedChapters.has(root.id);

                                    return (
                                        <div key={root.id} className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/30">
                                            {/* Chapter Header */}
                                            <div
                                                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                onClick={() => toggleChapter(root.id)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-1 rounded-md transition-transform duration-200 ${isExpanded ? 'rotate-90 text-violet-600' : 'text-slate-400'}`}>
                                                        <ChevronDown size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-800 dark:text-white">{root.title}</p>
                                                        <p className="text-xs text-slate-400">{root.semester} • {subtopics.length} subtopics</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col gap-0.5 mr-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMoveTopic(root.id, 'up'); }}
                                                            className="p-0.5 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded disabled:opacity-30"
                                                            disabled={hierarchy.roots.indexOf(root) === 0}
                                                        >
                                                            <ArrowUp size={12} />
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleMoveTopic(root.id, 'down'); }}
                                                            className="p-0.5 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded disabled:opacity-30"
                                                            disabled={hierarchy.roots.indexOf(root) === hierarchy.roots.length - 1}
                                                        >
                                                            <ArrowDown size={12} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openEditTopicModal(root); }}
                                                        className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                                                        title="Edit Chapter"
                                                    >
                                                        <Edit3 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); openAddTopicModal(root.id); }}
                                                        className="p-1.5 text-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg text-xs font-bold"
                                                        title="Add Subtopic"
                                                    >
                                                        <Plus size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteTopic(root.id); }}
                                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Subtopics List */}
                                            {isExpanded && (
                                                <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/20">
                                                    {subtopics.length > 0 ? (
                                                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                            {subtopics.map(sub => (
                                                                <div key={sub.id} className="p-3 flex items-center justify-between pl-12 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                                                                        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">{sub.title}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        <button
                                                                            onClick={() => openEditTopicModal(sub)}
                                                                            className="p-1 text-slate-300 hover:text-violet-500 transition-colors"
                                                                        >
                                                                            <Edit3 size={14} />
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeleteTopic(sub.id)}
                                                                            className="p-1 text-slate-300 hover:text-red-500 transition-colors"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-xs text-slate-400 italic">
                                                            No subtopics. Click + to add one.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {hierarchy.roots.length === 0 && selectedCurriculumId && (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm italic text-center py-8">No chapters yet. Add one!</p>
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
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {editingTopic ? 'Edit Topic' : (addingSubtopicTo ? 'Add Subtopic' : 'Add Chapter')}
                            </h3>
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
                                {editingTopic ? 'Update Topic' : (addingSubtopicTo ? 'Add Subtopic' : 'Add Chapter')}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SyllabusHub;
