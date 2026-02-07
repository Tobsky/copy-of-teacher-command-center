import React, { createContext, useContext, ReactNode } from 'react';
import { ClassGroup, Student, Assignment, Grade, AttendanceRecord, Snippet, Todo, Lesson, AppView, ExamBoard, SyllabusTopic, Curriculum, SyllabusProgress, AcademicSession } from '../types';

// Contexts
import { AuthProvider, useAuth } from './AuthContext';
import { SessionProvider, useSession } from './SessionContext';
import { UIProvider, useUI } from './UIContext';
import { DataProvider, useData } from './DataContext';

interface AppContextType {
  currentView: AppView;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextFacade: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { loading: authLoading, logout } = useAuth();
  const { currentView, setCurrentView } = useUI();
  const {
    academicSessions, activeSession, fetchAcademicSessions,
    addAcademicSession, updateAcademicSession, deleteAcademicSession,
    setActiveSession, createSessionFromLegacy
  } = useSession();

  const data = useData();

  const appContextValue: AppContextType = {
    loading: authLoading, // Primary auth loading
    logout,
    currentView, setCurrentView,
    academicSessions, activeSession, fetchAcademicSessions,
    addAcademicSession, updateAcademicSession, deleteAcademicSession,
    setActiveSession, createSessionFromLegacy,
    ...data // Spread all data state and actions
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <SessionProvider>
        <UIProvider>
          <DataProvider>
            <AppContextFacade>
              {children}
            </AppContextFacade>
          </DataProvider>
        </UIProvider>
      </SessionProvider>
    </AuthProvider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppContext must be used within AppProvider");
  return context;
};