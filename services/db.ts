
import { 
    INITIAL_USERS, INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_CLASSES, 
    INITIAL_ANNOUNCEMENTS, INITIAL_GRADES, INITIAL_MESSAGES, INITIAL_INVOICES 
} from '../constants';
import { User, Student, Message, UserRole } from '../types';

// Simple In-Memory / LocalStorage Database to simulate Firebase behavior
// This ensures the app works perfectly without requiring the user to actually set up Firebase immediately.

const loadData = (key: string, initial: any) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
};

const saveData = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
};

class DatabaseService {
    users = loadData('users', INITIAL_USERS);
    students = loadData('students', INITIAL_STUDENTS);
    messages = loadData('messages', INITIAL_MESSAGES);
    classes = loadData('classes', INITIAL_CLASSES);
    attendance = loadData('attendance', {}); // { classId_date: { studentId: status } }

    // --- Users ---
    async login(userId: string): Promise<User | null> {
        // Simulating network delay
        await new Promise(r => setTimeout(r, 500));
        return this.users.find((u: User) => u.id === userId) || null;
    }

    async registerUser(user: User): Promise<User> {
        await new Promise(r => setTimeout(r, 800));
        this.users.push(user);
        saveData('users', this.users);
        return user;
    }

    // --- Students ---
    getStudentsForParent(parentId: string): Student[] {
        return this.students.filter((s: Student) => s.parentId === parentId);
    }
    
    getAllStudents(): Student[] {
        return this.students;
    }

    getStudentById(id: string): Student | undefined {
        return this.students.find((s: Student) => s.id === id);
    }

    // --- Messages ---
    getMessages(userId: string, otherId: string): Message[] {
        return this.messages.filter((m: Message) => 
            (m.senderId === userId && m.recipientId === otherId) || 
            (m.senderId === otherId && m.recipientId === userId)
        ).sort((a: Message, b: Message) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

    async sendMessage(msg: Message): Promise<void> {
        await new Promise(r => setTimeout(r, 200));
        this.messages.push(msg);
        saveData('messages', this.messages);
    }

    // --- Attendance ---
    async saveAttendance(classId: string, date: string, records: Record<string, string>) {
        const key = `${classId}_${date}`;
        this.attendance[key] = records;
        saveData('attendance', this.attendance);
        
        // Update student attendance % (Simplified logic)
        Object.entries(records).forEach(([studentId, status]) => {
            const student = this.students.find((s: Student) => s.id === studentId);
            if (student) {
                // Mock calculation update
                if (status === 'absent') student.attendance = Math.max(0, student.attendance - 1);
            }
        });
        saveData('students', this.students);
    }

    // --- Utils ---
    generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }
}

export const db = new DatabaseService();
