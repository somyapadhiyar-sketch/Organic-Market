import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send, Sparkles, Trash2 } from 'lucide-react';
import { useStore } from "../context/StoreContext";

export default function AIChatbot({ isOpen, onClose }) {
  const { currentUser } = useStore();
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: "Hi there! I'm your Zesty AI Assistant. How can I help you find the freshest groceries today?" }]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping, isOpen]);

  // Prevent background scrolling when full page chat is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Auto-focus input when opened or after bot finishes typing
  useEffect(() => {
    if (isOpen && !isTyping) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, isTyping]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!chatInput.trim() || isTyping) return;
    const userMsg = chatInput.trim();
    
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const response = await fetch(import.meta.env.VITE_WEBHOOK_AI_CHATBOT_URL, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'x-org-key': import.meta.env.VITE_AI_CHATBOT_ORG_KEY
        },
        body: JSON.stringify({ message: userMsg, userId: currentUser?.uid, sessionId: currentUser?.uid })
      });
      
      const rawText = await response.text();
      let botReply = rawText; // Fallback to exactly what the URL returned

      try {
        const data = JSON.parse(rawText);
        
        const extractString = (obj) => {
          if (typeof obj === 'string') return obj;
          if (Array.isArray(obj)) return obj.length > 0 ? extractString(obj[0]) : rawText;
          if (typeof obj === 'object' && obj !== null) {
            if (typeof obj.aiResponse === 'string') return obj.aiResponse;
            if (typeof obj.output === 'string') return obj.output;
            if (typeof obj.response === 'string') return obj.response;
            if (typeof obj.text === 'string') return obj.text;
            if (typeof obj.message === 'string') return obj.message;
            if (obj.json) return extractString(obj.json); // Handles standard n8n raw item format
            return JSON.stringify(obj); // Prevents React crash if it grabs an unhandled object
          }
          return String(obj);
        };
        botReply = extractString(data);
      } catch (e) {
        // The response was plain text and not JSON, so botReply remains rawText
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error("Chatbot error:", error);
      setChatMessages(prev => [...prev, { sender: 'bot', text: "Connection error. Please try again later." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setChatMessages([{ sender: 'bot', text: 'Hi there! I am your Zesty AI Assistant. How can I help you with your shopping today?' }]);
  }

  if (!currentUser || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-50 z-[120] flex flex-col animate-in slide-in-from-bottom-8 duration-500 pointer-events-auto">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-4 py-4 sm:px-8 flex justify-between items-center shadow-sm shrink-0 relative z-10">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2.5 -ml-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shrink-0 shadow-md">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h3 className="font-black text-slate-900 leading-tight text-lg tracking-tight">Zesty AI</h3>
                <p className="text-[11px] text-emerald-600 flex items-center gap-1.5 font-bold uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span> Online</p>
              </div>
            </div>
          </div>
          <button onClick={handleClearChat} title="Clear Chat" className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-red-50 hover:text-red-600 rounded-xl border border-slate-200 transition-colors text-xs font-bold text-slate-500 shadow-sm">
            <Trash2 size={14} /> <span className="hidden sm:inline">Clear</span>
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar relative">
          {/* Subtle Background Logo */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <Sparkles size={250} />
          </div>
          
          <div className="max-w-4xl mx-auto w-full space-y-6 relative z-10">
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`flex gap-2 sm:gap-3 max-w-[90%] sm:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                  {msg.sender === 'bot' && (
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm mb-1">
                      <Sparkles size={16} className="text-white" />
                    </div>
                  )}
                  <div className={`p-4 sm:p-5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm shadow-md font-medium' 
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm font-medium'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start gap-2 sm:gap-3 animate-in fade-in">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shrink-0 shadow-sm mb-1">
                  <Sparkles size={16} className="text-white animate-pulse" />
                </div>
                <div className="bg-white border border-slate-200 p-4 sm:p-5 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-1.5 w-max h-[48px] sm:h-[56px]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce"></span>
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-4" />
          </div>
        </div>

        {/* Input Footer */}
        <div className="bg-white border-t border-slate-200 p-4 sm:p-6 shrink-0 relative z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
          <div className="max-w-4xl mx-auto w-full">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
              <input ref={inputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask Zesty AI for recommendations..." disabled={isTyping} className="flex-1 bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 rounded-2xl pl-6 pr-16 py-4 sm:py-5 outline-none text-[15px] font-bold text-slate-800 transition-all shadow-inner placeholder:text-slate-400 disabled:opacity-50" />
              <button type="submit" disabled={!chatInput.trim() || isTyping} className="absolute right-2 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-md active:scale-95">
                <Send size={20} className="-translate-x-[1px] translate-y-[1px]" />
              </button>
            </form>
            <p className="text-center text-[11px] font-bold text-slate-400 mt-4 flex items-center justify-center gap-1.5 uppercase tracking-widest">
              <Sparkles size={12} className="text-emerald-500" />
              Zesty AI Intelligence • Cultivating a Smarter Way to Shop
            </p>
          </div>
        </div>
    </div>
  );
}