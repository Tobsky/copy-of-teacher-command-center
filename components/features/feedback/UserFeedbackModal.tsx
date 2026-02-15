import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { useData } from '../../../context/DataContext';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, Send, Bug, Lightbulb, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { emailService } from '../../../services/emailService';

interface UserFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const UserFeedbackModal: React.FC<UserFeedbackModalProps> = ({ isOpen, onClose }) => {
    const { submitUserFeedback } = useData();
    const { session } = useAuth();

    const [type, setType] = useState<'bug' | 'feature_request' | 'general' | 'other'>('bug');
    const [message, setMessage] = useState('');
    const [contactEmail, setContactEmail] = useState(session?.user.email || '');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await submitUserFeedback(type, message, contactEmail);

            // Send email notification (non-blocking)
            if (session?.user.id) {
                emailService.sendFeedbackEmail({
                    type,
                    message,
                    contact_email: contactEmail,
                    user_id: session.user.id
                });
            }

            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setMessage('');
                setType('bug');
                onClose();
            }, 2000);
        } catch (err) {
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Feedback Sent" size="sm">
                <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
                        <CheckCircle size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Thank You!</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                        Your feedback has been received. We appreciate your input!
                    </p>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Send Feedback">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={() => setType('bug')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'bug' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <Bug size={24} />
                        <span className="text-sm">Report Bug</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('feature_request')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'feature_request' ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <Lightbulb size={24} />
                        <span className="text-sm">Feature Request</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('general')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'general' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <MessageSquare size={24} />
                        <span className="text-sm">General</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setType('other')}
                        className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${type === 'other' ? 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                    >
                        <AlertCircle size={24} />
                        <span className="text-sm">Other</span>
                    </button>
                </div>

                {/* Message Input */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        {type === 'bug' ? 'Describe the issue' : type === 'feature_request' ? 'Describe your idea' : 'Your Message'}
                    </label>
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={type === 'bug' ? "What happened? What did you expect to happen?" : "How would this feature help you?"}
                        className="w-full h-32 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    />
                </div>

                {/* Contact Email (Optional) */}
                <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        Contact Email <span className="font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !message.trim()}
                        className="px-6 py-2 rounded-lg bg-indigo-600 text-white font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                        Submit Feedback
                    </button>
                </div>
            </form>
        </Modal>
    );
};
