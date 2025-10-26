
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { INITIAL_MESSAGE } from '../constants';
import { Message, ThemeConfig } from '../types';
import { BotIcon, SendIcon, UserIcon } from './icons';

interface ChatbotProps {
  themeConfig: ThemeConfig;
}

const TypingIndicator: React.FC<{ themeConfig: ThemeConfig }> = ({ themeConfig }) => (
    <div className={`flex items-center space-x-2`}>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${themeConfig.botBubble}`}>
             <BotIcon className={`w-6 h-6 ${themeConfig.botText}`} />
        </div>
        <div className={`flex items-center space-x-1 p-3 rounded-lg ${themeConfig.botBubble}`}>
            <span className={`w-2 h-2 rounded-full animate-pulse ${themeConfig.botText} bg-current`}></span>
            <span className={`w-2 h-2 rounded-full animate-pulse delay-75 ${themeConfig.botText} bg-current`}></span>
            <span className={`w-2 h-2 rounded-full animate-pulse delay-150 ${themeConfig.botText} bg-current`}></span>
        </div>
    </div>
);


export const Chatbot: React.FC<ChatbotProps> = ({ themeConfig }) => {
    const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSendMessage = useCallback(async (messageText: string) => {
        if (!messageText.trim()) return;

        setIsLoading(true);
        const userMessage: Message = { id: Date.now().toString(), text: messageText, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setUserInput('');

        let botMessageId: string | null = null;

        try {
            if (!chatRef.current) {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                chatRef.current = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    history: messages.filter(m => m.id !== 'initial').map(m => ({
                        role: m.sender === 'user' ? 'user' : 'model',
                        parts: [{ text: m.text }],
                    })),
                });
            }
            
            botMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: botMessageId!, text: '', sender: 'bot' }]);

            const stream = await chatRef.current.sendMessageStream({ message: messageText });

            let fullResponse = '';
            for await (const chunk of stream) {
                const chunkText = chunk.text;
                fullResponse += chunkText;
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === botMessageId ? { ...msg, text: fullResponse } : msg
                    )
                );
            }

        } catch (error) {
            console.error('Error sending message to Gemini:', error);
            const errorMessage = "I'm sorry, I encountered an error. Please try again.";
            if (botMessageId) {
                 setMessages(prev =>
                    prev.map(msg =>
                        msg.id === botMessageId ? { ...msg, text: errorMessage } : msg
                    )
                );
            } else {
                 const errorMsg: Message = { id: (Date.now() + 1).toString(), text: errorMessage, sender: 'bot' };
                 setMessages(prev => [...prev, errorMsg]);
            }
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSendMessage(userInput);
    };

    const markdownComponents: React.ComponentProps<typeof ReactMarkdown>['components'] = {
        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
        ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
        ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
        a: ({node, ...props}) => <a className="underline hover:opacity-80" target="_blank" rel="noopener noreferrer" {...props} />,
        code: ({node, inline, className, children, ...props}) => {
            return !inline ? (
                <pre className="p-3 my-2 overflow-x-auto rounded-md bg-black/10 text-sm">
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            ) : (
                <code className={`px-1 py-0.5 rounded-sm bg-black/10 text-sm ${className || ''}`} {...props}>
                    {children}
                </code>
            );
        },
        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-black/20 pl-4 italic my-2" {...props} />,
        table: ({node, ...props}) => <div className="overflow-x-auto my-2"><table className="table-auto w-full" {...props} /></div>,
        thead: ({node, ...props}) => <thead className="bg-black/10" {...props} />,
        tr: ({node, ...props}) => <tr className="border-b border-black/10 last:border-b-0" {...props} />,
        th: ({node, ...props}) => <th className="px-4 py-2 text-left font-semibold" {...props} />,
        td: ({node, ...props}) => <td className="px-4 py-2" {...props} />,
    };

    return (
        <div className={`flex flex-col h-full w-full rounded-2xl shadow-2xl overflow-hidden ${themeConfig.chatBackground}`}>
            <div className="flex-grow p-6 overflow-y-auto">
                <div className="space-y-6">
                    {messages.map((msg) => {
                         if (msg.sender === 'bot' && msg.text === '') {
                             return null;
                         }
                         return (
                            <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                               <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? themeConfig.userBubble : themeConfig.botBubble}`}>
                                {msg.sender === 'user' ? <UserIcon className={`w-6 h-6 ${themeConfig.userText}`} /> : <BotIcon className={`w-6 h-6 ${themeConfig.botText}`} />}
                               </div>
                                <div className={`p-3 rounded-lg max-w-sm md:max-w-md break-words ${msg.sender === 'user' ? `${themeConfig.userBubble} ${themeConfig.userText}` : `${themeConfig.botBubble} ${themeConfig.botText}`}`}>
                                    {msg.sender === 'user' ? (
                                        <p className="whitespace-pre-wrap">{msg.text}</p>
                                    ) : (
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={markdownComponents}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {isLoading && <TypingIndicator themeConfig={themeConfig} />}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className={`p-4 border-t ${themeConfig.borderColor}`}>
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        placeholder="Ask Gemini anything..."
                        disabled={isLoading}
                        className={`flex-grow p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow duration-200 ${themeConfig.inputBackground} ${themeConfig.inputText}`}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !userInput.trim()}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${themeConfig.button} ${themeConfig.buttonHover}`}
                        aria-label="Send message"
                    >
                        <SendIcon className="w-6 h-6" />
                    </button>
                </form>
            </div>
        </div>
    );
};
