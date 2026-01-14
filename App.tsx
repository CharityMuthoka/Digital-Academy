
import React, { useState, useEffect, useCallback } from 'react';
import { ViewState, User, Course, Lesson } from './types';
import { COURSES } from './constants';
import { askTutor } from './services/geminiService';
import { 
  BookOpen, 
  LayoutDashboard, 
  User as UserIcon, 
  LogOut, 
  Search, 
  CheckCircle2, 
  Lock, 
  CreditCard, 
  MessageSquare, 
  Send,
  Zap,
  Award,
  Clock,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');
  const [user, setUser] = useState<User>({
    name: 'Alex Student',
    email: 'alex@example.com',
    avatar: 'https://picsum.photos/seed/student/100/100',
    isLoggedIn: false,
    balance: 150.00
  });
  const [courses, setCourses] = useState<Course[]>(COURSES);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'tutor'; text: string }[]>([]);
  const [isTutorLoading, setIsTutorLoading] = useState(false);

  // Persistence check (Simulated)
  useEffect(() => {
    const savedUser = localStorage.getItem('skillbridge_user');
    if (savedUser) {
      // setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = () => {
    setUser(prev => ({ ...prev, isLoggedIn: true }));
    setView('dashboard');
  };

  const handleLogout = () => {
    setUser(prev => ({ ...prev, isLoggedIn: false }));
    setView('landing');
  };

  const handleEnroll = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    if (!course) return;
    
    if (user.balance < course.price) {
      alert("Insufficient balance! Please add funds.");
      return;
    }

    setIsPaying(true);
    setTimeout(() => {
      setCourses(prev => prev.map(c => 
        c.id === courseId ? { ...c, enrolled: true } : c
      ));
      setUser(prev => ({ ...prev, balance: prev.balance - course.price }));
      setIsPaying(false);
      alert(`Successfully enrolled in ${course.title}!`);
    }, 1500);
  };

  const toggleLessonCompletion = (courseId: string, lessonId: string) => {
    setCourses(prev => prev.map(c => {
      if (c.id === courseId) {
        const newLessons = c.lessons.map(l => l.id === lessonId ? { ...l, completed: !l.completed } : l);
        const completedCount = newLessons.filter(l => l.completed).length;
        const newProgress = Math.round((completedCount / newLessons.length) * 100);
        return { ...c, lessons: newLessons, progress: newProgress };
      }
      return c;
    }));
  };

  const handleAskTutor = async () => {
    if (!chatMessage.trim() || !selectedCourse) return;
    const msg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsTutorLoading(true);
    
    const response = await askTutor(selectedCourse.title, msg);
    setChatHistory(prev => [...prev, { role: 'tutor', text: response }]);
    setIsTutorLoading(false);
  };

  // Dashboard Stat Data
  const progressData = courses.filter(c => c.enrolled).map(c => ({
    name: c.title.substring(0, 10) + '...',
    progress: c.progress
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView(user.isLoggedIn ? 'dashboard' : 'landing')}>
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <Zap size={24} />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                SkillBridge
              </span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              {user.isLoggedIn && (
                <>
                  <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 font-medium ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
                    <LayoutDashboard size={18} /> Dashboard
                  </button>
                  <button onClick={() => setView('course-catalog')} className={`flex items-center gap-2 font-medium ${view === 'course-catalog' || view === 'course-detail' ? 'text-indigo-600' : 'text-gray-600 hover:text-indigo-600'}`}>
                    <BookOpen size={18} /> Courses
                  </button>
                </>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {user.isLoggedIn ? (
                <div className="flex items-center space-x-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                    <p className="text-xs text-green-600 font-medium">${user.balance.toFixed(2)}</p>
                  </div>
                  <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="Profile" />
                  <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <button onClick={handleLogin} className="bg-indigo-600 text-white px-5 py-2 rounded-full font-medium hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg">
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow">
        {view === 'landing' && <LandingView onGetStarted={handleLogin} />}
        
        {view === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name.split(' ')[0]}! 👋</h1>
              <p className="text-gray-600 mt-1">Check your latest learning activity and progress.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Stats & Progress */}
              <div className="lg:col-span-2 space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><BookOpen size={24} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrolled</p>
                      <p className="text-2xl font-bold">{courses.filter(c => c.enrolled).length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle2 size={24} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Completed</p>
                      <p className="text-2xl font-bold">{courses.filter(c => c.progress === 100).length}</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Award size={24} /></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Certificates</p>
                      <p className="text-2xl font-bold">{courses.filter(c => c.progress === 100).length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Course Progress (%)</h2>
                  {progressData.length > 0 ? (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                          <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                          />
                          <Bar dataKey="progress" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                      <Search size={48} className="mb-4 opacity-20" />
                      <p>Enroll in a course to see your progress here.</p>
                      <button onClick={() => setView('course-catalog')} className="mt-4 text-indigo-600 font-semibold hover:underline">
                        Browse Catalog
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Continue Learning</h2>
                  <div className="space-y-4">
                    {courses.filter(c => c.enrolled && c.progress < 100).map(course => (
                      <div key={course.id} className="flex items-center p-4 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors cursor-pointer"
                           onClick={() => { setSelectedCourse(course); setView('course-detail'); }}>
                        <img src={course.thumbnail} className="w-16 h-12 object-cover rounded-lg" alt="" />
                        <div className="ml-4 flex-grow">
                          <h3 className="font-semibold text-gray-900">{course.title}</h3>
                          <div className="flex items-center mt-1">
                            <div className="w-full bg-gray-100 rounded-full h-1.5 max-w-xs">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                            </div>
                            <span className="ml-3 text-xs font-medium text-gray-500">{course.progress}%</span>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-300" size={20} />
                      </div>
                    ))}
                    {courses.filter(c => c.enrolled && c.progress < 100).length === 0 && (
                      <p className="text-center text-gray-500 py-4 italic">No active courses. Time to pick a new one!</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-2xl text-white shadow-xl">
                  <h3 className="text-xl font-bold mb-2">Upgrade Your Skills</h3>
                  <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Unlock lifetime access to over 50+ professional tech courses and real-world projects.</p>
                  <button onClick={() => setView('course-catalog')} className="w-full bg-white text-indigo-600 py-3 rounded-xl font-bold shadow-lg hover:bg-indigo-50 transition-colors">
                    Explore New Courses
                  </button>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 mb-6">Upcoming Events</h2>
                  <div className="space-y-4">
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex flex-col items-center justify-center font-bold">
                        <span className="text-xs uppercase">Oct</span>
                        <span className="text-lg">12</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">React 19 Workshop</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Live Session • 4:00 PM</p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0 w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex flex-col items-center justify-center font-bold">
                        <span className="text-xs uppercase">Oct</span>
                        <span className="text-lg">15</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm">Web Security Q&A</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Community Hall • 2:00 PM</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'course-catalog' && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Course Catalog</h1>
                <p className="text-gray-600 mt-1">Choose from our curated collection of technical tracks.</p>
              </div>
              <div className="flex items-center bg-white border border-gray-200 rounded-full px-4 py-2 w-full md:w-80 shadow-sm">
                <Search size={18} className="text-gray-400 mr-2" />
                <input type="text" placeholder="Search courses..." className="bg-transparent border-none outline-none text-sm w-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {courses.map(course => (
                <div key={course.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group flex flex-col">
                  <div className="relative aspect-video overflow-hidden">
                    <img src={course.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" alt={course.title} />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-indigo-600 shadow-sm">
                      {course.category}
                    </div>
                    {course.enrolled && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white p-1 rounded-full shadow-lg">
                        <CheckCircle2 size={16} />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <h3 className="font-bold text-gray-900 line-clamp-2 leading-tight h-10 mb-2">{course.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{course.description}</p>
                    
                    <div className="flex items-center text-xs text-gray-400 space-x-4 mb-6">
                      <span className="flex items-center gap-1"><Clock size={14} /> {course.lessons.length} Lessons</span>
                      <span className="flex items-center gap-1"><UserIcon size={14} /> 1.2k Students</span>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      {course.enrolled ? (
                        <button 
                          onClick={() => { setSelectedCourse(course); setView('course-detail'); }}
                          className="w-full bg-indigo-50 text-indigo-600 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors"
                        >
                          Continue
                        </button>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xl font-black text-gray-900">${course.price}</span>
                          <button 
                            onClick={() => { setSelectedCourse(course); setView('course-detail'); }}
                            className="bg-gray-900 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
                          >
                            View Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'course-detail' && selectedCourse && (
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <button onClick={() => setView(selectedCourse.enrolled ? 'dashboard' : 'course-catalog')} className="flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-6 transition-colors">
              <ChevronRight className="rotate-180 mr-1" size={16} /> Back to {selectedCourse.enrolled ? 'Dashboard' : 'Catalog'}
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Content / Video */}
              <div className="lg:col-span-2">
                <div className="bg-gray-900 aspect-video rounded-3xl overflow-hidden shadow-2xl relative mb-8 group">
                  {selectedCourse.enrolled ? (
                    selectedLesson ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800 text-white p-12 text-center">
                        <div>
                          <h2 className="text-3xl font-bold mb-4">{selectedLesson.title}</h2>
                          <p className="text-gray-400 text-lg leading-relaxed max-w-lg mx-auto">
                            {selectedLesson.content}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white">
                        <BookOpen size={64} className="mb-4 text-indigo-400 opacity-50" />
                        <h2 className="text-2xl font-bold">Select a lesson to start learning</h2>
                      </div>
                    )
                  ) : (
                    <div className="w-full h-full relative">
                      <img src={selectedCourse.thumbnail} className="w-full h-full object-cover blur-sm opacity-50" alt="" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                        <div className="p-4 bg-white/10 backdrop-blur-md rounded-full mb-6">
                          <Lock size={48} className="text-indigo-400" />
                        </div>
                        <h2 className="text-3xl font-bold mb-3">Content Locked</h2>
                        <p className="text-gray-300 max-w-sm mb-8">Purchase this course for ${selectedCourse.price} to unlock all lessons and materials.</p>
                        <button 
                          onClick={() => handleEnroll(selectedCourse.id)}
                          disabled={isPaying}
                          className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
                        >
                          {isPaying ? "Processing..." : <><CreditCard size={20} /> Enroll Now</>}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Lesson Header */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{selectedCourse.title}</h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-bold uppercase tracking-wide text-[10px]">{selectedCourse.category}</span>
                    <span className="flex items-center gap-1"><Clock size={14} /> 4.5 Hours Total</span>
                    <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle2 size={14} /> Certificate Included</span>
                  </div>
                </div>

                {/* AI Tutor Chat */}
                {selectedCourse.enrolled && (
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[400px]">
                    <div className="p-4 border-b border-gray-100 bg-indigo-50/50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                          <MessageSquare size={16} />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm leading-none">AI Study Assistant</h3>
                          <p className="text-[10px] text-gray-500 mt-1">Ask anything about {selectedCourse.title}</p>
                        </div>
                      </div>
                      <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                    </div>
                    
                    <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50">
                      {chatHistory.length === 0 && (
                        <div className="text-center py-8">
                          <div className="bg-white w-12 h-12 rounded-full shadow-sm mx-auto flex items-center justify-center text-indigo-600 mb-3">
                            <Zap size={20} />
                          </div>
                          <p className="text-sm text-gray-400 max-w-[200px] mx-auto">Ask me a question about the course materials!</p>
                        </div>
                      )}
                      {chatHistory.map((chat, idx) => (
                        <div key={idx} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                            chat.role === 'user' 
                              ? 'bg-indigo-600 text-white rounded-tr-none' 
                              : 'bg-white border border-gray-200 text-gray-700 rounded-tl-none shadow-sm'
                          }`}>
                            {chat.text}
                          </div>
                        </div>
                      ))}
                      {isTutorLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white border border-gray-200 px-4 py-2.5 rounded-2xl rounded-tl-none flex space-x-1">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 border-t border-gray-100 bg-white">
                      <form onSubmit={(e) => { e.preventDefault(); handleAskTutor(); }} className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="Type your question..." 
                          className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                        />
                        <button 
                          disabled={!chatMessage.trim() || isTutorLoading}
                          className="bg-indigo-600 text-white p-2 rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                        >
                          <Send size={20} />
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar: Lessons */}
              <div className="space-y-6">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-lg">Course Lessons</h3>
                    <p className="text-sm text-gray-500">{selectedCourse.lessons.length} total units</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {selectedCourse.lessons.map((lesson, idx) => (
                      <div 
                        key={lesson.id} 
                        className={`p-4 flex items-center justify-between group transition-colors ${
                          selectedLesson?.id === lesson.id ? 'bg-indigo-50/50' : 'hover:bg-gray-50'
                        } ${!selectedCourse.enrolled && idx > 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        onClick={() => {
                          if (selectedCourse.enrolled || idx === 0) {
                            setSelectedLesson(lesson);
                          }
                        }}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                            lesson.completed 
                              ? 'bg-green-100 text-green-600' 
                              : selectedLesson?.id === lesson.id ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {lesson.completed ? <CheckCircle2 size={16} /> : idx + 1}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${selectedLesson?.id === lesson.id ? 'text-indigo-600' : 'text-gray-900'}`}>{lesson.title}</h4>
                            <p className="text-[10px] text-gray-400">{lesson.duration}</p>
                          </div>
                        </div>
                        {selectedCourse.enrolled ? (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLessonCompletion(selectedCourse.id, lesson.id);
                            }}
                            className={`p-1 rounded-md transition-colors ${lesson.completed ? 'text-green-500' : 'text-gray-300 hover:text-indigo-400'}`}
                          >
                            <CheckCircle2 size={18} />
                          </button>
                        ) : (
                          idx > 0 && <Lock size={14} className="text-gray-300" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold mb-4">Course Highlights</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="mt-1 text-indigo-500"><Zap size={16} /></div>
                      Practical, hands-on projects
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="mt-1 text-indigo-500"><Award size={16} /></div>
                      Verified digital certificate
                    </li>
                    <li className="flex items-start gap-3 text-sm text-gray-600">
                      <div className="mt-1 text-indigo-500"><MessageSquare size={16} /></div>
                      Support from tech mentors
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-indigo-600 p-2 rounded-lg text-white">
                  <Zap size={20} />
                </div>
                <span className="text-xl font-bold">SkillBridge</span>
              </div>
              <p className="text-gray-500 max-w-sm mb-6">
                The most flexible and affordable way for students to learn high-demand tech skills. From basic computer packages to advanced web architecture.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-indigo-600 cursor-pointer">All Courses</li>
                <li className="hover:text-indigo-600 cursor-pointer">Learning Paths</li>
                <li className="hover:text-indigo-600 cursor-pointer">Certificates</li>
                <li className="hover:text-indigo-600 cursor-pointer">Pricing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li className="hover:text-indigo-600 cursor-pointer">Help Center</li>
                <li className="hover:text-indigo-600 cursor-pointer">Contact Us</li>
                <li className="hover:text-indigo-600 cursor-pointer">Terms of Service</li>
                <li className="hover:text-indigo-600 cursor-pointer">Privacy Policy</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 mt-12 pt-8 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} SkillBridge Academy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

// Landing View Component
const LandingView: React.FC<{ onGetStarted: () => void }> = ({ onGetStarted }) => {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-widest mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-500 mr-2 animate-ping"></span>
            Elevate Your Career
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 tracking-tight">
            Bridge the Gap Between <br />
            <span className="text-indigo-600">Curiosity and Code.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
            Join 5,000+ students mastering Computer Basics, Microsoft Office, and Full-Stack Web Development on the world's most intuitive LMS.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={onGetStarted} className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-700 hover:-translate-y-1 transition-all">
              Start Learning Now
            </button>
            <button className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-2xl font-bold text-lg shadow-sm hover:bg-gray-50 transition-all">
              Browse Courses
            </button>
          </div>
        </div>
      </div>

      {/* Feature Section */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="bg-indigo-50 w-12 h-12 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Visual Dashboard</h3>
              <p className="text-gray-500 leading-relaxed">Track your completion percentage, lesson history, and certificates in one beautiful interface.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="bg-violet-50 w-12 h-12 rounded-xl flex items-center justify-center text-violet-600 mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">AI Tutor Support</h3>
              <p className="text-gray-500 leading-relaxed">Get instant explanations for complex concepts directly within your lessons using Gemini AI.</p>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <div className="bg-amber-50 w-12 h-12 rounded-xl flex items-center justify-center text-amber-600 mb-6">
                <CreditCard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-4">Pay as You Go</h3>
              <p className="text-gray-500 leading-relaxed">No expensive subscriptions. Only pay a small fee for the courses you actually want to take.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-20">
        <div className="absolute top-20 left-10 w-64 h-64 bg-indigo-400 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-40 right-10 w-96 h-96 bg-violet-400 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default App;
