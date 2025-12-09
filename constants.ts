
import { UserRole, Student, Announcement, GradeItem, Message, ClassSession, Invoice, ReportCard, Teacher, User } from './types';

export const APP_NAME = "رابط الرافدين"; 

// --- Initial Data for "Database" ---

export const INITIAL_USERS: User[] = [
    { id: 'p1', name: 'أبو علي (حسين كريم)', role: UserRole.PARENT, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hussein', linkedStudentIds: ['s1', 's2'] },
    { id: 't1', name: 'أستاذ حيدر', role: UserRole.TEACHER, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Haider', specialization: 'الرياضيات' },
    { id: 't2', name: 'ست مروة', role: UserRole.TEACHER, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marwa', specialization: 'اللغة الإنجليزية' },
    { id: 's1', name: 'علي حسين', role: UserRole.STUDENT, avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali', gradeLevel: 'الخامس العلمي' },
];

export const INITIAL_TEACHERS: Teacher[] = [
    { id: 't1', name: 'أستاذ حيدر', subject: 'الرياضيات', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Haider' },
    { id: 't2', name: 'ست مروة', subject: 'اللغة الإنجليزية', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marwa' },
    { id: 't3', name: 'أستاذ أحمد', subject: 'الفيزياء', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed' },
    { id: 't4', name: 'د. يوسف', subject: 'اللغة العربية', avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yousef' },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's1',
    name: 'علي حسين',
    gradeLevel: 'الخامس العلمي',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali',
    gpa: 88.5,
    attendance: 94,
    nextExam: 'الرياضيات - الأحد القادم',
    tuitionStatus: 'paid',
    parentId: 'p1'
  },
  {
    id: 's2',
    name: 'زينب حسين',
    gradeLevel: 'الثاني المتوسط',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zainab',
    gpa: 92.0,
    attendance: 98,
    nextExam: 'العلوم - الثلاثاء',
    tuitionStatus: 'overdue',
    parentId: 'p1'
  },
  {
    id: 's3',
    name: 'محمد كاظم',
    gradeLevel: 'الخامس العلمي',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed',
    gpa: 76.5,
    attendance: 85,
    nextExam: 'الفيزياء - الأربعاء',
    tuitionStatus: 'pending',
    parentId: 'p2'
  }
];

export const INITIAL_CLASSES: ClassSession[] = [
  { id: 'c1', subject: 'الرياضيات', grade: 'الخامس العلمي (أ)', time: '08:00 ص', topic: 'التفاضل والتكامل', studentsCount: 32, teacherId: 't1' },
  { id: 'c2', subject: 'الرياضيات', grade: 'الخامس العلمي (ب)', time: '09:30 ص', topic: 'المصفوفات', studentsCount: 30, teacherId: 't1' },
  { id: 'c3', subject: 'الفيزياء', grade: 'الرابع العلمي', time: '11:00 ص', topic: 'قوانين الحركة', studentsCount: 28, teacherId: 't3' },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'اجتماع أولياء الأمور',
    content: 'ندعوكم لحضور اجتماع مجلس الآباء والمعلمين يوم الخميس القادم في قاعة المتنبي لمناقشة خطة نصف السنة.',
    date: '2023-10-25',
    type: 'event',
    targetAudience: 'parents'
  },
  {
    id: 'a2',
    title: 'تنبيه بخصوص الامتحانات',
    content: 'ستبدأ امتحانات نصف السنة يوم 15 كانون الثاني. يرجى من جميع الطلبة استلام جداولهم من الإدارة.',
    date: '2023-10-22',
    type: 'urgent',
    targetAudience: 'all'
  },
  {
    id: 'a3',
    title: 'مسابقة الروبوت',
    content: 'فتح باب التسجيل في نادي الروبوت والذكاء الاصطناعي للمتميزين.',
    date: '2023-10-20',
    type: 'info',
    targetAudience: 'students'
  }
];

export const INITIAL_GRADES: GradeItem[] = [
  { id: 'g1', studentId: 's1', subject: 'الرياضيات', score: 45, total: 50, date: '2023-10-10', type: 'midterm' },
  { id: 'g2', studentId: 's1', subject: 'الفيزياء', score: 42, total: 50, date: '2023-10-12', type: 'quiz' },
  { id: 'g3', studentId: 's1', subject: 'اللغة العربية', score: 48, total: 50, date: '2023-10-15', type: 'homework' },
  { id: 'g4', studentId: 's2', subject: 'العلوم', score: 95, total: 100, date: '2023-10-18', type: 'midterm' },
];

export const INITIAL_MESSAGES: Message[] = [
  { id: 'm1', senderId: 't1', senderName: 'أستاذ حيدر', recipientId: 'p1', content: 'السلام عليكم أبو علي، مستوى علي ممتاز في الرياضيات هذا الشهر.', timestamp: new Date(Date.now() - 86400000).toISOString(), read: true },
  { id: 'm2', senderId: 'p1', senderName: 'أبو علي', recipientId: 't1', content: 'وعليكم السلام أستاذ، شكراً لجهودكم. هل يحتاج دروس تقوية في الهندسة؟', timestamp: new Date(Date.now() - 82000000).toISOString(), read: false },
];

export const INITIAL_INVOICES: Invoice[] = [
    { id: 'inv_001', studentId: 's2', title: 'القسط الدراسي الأول - 2024', amount: 750000, dueDate: '2023-10-01', status: 'overdue' },
    { id: 'inv_002', studentId: 's1', title: 'القسط الدراسي الأول - 2024', amount: 850000, dueDate: '2023-10-01', status: 'paid' },
    { id: 'inv_003', studentId: 's2', title: 'رسوم النقل (باص) - تشرين الأول', amount: 50000, dueDate: '2023-11-01', status: 'pending' },
];

export const INITIAL_REPORTS: ReportCard[] = [
    { id: 'rep_001', studentId: 's1', title: 'تقرير الشهر الأول', date: '2023-10-30', type: 'monthly', url: '#' },
    { id: 'rep_002', studentId: 's2', title: 'تقرير الشهر الأول', date: '2023-10-30', type: 'monthly', url: '#' },
];
