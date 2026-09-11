import React, { useState } from 'react';
import { MessageSquareText, SendHorizonal, Sparkles, Bot, UserRound, Loader2, X } from 'lucide-react';
import api from '../services/api';

const initialBotMessage = {
  sender: 'bot',
  text: 'Hi! I can help with task status, project health, and priorities. Try asking: "How many tasks are pending?" or "What is my project status?"'
};

const Chatbot = () => {
  const [messages, setMessages] = useState([initialBotMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMessage = { sender: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/chatbot/ask', { message: trimmed });
      const reply = response?.data?.data?.reply || 'I could not generate a reply right now.';
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (error) {
      const message = error?.response?.data?.error || 'The assistant is unavailable right now.';
      setMessages((prev) => [...prev, { sender: 'bot', text: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <section className="fixed bottom-24 right-4 z-50 flex h-[min(560px,calc(100vh-7rem))] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:right-6" aria-label="PlanFlow Assistant">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-slate-900">PlanFlow Assistant</div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Sparkles className="h-3 w-3 text-violet-600" />
                  Workspace insights
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900" aria-label="Close assistant">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto bg-slate-50 p-4">
          {messages.map((message, index) => (
            <div key={`${message.sender}-${index}`} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full ${message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-violet-100 text-violet-700'}`}>
                  {message.sender === 'user' ? <UserRound className="h-4 w-4" /> : <MessageSquareText className="h-4 w-4" />}
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${message.sender === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 border border-slate-200'}`}>
                  {message.text}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                Thinking...
              </div>
            </div>
          )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-200 bg-white p-3">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about tasks, projects, or project health..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none ring-0 transition focus:border-violet-400 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
          </form>
        </section>
      )}

      <button
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="fixed bottom-5 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition hover:scale-105 hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-200 sm:right-6"
        aria-label={open ? 'Close assistant' : 'Open assistant'}
        title={open ? 'Close assistant' : 'Open assistant'}
      >
        {open ? <X className="h-6 w-6" /> : <MessageSquareText className="h-6 w-6" />}
      </button>
    </>
  );
};

export default Chatbot;
