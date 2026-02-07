import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';

const AuthPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const mode = searchParams.get('mode');

    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState(mode !== 'signup');
    const [isForgotPassword, setIsForgotPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState(''); // Only for signup
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            if (isForgotPassword) {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/login`,
                });
                if (error) throw error;
                setMessage('Check your email for the password reset link!');
                setIsForgotPassword(false);
            } else if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                // 1. Check if email already exists
                const { data: emailTaken, error: checkError } = await supabase.rpc('email_exists', {
                    email_check: email
                });

                if (checkError) {
                    console.error("Error checking email:", checkError);
                    // Fallback: Proceed with signup anyway if check fails (e.g. function missing)
                }

                if (emailTaken) {
                    throw new Error("This email is already registered. Please log in instead.");
                }

                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/`,
                        data: {
                            full_name: fullName,
                        },
                    },
                });
                if (error) throw error;
                setMessage('Check your email for the login link!');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during authentication');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none animate-scale-in">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2 tracking-tighter">Boundaries</h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {isForgotPassword ? 'Reset Your Password' : 'Command Center Login'}
                    </p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-3 text-red-600 dark:text-red-400 text-sm font-medium">
                        <AlertCircle size={18} className="mt-0.5 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {message && (
                    <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm text-center font-medium">
                        {message}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-5">
                    {!isLogin && (
                        <div>
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <ArrowRight size={18} />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="block w-full pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail size={18} />
                            </div>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                                placeholder="teacher@school.edu"
                            />
                        </div>
                    </div>

                    {!isForgotPassword && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Password</label>
                                {isLogin && (
                                    <button
                                        type="button"
                                        onClick={() => { setIsForgotPassword(true); setError(null); setMessage(null); }}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Forgot Password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl py-3 px-4 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-600"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')
                        )}
                    </button>
                </form>

                {isForgotPassword ? (
                    <div className="mt-8 text-center text-sm">
                        <button
                            onClick={() => { setIsForgotPassword(false); setError(null); setMessage(null); }}
                            className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none hover:underline"
                        >
                            ← Back to Login
                        </button>
                    </div>
                ) : (

                    <div className="mt-8 text-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="ml-2 font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors focus:outline-none hover:underline"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>

                        {/* Back to Home Link */}
                        <div className="mt-6">
                            <a href="/" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xs transition-colors">← Back to Home</a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuthPage;
