
export enum UserRole {
  PARENT = 'parent',
  STUDENT = 'student',
  TEACHER = 'teacher'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  email?: string;
  phone?: string;
  linkedStudentIds?: string[]; // For parents
  specialization?: string; // For teachers
  gradeLevel?: string; // For students
}

export interface Teacher {
  id: string;
  name: string;
  subject: string;
  avatarUrl: string;
  schedule?: string[];
}

export interface Student {
  id: string;
  name: string;
  gradeLevel: string; // e.g., 'الخامس العلمي'
  avatarUrl: string;
  gpa: number;
  attendance: number; // percentage
  nextExam?: string;
  tuitionStatus?: 'paid' | 'partial' | 'overdue' | 'pending';
  parentId?: string;
}

export interface ClassSession {
  id: string;
  subject: string;
  grade: string; // e.g., '5th Grade A'
  time: string;
  topic: string;
  studentsCount: number;
  teacherId: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  recipientId: string; // Can be a userId or 'class_id'
  content: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  type: 'urgent' | 'info' | 'event';
  targetAudience: 'all' | 'parents' | 'students' | 'teachers';
}

export interface GradeItem {
  id: string;
  studentId: string;
  subject: string;
  score: number;
  total: number;
  date: string;
  type: 'quiz' | 'midterm' | 'final' | 'homework';
}

export interface Invoice {
  id: string;
  studentId: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
}

export interface ReportCard {
  id: string;
  studentId: string;
  title: string;
  date: string;
  type: 'monthly' | 'midterm' | 'final';
  url: string; 
}

export interface Exam {
  id: string;
  subject: string;
  topic: string;
  questions: {question: string, type: 'mcq'|'text'}[];
  generatedDate: string;
}