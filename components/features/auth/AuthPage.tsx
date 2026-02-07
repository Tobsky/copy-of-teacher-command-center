import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../../supabaseClient';
import { Mail, Lock, Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

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
                        <Input
                            label="Full Name"
                            type="text"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="John Doe"
                            startIcon={<ArrowRight size={18} />}
                        />
                    )}

                    <Input
                        label="Email Address"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="teacher@school.edu"
                        startIcon={<Mail size={18} />}
                    />

                    {!isForgotPassword && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center mb-1">
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
                            {/* Re-implementing Password Input manually or using Input without label to control the top label logic layout difference? 
                                Actually, I can just use Input and handle the forgot password link differently or pass ReactNode as label?
                                Input accepts string label. 
                                Let's just put the logic above and use Input with no label but with startIcon. 
                            */}
                            <div className="relative">
                                {/* Using Input component but we want the 'Forgot Password' link to align with label. 
                                    My Input component renders label inside. 
                                    Let's just use the Input component and put the Forgot Password link separately if needed, 
                                    OR just use the Input component normally and put the link under it? 
                                    Standard pattern is top right. 
                                    Let's manually reconstruct the label row then use Input with no label prop.
                                */}
                            </div>
                            <Input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                minLength={6}
                                startIcon={<Lock size={18} />}
                            />
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 border-none"
                    >
                        {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')}
                    </Button>
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
