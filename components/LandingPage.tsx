import React, { useState, useEffect } from 'react';
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
import { useTheme } from '../context/ThemeContext';

const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
                        Your AI-Powered<br />
                        <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Teacher Command Center.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up delay-100">
                        Handle complex grade curving, AI-powered reports, and student interventions in one place. Built specifically for IGCSE, A-Level, and IB teachers.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-200">
                        <button
                            onClick={() => navigate('/login?mode=signup')}
                            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-lg shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all"
                        >
                            Get Started for Free
                        </button>
                        <button className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-lg transition-all flex items-center justify-center gap-2">
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Focus on Teaching, Not Admin</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                            Automate the redundant tasks that eat up your planning time.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<TrendingUp className="text-emerald-500" size={32} />}
                            title="Automated Curving"
                            description="Normalise raw scores to IGCSE & IB boundaries in seconds. No more manual math or Excel formulas."
                        />
                        <FeatureCard
                            icon={<Sparkles className="text-violet-500" size={32} />}
                            title="Smart AI Feedback"
                            description="Generate personalized report comments that analyze grades, attendance, and behavioral traits in seconds."
                        />
                        <FeatureCard
                            icon={<ListChecks className="text-amber-500" size={32} />}
                            title="Syllabus & Mastery"
                            description="Track coverage against exam boards. spot gaps instantly with mastery heatmaps and never miss a topic."
                        />
                    </div>
                </div>
            </section>

            {/* Core Workflow */}
            <section id="workflow" className="py-20 md:py-32 overflow-hidden">
                <div className="container mx-auto px-4 space-y-24">

                    {/* Item 1 */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <LayoutDashboard size={24} />
                            </div>
                            <h3 className="text-3xl font-bold">A Gradebook That Thinks</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Visualise student performance with instant color-coded alerts. Track averages, weightings, and export everything to CSV for your school's MIS.
                            </p>
                            <ul className="space-y-3">
                                <ListItem text="Custom Weighting Categories" />
                                <ListItem text="Instant Excel Export" />
                                <ListItem text="Visual Performance Alerts" />
                            </ul>
                        </div>
                        <div className="flex-1 bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center shadow-2xl">
                            {/* Abstract Representation of UI */}
                            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 opacity-90 hover:scale-105 transition-transform duration-500">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                    <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30" />
                                </div>
                                <div className="space-y-4">
                                    <div className="h-12 w-full bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center px-4 border-l-4 border-emerald-500">
                                        <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    </div>
                                    <div className="h-12 w-full bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center px-4 border-l-4 border-amber-500">
                                        <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    </div>
                                    <div className="h-12 w-full bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center px-4 border-l-4 border-red-500">
                                        <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="text-3xl font-bold">Lesson Planning on Autopilot</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Generate structured lesson plans from a single topic using our AI engine. Attach resources, links, and homework in one drag-and-drop interface.
                            </p>
                            <ul className="space-y-3">
                                <ListItem text="AI-Generated Objectives" />
                                <ListItem text="Resource Management" />
                                <ListItem text="Syllabus Tracking" />
                            </ul>
                        </div>
                        <div className="flex-1 bg-gradient-to-bl from-pink-100 to-indigo-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center shadow-2xl">
                            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 opacity-90 hover:scale-105 transition-transform duration-500 flex flex-col">
                                <div className="h-4 w-1/2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6" />
                                <div className="flex-1 space-y-3">
                                    <div className="h-3 w-full bg-slate-50 dark:bg-slate-900 rounded-full" />
                                    <div className="h-3 w-[90%] bg-slate-50 dark:bg-slate-900 rounded-full" />
                                    <div className="h-3 w-[95%] bg-slate-50 dark:bg-slate-900 rounded-full" />
                                    <div className="mt-4 flex gap-2">
                                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Item 3 */}
                    <div className="flex flex-col md:flex-row items-center gap-12 md:gap-24">
                        <div className="flex-1 space-y-6">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                <ListChecks size={24} />
                            </div>
                            <h3 className="text-3xl font-bold">Total Syllabus Control</h3>
                            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                                Ditch the paper checklist. Track every topic from "Not Started" to "Mastered". Link lessons directly to syllabus points and visualize your progress.
                            </p>
                            <ul className="space-y-3">
                                <ListItem text="Exam Board Templates" />
                                <ListItem text="Gap Analysis Alerts" />
                                <ListItem text="Mastery Heatmaps" />
                            </ul>
                        </div>
                        <div className="flex-1 bg-gradient-to-br from-emerald-100 to-teal-50 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 aspect-[4/3] flex items-center justify-center shadow-2xl">
                            <div className="w-full h-full bg-white dark:bg-slate-950 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-800 opacity-90 hover:scale-105 transition-transform duration-500 flex flex-col gap-3">
                                <div className="h-4 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-full mb-2" />
                                <div className="space-y-2">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="flex items-center gap-3 p-2 border border-slate-50 dark:border-slate-800 rounded-lg">
                                            <div className={`w-3 h-3 rounded-full ${i === 1 ? 'bg-emerald-500' : i === 2 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                                            <div className="h-2 w-2/3 bg-slate-100 dark:bg-slate-800 rounded-full" />
                                        </div>
                                    ))}
                                </div>
                            </div>
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
