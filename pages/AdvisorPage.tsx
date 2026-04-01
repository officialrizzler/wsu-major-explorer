import React, { useState, useRef, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAdvisorResponse } from '../services/advisorService';
import { Send, Bot, ChevronDown, GraduationCap } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';
import ReactMarkdown from 'react-markdown';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

const shouldJustifyUserMessage = (text: string) => {
    const normalized = text.replace(/\s+/g, ' ').trim();
    return normalized.length > 90 || text.includes('\n');
};

const AdvisorPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { compareList } = useCompare();

    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: "Hello! I am your AI Advisor, and I'm ready to help you explore academic programs at Winona State University.\n\nYou can ask me things like:\n- \"What majors does WSU have for biology?\"\n- \"Tell me about the Nursing program.\"\n- \"I like art and computers, what should I study?\"\n\nHow can I help you today?\n\nPlease remember to connect with an official WSU academic advisor for the most accurate and personalized guidance." }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isScrolledUp, setIsScrolledUp] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
        if (scrollContainerRef.current) {
            const { scrollHeight, clientHeight } = scrollContainerRef.current;
            scrollContainerRef.current.scrollTo({
                top: scrollHeight - clientHeight,
                behavior
            });
        }
    };

    const handleScroll = () => {
        const container = scrollContainerRef.current;
        if (container) {
            const threshold = 30;
            const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
            setIsScrolledUp(!isAtBottom);
        }
    };

    const handleSend = async (prefilledPrompt?: string) => {
        const query = prefilledPrompt || input;
        if (!query.trim()) return;

        const userMessage: ChatMessage = { role: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        setTimeout(() => scrollToBottom('smooth'), 100);

        const chatHistoryForApi = [...messages, userMessage].slice(-8).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        try {
            const responseText = await getAdvisorResponse(chatHistoryForApi, query);
            const modelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, modelMessage]);
        } catch (error) {
            console.error("Advisor Error:", error);
            const errorMessageText = error instanceof Error ? error.message : "I'm sorry, I encountered an unexpected error.";
            const errorMessage: ChatMessage = { role: 'model', text: `Debug Error: ${errorMessageText}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    useLayoutEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const prompt = searchParams.get('prompt');
        if (prompt) {
            handleSend(prompt);
            navigate(location.pathname, { replace: true });
        }
    }, [location.search]);

    return (
        <div className={`relative flex h-[calc(100dvh-4rem)] min-h-0 flex-col overflow-hidden bg-[#f6f7fb] ${compareList.length > 0 ? 'pb-20 sm:pb-0' : ''}`}>
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-white via-[#f8f8fb] to-transparent" />
                <div className="absolute left-1/2 top-[-10rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,_rgba(34,91,255,0.10),_transparent_65%)]" />
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white/90 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 min-h-0 flex-col px-4 pb-4 pt-4 sm:px-8 sm:pb-6 sm:pt-5">
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex-1 min-h-0 overflow-y-auto scroll-smooth [mask-image:linear-gradient(to_bottom,transparent,black_2rem,black_calc(100%-2rem),transparent)]"
                >
                    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-10 pt-4 sm:gap-10 sm:pb-12 sm:pt-6">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-bubble-animation w-full ${msg.role === 'user' ? 'flex flex-col items-end' : ''}`}>
                                <div className={`mb-3 flex items-center gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                    <div className={`flex h-9 w-9 items-center justify-center rounded-full border ${msg.role === 'user' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-gray-200 bg-white text-gray-700 shadow-sm'}`}>
                                        {msg.role === 'user' ? <GraduationCap size={16} /> : <Bot size={18} />}
                                    </div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">
                                        {msg.role === 'user' ? 'You' : 'AI Advisor'}
                                    </p>
                                </div>

                                <div className={msg.role === 'user' ? 'w-full max-w-2xl px-6 sm:px-8' : 'pl-12 sm:pl-14'}>
                                    <div
                                        className={`text-[14px] leading-7 sm:text-[15px] ${msg.role === 'user' ? 'font-medium text-gray-900' : 'text-gray-700'}`}
                                        style={msg.role === 'user'
                                            ? shouldJustifyUserMessage(msg.text)
                                                ? { textAlign: 'justify', textAlignLast: 'left' }
                                                : { textAlign: 'right' }
                                            : undefined}
                                    >
                                        <ReactMarkdown
                                            components={{
                                                a: ({ node, ...props }) => <a {...props} className="font-medium text-primary-700 underline decoration-primary-200 underline-offset-4 hover:text-primary-800" target="_blank" rel="noopener noreferrer" />,
                                                p: ({ node, ...props }) => <p {...props} className="mb-3 last:mb-0 whitespace-pre-wrap" />,
                                                ul: ({ node, ...props }) => <ul {...props} className={`mb-3 list-disc space-y-1.5 pl-6 ${msg.role === 'user' ? 'inline-block text-left' : 'text-left'}`} />,
                                                ol: ({ node, ...props }) => <ol {...props} className={`mb-3 list-decimal space-y-1.5 pl-6 ${msg.role === 'user' ? 'inline-block text-left' : 'text-left'}`} />,
                                                li: ({ node, ...props }) => <li {...props} />,
                                                strong: ({ node, ...props }) => <strong {...props} className="font-semibold" />
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {isLoading && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-32 z-10">
                        <div className="mx-auto w-full max-w-3xl px-4 sm:px-0">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-sm">
                                    <Bot size={18} />
                                </div>
                                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-4 py-2 shadow-sm backdrop-blur">
                                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gray-400">Thinking</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400 animate-bounce"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isScrolledUp && (
                    <button
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-24 right-5 z-20 rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-lg shadow-gray-200/80 transition hover:border-gray-300 hover:bg-white"
                        aria-label="Scroll to latest messages"
                    >
                        <ChevronDown size={20} />
                    </button>
                )}

                <div className="pointer-events-none z-20 mt-3 px-1 pb-1 sm:mt-4">
                    <div className="mx-auto w-full max-w-3xl">
                        <div className="pointer-events-auto rounded-[28px] border border-gray-200/80 bg-white/88 p-3 shadow-[0_20px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                            <div className="relative flex items-end gap-3">
                                <div className="relative flex-1">
                                    <input
                                        type="text"
                                        value={input}
                                        maxLength={1000}
                                        onChange={e => setInput(e.target.value)}
                                        onKeyPress={e => e.key === 'Enter' && handleSend()}
                                        placeholder="Message WSU Advisor..."
                                        className="font-body w-full rounded-[22px] border border-transparent bg-transparent px-4 py-3.5 pr-12 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
                                        disabled={isLoading}
                                    />
                                </div>
                                <button
                                    onClick={() => handleSend()}
                                    disabled={isLoading || !input.trim()}
                                    className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvisorPage;
