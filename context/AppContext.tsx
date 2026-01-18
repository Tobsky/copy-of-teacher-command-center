import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { toCamelCase, toSnakeCase } from '../utils/mapper';
import { ClassGroup, Student, Assignment, Grade, AttendanceRecord, Snippet, Todo, Lesson, AppView, ExamBoard } from '../types';

interface AppContextType {
  currentView: AppView; // Kept for types but unused by router
  setCurrentView: (view: AppView) => void;
  classes: ClassGroup[];
  students: Student[];
  assignments: Assignment[];
  grades: Grade[];
  attendance: AttendanceRecord[];
  snippets: Snippet[];
  todos: Todo[];
  lessons: Lesson[];
  examBoards: ExamBoard[];

  loading: boolean;

  addClass: (cls: Omit<ClassGroup, 'id'>) => Promise<void>;
  updateClass: (cls: ClassGroup) => Promise<void>;
  deleteClass: (id: string) => Promise<void>;
  addStudent: (student: Omit<Student, 'id'>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (assignment: Assignment) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  updateGrade: (grade: Grade) => Promise<void>;
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

  logout: () => Promise<void>;

  fetchClasses: () => Promise<void>;
  fetchStudents: () => Promise<void>;
  fetchAssignments: () => Promise<void>;
  fetchGrades: () => Promise<void>;
  fetchAttendance: () => Promise<void>;
  fetchSnippets: () => Promise<void>;
  fetchTodos: () => Promise<void>;
  fetchLessons: () => Promise<void>;
  fetchExamBoards: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<ClassGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [examBoards, setExamBoards] = useState<ExamBoard[]>([]);
  const [session, setSession] = useState<any>(null);

  // Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
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
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Methods
  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*');
    if (data) setClasses(toCamelCase(data));
  };

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select('*');
    if (data) setStudents(toCamelCase(data));
  };

  const fetchAssignments = async () => {
    const { data } = await supabase.from('assignments').select('*');
    if (data) setAssignments(toCamelCase(data));
  };

  const fetchGrades = async () => {
    const { data } = await supabase.from('grades').select('*');
    if (data) setGrades(toCamelCase(data));
  };

  const fetchAttendance = async () => {
    const { data } = await supabase.from('attendance').select('*');
    if (data) setAttendance(toCamelCase(data));
  };

  const fetchSnippets = async () => {
    const { data } = await supabase.from('snippets').select('*');
    if (data) setSnippets(toCamelCase(data));
  };

  const fetchTodos = async () => {
    const { data } = await supabase.from('todos').select('*');
    if (data) setTodos(toCamelCase(data));
  };

  const fetchLessons = async () => {
    const { data } = await supabase.from('lessons').select('*');
    if (data) setLessons(toCamelCase(data));
  };

  const fetchExamBoards = async () => {
    const { data } = await supabase.from('exam_boards').select('*');
    if (data) setExamBoards(toCamelCase(data));
  };


  // --- Actions ---

  const addClass = async (cls: Omit<ClassGroup, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('classes').insert([
      toSnakeCase({ ...cls, userId: session.user.id })
    ]).select();
    if (data) setClasses([...classes, toCamelCase(data[0])]);
    if (error) console.error(error);
  };

  const deleteClass = async (id: string) => {
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (!error) setClasses(classes.filter(c => c.id !== id));
  };

  const updateClass = async (updated: ClassGroup) => {
    const { error } = await supabase.from('classes').update(
      toSnakeCase(updated)
    ).eq('id', updated.id);
    if (!error) setClasses(classes.map(c => c.id === updated.id ? updated : c));
  };

  const addStudent = async (student: Omit<Student, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('students').insert([
      toSnakeCase({ ...student, userId: session.user.id })
    ]).select();

    if (data) {
      setStudents([...students, toCamelCase(data[0])]);
    }
    if (error) console.error(error);
  };

  const deleteStudent = async (id: string) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (!error) setStudents(students.filter(s => s.id !== id));
  };

  const addAssignment = async (assignment: Omit<Assignment, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('assignments').insert([
      toSnakeCase({ ...assignment, userId: session.user.id })
    ]).select();

    if (data) {
      setAssignments([...assignments, toCamelCase(data[0])]);
    }
    if (error) console.error(error);
  };

  const updateAssignment = async (updated: Assignment) => {
    const { error } = await supabase.from('assignments').update(
      toSnakeCase(updated)
    ).eq('id', updated.id);
    if (!error) setAssignments(assignments.map(a => a.id === updated.id ? updated : a));
  };

  const deleteAssignment = async (id: string) => {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (!error) {
      setAssignments(assignments.filter(a => a.id !== id));
      setGrades(grades.filter(g => g.assignmentId !== id)); // Optimistic local cleanup
    }
  };

  // Grade upsert logic
  const updateGrade = async (grade: Grade) => {
    if (!session) return;
    const payload = toSnakeCase({
      ...grade,
      userId: session.user.id
    });

    // We need to map camelCase to snake_case for DB
    const { data, error } = await supabase.from('grades').upsert(payload, { onConflict: 'student_id, assignment_id' }).select();

    if (data && !error) {
      const newGrade = toCamelCase(data[0]);

      setGrades(prev => {
        const idx = prev.findIndex(g => g.studentId === newGrade.studentId && g.assignmentId === newGrade.assignmentId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newGrade;
          return next;
        }
        return [...prev, newGrade];
      });
    } else {
      console.error(error);
    }
  };

  const updateAttendance = async (record: AttendanceRecord) => {
    if (!session) return;
    const payload = toSnakeCase({
      ...record,
      userId: session.user.id
    });

    const { data, error } = await supabase.from('attendance').upsert(payload, { onConflict: 'student_id, date, class_id' }).select();

    if (data && !error) {
      const newRecord: AttendanceRecord = toCamelCase(data[0]);

      setAttendance(prev => {
        const idx = prev.findIndex(r => r.date === newRecord.date && r.studentId === newRecord.studentId && r.classId === newRecord.classId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newRecord;
          return next;
        }
        return [...prev, newRecord];
      });
    }
  };

  const addSnippet = async (snippet: Omit<Snippet, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('snippets').insert([
      toSnakeCase({ ...snippet, userId: session.user.id })
    ]).select();
    if (data) setSnippets([...snippets, toCamelCase(data[0])]);
  };

  const deleteSnippet = async (id: string) => {
    const { error } = await supabase.from('snippets').delete().eq('id', id);
    if (!error) setSnippets(snippets.filter(s => s.id !== id));
  };

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('todos').update({ completed: !currentStatus }).eq('id', id);
    if (!error) setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = async (text: string) => {
    if (!session) return;
    const { data, error } = await supabase.from('todos').insert([
      toSnakeCase({ text, completed: false, userId: session.user.id })
    ]).select();
    if (data) setTodos([...todos, toCamelCase(data[0])]);
  };

  const deleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) setTodos(todos.filter(t => t.id !== id));
  };

  const addLesson = async (lesson: Omit<Lesson, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('lessons').insert([
      toSnakeCase({ ...lesson, userId: session.user.id })
    ]).select();
    if (data) setLessons([...lessons, toCamelCase(data[0])]);
  };

  const updateLesson = async (updated: Lesson) => {
    const { error } = await supabase.from('lessons').update(
      toSnakeCase(updated)
    ).eq('id', updated.id);
    if (!error) setLessons(lessons.map(l => l.id === updated.id ? updated : l));
  };

  const deleteLesson = async (id: string) => {
    const { error } = await supabase.from('lessons').delete().eq('id', id);
    if (!error) setLessons(lessons.filter(l => l.id !== id));
  };

  const addExamBoard = async (board: Omit<ExamBoard, 'id'>): Promise<ExamBoard | null> => {
    if (!session) return null;
    const { data, error } = await supabase.from('exam_boards').insert([
      toSnakeCase({ ...board, userId: session.user.id })
    ]).select();

    if (data) {
      const newBoard = toCamelCase(data[0]);
      setExamBoards(prev => [...prev, newBoard]);
      return newBoard;
    }
    if (error) {
      console.error('Error adding exam board:', error);
      alert('Failed to add exam board');
      return null;
    }
    return null;
  };

  const updateExamBoard = async (updated: ExamBoard): Promise<ExamBoard | null> => {
    const { error } = await supabase.from('exam_boards').update(
      toSnakeCase(updated)
    ).eq('id', updated.id);

    if (!error) {
      setExamBoards(prev => prev.map(b => b.id === updated.id ? updated : b));
      return updated;
    } else {
      console.error('Error updating exam board:', error);
      alert('Failed to update exam board');
      return null;
    }
  };

  const deleteExamBoard = async (id: string) => {
    const { error } = await supabase.from('exam_boards').delete().eq('id', id);

    if (!error) {
      setExamBoards(prev => prev.filter(b => b.id !== id));
    } else {
      console.error('Error deleting exam board:', error);
      alert(`Failed to delete exam board: ${error.message}`);
    }
  };

  const restoreDefaultExamBoards = async (boards: Omit<ExamBoard, 'id'>[]) => {
    if (!session) return;
    const { data, error } = await supabase.from('exam_boards').insert(
      boards.map(b => toSnakeCase({ ...b, userId: session.user.id }))
    ).select();

    if (data) {
      const newBoards = toCamelCase(data);
      setExamBoards(prev => [...prev, ...newBoards]);
    }
    if (error) {
      console.error('Error restoring default boards:', error);
      alert('Failed to restore default boards');
    }
  };


  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setClasses([]);
    setStudents([]);
    setAssignments([]);
    setGrades([]);
    setAttendance([]);
    setSnippets([]);
    setTodos([]);
    setLessons([]);
    setExamBoards([]);
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      classes, students, assignments, grades, attendance, snippets, todos, lessons, examBoards,
      loading,
      addClass, updateClass, deleteClass, addStudent, deleteStudent,
      addAssignment, updateAssignment, deleteAssignment,
      updateGrade, updateAttendance, addSnippet, deleteSnippet,
      toggleTodo, addTodo, deleteTodo, logout,
      addLesson, updateLesson, deleteLesson,
      addExamBoard, updateExamBoard, deleteExamBoard, restoreDefaultExamBoards,
      fetchClasses, fetchStudents, fetchAssignments, fetchGrades, fetchAttendance, fetchSnippets, fetchTodos, fetchLessons, fetchExamBoards
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};