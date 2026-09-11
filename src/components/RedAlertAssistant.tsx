import React, { useState, useRef, useEffect } from 'react';
import { Alert, ChatMessage } from '../types';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Shield,
  Bot,
  User,
  AlertCircle,
} from 'lucide-react';

interface RedAlertAssistantProps {
  currentAlert: Alert | null;
}

export const RedAlertAssistant: React.FC<RedAlertAssistantProps> = ({
  currentAlert,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: 'Hello, I am Red Alert Assistant. I can help explain hazard classifications, active alert details, or emergency survival guidelines. How can I assist your safety preparedness today?',
      timestamp: 'Just now',
      source: 'Safety Knowledge Base',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const quickPrompts = [
    'What should I do during a flood?',
    'What does orange alert mean?',
    'Explain this alert.',
    'Why is this alert important?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          currentAlert,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const assistantMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          source: data.source || 'Red Alert AI Engine',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (err) {
      console.warn('Chat assistant fetch failed, using safety rule fallback:', err);
      const fallbackMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: 'Always follow instructions from official emergency services and civil defense. For active threats, dial 911 or your local emergency number and move to designated safe shelters.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'Emergency Safety Rules',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Assistant Launcher Button */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          id="open-red-alert-assistant-btn"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-2xl transition-all duration-300 active:scale-95 ${
            isOpen
              ? 'bg-slate-800 text-slate-200 border border-slate-700'
              : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/40 ring-4 ring-rose-600/20'
          }`}
          aria-label="Open Red Alert Assistant"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <Bot className="w-5 h-5" />
              <span className="font-tech font-bold text-xs uppercase tracking-wider hidden sm:inline">
                Red Alert Assistant
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </>
          )}
        </button>
      </div>

      {/* Assistant Modal Window */}
      {isOpen && (
        <div
          id="red-alert-assistant-panel"
          className="fixed bottom-20 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 max-h-[560px] h-[520px] rounded-3xl border border-slate-800 bg-slate-950/95 shadow-2xl backdrop-blur-xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-600/20 border border-rose-500/30 text-rose-400">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-tech text-sm font-bold uppercase text-white tracking-wider">
                  Red Alert Assistant
                </h3>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono-num">
                  <Sparkles className="w-3 h-3 text-rose-400" /> Powered by Gemini
                </span>
              </div>
            </div>

            <button
              id="close-assistant-btn"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-1 ${
                      isUser ? 'bg-rose-600 text-white' : 'bg-slate-800 text-rose-400 border border-slate-700'
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>

                  <div
                    className={`p-3 rounded-2xl max-w-[82%] text-xs leading-relaxed ${
                      isUser
                        ? 'bg-rose-600 text-white rounded-tr-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                    }`}
                  >
                    <p>{msg.text}</p>
                    <div
                      className={`text-[9px] mt-1 font-mono-num ${
                        isUser ? 'text-rose-200' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp} {msg.source ? `• ${msg.source}` : ''}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2">
                <Bot className="w-4 h-4 text-rose-400 animate-spin" />
                <span>Assistant is evaluating safety guidance...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 border-t border-slate-800/80 bg-slate-900/50 flex gap-1.5 overflow-x-auto no-scrollbar">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                className="whitespace-nowrap px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex-shrink-0"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input field */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
          >
            <input
              id="assistant-chat-input"
              type="text"
              placeholder="Ask safety questions..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
            />
            <button
              id="send-chat-btn"
              type="submit"
              disabled={loading || !inputMessage.trim()}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all disabled:opacity-50"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Safety reminder footer */}
          <div className="px-3 py-1 bg-slate-900 text-[9px] text-slate-400 text-center font-mono-num">
            Safety note: In life-threatening emergencies, dial 911 / 112 immediately.
          </div>
        </div>
      )}
    </>
  );
};
