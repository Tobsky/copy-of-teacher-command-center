import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Mic, Send, Minimize2, Maximize2, Bot } from 'lucide-react';
import { getChatResponse, ChatMessage } from '../../../services/geminiService';
import ReactMarkdown from 'react-markdown';

const AIChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVoiceActive, setIsVoiceActive] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null); // Use any for SpeechRecognition to avoid type issues if types aren't installed

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setInputValue(transcript);
                handleSendMessage(transcript);
                setIsVoiceActive(false);
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech verification error", event.error);
                setIsVoiceActive(false);
            };

            recognitionRef.current.onend = () => {
                setIsVoiceActive(false);
            }
        }
    }, []);

    const toggleVoiceMode = () => {
        if (isVoiceActive) {
            recognitionRef.current?.stop();
            setIsVoiceActive(false);
        } else {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.start();
                    setIsVoiceActive(true);
                } catch (e) {
                    console.error("Error starting speech recognition:", e);
                }
            } else {
                alert("Voice mode is not supported in this browser.");
            }
        }
    };

    const speakResponse = (text: string) => {
        if ('speechSynthesis' in window) {
            // Cancel any current speaking
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            // Try to select a "natural" voice if available
            const voices = window.speechSynthesis.getVoices();
            const preferredVoice = voices.find(voice => voice.name.includes("Google US English") || voice.name.includes("Natural"));
            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.rate = 1.1; // Slightly faster for conversational feel
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSendMessage = async (text: string = inputValue) => {
        if (!text.trim()) return;

        // Add user message immediately
        const userMsg: ChatMessage = { role: 'user', parts: [{ text: text }] };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            // Get AI Response
            const aiResponseText = await getChatResponse(messages, text);

            const aiMsg: ChatMessage = { role: 'model', parts: [{ text: aiResponseText }] };
            setMessages(prev => [...prev, aiMsg]);

            // Speak if appropriate (e.g., if voice mode was just used or always? 
            // Let's speak if the input came from voice (handled in onresult) OR if we track a "voice session" mode.
            // For now, let's only speak if the user explicitly used voice logic, but since handleSendMessage is generic,
            // we might want a flag. However, for "Voice Mode" usually the expectation is 2-way audio.
            // A simple heuristic: if the chat is open and we just finished a voice input.
            // Since we passed text directly from voice, we can assume we want a spoke response if we had a way to track it.
            // BUT, simply speaking every response might be annoying if typing. 
            // Let's only speak if isVoiceActive was true recently? No, it sets to false on end.
            // Let's leave it as a manual toggle or implicit? 
            // Re-reading requirements: "activate voice mode to actually talk with it".
            // Implementation: We will speak the response if the input came from speech recognition (we can pass a flag or just assume for this MVP).
            // Actually, let's just speak it if 'speechSynthesis' is supported and maybe add a mute toggle later. 
            // For this specific requirement, let's speak it if the input was voice-triggered.

            // Refined approach: check if isVoiceActive was true when this started? 
            // Let's actually just speak if the user clicked the mic. 
            // Simpler: I'll use a ref to track if the last input was voice.
        } catch (error) {
            console.error("Chat Error", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Quick "Voice Mode" effect for the pulse
    // We need to trigger `speakResponse` after state update. 
    // We can use a useEffect to watch messages.
    const lastMessageCount = useRef(0);
    useEffect(() => {
        if (messages.length > lastMessageCount.current) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'model') {
                // Check if we should speak. 
                // For now, let's assume if it's the "Voice Mode", we speak.
                // But since we don't have a persistent "Voice Mode" toggle (just a mic button), 
                // we might just speak if the previous user message was short/voice-like? 
                // Let's implement a rule: If the user clicked the mic to send the previous message.
                // WE NEED TO KNOW source.
                // I will stick to text-only unless I can verify source clearly. 
                // Re-reading prompt: "activate voice mode to actually talk with it" implying a session.
                // I'll stick to: Click Mic -> Speak -> AI Speaks back.
                // To do this, I need to know if the last message was voice.
                // I'll add a dirty check or just speak everything if the widget is in "Voice View"?
                // Let's just speak it if the user USED the mic.
            }
            lastMessageCount.current = messages.length;
        }
    }, [messages]);

    // Actually, I'll allow the `handleSendMessage` to take a `shouldSpeak` arg
    const sendUserMessage = async (text: string, speakReply: boolean = false) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = { role: 'user', parts: [{ text: text }] };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        try {
            const aiResponseText = await getChatResponse(messages, text);
            const aiMsg: ChatMessage = { role: 'model', parts: [{ text: aiResponseText }] };
            setMessages(prev => [...prev, aiMsg]);

            if (speakReply) {
                speakResponse(aiResponseText);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }

    // Rewrite the voice result handler to use this
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                setIsVoiceActive(false);
                sendUserMessage(transcript, true); // True to speak back
            };
        }
    }, []);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">

            {/* Chat Window */}
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-slide-up origin-bottom-right">

                    {/* Header */}
                    <div className="bg-indigo-600 p-4 flex items-center justify-between text-white shrink-0">
                        <div className="flex items-center gap-2">
                            <Bot size={20} />
                            <h3 className="font-bold text-sm">Boundaries AI Support</h3>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950/50">
                        {messages.length === 0 && (
                            <div className="text-center text-slate-500 text-sm mt-10 px-4">
                                <p className="mb-2">👋 Hi! I'm Boundaries.</p>
                                <p>I can help you navigate the app, plan lessons, or explain our features.</p>
                            </div>
                        )}

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-indigo-600 text-white rounded-tr-none'
                                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-tl-none shadow-sm'
                                    }`}>
                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                                        <ReactMarkdown
                                            components={{
                                                p: ({ node, ...props }: any) => <p className="mb-2 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }: any) => <ul className="list-disc pl-4 mb-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }: any) => <ol className="list-decimal pl-4 mb-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }: any) => <li className="mb-0.5" {...props} />,
                                                a: ({ node, ...props }: any) => <a className="text-blue-500 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                                                h1: ({ node, ...props }: any) => <h1 className="font-bold text-lg mb-2 mt-1" {...props} />,
                                                h2: ({ node, ...props }: any) => <h2 className="font-bold text-base mb-2 mt-1" {...props} />,
                                                h3: ({ node, ...props }: any) => <h3 className="font-semibold text-sm mb-1 mt-1" {...props} />,
                                                strong: ({ node, ...props }: any) => <strong className="font-bold text-indigo-700 dark:text-indigo-400" {...props} />,
                                            }}
                                        >
                                            {msg.parts[0].text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Footer / Input */}
                    <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 relative">

                        {/* Voice Overlay */}
                        {isVoiceActive && (
                            <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/95 z-10 flex items-center justify-center gap-1 backdrop-blur-sm">
                                <div className="h-8 w-1 bg-indigo-500 rounded-full animate-wave" style={{ animationDelay: '0ms' }}></div>
                                <div className="h-12 w-1 bg-indigo-500 rounded-full animate-wave" style={{ animationDelay: '100ms' }}></div>
                                <div className="h-16 w-1 bg-indigo-500 rounded-full animate-wave" style={{ animationDelay: '200ms' }}></div>
                                <div className="h-12 w-1 bg-indigo-500 rounded-full animate-wave" style={{ animationDelay: '300ms' }}></div>
                                <div className="h-8 w-1 bg-indigo-500 rounded-full animate-wave" style={{ animationDelay: '400ms' }}></div>
                                <span className="absolute bottom-2 text-xs font-bold text-indigo-600 uppercase tracking-widest animate-pulse">Listening...</span>
                            </div>
                        )}

                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleVoiceMode}
                                className={`p-2 rounded-full transition-all ${isVoiceActive ? 'bg-red-100 text-red-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600'}`}
                            >
                                <Mic size={20} />
                            </button>
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && !isLoading && sendUserMessage(inputValue)}
                                placeholder="Ask Boundaries..."
                                className="flex-1 bg-slate-50 dark:bg-slate-800 border-0 rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                            <button
                                onClick={() => sendUserMessage(inputValue)}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2 bg-indigo-600 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-indigo-700 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 group relative"
                >
                    <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse"></span>
                </button>
            )}
        </div>
    );
};

export default AIChatWidget;
