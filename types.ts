export interface ClassGroup {
  id: string;
  name: string;
  section: string;
  schedule: string;
  curriculumId?: string | null;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
}

export interface Assignment {
  id: string;
  classId: string;
  title: string;
  maxPoints: number;
  date: string;
  completed: boolean;
  category?: string; // e.g., "Homework", "Quiz", "Exam"
  weight?: string; // e.g., "20%"
  createdAt?: string; // ISO timestamp from DB
}

export interface Grade {
  studentId: string;
  assignmentId: string;
  score: number;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  id: string;
  date: string;
  classId: string;
  studentId: string;
  status: AttendanceStatus;
}

export interface Snippet {
  id: string;
  title: string;
  language: string;
  code: string;
  tags: string[];
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export type ResourceType = 'link' | 'pdf' | 'video' | 'image';

export interface LessonResource {
  id: string; // Added ID for easier deletion
  type: ResourceType;
  label: string;
  url: string;
}

export interface Lesson {
  id: string;
  userId: string;
  title: string;
  date: string;
  content: string;
  resources: LessonResource[];
  classId?: string;
  syllabusTopicId?: string;
}

export interface SyllabusTopic {
  id: string;
  userId: string;
  curriculumId: string;
  title: string;
  semester: 'Semester 1' | 'Semester 2';
  orderIndex: number;
  createdAt?: string;
}

export interface Curriculum {
  id: string;
  userId: string;
  name: string;
  boardCode?: string;
  createdAt?: string;
}

export type SyllabusStatus = 'not_started' | 'taught' | 'assessed' | 'completed';

export interface SyllabusProgress {
  id: string;
  userId: string;
  classId: string;
  topicId: string;
  status: SyllabusStatus;
  updatedAt?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  CLASSES = 'CLASSES',
  ATTENDANCE = 'ATTENDANCE',
  GRADEBOOK = 'GRADEBOOK',
  SNIPPETS = 'SNIPPETS',
  FEEDBACK = 'FEEDBACK',
  CURVING = 'CURVING',
  SYLLABUS = 'SYLLABUS'
}

// --- Grade Curving Types ---

export interface GradeBoundary {
  grade: string;
  minScore: number;
}

export interface ExamBoard {
  id: string; // Added ID for editing/deleting
  name: string;
  maxScore: number;
  boundaries: GradeBoundary[];
}

export interface SchoolGradeRange {
  label: string;
  minPercent: number;
  maxPercent: number;
}

export interface SchoolGradingSystem {
  name: string;
  grades: SchoolGradeRange[];
}

export interface CurvedGradeResult {
  rawScore: number;
  scaledScore: number;
  boardGrade: string;
  schoolPercent: number;
  schoolGrade: string;
}

export interface StudentCurvedGrade extends CurvedGradeResult {
  studentId: string;
  studentName: string;
}