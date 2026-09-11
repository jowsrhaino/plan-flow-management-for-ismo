import React, { useState } from 'react';
import { MessageSquareText, SendHorizonal, Sparkles, Bot, UserRound, Loader2 } from 'lucide-react';
import api from '../services/api';

const initialBotMessage = {
  sender: 'bot',
  text: 'Hi! I can help with task status, project health, and priorities. Try asking: "How many tasks are pending?" or "What is my project status?"'
};

const Chatbot = () => {
  const [messages, setMessages] = useState([initialBotMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">AI assistant</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">PlanFlow Chatbot</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-700">
          <Sparkles className="h-4 w-4" />
          Workspace insights
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-white">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-900">PlanFlow Assistant</div>
            <div className="text-xs text-slate-500">Always ready with quick project insight</div>
          </div>
        </div>

        <div className="h-[480px] space-y-4 overflow-y-auto bg-slate-50 p-5">
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

        <form onSubmit={handleSubmit} className="flex gap-3 border-t border-slate-200 bg-white p-4">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about tasks, projects, or project health..."
            className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none ring-0 transition focus:border-violet-400 focus:bg-white"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <SendHorizonal className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
