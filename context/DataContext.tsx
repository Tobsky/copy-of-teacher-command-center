import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useSession } from './SessionContext';
import {
    ClassGroup, Student, Assignment, Grade, AttendanceRecord, Snippet, Todo, Lesson,
    ExamBoard, SyllabusTopic, Curriculum, SyllabusProgress
} from '../types';

// Services
import { classService } from '../services/classService';
import { studentService } from '../services/studentService';
import { assignmentService } from '../services/assignmentService';
import { gradeService } from '../services/gradeService';
import { attendanceService } from '../services/attendanceService';
import { snippetService, todoService } from '../services/utilityService';
import { lessonService } from '../services/lessonService';
import { examBoardService } from '../services/examBoardService';
import { syllabusService } from '../services/syllabusService';
import { feedbackService } from '../services/feedbackService';

interface DataContextType {
    classes: ClassGroup[];
    students: Student[];
    assignments: Assignment[];
    grades: Grade[];
    attendance: AttendanceRecord[];
    snippets: Snippet[];
    todos: Todo[];
    lessons: Lesson[];
    examBoards: ExamBoard[];
    syllabusTopics: SyllabusTopic[];
    curriculums: Curriculum[];
    syllabusProgress: SyllabusProgress[];
    loading: boolean;

    fetchClasses: () => Promise<void>;
    fetchStudents: () => Promise<void>;
    fetchAssignments: () => Promise<void>;
    fetchGrades: () => Promise<void>;
    fetchAttendance: () => Promise<void>;
    fetchSnippets: () => Promise<void>;
    fetchTodos: () => Promise<void>;
    fetchLessons: () => Promise<void>;
    fetchExamBoards: () => Promise<void>;
    fetchSyllabusTopics: () => Promise<void>;
    fetchCurriculums: () => Promise<void>;
    fetchSyllabusProgress: () => Promise<void>;

    addClass: (cls: Omit<ClassGroup, 'id'>) => Promise<void>;
    updateClass: (cls: ClassGroup) => Promise<void>;
    deleteClass: (id: string) => Promise<void>;
    promoteClass: (sourceClassId: string, targetClassName: string, targetSection: string) => Promise<void>;

    addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
    deleteStudent: (id: string) => Promise<void>;

    addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
    updateAssignment: (assignment: Assignment) => Promise<void>;
    deleteAssignment: (id: string) => Promise<void>;

    updateGrade: (grade: Grade) => Promise<void>;
    deleteGrade: (studentId: string, assignmentId: string) => Promise<void>;
    purgeEmptyGrades: () => Promise<boolean>;

    updateAttendance: (record: AttendanceRecord) => Promise<void>;

    addSnippet: (snippet: Omit<Snippet, 'id'>) => Promise<void>;
    deleteSnippet: (id: string) => Promise<void>;

    toggleTodo: (id: string, currentStatus: boolean) => Promise<void>;
    addTodo: (text: string) => Promise<void>;
    deleteTodo: (id: string) => Promise<void>;

    addLesson: (lesson: Omit<Lesson, 'id'>) => Promise<void>;
    updateLesson: (lesson: Lesson) => Promise<void>;
    deleteLesson: (id: string) => Promise<void>;

    addExamBoard: (board: Omit<ExamBoard, 'id'>) => Promise<ExamBoard | null>;
    updateExamBoard: (board: ExamBoard) => Promise<ExamBoard | null>;
    deleteExamBoard: (id: string) => Promise<void>;
    restoreDefaultExamBoards: (boards: Omit<ExamBoard, 'id'>[]) => Promise<void>;

    addSyllabusTopic: (topic: Omit<SyllabusTopic, 'id'>) => Promise<void>;
    updateSyllabusTopic: (topic: SyllabusTopic) => Promise<void>;
    deleteSyllabusTopic: (id: string) => Promise<void>;

    addCurriculum: (curriculum: Omit<Curriculum, 'id'>) => Promise<Curriculum | null>;
    updateCurriculum: (curriculum: Curriculum) => Promise<void>;
    deleteCurriculum: (id: string) => Promise<void>;

    upsertSyllabusProgress: (progress: Omit<SyllabusProgress, 'id'>) => Promise<void>;
    submitUserFeedback: (type: 'bug' | 'feature_request' | 'general' | 'other', message: string, contactEmail?: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { session } = useAuth();
    const { activeSession } = useSession();

    const [classes, setClasses] = useState<ClassGroup[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [grades, setGrades] = useState<Grade[]>([]);
    const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
    const [snippets, setSnippets] = useState<Snippet[]>([]);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [examBoards, setExamBoards] = useState<ExamBoard[]>([]);
    const [syllabusTopics, setSyllabusTopics] = useState<SyllabusTopic[]>([]);
    const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
    const [syllabusProgress, setSyllabusProgress] = useState<SyllabusProgress[]>([]);
    const [loading, setLoading] = useState(false);

    // Clear data on logout
    useEffect(() => {
        if (!session) {
            setClasses([]);
            setStudents([]);
            setAssignments([]);
            setGrades([]);
            setAttendance([]);
            setSnippets([]);
            setTodos([]);
            setLessons([]);
            setExamBoards([]);
            setSyllabusTopics([]);
            setCurriculums([]);
            setSyllabusProgress([]);
        } else {
            // Fetch initial data
            fetchClasses();
            // ... potentially others
        }
    }, [session]);

    // Re-fetch classes when active session changes
    useEffect(() => {
        if (session) {
            fetchClasses();
        }
    }, [activeSession]);


    // --- Fetch Methods ---

    const fetchClasses = async () => {
        if (!session) return;
        try {
            const data = await classService.fetchClasses(activeSession?.id || null);
            setClasses(data);
        } catch (error) { console.error(error); }
    };

    const fetchStudents = async () => {
        try {
            const data = await studentService.fetchStudents();
            setStudents(data);
        } catch (error) { console.error(error); }
    };

    const fetchAssignments = async () => {
        try {
            const data = await assignmentService.fetchAssignments();
            setAssignments(data);
        } catch (error) { console.error(error); }
    };

    const fetchGrades = async () => {
        try {
            const data = await gradeService.fetchGrades();
            setGrades(data);
        } catch (error) { console.error(error); }
    };

    const fetchAttendance = async () => {
        try {
            const data = await attendanceService.fetchAttendance();
            setAttendance(data);
        } catch (error) { console.error(error); }
    };

    const fetchSnippets = async () => {
        try {
            const data = await snippetService.fetchSnippets();
            setSnippets(data);
        } catch (error) { console.error(error); }
    };

    const fetchTodos = async () => {
        try {
            const data = await todoService.fetchTodos();
            setTodos(data);
        } catch (error) { console.error(error); }
    };

    const fetchLessons = async () => {
        try {
            const data = await lessonService.fetchLessons();
            setLessons(data);
        } catch (error) { console.error(error); }
    };

    const fetchExamBoards = async () => {
        try {
            const data = await examBoardService.fetchExamBoards();
            setExamBoards(data);
        } catch (error) { console.error(error); }
    };

    const fetchSyllabusTopics = async () => {
        try {
            const data = await syllabusService.fetchSyllabusTopics();
            setSyllabusTopics(data);
        } catch (error) { console.error(error); }
    };

    const fetchCurriculums = async () => {
        try {
            const data = await syllabusService.fetchCurriculums();
            setCurriculums(data);
        } catch (error) { console.error(error); }
    };

    const fetchSyllabusProgress = async () => {
        try {
            const data = await syllabusService.fetchSyllabusProgress();
            setSyllabusProgress(data);
        } catch (error) { console.error(error); }
    };

    // --- Actions ---

    const addClass = async (cls: Omit<ClassGroup, 'id'>) => {
        if (!session) return;
        try {
            const newClass = await classService.addClass(cls, session.user.id, activeSession?.id);
            setClasses([...classes, newClass]);
        } catch (error) { console.error(error); }
    };

    const deleteClass = async (id: string) => {
        try {
            await classService.deleteClass(id);
            setClasses(classes.filter(c => c.id !== id));
        } catch (error) { console.error(error); }
    };

    const updateClass = async (updated: ClassGroup) => {
        try {
            await classService.updateClass(updated);
            setClasses(classes.map(c => c.id === updated.id ? updated : c));
        } catch (error) { console.error(error); }
    };

    const promoteClass = async (sourceClassId: string, targetClassName: string, targetSection: string) => {
        if (!session || !activeSession) return;
        try {
            await classService.promoteClass(session.user.id, sourceClassId, targetClassName, targetSection, activeSession.id);
            fetchClasses();
            fetchStudents();
        } catch (error) { console.error("Failed to promote class:", error); }
    };

    const addStudent = async (student: Omit<Student, 'id'>) => {
        if (!session) return;
        try {
            const newStudent = await studentService.addStudent(student, session.user.id);
            setStudents([...students, newStudent]);
        } catch (error) { console.error(error); }
    };

    const deleteStudent = async (id: string) => {
        try {
            await studentService.deleteStudent(id);
            setStudents(students.filter(s => s.id !== id));
        } catch (error) { console.error(error); }
    };

    const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
        if (!session) return;
        try {
            const newAssignment = await assignmentService.addAssignment(assignment, session.user.id);
            setAssignments([...assignments, newAssignment]);
        } catch (error) { console.error(error); }
    };

    const updateAssignment = async (updated: Assignment) => {
        try {
            await assignmentService.updateAssignment(updated);
            setAssignments(assignments.map(a => a.id === updated.id ? updated : a));
        } catch (error) { console.error(error); }
    };

    const deleteAssignment = async (id: string) => {
        try {
            await assignmentService.deleteAssignment(id);
            setAssignments(assignments.filter(a => a.id !== id));
            setGrades(grades.filter(g => g.assignmentId !== id)); // Optimistic cleanup
        } catch (error) { console.error(error); }
    };

    const updateGrade = async (grade: Grade) => {
        if (!session) return;
        try {
            const newGrade = await gradeService.updateGrade(grade, session.user.id);
            setGrades(prev => {
                const idx = prev.findIndex(g => g.studentId === newGrade.studentId && g.assignmentId === newGrade.assignmentId);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = newGrade;
                    return next;
                }
                return [...prev, newGrade];
            });
        } catch (error) { console.error(error); }
    };

    const deleteGrade = async (studentId: string, assignmentId: string) => {
        try {
            await gradeService.deleteGrade(studentId, assignmentId);
            setGrades(prev => prev.filter(g => !(g.studentId === studentId && g.assignmentId === assignmentId)));
        } catch (error) { console.error("Error deleting grade:", error); }
    };

    const purgeEmptyGrades = async () => {
        try {
            await gradeService.purgeEmptyGrades();
            setGrades(prev => prev.filter(g => g.score !== 0));
            return true;
        } catch (error) {
            console.error("Error purging empty grades:", error);
            return false;
        }
    };

    const updateAttendance = async (record: AttendanceRecord) => {
        if (!session) return;
        try {
            const newRecord = await attendanceService.updateAttendance(record, session.user.id);
            setAttendance(prev => {
                const idx = prev.findIndex(r => r.date === newRecord.date && r.studentId === newRecord.studentId && r.classId === newRecord.classId);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = newRecord;
                    return next;
                }
                return [...prev, newRecord];
            });
        } catch (error) { console.error(error); }
    };

    const addSnippet = async (snippet: Omit<Snippet, 'id'>) => {
        if (!session) return;
        try {
            const newSnippet = await snippetService.addSnippet(snippet, session.user.id);
            setSnippets([...snippets, newSnippet]);
        } catch (error) { console.error(error); }
    };

    const deleteSnippet = async (id: string) => {
        try {
            await snippetService.deleteSnippet(id);
            setSnippets(snippets.filter(s => s.id !== id));
        } catch (error) { console.error(error); }
    };

    const toggleTodo = async (id: string, currentStatus: boolean) => {
        try {
            await todoService.toggleTodo(id, currentStatus);
            setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
        } catch (error) { console.error(error); }
    };

    const addTodo = async (text: string) => {
        if (!session) return;
        try {
            const newTodo = await todoService.addTodo(text, session.user.id);
            setTodos([...todos, newTodo]);
        } catch (error) { console.error(error); }
    };

    const deleteTodo = async (id: string) => {
        try {
            await todoService.deleteTodo(id);
            setTodos(todos.filter(t => t.id !== id));
        } catch (error) { console.error(error); }
    };

    const addLesson = async (lesson: Omit<Lesson, 'id'>) => {
        if (!session) return;
        try {
            const newLesson = await lessonService.addLesson(lesson, session.user.id);
            setLessons([...lessons, newLesson]);
        } catch (error) { console.error(error); }
    };

    const updateLesson = async (updated: Lesson) => {
        try {
            await lessonService.updateLesson(updated);
            setLessons(lessons.map(l => l.id === updated.id ? updated : l));
        } catch (error) { console.error(error); }
    };

    const deleteLesson = async (id: string) => {
        try {
            await lessonService.deleteLesson(id);
            setLessons(lessons.filter(l => l.id !== id));
        } catch (error) { console.error(error); }
    };

    const addExamBoard = async (board: Omit<ExamBoard, 'id'>): Promise<ExamBoard | null> => {
        if (!session) return null;
        try {
            const newBoard = await examBoardService.addExamBoard(board, session.user.id);
            setExamBoards(prev => [...prev, newBoard]);
            return newBoard;
        } catch (error) {
            console.error('Error adding exam board:', error);
            alert('Failed to add exam board');
            return null;
        }
    };

    const updateExamBoard = async (updated: ExamBoard): Promise<ExamBoard | null> => {
        try {
            const result = await examBoardService.updateExamBoard(updated);
            setExamBoards(prev => prev.map(b => b.id === updated.id ? updated : b));
            return result;
        } catch (error) {
            console.error('Error updating exam board:', error);
            alert('Failed to update exam board');
            return null;
        }
    };

    const deleteExamBoard = async (id: string) => {
        try {
            await examBoardService.deleteExamBoard(id);
            setExamBoards(prev => prev.filter(b => b.id !== id));
        } catch (error: any) {
            console.error('Error deleting exam board:', error);
            alert(`Failed to delete exam board: ${error.message}`);
        }
    };

    const restoreDefaultExamBoards = async (boards: Omit<ExamBoard, 'id'>[]) => {
        if (!session) return;
        try {
            const newBoards = await examBoardService.restoreDefaultExamBoards(boards, session.user.id);
            setExamBoards(prev => [...prev, ...newBoards]);
        } catch (error) {
            console.error('Error restoring default boards:', error);
            alert('Failed to restore default boards');
        }
    };

    const addSyllabusTopic = async (topic: Omit<SyllabusTopic, 'id'>) => {
        if (!session) return;
        try {
            const newTopic = await syllabusService.addSyllabusTopic(topic, session.user.id);
            setSyllabusTopics([...syllabusTopics, newTopic]);
        } catch (error) { console.error(error); }
    };

    const updateSyllabusTopic = async (updated: SyllabusTopic) => {
        try {
            await syllabusService.updateSyllabusTopic(updated);
            setSyllabusTopics(syllabusTopics.map(t => t.id === updated.id ? updated : t));
        } catch (error) { console.error(error); }
    };

    const deleteSyllabusTopic = async (id: string) => {
        try {
            await syllabusService.deleteSyllabusTopic(id);
            setSyllabusTopics(syllabusTopics.filter(t => t.id !== id));
        } catch (error) { console.error(error); }
    };

    const addCurriculum = async (curriculum: Omit<Curriculum, 'id'>): Promise<Curriculum | null> => {
        if (!session) return null;
        try {
            const newCurriculum = await syllabusService.addCurriculum(curriculum, session.user.id);
            setCurriculums([...curriculums, newCurriculum]);
            return newCurriculum;
        } catch (error) {
            console.error(error);
            return null;
        }
    };

    const updateCurriculum = async (updated: Curriculum) => {
        try {
            await syllabusService.updateCurriculum(updated);
            setCurriculums(curriculums.map(c => c.id === updated.id ? updated : c));
        } catch (error) { console.error(error); }
    };

    const deleteCurriculum = async (id: string) => {
        try {
            await syllabusService.deleteCurriculum(id);
            setCurriculums(curriculums.filter(c => c.id !== id));
        } catch (error) { console.error(error); }
    };

    const upsertSyllabusProgress = async (progress: Omit<SyllabusProgress, 'id'>) => {
        if (!session) return;
        try {
            const newProgress = await syllabusService.upsertSyllabusProgress(progress, session.user.id);
            setSyllabusProgress(prev => {
                const idx = prev.findIndex(p => p.classId === newProgress.classId && p.topicId === newProgress.topicId);
                if (idx >= 0) {
                    const next = [...prev];
                    next[idx] = newProgress;
                    return next;
                }
                return [...prev, newProgress];
            });
        } catch (error) { console.error(error); }
    };

    const submitUserFeedback = async (type: 'bug' | 'feature_request' | 'general' | 'other', message: string, contactEmail?: string) => {
        if (!session) return;
        try {
            await feedbackService.submitFeedback({ type, message, contactEmail, userId: session.user.id }, session.user.id);
        } catch (error) { console.error("Failed to submit feedback:", error); throw error; }
    };

    return (
        <DataContext.Provider value={{
            classes, students, assignments, grades, attendance, snippets, todos, lessons, examBoards, syllabusTopics, curriculums, syllabusProgress,
            loading,
            fetchClasses, fetchStudents, fetchAssignments, fetchGrades, fetchAttendance, fetchSnippets, fetchTodos, fetchLessons, fetchExamBoards, fetchSyllabusTopics, fetchCurriculums, fetchSyllabusProgress,
            addClass, updateClass, deleteClass, promoteClass,
            addStudent, deleteStudent,
            addAssignment, updateAssignment, deleteAssignment,
            updateGrade, deleteGrade, purgeEmptyGrades, updateAttendance,
            addSnippet, deleteSnippet,
            toggleTodo, addTodo, deleteTodo,
            addLesson, updateLesson, deleteLesson,
            addExamBoard, updateExamBoard, deleteExamBoard, restoreDefaultExamBoards,
            addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic,
            addCurriculum, updateCurriculum, deleteCurriculum,
            upsertSyllabusProgress,
            submitUserFeedback
        }}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("useData must be used within DataProvider");
    return context;
};
