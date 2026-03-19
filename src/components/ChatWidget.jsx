import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../context/StoreContext';

const INITIAL_MESSAGES = [
  { text: "Hi there! 👋 Welcome to Zesty. How can I help you today?", sender: 'bot' }
];

export default function ChatWidget() {
  const { currentUser } = useStore();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');

  // Auto-clear chat after 5 minutes of inactivity
  useEffect(() => {
    if (messages.length > 1) {
      const timer = setTimeout(() => {
        setMessages(INITIAL_MESSAGES);
      }, 5 * 60 * 1000); // 5 minutes
      return () => clearTimeout(timer);
    }
  }, [messages]);

  const clearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { text: inputValue, sender: 'user' }]);
    const lowerCaseInput = inputValue.toLowerCase();
    setInputValue('');

    // Simulate bot reply
    setTimeout(() => {
      let botReply = "I'm sorry, I'm not sure how to answer that. For more complex questions, please contact our support team.";
      if (lowerCaseInput.includes('payment') || lowerCaseInput.includes('pay')) {
        botReply = "We accept all major credit/debit cards, UPI, and Cash on Delivery (COD)."
      } else if (lowerCaseInput.includes('hello') || lowerCaseInput.includes('hi') || lowerCaseInput.includes('hey')) {
        botReply = "Hello! How can I assist you today? You can ask about delivery, returns, or payments."
      } else if (lowerCaseInput.includes('delivery') || lowerCaseInput.includes('time') || lowerCaseInput.includes('deliver')) {
        botReply = "We deliver from 8 AM to 10 PM, 7 days a week! Most orders arrive within 30-60 minutes."
      } else if (lowerCaseInput.includes('return') || lowerCaseInput.includes('refund') || lowerCaseInput.includes('policy')) {
        botReply = "If you're not happy with an item, you can return it at the time of delivery. For any issues after delivery, please contact our support team within 24 hours."
      }
      setMessages(prev => [...prev, { text: botReply, sender: 'bot' }]);
    }, 1000);
  };

  useEffect(() => {
    const chatArea = document.querySelector('.chat-messages-area');
    if (chatArea) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [messages, isOpen]);

  if (location.pathname.startsWith('/login') || location.pathname.startsWith('/signup')) {
    return null;
  }

  if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'delivery')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      
      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="absolute bottom-20 right-0 w-80 h-96 bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0px_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center shadow-md">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <h3 className="font-black">Support Chat</h3>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={clearChat} className="text-xs bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-lg font-bold transition-colors">Clear</button>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors font-black">✕</button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4 custom-scrollbar chat-messages-area">
              {messages.map((msg, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-tl-sm shadow-sm'}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-green-500 transition-all text-slate-800 font-medium"
              />
              <button type="submit" className="bg-slate-900 text-white p-2 rounded-xl hover:bg-slate-800 transition-colors shadow-md">
                ➔
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button 
        whileHover={{ scale: 1.1 }} 
        whileTap={{ scale: 0.9 }} 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-slate-900 text-white rounded-full flex items-center justify-center text-2xl shadow-[0px_10px_25px_rgba(0,0,0,0.5)] border-2 border-white hover:bg-green-600 transition-colors"
      >
        {isOpen ? '✕' : '💬'}
      </motion.button>
    </div>
  );
}