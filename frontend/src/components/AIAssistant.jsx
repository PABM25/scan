import React, { useState, useRef, useEffect } from 'react';
import { MdClose, MdSend, MdSmartToy } from 'react-icons/md';

function AIAssistant({ documentText, onClose }) {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! I'm your AI assistant. I've read your document. What would you like to know?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api/chat';
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.text,
          context: documentText
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { id: Date.now(), text: data.answer, sender: 'ai' }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now(), text: "Sorry, I couldn't process that request right now.", sender: 'ai' }]);
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now(), text: "Error connecting to the AI service.", sender: 'ai' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col h-full w-full">
      <header className="bg-blue-600 text-white p-4 shadow-sm flex justify-between items-center z-10 shrink-0">
        <div className="flex items-center gap-2">
            <MdSmartToy size={24} />
            <h1 className="text-lg font-bold tracking-tight">AI Assistant</h1>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-blue-700 rounded-full transition">
           <MdClose size={24} />
        </button>
      </header>

      <div className="flex-grow overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-200 text-gray-800 rounded-tl-none'}`}>
                {msg.text}
             </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="max-w-[80%] p-3 rounded-2xl bg-gray-200 text-gray-500 rounded-tl-none flex gap-1">
                <span className="animate-bounce">.</span><span className="animate-bounce" style={{animationDelay: '0.2s'}}>.</span><span className="animate-bounce" style={{animationDelay: '0.4s'}}>.</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-gray-200 shrink-0 flex gap-2 pb-safe-bottom">
         <input
           type="text"
           value={input}
           onChange={(e) => setInput(e.target.value)}
           onKeyPress={(e) => e.key === 'Enter' && handleSend()}
           placeholder="Ask for a summary, key points..."
           className="flex-grow border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
         />
         <button
           onClick={handleSend}
           disabled={!input.trim() || isTyping}
           className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-50 hover:bg-blue-700 transition shrink-0"
         >
           <MdSend size={20} />
         </button>
      </div>
    </div>
  );
}

export default AIAssistant;
