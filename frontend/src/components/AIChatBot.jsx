import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import './AIChatBot.css';

const API_KEY = 'sk-8ab34629a8984de7b3c6e0e298ab0c96';
const API_URL = 'https://api.deepseek.com/chat/completions';

const AIChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your Migraine Assistant. How can I help you today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: [
                        { role: "system", content: "You are a helpful, empathetic medical assistant for a migraine tracking app. Help the user analyze their symptoms, suggest general relief methods (non-medical advice), and explain triggers. Keep answers concise." },
                        ...messages,
                        userMsg
                    ],
                    stream: false
                })
            });

            const data = await response.json();

            if (data.choices && data.choices[0]) {
                const aiMsg = data.choices[0].message;
                setMessages(prev => [...prev, aiMsg]);
            } else {
                console.error('API Error:', data);
                setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error connecting to the AI.' }]);
            }
        } catch (error) {
            console.error('Network Error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: 'Network error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Launcher */}
            {!isOpen && (
                <button className="ai-fab" onClick={() => setIsOpen(true)}>
                    <Bot size={24} color="white" />
                </button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-title">
                            <Bot size={20} className="ai-avatar-small" />
                            <span>Dr. AI Assistant</span>
                        </div>
                        <button className="chat-close" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, i) => (
                            <div key={i} className={`message-row ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                {msg.role === 'assistant' && <div className="avatar ai"><Bot size={14} /></div>}
                                <div className={`message-bubble ${msg.role}`}>
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && <div className="avatar user"><User size={14} /></div>}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message-row ai">
                                <div className="avatar ai"><Bot size={14} /></div>
                                <div className="message-bubble ai loading">
                                    <Loader2 size={16} className="spin" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="chat-input-area">
                        <input
                            type="text"
                            placeholder="Ask about migraines..."
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && sendMessage()}
                        />
                        <button className="send-btn" onClick={sendMessage} disabled={isLoading}>
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AIChatBot;
