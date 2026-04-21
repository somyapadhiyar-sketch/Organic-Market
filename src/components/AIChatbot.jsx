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
    <div className="fixed inset-0 bg-[#FDFCFE] z-[120] flex flex-col animate-in slide-in-from-bottom-8 duration-300 pointer-events-auto">
        
      {/* Header */}
      <div className="bg-white border-b border-slate-100 p-4 sm:px-8 flex justify-between items-center shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="p-2 sm:p-3 -ml-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-[#3B0060]">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 shrink-0 shadow-sm">
              <Sparkles size={24} className="text-[#3B0060]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 leading-tight">Zesty Support</h3>
              <p className="text-[11px] text-emerald-600 flex items-center gap-1.5 font-bold mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span> Always Online</p>
            </div>
          </div>
        </div>
        <button onClick={handleClearChat} title="Clear Chat" className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-red-50 hover:text-red-600 rounded-lg border border-slate-200 transition-colors text-xs font-bold text-slate-400">
          <Trash2 size={16} /> <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Body */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 custom-scrollbar">
        <div className="max-w-4xl mx-auto w-full space-y-6">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[90%] sm:max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border border-purple-200">
                    <Sparkles size={14} className="text-[#3B0060]" />
                  </div>
                )}
                <div className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm whitespace-pre-wrap ${
                  msg.sender === 'user' 
                    ? 'bg-[#3B0060] text-white rounded-tr-none font-medium' 
                    : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none font-medium'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center shrink-0 border border-purple-100">
                <Sparkles size={14} className="text-[#3B0060] animate-pulse" />
              </div>
              <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5 w-max">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-300 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Footer */}
      <div className="bg-white border-t border-slate-100 p-4 sm:p-6 shrink-0">
        <div className="max-w-4xl mx-auto w-full">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3 relative">
            <input ref={inputRef} type="text" value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="How can I help you?" disabled={isTyping} className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl pl-6 pr-16 py-4 outline-none focus:border-[#3B0060] focus:ring-4 focus:ring-purple-500/5 text-[15px] font-medium text-slate-800 transition-all disabled:opacity-50 shadow-inner placeholder:text-slate-400" />
            <button type="submit" disabled={!chatInput.trim() || isTyping} className="absolute right-2 w-11 h-11 bg-[#3B0060] text-white rounded-xl hover:bg-[#2A0045] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 shadow-md active:scale-95"><Send size={18} /></button>
          </form>
          <p className="text-center text-[10px] font-bold text-slate-400 mt-3 uppercase tracking-widest">Zesty AI Intelligence • Cultivating a Smarter, Fresher Way to Shop</p>
        </div>
      </div>
    </div>
  );
}