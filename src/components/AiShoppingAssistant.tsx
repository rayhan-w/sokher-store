'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export default function AiShoppingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'নমস্কার! আমি শখের স্টোরের AI বিউটি অ্যাসিস্ট্যান্ট। পণ্যের দাম, স্টক বা আপনার ত্বকের উপযোগী কোনো প্রসাধন খুঁজতে সাহায্য লাগলে আমাকে জানান!',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend.trim() }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: data.reply || 'দুঃখিত, কোনো উত্তর পাওয়া যায়নি।',
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: 'সার্ভারের সাথে সংযোগ বিচ্ছিন্ন হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Pond's cream এর দাম কত?",
    "Maybelline foundation এর শেড কি কি আছে?",
    "Sensitive skin এর জন্য কোন ফেসওয়াশ ভালো?",
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 sm:bottom-6 right-5 z-40 p-3.5 rounded-full bg-gradient-to-r from-[#cc272d] to-[#e11d2e] text-white shadow-xl shadow-red-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group"
        aria-label="AI Shopping Assistant"
      >
        <Sparkles className="w-5 h-5 animate-pulse" />
        <span className="text-xs font-bold hidden sm:inline-block pr-1">AI Assistant</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 sm:bottom-20 right-4 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[500px] max-h-[80vh] bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#cc272d] to-[#e11d2e] text-white p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-none">Sokher AI Assistant</h3>
                <span className="text-[10px] text-rose-100 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Beauty Advisor
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-6 h-6 rounded-full bg-[#cc272d] text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed shadow-xs ${
                    m.sender === 'user'
                      ? 'bg-[#cc272d] text-white rounded-tr-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-gray-400 text-xs italic">
                <div className="w-6 h-6 rounded-full bg-rose-100 text-[#cc272d] flex items-center justify-center">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                </div>
                <span>শখের স্টোর ক্যাটালগ খোঁজা হচ্ছে...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="p-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {quickPrompts.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="px-2.5 py-1 rounded-full bg-rose-50 text-[#cc272d] hover:bg-rose-100 whitespace-nowrap transition border border-rose-100/60"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="পণ্য সম্পর্কে প্রশ্ন লিখুন..."
              className="flex-1 py-2 px-3.5 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-[#cc272d]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 rounded-full bg-[#cc272d] text-white disabled:opacity-40 hover:bg-red-700 transition"
              aria-label="Send"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
