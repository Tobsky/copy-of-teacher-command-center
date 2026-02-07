import React, { useState, useEffect, useRef } from 'react';
import {
    CheckCircle,
    ArrowRight,
    TrendingUp,
    Sparkles,
    ShieldAlert,
    LayoutDashboard,
    Users,
    Calendar,
    BookOpen,
    Menu,
    X,
    Moon,
    Sun,
    GraduationCap,
    ListChecks
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../context/ThemeContext';
import { Modal } from '../../ui/Modal';

// Hook for scroll detection
function useOnScreen(ref: React.RefObject<HTMLElement>) {
    const [isIntersecting, setIntersecting] = useState(false);
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIntersecting(true);
                observer.disconnect();
            }
        }, { threshold: 0.1 });
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [ref]);
    return isIntersecting;
}

// Mockup Component: Live Gradebook
const LiveGradebook = () => {
    const [visibleRows, setVisibleRows] = useState(0);
    const [activeScore, setActiveScore] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!isVisible) return;

        let rowCount = 0;
        const interval = setInterval(() => {
            rowCount++;
            setVisibleRows(prev => (prev < 4 ? prev + 1 : prev));
            if (rowCount >= 4) clearInterval(interval);
        }, 500);

        let score = 0;
        const scoreInterval = setInterval(() => {
            score += 2;
            setActiveScore(prev => (prev < 92 ? prev + 2 : 92));
            if (score >= 92) clearInterval(scoreInterval);
        }, 30);

        return () => {
            clearInterval(interval);
            clearInterval(scoreInterval);
        };
    }, [isVisible]);

    return (
        <div ref={ref} className="w-full h-full bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col opacity-90 hover:scale-105 transition-transform duration-500">
            {/* Header */}
            <div className="h-10 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 gap-4 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-20 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1" />
                <div className="w-4 h-4 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center text-[8px] font-bold">%</div>
            </div>
            {/* Rows */}
            <div className="p-2 space-y-1">
                {[
                    { name: 'Alex M.', score: `${activeScore}%`, grade: 'A*', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
                    { name: 'Sarah J.', score: '88%', grade: 'A', color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500' },
                    { name: 'James L.', score: '74%', grade: 'B', color: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-500' },
                    { name: 'Maya P.', score: '58%', grade: 'C', color: 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' },
                ].map((student, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-all duration-500 ${i < visibleRows ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold ${i % 2 === 0 ? 'bg-indigo-100 text-indigo-600' : 'bg-violet-100 text-violet-600'}`}>
                                {student.name[0]}
                            </div>
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{student.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{student.score}</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${student.color}`}>
                                {student.grade}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Mockup Component: Live Syllabus
const LiveSyllabus = () => {
    const [checkedItems, setCheckedItems] = useState([false, false, false]);
    const [progress, setProgress] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!isVisible) return;

        const timers = [
            setTimeout(() => setCheckedItems([true, false, false]), 800),
            setTimeout(() => setCheckedItems([true, true, false]), 1600),
            setTimeout(() => setProgress(85), 500),
        ];
        return () => timers.forEach(clearTimeout);
    }, [isVisible]);

    return (
        <div ref={ref} className="w-full h-full bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col opacity-90 hover:scale-105 transition-transform duration-500 relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 dark:bg-slate-800">
                <div
                    className="w-full bg-emerald-500 transition-all duration-[2000ms] ease-out"
                    style={{ height: `${progress}%` }}
                />
            </div>
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between mb-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Unit 3: Algorithms</div>
                    <div className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                        {progress}% Done
                    </div>
                </div>
                {[
                    { title: '3.1 Decomposition', status: 'Mastered', date: 'Oct 12' },
                    { title: '3.2 Pattern Rec.', status: 'Mastered', date: 'Oct 14' },
                    { title: '3.3 Abstraction', status: 'In Progress', date: 'Today' },
                ].map((topic, i) => (
                    <div key={i} className="flex items-start gap-3 group">
                        <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center transition-all duration-500 ${checkedItems[i] ? 'bg-emerald-500 border-emerald-500 text-white scale-100' : 'border-slate-300 dark:border-slate-600'}`}>
                            {checkedItems[i] && <CheckCircle size={10} />}
                        </div>
                        <div className="flex-1">
                            <div className={`text-sm font-medium transition-all duration-500 ${checkedItems[i] ? 'text-slate-500 dark:text-slate-500 line-through decoration-slate-400' : 'text-slate-800 dark:text-white'}`}>
                                {topic.title}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 flex gap-2">
                                <span>{topic.status}</span>
                                <span>•</span>
                                <span>{topic.date}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {/* Heatmap strip at bottom */}
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-0.5">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 delay-[${i * 50}ms] ${i < (progress / 5) ? (i % 3 === 0 ? 'bg-emerald-400' : 'bg-emerald-300') : 'bg-slate-100 dark:bg-slate-800'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

// Mockup Component: Live Feedback Typewriter
const LiveFeedback = () => {
    const fullText = "Alex has demonstrated excellent mastery of Algorithms this term, achieving an average of 92%.";
    const [text, setText] = useState("");
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref);

    useEffect(() => {
        if (!isVisible) return;

        let i = 0;
        const interval = setInterval(() => {
            setText(fullText.substring(0, i));
            i++;
            if (i > fullText.length) clearInterval(interval);
        }, 30);
        return () => clearInterval(interval);
    }, [isVisible]);

    return (
        <div ref={ref} className="w-full h-full bg-white dark:bg-slate-950 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col opacity-90 hover:scale-105 transition-transform duration-500 relative">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-pink-500 to-indigo-500 animate-pulse" />
            <div className="p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg">🎓</div>
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-white">Student Report</div>
                        <div className="text-xs text-slate-400">Generated Just Now</div>
                    </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl text-xs leading-relaxed text-slate-600 dark:text-slate-300 border border-slate-100 dark:border-slate-800 relative min-h-[80px]">
                    <Sparkles className="absolute -top-2 -right-2 text-pink-500 bg-white dark:bg-slate-800 rounded-full p-0.5" size={16} />
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {text}
                    </span>
                    <span className="inline-block w-1.5 h-3 bg-indigo-500 ml-0.5 animate-pulse" />
                </div>
                <div className="flex gap-2">
                    {['Focus', 'Helpful', 'Creative'].map((tag, i) => (
                        <span key={i} className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 animate-fade-in" style={{ animationDelay: `${i * 200}ms` }}>
                            {tag}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Demo Carousel Component
const DemoCarousel = () => {
    const [step, setStep] = useState(0);
    const steps = [
        { title: 'Smart Gradebook', component: <LiveGradebook />, desc: 'Track performance with weighted categories and instant alerts.' },
        { title: 'Syllabus Hub', component: <LiveSyllabus />, desc: 'Visualize mastery and spot gaps in seconds.' },
        { title: 'AI Feedback', component: <LiveFeedback />, desc: 'Generate personalized narrative reports with one click.' },
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setStep(prev => (prev + 1) % steps.length);
        }, 5000); // Auto-advance every 5s
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <div className="flex-1 overflow-hidden relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-8">
                {/* Current Slide */}
                <div key={step} className="w-full max-w-sm animate-fade-in">
                    {steps[step].component}
                </div>

                {/* Navigation Dots */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {steps.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setStep(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === step ? 'bg-indigo-600 w-6' : 'bg-slate-300 dark:bg-slate-600'}`}
                        />
                    ))}
                </div>
            </div>
            <div className="mt-6 text-center">
                <h3 className="text-xl font-bold mb-2">{steps[step].title}</h3>
                <p className="text-slate-500">{steps[step].desc}</p>
            </div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDemoOpen, setIsDemoOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setIsMobileMenuOpen(false);
        }
    };

    const navLinks = [
        { name: 'Features', id: 'features' },
        { name: 'Workflow', id: 'workflow' },
        { name: 'Pricing', id: 'pricing' },
    ];

    return (
        <div className={`min-h-screen font-sans transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
            <Modal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} title="Product Tour" size="lg">
                <DemoCarousel />
            </Modal>

            {/* Navigation */}
            <nav className={`fixed w-full z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl md:text-2xl tracking-tighter">
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Boundaries</span>
                    </div>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => scrollToSection(link.id)}
                                className="text-sm font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                {link.name}
                            </button>
                        ))}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-5 py-2.5 rounded-full bg-slate-100 dark:bg-slate-800 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/login?mode=signup')} // Signup flows to auth page
                            className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5"
                        >
                            Get Started
                        </button>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="md:hidden flex items-center gap-4">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                        >
                            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav Dropdown */}
                {isMobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white dark:bg-slate-900 shadow-xl border-t border-slate-100 dark:border-slate-800 p-4 flex flex-col gap-4 md:hidden">
                        {navLinks.map(link => (
                            <button
                                key={link.name}
                                onClick={() => scrollToSection(link.id)}
                                className="text-left py-2 font-medium border-b border-slate-100 dark:border-slate-800 last:border-0"
                            >
                                {link.name}
                            </button>
                        ))}
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold"
                        >
                            Log In
                        </button>
                        <button
                            onClick={() => navigate('/login?mode=signup')}
                            className="w-full py-3 rounded-xl bg-indigo-600 text-white font-bold"
                        >
                            Get Started
                        </button>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-4 relative overflow-hidden">
                {/* Abstract Background Blobs */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-violet-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

                <div className="container mx-auto text-center max-w-4xl relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold tracking-wide uppercase mb-8 border border-indigo-100 dark:border-indigo-800 animate-fade-in">
                        <Sparkles size={14} />
                        <span>The Intelligence-First Teacher Dashboard</span>
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 tracking-tight animate-slide-up">
                        Focus on Teaching,<br />
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Not Admin.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
                        The all-in-one command center for IGCSE & IB teachers. Track syllabus mastery, automate reports with AI, and curve grades in seconds.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                        <button
                            onClick={() => navigate('/login?mode=signup')}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all"
                        >
                            Get Started for Free
                        </button>
                        <button
                            onClick={() => setIsDemoOpen(true)}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-lg transition-all flex items-center justify-center gap-2"
                        >
                            <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">▶</span>
                            Watch Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Painkillers / Feature Grid */}
            <section id="features" className="py-20 md:py-32 bg-white dark:bg-slate-900 relative">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Complete Classroom Control</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Powerful tools designed to save you hours every week.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<TrendingUp className="text-emerald-500" size={32} />}
                            title="Syllabus Tracking"
                            description="Track coverage against exam boards (IGCSE, IB, A-Level). Spot gaps instantly with mastery heatmaps."
                        />
                        <FeatureCard
                            icon={<Sparkles className="text-violet-500" size={32} />}
                            title="Smart AI Feedback"
                            description="Generate personalized report comments that analyze grades, attendance, and behavioral traits in seconds."
                        />
                        <FeatureCard
                            icon={<ListChecks className="text-amber-500" size={32} />}
                            title="Automated Grading"
                            description="Calculate weighted averages instantly. Support for complex grade curving and boundary management."
                        />
                    </div>
                </div>
            </section>

            {/* Core Workflow */}
            <section id="workflow" className="py-20 md:py-32 overflow-hidden">
                <div className="container mx-auto px-4 space-y-24">

                    {/* Item 1: Gradebook */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <LayoutDashboard size={24} />
                            </div>
                            <h3 className="text-3xl font-bold">A Gradebook That Thinks</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Visualise student performance with instant color-coded alerts. Track averages with weighted categories (e.g., Exams 60%, Homework 20%) and export everything to CSV.
                            </p>
                            <ul className="space-y-3">
                                <ListItem text="Weighted Grading Categories" />
                                <ListItem text="Instant Excel Export" />
                                <ListItem text="Visual Performance Alerts" />
                            </ul>
                        </div>
                        <div className="flex-1 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center shadow-2xl">
                            <LiveGradebook />
                        </div>
                    </div>

                    {/* Item 2: Syllabus Hub */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <ListChecks size={24} />
                            </div>
                            <h3 className="text-3xl font-bold">Total Syllabus Control</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Ditch the paper checklist. Build recursive topics (Chapters → Subtopics), track mastery per class, and spot coverage gaps instantly.
                            </p>
                            <ul className="space-y-3">
                                <ListItem text="Exam Board Templates" />
                                <ListItem text="Gap Analysis Alerts" />
                                <ListItem text="Mastery Heatmaps" />
                            </ul>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center shadow-2xl">
                            <LiveSyllabus />
                        </div>
                    </div>

                    {/* Item 3: Smart Feedback */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                <Sparkles size={24} />
                            </div>
                            <h3 className="text-3xl font-bold">Feedback in Seconds</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Generate personalized narrative reports. Our AI combines grade data, attendance trends, and your selected behavioral traits into a professional comment.
                            </p>
                            <ul className="space-y-3">
                                <ListItem text="Behavioral Trait Selection" />
                                <ListItem text="Context-Aware Generation" />
                                <ListItem text="Assignment-Specific Feedback" />
                            </ul>
                        </div>
                        <div className="flex-1 bg-gradient-to-bl from-pink-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center shadow-2xl">
                            <LiveFeedback />
                        </div>
                    </div>

                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-slate-50 dark:bg-slate-950/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
                        <p className="text-slate-500 dark:text-slate-400">No complex setup. Just intuitive tools.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-slate-200 via-indigo-200 to-slate-200 dark:from-slate-800 dark:via-indigo-900 dark:to-slate-800 z-0" />

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent shadow-xl mb-6">
                                1
                            </div>
                            <h3 className="text-xl font-bold mb-3">Define Curriculum</h3>
                            <p className="text-slate-500 dark:text-slate-400">Select a template (IGCSE, IB) or build your own custom syllabus structure.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent shadow-xl mb-6">
                                2
                            </div>
                            <h3 className="text-xl font-bold mb-3">Track & Grade</h3>
                            <p className="text-slate-500 dark:text-slate-400">Input grades, mark attendance, and track syllabus coverage in the planner.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full border-4 border-slate-50 dark:border-slate-800 flex items-center justify-center text-2xl font-bold bg-gradient-to-br from-indigo-500 to-violet-500 bg-clip-text text-transparent shadow-xl mb-6">
                                3
                            </div>
                            <h3 className="text-xl font-bold mb-3">Generate Reports</h3>
                            <p className="text-slate-500 dark:text-slate-400">Let AI write your narrative reports and export your gradebook to Excel.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof */}
            <section className="py-20 bg-slate-50 dark:bg-slate-950 border-y border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Trusted by teachers delivering</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Logos would be images, using text placeholders for now with styling */}
                        <span className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-200">Cambridge</span>
                        <span className="text-2xl font-sans font-bold text-slate-800 dark:text-slate-200">Edexcel</span>
                        <span className="text-2xl font-slab font-bold text-slate-800 dark:text-slate-200">IB Diploma</span>
                        <span className="text-2xl font-mono font-bold text-slate-800 dark:text-slate-200">AQA</span>
                    </div>

                    <div className="mt-20 max-w-4xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl shadow-xl relative">
                        <div className="text-4xl text-indigo-200 absolute top-8 left-8">"</div>
                        <p className="text-xl md:text-2xl font-medium text-slate-700 dark:text-slate-300 italic relative z-10">
                            Report week used to take me 20 hours. With the Smart Feedback engine, I finished my whole Year 11 cohort in an hour. It's not just a tool, it's a lifesaver.
                        </p>
                        <div className="mt-8 flex items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
                            <div className="text-left">
                                <div className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</div>
                                <div className="text-sm text-slate-500">Computer Science Lead</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
                        <p className="text-slate-500 dark:text-slate-400">Everything you need to run your classroom.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                        {/* Free */}
                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Starter</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-slate-900 dark:text-white">$0</span>
                                    <span className="text-slate-500">/ forever</span>
                                </div>
                                <p className="text-slate-500 mt-4 text-sm">For individual teachers just getting organized.</p>
                            </div>
                            <div className="space-y-4 mb-8">
                                <PricingItem text="Student Roster" />
                                <PricingItem text="Basic Gradebook" />
                                <PricingItem text="Attendance Tracking" />
                                <PricingItem text="Manual Lesson Planning" />
                            </div>
                            <button
                                onClick={() => navigate('/login?mode=signup')}
                                className="w-full py-4 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Start For Free
                            </button>
                        </div>

                        {/* Pro */}
                        <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-3xl border border-slate-800 dark:border-slate-700 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 bg-gradient-to-bl from-indigo-500 to-violet-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                            <div className="mb-8 relative z-10">
                                <h3 className="text-xl font-bold text-white mb-2">Pro Teacher</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">$12</span>
                                    <span className="text-slate-400">/ month</span>
                                </div>
                                <p className="text-slate-400 mt-4 text-sm"> The full "Painkiller" suite for serious educators.</p>
                            </div>
                            <div className="space-y-4 mb-8 relative z-10 text-slate-300">
                                <PricingItem text="Advanced Grade Curving" highlighted />
                                <PricingItem text="Unlimited AI Feedback" highlighted />
                                <PricingItem text="Intervention Logger" highlighted />
                                <PricingItem text="Bulk Excel Import" />
                            </div>
                            <button
                                onClick={() => navigate('/login?mode=signup')}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-900/50 transition-all relative z-10"
                            >
                                Get Pro
                            </button>

                            {/* Glow effect */}
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
                        </div>

                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950 py-12 border-t border-slate-200 dark:border-slate-800">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <span className="font-bold text-xl tracking-tighter">Boundaries</span>
                        <p className="text-sm text-slate-500 mt-2">Made for Teachers, by Teachers.</p>
                    </div>
                    <div className="flex gap-8 text-sm text-slate-500">
                        <a href="#" className="hover:text-indigo-500 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-indigo-500 transition-colors">Terms</a>
                        <a href="#" className="hover:text-indigo-500 transition-colors">Contact</a>
                    </div>
                    <div className="flex gap-4">
                        {/* Social placeholders */}
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">
                            <span className="font-bold text-xs">X</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-pointer">
                            <span className="font-bold text-xs">in</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

// Sub-components for cleaner code
const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
        <div className="mb-6 bg-white dark:bg-slate-900 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
);

const ListItem: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
        <div className="text-emerald-500"><CheckCircle size={18} /></div>
        <span className="font-medium">{text}</span>
    </div>
);

const PricingItem: React.FC<{ text: string; highlighted?: boolean }> = ({ text, highlighted }) => (
    <div className={`flex items-center gap-3 ${highlighted ? 'text-white font-medium' : ''}`}>
        <div className={highlighted ? 'text-indigo-400' : 'text-slate-500'}><CheckCircle size={18} /></div>
        <span>{text}</span>
    </div>
);

export default LandingPage;
