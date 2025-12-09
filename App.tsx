
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, BookOpen, Calendar as CalendarIcon, MessageCircle, User as UserIcon, Bell, LogOut, 
  GraduationCap, BrainCircuit, CreditCard, FileText, ChevronRight, TrendingUp, 
  MapPin, Menu, X, Mic, Volume2, Sparkles, Image as ImageIcon, Video, 
  ScanSearch, Palette, Play, Users, ClipboardList, PenTool, Layout, Check, AlertCircle, Clock,
  ArrowRight, Download, DollarSign, Wallet, UserPlus, Link as LinkIcon, Phone, Mail, Award, Search, Send, FileQuestion
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

import { UserRole, Student, Teacher, Message, User } from './types';
import { INITIAL_TEACHERS, APP_NAME, INITIAL_CLASSES, INITIAL_INVOICES, INITIAL_REPORTS, INITIAL_ANNOUNCEMENTS, INITIAL_GRADES, INITIAL_STUDENTS } from './constants';
import { Card, Button, Input, Badge, Select, FileUpload } from './components/Components';
import { 
  askAITutor, generateSpeech, generateImage, editImage, 
  generateVideo, analyzeMedia, getLiveClient, ensureApiKey 
} from './services/geminiService';
import { db } from './services/db'; // Import our new simulated DB

// --- Types ---
type Screen = 
  // Common
  | 'SPLASH' | 'LOGIN' | 'REGISTER' | 'PROFILE' | 'CHAT'
  // Student
  | 'STUDENT_DASH' | 'LIVE_VOICE' | 'STUDIO' | 'ANALYSIS' | 'GRADES' | 'AI_TUTOR' | 'STUDENT_TEACHERS'
  // Parent
  | 'PARENT_DASH' | 'CHILD_DETAIL' | 'PAYMENTS' | 'REPORTS'
  // Teacher
  | 'TEACHER_DASH' | 'CLASSES' | 'CLASS_DETAIL' | 'TEACHER_TOOLS' | 'ATTENDANCE' | 'EXAM_GENERATOR';

// ============================================================================
//                               SHARED COMPONENTS
// ============================================================================

const ChatScreen = ({ currentUser, recipient, onBack }: { currentUser: User, recipient: { id: string, name: string, role: string, avatar?: string }, onBack: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const endRef = useRef<HTMLDivElement>(null);

    // Load messages from DB
    useEffect(() => {
        const load = () => {
            const msgs = db.getMessages(currentUser.id, recipient.id);
            setMessages(msgs);
        };
        load();
        const interval = setInterval(load, 2000); // Polling for new messages
        return () => clearInterval(interval);
    }, [currentUser.id, recipient.id]);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;
        const newMsg: Message = {
            id: db.generateId(),
            senderId: currentUser.id,
            senderName: currentUser.name,
            recipientId: recipient.id,
            content: inputText,
            timestamp: new Date().toISOString(),
            read: false
        };
        
        await db.sendMessage(newMsg);
        setMessages([...messages, newMsg]);
        setInputText('');

        // Mock Reply if chatting with AI or if it's a demo
        if (recipient.id.startsWith('mock_')) {
            setTimeout(async () => {
                 const reply: Message = {
                    id: db.generateId(),
                    senderId: recipient.id,
                    senderName: recipient.name,
                    recipientId: currentUser.id,
                    content: 'شكراً لرسالتك. سأقوم بالرد عليك قريباً.',
                    timestamp: new Date().toISOString(),
                    read: false
                };
                await db.sendMessage(reply);
                setMessages(prev => [...prev, reply]);
            }, 1500);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-slide-up">
            {/* Header */}
            <div className="bg-white border-b border-stone-100 p-4 flex items-center gap-4 rounded-t-2xl shadow-sm">
                 <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full text-slate-500"><ArrowRight size={20} /></button>
                 <div className="relative">
                     <img src={recipient.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${recipient.name}`} className="w-10 h-10 rounded-full bg-slate-100" />
                     <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                 </div>
                 <div>
                     <h3 className="font-bold text-navy-900">{recipient.name}</h3>
                     <p className="text-xs text-slate-500">{recipient.role === 'teacher' ? 'مدرس' : recipient.role === 'parent' ? 'ولي أمر' : 'طالب'}</p>
                 </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUser.id;
                    return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl ${isMe ? 'bg-navy-900 text-white rounded-tr-none' : 'bg-white text-navy-900 border border-stone-200 rounded-tl-none'}`}>
                            <p className="text-sm">{msg.content}</p>
                            <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-slate-300' : 'text-slate-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString('ar-IQ', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>
                    </div>
                )})}
                <div ref={endRef}></div>
            </div>

            {/* Input */}
            <div className="bg-white p-4 border-t border-stone-100 flex gap-2 rounded-b-2xl">
                 <button className="p-3 text-slate-400 hover:text-navy-900 transition-colors"><Mic size={20} /></button>
                 <input 
                    className="flex-1 bg-slate-100 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-gold-500/50"
                    placeholder="اكتب رسالتك..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                 />
                 <button onClick={handleSend} className="bg-navy-900 text-white p-3 rounded-xl hover:bg-navy-800 transition-colors">
                     <Send size={20} />
                 </button>
            </div>
        </div>
    );
};

// ============================================================================
//                               TEACHER SCREENS
// ============================================================================

const TeacherDashboard = ({ user, onNavigate }: { user: User, onNavigate: (screen: Screen) => void }) => {
    return (
        <div className="space-y-6 animate-slide-up">
            <header className="flex justify-between items-center mb-2">
                 <div>
                     <h1 className="text-2xl font-bold text-navy-900">مرحباً، {user.name}</h1>
                     <p className="text-slate-500">لديك 3 حصص اليوم</p>
                 </div>
                 <div className="w-12 h-12 bg-gold-100 rounded-full flex items-center justify-center text-gold-600 border border-gold-200">
                     <Users size={24} />
                 </div>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-gradient-to-br from-navy-900 to-navy-800 text-white border-none shadow-xl shadow-navy-900/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Check className="text-emerald-400" size={20} />
                        <span className="text-slate-200 text-sm">الحضور اليوم</span>
                    </div>
                    <div className="text-3xl font-bold">96%</div>
                </Card>
                <Card className="bg-white border-gold-200 border">
                    <div className="flex items-center gap-3 mb-2">
                        <Clock className="text-gold-600" size={20} />
                        <span className="text-slate-600 text-sm">الحصة القادمة</span>
                    </div>
                    <div className="text-xl font-bold text-navy-900">09:30 ص</div>
                    <div className="text-xs text-slate-500">الخامس العلمي (ب)</div>
                </Card>
            </div>

            {/* Tools Grid */}
            <h3 className="font-bold text-navy-900 text-lg mt-4">أدوات المعلم الذكية</h3>
            <div className="grid grid-cols-2 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-all group" onClick={() => onNavigate('EXAM_GENERATOR')}>
                    <div className="flex flex-col items-center gap-3 py-2">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-110 transition-transform">
                            <FileQuestion size={24} />
                        </div>
                        <span className="font-bold text-navy-900 text-sm">صانع الاختبارات</span>
                    </div>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-all group" onClick={() => onNavigate('CLASSES')}>
                    <div className="flex flex-col items-center gap-3 py-2">
                         <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Users size={24} />
                        </div>
                        <span className="font-bold text-navy-900 text-sm">إدارة الصفوف</span>
                    </div>
                </Card>
            </div>
            
            {/* Schedule */}
            <Card title="الجدول اليومي" icon={CalendarIcon}>
                <div className="space-y-4">
                    {db.classes.filter((c: any) => c.teacherId === user.id || c.teacherId === 't1').map((cls: any) => (
                        <div key={cls.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                             <div className="flex items-center gap-4">
                                 <div className="bg-white p-2 rounded-lg text-center min-w-[60px] border border-slate-200 shadow-sm">
                                     <span className="block text-xs text-slate-400 font-bold">بدء</span>
                                     <span className="block text-navy-900 font-bold">{cls.time.split(' ')[0]}</span>
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-navy-900">{cls.grade}</h4>
                                     <p className="text-xs text-slate-500">{cls.subject} • {cls.topic}</p>
                                 </div>
                             </div>
                             <Button variant="secondary" className="px-3 py-2 text-xs h-auto shadow-none" onClick={() => onNavigate('ATTENDANCE')}>
                                 سجل
                             </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const ExamGeneratorScreen = ({ onBack }: { onBack: () => void }) => {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<string | null>(null);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const { text } = await askAITutor(`قم بإنشاء اختبار قصير في مادة ${prompt}، يتكون من 3 أسئلة اختيار من متعدد وسؤال واحد شرح. نسق الإجابة بشكل جميل.`);
            setResult(text);
        } catch (e) {
            setResult("حدث خطأ في التوليد");
        }
        setLoading(false);
    };

    return (
        <div className="space-y-6 animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
                <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full"><ArrowRight /></button>
                <h1 className="text-xl font-bold text-navy-900">صانع الاختبارات الذكي</h1>
            </div>

            <Card className="p-4 space-y-4">
                <Input 
                    label="موضوع الاختبار" 
                    placeholder="مثال: الرياضيات - المعادلات التفاضلية" 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <Button onClick={handleGenerate} isLoading={loading} className="w-full">
                    <Sparkles size={18} /> توليد الاختبار
                </Button>
            </Card>

            {result && (
                <Card title="المسودة المقترحة" className="animate-fade-in bg-stone-50">
                    <div className="prose prose-sm text-right whitespace-pre-wrap font-medium text-navy-900 leading-relaxed">
                        {result}
                    </div>
                    <div className="mt-4 flex gap-2">
                        <Button variant="outline" className="flex-1 text-xs">تعديل</Button>
                        <Button className="flex-1 text-xs">اعتماد ونشر</Button>
                    </div>
                </Card>
            )}
        </div>
    );
};

const AttendanceScreen = () => {
    const [selectedClass, setSelectedClass] = useState(db.classes[0].id);
    const [attendance, setAttendance] = useState<Record<string, 'present'|'absent'|'late'>>({});
    const students = db.getAllStudents(); // In real app, filter by class

    const toggleStatus = (studentId: string) => {
        const current = attendance[studentId] || 'present';
        const next = current === 'present' ? 'absent' : current === 'absent' ? 'late' : 'present';
        setAttendance({...attendance, [studentId]: next});
    };

    const handleSave = async () => {
        const date = new Date().toISOString().split('T')[0];
        await db.saveAttendance(selectedClass, date, attendance);
        alert('تم حفظ سجل الحضور بنجاح!');
    };

    return (
        <div className="space-y-6 animate-slide-up pb-24">
            <h1 className="text-2xl font-bold text-navy-900">سجل الحضور</h1>
            
            <Select 
                options={db.classes.map((c: any) => ({label: c.grade + ' - ' + c.time, value: c.id}))}
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
            />

            <div className="space-y-3">
                {students.map((student: Student) => {
                    const status = attendance[student.id] || 'present';
                    const statusColors = {
                        present: 'bg-white border-emerald-200',
                        absent: 'bg-rose-50 border-rose-200',
                        late: 'bg-amber-50 border-amber-200'
                    };
                    return (
                        <div 
                            key={student.id} 
                            onClick={() => toggleStatus(student.id)}
                            className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${statusColors[status]}`}
                        >
                            <div className="flex items-center gap-3">
                                <img src={student.avatarUrl} className="w-10 h-10 rounded-full" />
                                <span className="font-bold text-navy-900">{student.name}</span>
                            </div>
                            <div className="flex gap-1">
                                <div className={`w-3 h-3 rounded-full ${status === 'present' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${status === 'absent' ? 'bg-rose-500' : 'bg-slate-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${status === 'late' ? 'bg-amber-500' : 'bg-slate-200'}`} />
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto">
                <Button className="w-full shadow-2xl" onClick={handleSave}>حفظ السجل</Button>
            </div>
        </div>
    );
};

// ============================================================================
//                               PARENT SCREENS
// ============================================================================

const ParentDashboard = ({ user, onSelectChild, onNavigate }: { user: User, onSelectChild: (child: Student) => void, onNavigate: (s: Screen) => void }) => {
    // Fetch real linked students
    const myChildren = db.getStudentsForParent(user.id);
    
    const totalDue = INITIAL_INVOICES.filter(i => myChildren.some(c => c.id === i.studentId) && i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="space-y-6 animate-slide-up">
            <header className="flex justify-between items-center">
                 <div>
                     <h1 className="text-2xl font-bold text-navy-900">مرحباً، {user.name.split(' ')[0]}</h1>
                     <p className="text-slate-500">لديك إشعاران جديدان</p>
                 </div>
                 <button className="p-2 bg-white rounded-full shadow-sm text-gold-500"><Bell /></button>
            </header>

            {/* Children Scroll */}
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
                {myChildren.map(student => (
                    <div key={student.id} onClick={() => onSelectChild(student)} className="min-w-[280px] bg-white rounded-2xl p-5 border border-stone-100 shadow-sm relative overflow-hidden group cursor-pointer hover:border-gold-300 transition-all">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gold-500" />
                        <div className="flex items-center gap-4 mb-4">
                            <img src={student.avatarUrl} alt={student.name} className="w-14 h-14 rounded-full border-2 border-white shadow-md group-hover:scale-105 transition-transform" />
                            <div>
                                <h3 className="font-bold text-lg text-navy-900">{student.name}</h3>
                                <p className="text-xs text-slate-500">{student.gradeLevel}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                            <div className="bg-slate-50 rounded-lg p-2">
                                <span className="block text-xs text-slate-400">المعدل</span>
                                <span className="block font-bold text-emerald-600">{student.gpa}%</span>
                            </div>
                            <div className="bg-slate-50 rounded-lg p-2">
                                <span className="block text-xs text-slate-400">الامتحان</span>
                                <span className="block font-bold text-navy-900 text-xs truncate">{student.nextExam?.split('-')[0] || 'لا يوجد'}</span>
                            </div>
                        </div>
                    </div>
                ))}
                <div onClick={() => onNavigate('REGISTER')} className="min-w-[100px] flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 cursor-pointer hover:bg-slate-50">
                    <UserPlus size={24} />
                    <span className="text-xs mt-2 font-medium">ربط طالب</span>
                </div>
            </div>

            {/* Financial Overview */}
            <Card title="الملخص المالي" icon={Wallet} action={<Button variant="ghost" className="text-xs px-2 py-1 h-auto" onClick={() => onNavigate('PAYMENTS')}>التفاصيل</Button>}>
                <div className="flex items-center justify-between">
                    <div>
                         <p className="text-sm text-slate-500">المبالغ المستحقة</p>
                         <p className="text-2xl font-bold text-navy-900">{totalDue.toLocaleString()} د.ع</p>
                    </div>
                    {totalDue > 0 ? (
                        <Button variant="danger" className="py-2 px-4 text-sm shadow-none">ادفع الآن</Button>
                    ) : (
                        <Badge color="green">واصل</Badge>
                    )}
                </div>
            </Card>

            <Card title="آخر التحديثات" icon={Bell}>
                <div className="space-y-4">
                    {INITIAL_ANNOUNCEMENTS.slice(0, 2).map(ann => (
                        <div key={ann.id} className="flex gap-3 items-start border-b border-stone-50 last:border-0 pb-3 last:pb-0">
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${ann.type === 'urgent' ? 'bg-red-500' : 'bg-blue-500'}`} />
                            <div>
                                <h4 className="font-bold text-sm text-navy-900">{ann.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">{ann.content}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

const ParentChildDetail = ({ student, onBack, onChat }: { student: Student, onBack: () => void, onChat: (r: any) => void }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'teachers'>('overview');

    // Get teachers for this student (Mock link)
    const myTeachers = INITIAL_TEACHERS.slice(0, 3); 

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="bg-navy-900 rounded-b-3xl -mx-4 -mt-6 p-6 pb-8 text-white relative mb-8 shadow-2xl shadow-navy-900/40">
                 <button onClick={onBack} className="absolute top-6 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><ArrowRight /></button>
                 <div className="flex flex-col items-center mt-4">
                     <img src={student.avatarUrl} className="w-24 h-24 rounded-full border-4 border-gold-500 mb-3 shadow-lg" />
                     <h2 className="text-2xl font-bold">{student.name}</h2>
                     <p className="text-slate-300">{student.gradeLevel}</p>
                 </div>
            </div>

            {/* Tabs */}
            <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                <button onClick={() => setActiveTab('overview')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-navy-900 text-white shadow-md' : 'text-slate-500'}`}>نظرة عامة</button>
                <button onClick={() => setActiveTab('teachers')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'teachers' ? 'bg-navy-900 text-white shadow-md' : 'text-slate-500'}`}>المدرسين</button>
            </div>

            {activeTab === 'overview' ? (
                <>
                    <div className="grid grid-cols-2 gap-4">
                        <Card className="flex flex-col items-center p-4">
                            <span className="text-3xl font-bold text-emerald-600">{student.gpa}%</span>
                            <span className="text-xs text-slate-500 mt-1">المعدل العام</span>
                        </Card>
                        <Card className="flex flex-col items-center p-4">
                            <span className="text-3xl font-bold text-navy-900">{student.attendance}%</span>
                            <span className="text-xs text-slate-500 mt-1">نسبة الحضور</span>
                        </Card>
                    </div>

                    <Card title="الدرجات الأخيرة" icon={GraduationCap}>
                        {INITIAL_GRADES.filter(g => g.studentId === student.id).map((g, i) => (
                            <div key={i} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                                <div>
                                    <span className="font-bold text-navy-800 block">{g.subject}</span>
                                    <span className="text-[10px] text-slate-400">{g.type} • {g.date}</span>
                                </div>
                                <Badge color={g.score > 45 ? 'green' : g.score > 40 ? 'blue' : 'red'}>
                                    {g.score}/{g.total}
                                </Badge>
                            </div>
                        ))}
                    </Card>
                </>
            ) : (
                <div className="space-y-4">
                    {myTeachers.map(t => (
                        <Card key={t.id}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={t.avatarUrl} className="w-12 h-12 rounded-full bg-slate-100" />
                                    <div>
                                        <h3 className="font-bold text-navy-900">{t.name}</h3>
                                        <p className="text-xs text-slate-500">{t.subject}</p>
                                    </div>
                                </div>
                                <Button 
                                    variant="outline" 
                                    className="px-3 py-2 h-auto text-xs" 
                                    onClick={() => onChat({id: t.id, name: t.name, role: 'teacher', avatar: t.avatarUrl})}
                                >
                                    <MessageCircle size={16} />
                                    مراسلة
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
//                               STUDENT SCREENS
// ============================================================================

const StudentDashboard = ({ user, onNavigate }: { user: User, onNavigate: (s: Screen) => void }) => {
    // Find the student record associated with this user
    const student = db.getStudentById(user.id) || INITIAL_STUDENTS[0];

    return (
        <div className="space-y-6 animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-navy-900">مرحباً، {student.name.split(' ')[0]} 👋</h1>
                    <p className="text-slate-500 text-sm">جاهز لرحلة التعلم اليوم؟</p>
                </div>
                <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src={student.avatarUrl} alt="Avatar" />
                </div>
            </div>

            {/* AI Action Card */}
            <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10">
                    <h2 className="text-xl font-bold mb-2">مساعدك الذكي جاهز!</h2>
                    <p className="text-slate-300 text-sm mb-4 max-w-[80%]">اسألني في أي مادة، أو دعنا نراجع للامتحان القادم.</p>
                    <div className="flex gap-3">
                        <Button variant="secondary" className="px-4 py-2 text-sm shadow-none border-none" onClick={() => onNavigate('LIVE_VOICE')}>
                            <Mic size={16} /> تحدث الآن
                        </Button>
                        <Button variant="outline" className="px-4 py-2 text-sm border-white/20 text-white hover:bg-white/10" onClick={() => onNavigate('AI_TUTOR')}>
                            <MessageCircle size={16} /> دردشة
                        </Button>
                    </div>
                </div>
                <Sparkles className="absolute -bottom-4 -left-4 text-white/5 w-40 h-40" />
            </div>

            {/* Tools Grid */}
            <h3 className="font-bold text-navy-900 text-lg">أدواتي</h3>
            <div className="grid grid-cols-2 gap-4">
                 <Card className="hover:shadow-md transition-all cursor-pointer bg-purple-50 border-purple-100" title="" onClick={() => onNavigate('STUDIO')}>
                    <div className="flex flex-col items-center py-2 text-purple-700">
                        <Palette size={32} className="mb-2" />
                        <span className="font-bold">استوديو الإبداع</span>
                    </div>
                 </Card>
                 <Card className="hover:shadow-md transition-all cursor-pointer bg-blue-50 border-blue-100" onClick={() => onNavigate('STUDENT_TEACHERS')}>
                    <div className="flex flex-col items-center py-2 text-blue-700">
                        <Users size={32} className="mb-2" />
                        <span className="font-bold">مدرسيني</span>
                    </div>
                 </Card>
            </div>

            {/* Schedule */}
            <Card title="جدول اليوم" icon={CalendarIcon}>
                <div className="space-y-3">
                    {INITIAL_CLASSES.slice(0, 2).map((cls, i) => (
                        <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                            <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center border border-slate-200 text-xs font-bold text-navy-900 shrink-0">
                                <span>{cls.time.split(':')[0]}</span>
                                <span className="text-[10px] text-slate-400">{cls.time.split(' ')[1]}</span>
                            </div>
                            <div>
                                <h4 className="font-bold text-navy-900">{cls.subject}</h4>
                                <p className="text-xs text-slate-500">{cls.topic}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

const AITutorScreen = ({ onBack }: { onBack: () => void }) => {
    // Reusing Chat UI but logic for AI
    const [messages, setMessages] = useState<Message[]>([
        {id: '0', senderId: 'ai', senderName: 'المعلم الذكي', recipientId: 'me', content: 'أهلاً بك! أنا معلمك الذكي. كيف يمكنني مساعدتك في دراستك اليوم؟', timestamp: new Date().toISOString(), read: true}
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const endRef = useRef<HTMLDivElement>(null);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg: Message = { id: Date.now().toString(), senderId: 'me', senderName: 'أنا', recipientId: 'ai', content: input, timestamp: new Date().toISOString(), read: true };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const { text } = await askAITutor(input);
            const aiMsg: Message = { id: (Date.now()+1).toString(), senderId: 'ai', senderName: 'المعلم الذكي', recipientId: 'me', content: text, timestamp: new Date().toISOString(), read: true };
            setMessages(prev => [...prev, aiMsg]);
        } catch (e) {
            // Error handling
        }
        setLoading(false);
    };

    useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}); }, [messages]);

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] animate-slide-up">
            <div className="bg-white border-b p-4 flex items-center gap-2">
                <button onClick={onBack}><ArrowRight /></button>
                <h2 className="font-bold text-navy-900">المعلم الذكي AI</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
                         <div className={`max-w-[85%] p-3 rounded-2xl ${m.senderId === 'me' ? 'bg-navy-900 text-white' : 'bg-white border text-navy-900'}`}>
                             {m.content}
                         </div>
                    </div>
                ))}
                {loading && <div className="text-center text-slate-400 text-sm">جاري التفكير...</div>}
                <div ref={endRef}></div>
            </div>
            <div className="p-4 bg-white border-t flex gap-2">
                <input className="flex-1 bg-slate-100 rounded-xl px-4 py-2" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="اسأل سؤالاً..." />
                <button onClick={handleSend} className="p-2 bg-navy-900 text-white rounded-xl"><Send /></button>
            </div>
        </div>
    );
}

const LiveVoiceScreen = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center space-y-8 animate-slide-up relative">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-navy-50 pointer-events-none" />
             <div className="w-48 h-48 bg-gradient-to-tr from-rose-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-rose-500/30 ring-4 ring-rose-100 relative z-10">
                 <Mic size={80} className="text-white drop-shadow-md" />
                 <div className="absolute inset-0 rounded-full border border-white/30 animate-[ping_2s_ease-in-out_infinite]" />
             </div>
             <div className="relative z-10">
                <h2 className="text-3xl font-bold text-navy-900 mb-2">جاري الاستماع...</h2>
                <p className="text-slate-500 max-w-xs mx-auto">تحدث مع المعلم الذكي بالصوت الطبيعي. يمكنك السؤال عن أي مسألة.</p>
             </div>
             <Button variant="danger" className="rounded-full w-16 h-16 p-0 z-10 shadow-lg hover:shadow-xl hover:scale-105 transition-all"><X size={32} /></Button>
        </div>
    ); 
};

// ============================================================================
//                               AUTH & REGISTRATION
// ============================================================================

const RegisterScreen = ({ onBack, onComplete }: { onBack: () => void, onComplete: () => void }) => {
    const [role, setRole] = useState<UserRole>(UserRole.PARENT);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [studentCode, setStudentCode] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRegister = async () => {
        if(!name) return;
        setLoading(true);
        const newUser: User = {
            id: db.generateId(),
            name,
            role,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
            email
        };
        await db.registerUser(newUser);
        alert('تم إنشاء الحساب بنجاح! يمكنك الدخول الآن.');
        onComplete();
    };

    return (
        <div className="min-h-screen p-6 flex flex-col animate-slide-up pb-20 bg-slate-50">
             <button onClick={onBack} className="self-end p-2 mb-4 bg-white rounded-full shadow-sm"><X /></button>
             <h1 className="text-3xl font-bold text-navy-900 mb-6">إنشاء حساب جديد</h1>

             <div className="flex bg-white p-1 rounded-xl mb-8 shadow-sm border border-stone-200">
                 {[UserRole.PARENT, UserRole.STUDENT, UserRole.TEACHER].map(r => (
                     <button 
                        key={r}
                        onClick={() => setRole(r)}
                        className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${role === r ? 'bg-navy-900 text-white shadow-md' : 'text-slate-400 hover:text-navy-900'}`}
                     >
                         {r === UserRole.PARENT ? 'ولي أمر' : r === UserRole.STUDENT ? 'طالب' : 'مدرس'}
                     </button>
                 ))}
             </div>

             <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                 <Input label="الاسم الثلاثي" placeholder="مثال: علي حسن كريم" value={name} onChange={e => setName(e.target.value)} />
                 <Input label="رقم الهاتف / البريد" placeholder="example@gmail.com" value={email} onChange={e => setEmail(e.target.value)} icon={Mail} />
                 <Input label="كلمة المرور" type="password" />

                 {role === UserRole.PARENT && (
                     <div className="bg-gold-50 border border-gold-200 rounded-xl p-4 mt-4">
                         <h3 className="font-bold text-navy-900 mb-2 flex items-center gap-2"><LinkIcon size={16}/> ربط الأبناء</h3>
                         <div className="flex gap-2">
                             <input 
                                className="flex-1 border rounded-lg px-3 py-2 text-sm" 
                                placeholder="رمز الطالب (مثال: s1)"
                                value={studentCode}
                                onChange={e => setStudentCode(e.target.value)}
                             />
                             <Button variant="secondary" className="py-2 px-4 text-sm shadow-none">تحقق</Button>
                         </div>
                     </div>
                 )}

                 <Button className="w-full mt-8" onClick={handleRegister} isLoading={loading}>إنشاء الحساب</Button>
             </div>
        </div>
    );
}

// ============================================================================
//                               MAIN APP
// ============================================================================

export default function App() {
  const [screen, setScreen] = useState<Screen>('SPLASH');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedChild, setSelectedChild] = useState<Student | null>(null);
  const [chatRecipient, setChatRecipient] = useState<any | null>(null);

  // Splash Effect
  useEffect(() => {
    setTimeout(() => setScreen('LOGIN'), 3000);
  }, []);

  const handleLogin = async (userId: string) => {
    const user = await db.login(userId);
    if (user) {
        setCurrentUser(user);
        if (user.role === UserRole.PARENT) setScreen('PARENT_DASH');
        else if (user.role === UserRole.STUDENT) setScreen('STUDENT_DASH');
        else setScreen('TEACHER_DASH');
    }
  };

  const startChat = (recipient: any) => {
      setChatRecipient(recipient);
      setScreen('CHAT');
  };

  const renderScreen = () => {
    if (screen === 'CHAT' && chatRecipient && currentUser) return <ChatScreen currentUser={currentUser} recipient={chatRecipient} onBack={() => setScreen(currentUser.role === UserRole.PARENT ? 'CHILD_DETAIL' : currentUser.role === UserRole.TEACHER ? 'TEACHER_DASH' : 'STUDENT_TEACHERS')} />;
    if (screen === 'REGISTER') return <RegisterScreen onBack={() => setScreen('LOGIN')} onComplete={() => setScreen('LOGIN')} />;
    
    // Safety check
    if (!currentUser && screen !== 'SPLASH' && screen !== 'LOGIN') return <div onClick={() => setScreen('LOGIN')}>خطأ: الرجاء تسجيل الدخول</div>;

    switch (screen) {
      case 'SPLASH':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen bg-navy-900 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')]"></div>
            <div className="w-32 h-32 bg-gold-500 rounded-3xl rotate-45 flex items-center justify-center animate-slide-up shadow-[0_0_50px_rgba(245,158,11,0.5)]">
               <div className="-rotate-45 text-navy-900 font-black text-6xl">ر</div>
            </div>
            <h1 className="text-white text-3xl font-bold mt-12 tracking-wide animate-fade-in">{APP_NAME}</h1>
          </div>
        );
      case 'LOGIN': 
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 relative z-10 animate-slide-up">
                <div className="w-full max-w-sm space-y-6">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-navy-900 rounded-2xl mx-auto flex items-center justify-center rotate-45 mb-4 shadow-xl">
                            <div className="-rotate-45 text-gold-500 font-black text-2xl">ر</div>
                        </div>
                        <h1 className="text-3xl font-black text-navy-900">{APP_NAME}</h1>
                    </div>
                    {/* Quick Login Buttons for Demo */}
                    <div className="space-y-3">
                        <Button onClick={() => handleLogin('p1')} className="w-full justify-between"><span>دخول (ولي أمر)</span><ArrowRight/></Button>
                        <Button onClick={() => handleLogin('s1')} variant="secondary" className="w-full justify-between"><span>دخول (طالب)</span><ArrowRight/></Button>
                        <Button onClick={() => handleLogin('t1')} variant="outline" className="w-full justify-between"><span>دخول (مدرس)</span><ArrowRight/></Button>
                    </div>
                     <div className="text-center pt-8 border-t border-slate-200 mt-8">
                        <p className="text-slate-500 text-sm">ليس لديك حساب؟ <button onClick={() => setScreen('REGISTER')} className="text-gold-600 font-bold hover:underline">سجل الآن</button></p>
                    </div>
                </div>
            </div>
        );
      
      // Teacher
      case 'TEACHER_DASH': return <TeacherDashboard user={currentUser!} onNavigate={setScreen} />;
      case 'CLASSES': return <div className="p-4"><h1 className="text-xl font-bold mb-4">صفوفي</h1>{INITIAL_CLASSES.map(c => <Card key={c.id} className="mb-4 p-4"><div className="font-bold">{c.grade}</div><Button className="mt-2 text-xs h-auto py-1" onClick={() => setScreen('TEACHER_DASH')}>عودة</Button></Card>)}</div>;
      case 'ATTENDANCE': return <AttendanceScreen />;
      case 'EXAM_GENERATOR': return <ExamGeneratorScreen onBack={() => setScreen('TEACHER_DASH')} />;
      
      // Parent
      case 'PARENT_DASH': return <ParentDashboard user={currentUser!} onSelectChild={(c) => {setSelectedChild(c); setScreen('CHILD_DETAIL')}} onNavigate={setScreen} />;
      case 'CHILD_DETAIL': return <ParentChildDetail student={selectedChild!} onBack={() => setScreen('PARENT_DASH')} onChat={startChat} />;
      case 'PAYMENTS': return <div className="p-4"><h1 className="text-xl font-bold mb-4">المدفوعات</h1>{INITIAL_INVOICES.map(i => <Card key={i.id} className="mb-4 p-4 flex justify-between"><span>{i.title}</span><Badge color="red">{i.amount}</Badge></Card>)}<Button onClick={() => setScreen('PARENT_DASH')}>عودة</Button></div>;
      
      // Student
      case 'STUDENT_DASH': return <StudentDashboard user={currentUser!} onNavigate={setScreen} />;
      case 'AI_TUTOR': return <AITutorScreen onBack={() => setScreen('STUDENT_DASH')} />;
      case 'LIVE_VOICE': return <LiveVoiceScreen />;
      case 'STUDENT_TEACHERS': return <div className="p-4 space-y-4"><h2 className="font-bold text-xl">مدرسيني</h2>{INITIAL_TEACHERS.map(t => <Card key={t.id} className="flex justify-between items-center p-4"><span>{t.name}</span><Button onClick={() => startChat({id: t.id, name: t.name, role: 'teacher', avatar: t.avatarUrl})} className="h-auto py-1 px-3 text-xs"><MessageCircle size={16}/></Button></Card>)}<Button variant="ghost" onClick={() => setScreen('STUDENT_DASH')}>عودة</Button></div>;

      default: return <div>Screen not found</div>;
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#fdfbf7] relative shadow-2xl overflow-hidden font-['Tajawal']">
      {/* Top Nav */}
      {screen !== 'SPLASH' && screen !== 'LOGIN' && screen !== 'REGISTER' && screen !== 'CHAT' && (
          <div className="sticky top-0 bg-[#fdfbf7]/95 backdrop-blur-md z-40 px-4 py-3 flex justify-between items-center border-b border-stone-100 shadow-sm">
              <Menu className="text-navy-900" />
              <span className="font-bold text-navy-900 text-lg tracking-tight">{APP_NAME}</span>
              <img 
                src={currentUser?.avatarUrl} 
                className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300" 
                onClick={() => {setCurrentUser(null); setScreen('LOGIN');}} // Logout
              />
          </div>
      )}

      <main className={`p-4 ${screen === 'SPLASH' || screen === 'LOGIN' ? 'p-0' : ''}`}>
        {renderScreen()}
      </main>

      {/* Bottom Nav */}
      {screen !== 'SPLASH' && screen !== 'LOGIN' && screen !== 'REGISTER' && screen !== 'CHAT' && screen !== 'LIVE_VOICE' && currentUser && (
        <div className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-lg border-t border-stone-100 flex justify-around py-3 pb-6 text-xs font-medium text-slate-400 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
           {currentUser.role === UserRole.TEACHER ? (
               <>
                 <button onClick={() => setScreen('TEACHER_DASH')} className={`${screen === 'TEACHER_DASH' ? 'text-navy-900 scale-110' : ''} flex flex-col items-center gap-1 transition-all`}>
                    <Home size={24} /> الرئيسة
                 </button>
                 <button onClick={() => setScreen('CLASSES')} className={`${screen === 'CLASSES' ? 'text-navy-900 scale-110' : ''} flex flex-col items-center gap-1 transition-all`}>
                    <Users size={24} /> الصفوف
                 </button>
               </>
           ) : currentUser.role === UserRole.PARENT ? (
                <>
                 <button onClick={() => setScreen('PARENT_DASH')} className={`${screen === 'PARENT_DASH' ? 'text-navy-900 scale-110' : ''} flex flex-col items-center gap-1 transition-all`}>
                    <Home size={24} /> الرئيسة
                 </button>
                 <button onClick={() => setScreen('PAYMENTS')} className={`${screen === 'PAYMENTS' ? 'text-navy-900 scale-110' : ''} flex flex-col items-center gap-1 transition-all`}>
                    <Wallet size={24} /> المالية
                 </button>
                </>
           ) : (
                <>
                 <button onClick={() => setScreen('STUDENT_DASH')} className={`${screen === 'STUDENT_DASH' ? 'text-navy-900 scale-110' : ''} flex flex-col items-center gap-1 transition-all`}>
                    <Home size={24} /> الرئيسة
                 </button>
                 <button onClick={() => setScreen('STUDENT_TEACHERS')} className={`${screen === 'STUDENT_TEACHERS' ? 'text-navy-900 scale-110' : ''} flex flex-col items-center gap-1 transition-all`}>
                    <Users size={24} /> مدرسيني
                 </button>
                </>
           )}
        </div>
      )}
    </div>
  );
}