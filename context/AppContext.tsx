import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { toCamelCase, toSnakeCase } from '../utils/mapper';
import { ClassGroup, Student, Assignment, Grade, AttendanceRecord, Snippet, Todo, Lesson, AppView, ExamBoard, SyllabusTopic, Curriculum, SyllabusProgress, AcademicSession } from '../types';

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
  syllabusTopics: SyllabusTopic[];
  curriculums: Curriculum[];
  syllabusProgress: SyllabusProgress[];

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
  fetchSyllabusTopics: () => Promise<void>;

  addSyllabusTopic: (topic: Omit<SyllabusTopic, 'id'>) => Promise<void>;
  updateSyllabusTopic: (topic: SyllabusTopic) => Promise<void>;
  deleteSyllabusTopic: (id: string) => Promise<void>;

  fetchCurriculums: () => Promise<void>;
  addCurriculum: (curriculum: Omit<Curriculum, 'id'>) => Promise<Curriculum | null>;
  updateCurriculum: (curriculum: Curriculum) => Promise<void>;
  deleteCurriculum: (id: string) => Promise<void>;

  fetchSyllabusProgress: () => Promise<void>;
  upsertSyllabusProgress: (progress: Omit<SyllabusProgress, 'id'>) => Promise<void>;

  academicSessions: AcademicSession[];
  activeSession: AcademicSession | null;
  fetchAcademicSessions: () => Promise<void>;
  addAcademicSession: (session: Omit<AcademicSession, 'id'>) => Promise<void>;
  updateAcademicSession: (session: AcademicSession) => Promise<void>;
  deleteAcademicSession: (id: string) => Promise<void>;
  setActiveSession: (id: string | null) => Promise<void>;
  createSessionFromLegacy: (session: Omit<AcademicSession, 'id'>) => Promise<void>;
  promoteClass: (sourceClassId: string, targetClassName: string, targetSection: string) => Promise<void>;
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
  const [syllabusTopics, setSyllabusTopics] = useState<SyllabusTopic[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [syllabusProgress, setSyllabusProgress] = useState<SyllabusProgress[]>([]);
  const [academicSessions, setAcademicSessions] = useState<AcademicSession[]>([]);
  const [activeSession, setActiveSessionState] = useState<AcademicSession | null>(null);
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
        setSyllabusTopics([]);
        setCurriculums([]);
        setSyllabusProgress([]);
        setAcademicSessions([]); // Clear sessions
        setActiveSessionState(null);
        setLoading(false);
      } else {
        // Refetch if logging back in
        fetchClasses();
        // ... (others usually fetched by components or on-demand, but session is global)
        fetchAcademicSessions();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Refetch data when session/activeSession changes
  useEffect(() => {
    if (session) {
      fetchClasses();
      fetchAcademicSessions();
    }
  }, [session]);

  // Separate effect for activeSession to avoid infinite loops if fetchClasses depends on it
  useEffect(() => {
    if (session) {
      fetchClasses();
    }
  }, [activeSession]);

  // Fetch Methods
  const fetchClasses = async () => {
    let query = supabase.from('classes').select('*');

    // If we have an active session, filter by it.
    // If NO active session, showing "Legacy" classes (where session_id is NULL) is a safe default behavior 
    // to prevent mixing data from other sessions.
    if (activeSession) {
      query = query.eq('session_id', activeSession.id);
    } else {
      // Option: Show classes with NO session (legacy)
      query = query.is('session_id', null);
    }

    const { data } = await query;
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

  const fetchSyllabusTopics = async () => {
    const { data } = await supabase.from('syllabus_topics').select('*');
    if (data) setSyllabusTopics(toCamelCase(data));
  };

  const fetchCurriculums = async () => {
    const { data } = await supabase.from('curriculums').select('*');
    if (data) setCurriculums(toCamelCase(data));
  };

  const fetchSyllabusProgress = async () => {
    const { data } = await supabase.from('syllabus_progress').select('*');
    if (data) setSyllabusProgress(toCamelCase(data));
  };


  // --- Actions ---

  const addClass = async (cls: Omit<ClassGroup, 'id'>) => {
    if (!session) return;

    // Attach current active session ID if available
    const payload = { ...cls, userId: session.user.id };
    if (activeSession) {
      payload.sessionId = activeSession.id;
    }

    const { data, error } = await supabase.from('classes').insert([
      toSnakeCase(payload)
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

  const deleteGrade = async (studentId: string, assignmentId: string) => {
    const { error } = await supabase.from('grades')
      .delete()
      .match({ student_id: studentId, assignment_id: assignmentId });

    if (!error) {
      setGrades(prev => prev.filter(g => !(g.studentId === studentId && g.assignmentId === assignmentId)));
    } else {
      console.error("Error deleting grade:", error);
    }
  };

  const purgeEmptyGrades = async () => {
    // Delete all grades where score is 0
    const { error } = await supabase.from('grades')
      .delete()
      .eq('score', 0);

    if (!error) {
      // Optimistically remove 0s from local state
      setGrades(prev => prev.filter(g => g.score !== 0));
      return true;
    } else {
      console.error("Error purging empty grades:", error);
      return false;
    }
  };

  const updateAttendance = async (record: AttendanceRecord) => {
    if (!session) return;
    const payload = toSnakeCase({
      ...record,
      userId: session.user.id
    });
    // Remove empty ID so Postgres generates a new UUID or handles conflict correctly
    if (!payload.id) delete payload.id;

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
    setSyllabusTopics([]);
    setCurriculums([]);
    setSyllabusProgress([]);
  };

  // --- Syllabus Topic Actions ---
  const addSyllabusTopic = async (topic: Omit<SyllabusTopic, 'id'>) => {
    if (!session) return;
    const { data, error } = await supabase.from('syllabus_topics').insert([
      toSnakeCase({ ...topic, userId: session.user.id })
    ]).select();
    if (data) setSyllabusTopics([...syllabusTopics, toCamelCase(data[0])]);
    if (error) console.error(error);
  };

  const updateSyllabusTopic = async (updated: SyllabusTopic) => {
    const { error } = await supabase.from('syllabus_topics').update(
      toSnakeCase(updated)
    ).eq('id', updated.id);
    if (!error) setSyllabusTopics(syllabusTopics.map(t => t.id === updated.id ? updated : t));
  };

  const deleteSyllabusTopic = async (id: string) => {
    const { error } = await supabase.from('syllabus_topics').delete().eq('id', id);
    if (!error) setSyllabusTopics(syllabusTopics.filter(t => t.id !== id));
  };

  // --- Curriculum Actions ---
  const addCurriculum = async (curriculum: Omit<Curriculum, 'id'>): Promise<Curriculum | null> => {
    if (!session) return null;
    const { data, error } = await supabase.from('curriculums').insert([
      toSnakeCase({ ...curriculum, userId: session.user.id })
    ]).select();
    if (data) {
      const newCurriculum = toCamelCase(data[0]);
      setCurriculums([...curriculums, newCurriculum]);
      return newCurriculum;
    }
    if (error) console.error(error);
    return null;
  };

  const updateCurriculum = async (updated: Curriculum) => {
    const { error } = await supabase.from('curriculums').update(
      toSnakeCase(updated)
    ).eq('id', updated.id);
    if (!error) setCurriculums(curriculums.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCurriculum = async (id: string) => {
    const { error } = await supabase.from('curriculums').delete().eq('id', id);
    if (!error) setCurriculums(curriculums.filter(c => c.id !== id));
  };

  // --- Academic Sessions ---
  const fetchAcademicSessions = async () => {
    if (!session) return;
    console.log("DEBUG: fetching academic sessions...");
    const { data, error } = await supabase.from('academic_sessions').select('*').order('created_at', { ascending: false });
    if (error) console.error("DEBUG: Error fetching sessions:", error);
    if (data) {
      console.log("DEBUG: Fetched sessions data:", data);
      const sessions = toCamelCase(data);
      setAcademicSessions(sessions);

      const active = sessions.find((s: AcademicSession) => s.isActive);
      if (active) setActiveSessionState(active);
      else if (sessions.length > 0) {
        // Fallback: If no active session, use the most recent one? 
        // Or strictly require user interaction. For now, let's auto-select the first one if none active.
        setActiveSessionState(sessions[0]);
      }
    }
  };

  const addAcademicSession = async (newSession: Omit<AcademicSession, 'id'>) => {
    if (!session) return;
    const payload = toSnakeCase({ ...newSession, userId: session.user.id });
    const { data, error } = await supabase.from('academic_sessions').insert([payload]).select();
    if (data && !error) {
      const created = toCamelCase(data[0]);
      setAcademicSessions([created, ...academicSessions]);
      if (created.isActive) setActiveSessionState(created);
    }
  };

  const updateAcademicSession = async (updated: AcademicSession) => {
    const payload = toSnakeCase(updated);
    const { error } = await supabase.from('academic_sessions').update(payload).eq('id', updated.id);
    if (!error) {
      setAcademicSessions(academicSessions.map(s => s.id === updated.id ? updated : s));
      if (updated.isActive) setActiveSessionState(updated);
    }
  };

  const deleteAcademicSession = async (id: string) => {
    const { error } = await supabase.from('academic_sessions').delete().eq('id', id);
    if (!error) {
      setAcademicSessions(academicSessions.filter(s => s.id !== id));
      if (activeSession?.id === id) setActiveSessionState(null);
    }
  };

  const setActiveSession = async (id: string | null) => {
    if (!session) return;

    // 1. Deactivate ALL sessions for this user in the DB to ensure data consistency
    await supabase.from('academic_sessions').update({ is_active: false }).eq('user_id', session.user.id);

    if (id === null) {
      // Switch to "Legacy" view (no active session)
      setActiveSessionState(null);
      fetchAcademicSessions();
      return;
    }

    // 2. Activate the target session
    const { data, error } = await supabase.from('academic_sessions').update({ is_active: true }).eq('id', id).select();

    if (data && !error) {
      const newActive = toCamelCase(data[0]);
      setActiveSessionState(newActive);
      // Refresh list to update 'isActive' status on all in UI
      fetchAcademicSessions();
      // Also refresh classes as the view context changed
      fetchClasses();
    }
  };

  const createSessionFromLegacy = async (newSession: Omit<AcademicSession, 'id'>) => {
    if (!session) return;

    // 1. Deactivate all existing sessions logic (since new one will be active)
    await supabase.from('academic_sessions').update({ is_active: false }).eq('user_id', session.user.id);

    // 2. Create the new session
    console.log("DEBUG: Converting legacy session...", newSession);
    const payload = toSnakeCase({ ...newSession, userId: session.user.id, isActive: true });
    const { data: sessionData, error: sessionError } = await supabase.from('academic_sessions').insert([payload]).select();

    if (sessionError) console.error("DEBUG: Error creating session:", sessionError);

    if (sessionData && !sessionError) {
      const createdSession = toCamelCase(sessionData[0]);
      const newSessionId = createdSession.id;

      // 2. Update all classes where session_id is NULL to this new session ID
      const { error: updateError } = await supabase.from('classes')
        .update({ session_id: newSessionId })
        .is('session_id', null);

      if (!updateError) {
        setAcademicSessions([createdSession, ...academicSessions]);
        if (createdSession.isActive) setActiveSessionState(createdSession);
        // Refresh classes to reflect the change
        fetchClasses();
      } else {
        console.error("Error migrating legacy classes:", updateError);
      }
    }
  };

  const promoteClass = async (sourceClassId: string, targetClassName: string, targetSection: string) => {
    if (!session || !activeSession) return;

    // 1. Create the new target class
    const classPayload = toSnakeCase({
      userId: session.user.id,
      name: targetClassName,
      section: targetSection,
      schedule: 'TBA',
      sessionId: activeSession.id
    });

    const { data: classData, error: classError } = await supabase.from('classes').insert([classPayload]).select();

    if (classError || !classData) {
      console.error("Failed to create target class:", classError);
      return;
    }

    const newClassId = classData[0].id;

    // 2. Fetch students from source class
    const { data: sourceStudents, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('class_id', sourceClassId);

    if (studentsError || !sourceStudents || sourceStudents.length === 0) {
      // Even if no students, we successfully created the class, so we should refresh
      fetchClasses();
      return;
    }

    // 3. Duplicate students to new class
    const studentsPayload = sourceStudents.map(s => ({
      user_id: session.user.id,
      class_id: newClassId,
      name: s.name,
      email: s.email
    }));

    const { error: copyError } = await supabase.from('students').insert(studentsPayload);

    if (copyError) {
      console.error("Failed to copy students:", copyError);
    }

    // 4. Refresh Data
    fetchClasses();
    fetchStudents();
  };

  // --- Syllabus Progress Actions ---
  const upsertSyllabusProgress = async (progress: Omit<SyllabusProgress, 'id'>) => {
    if (!session) return;
    const payload = toSnakeCase({ ...progress, userId: session.user.id });
    const { data, error } = await supabase.from('syllabus_progress').upsert(payload, { onConflict: 'class_id, topic_id' }).select();
    if (data && !error) {
      const newProgress = toCamelCase(data[0]);
      setSyllabusProgress(prev => {
        const idx = prev.findIndex(p => p.classId === newProgress.classId && p.topicId === newProgress.topicId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = newProgress;
          return next;
        }
        return [...prev, newProgress];
      });
    }
  };

  return (
    <AppContext.Provider value={{
      currentView, setCurrentView,
      classes, students, assignments, grades, attendance, snippets, todos, lessons, examBoards, syllabusTopics, curriculums, syllabusProgress,
      loading,
      addClass, updateClass, deleteClass, addStudent, deleteStudent,
      addAssignment, updateAssignment, deleteAssignment,
      updateGrade, updateAttendance, addSnippet, deleteSnippet,
      toggleTodo, addTodo, deleteTodo, logout,
      addLesson, updateLesson, deleteLesson,
      addExamBoard, updateExamBoard, deleteExamBoard, restoreDefaultExamBoards,
      addSyllabusTopic, updateSyllabusTopic, deleteSyllabusTopic,
      addCurriculum, updateCurriculum, deleteCurriculum,
      upsertSyllabusProgress,
      academicSessions, activeSession, fetchAcademicSessions, addAcademicSession, updateAcademicSession, deleteAcademicSession, setActiveSession, createSessionFromLegacy, promoteClass,
      fetchClasses, fetchStudents, fetchAssignments, fetchGrades, fetchAttendance, fetchSnippets, fetchTodos, fetchLessons, fetchExamBoards, fetchSyllabusTopics, fetchCurriculums, fetchSyllabusProgress
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