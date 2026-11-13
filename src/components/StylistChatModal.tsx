import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  isFallback?: boolean;
}

export const StylistChatModal: React.FC = () => {
  const { isChatOpen, setChatOpen, cart, user, navigate } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      text: "Hi Mia! I'm StyleMate AI. Ask me how to pair items in your bag, match family pastel tones, or pick the coziest size!",
    },
  ]);

  if (!isChatOpen) return null;

  const quickPrompts = [
    'Pair items in my bag',
    'Family lilac brunch look',
    'Best shoes for Blush Trousers?',
  ];

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend ?? input).trim();
    if (!query || loading) return;

    const nextHistory: ChatMessage[] = [...messages, { role: 'user', text: query }];
    setMessages(nextHistory);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/stylist/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          bagItems: cart,
          audience: user.audienceFocus,
          aesthetics: user.aesthetics,
          history: nextHistory,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fallbackNote =
          data?.code === 'AI_UNAVAILABLE'
            ? 'Live AI stylist requires a GEMINI_API_KEY in Settings > Secrets. Meanwhile, for your current bag, try pairing the Lavender Cloud Cardigan with Blush Pleated Trousers and Lilac Chunky Sneakers for a 98% Harmony score!'
            : data?.error || 'Could not reach StyleMate AI right now. Please try again.';
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', text: fallbackNote, isFallback: true },
        ]);
      } else {
        setMessages((prev) => [...prev, { role: 'assistant', text: data.reply }]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: 'Network interruption while reaching StyleMate AI. Try pairing your Lilac Cardigan with Cream Slacks or Blush Trousers in the AI Pair tab!',
          isFallback: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-on-surface/40 backdrop-blur-xs flex items-end sm:items-center justify-center"
      onClick={() => setChatOpen(false)}
    >
      <div
        className="w-full max-w-[460px] bg-surface rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[82dvh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle & Header */}
        <div className="px-5 pt-3 pb-3 bg-surface-container-low flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-lg">smart_toy</span>
            </div>
            <div>
              <h3 className="font-display font-bold text-[16px] text-on-surface leading-tight">
                StyleMate AI Stylist
              </h3>
              <p className="text-[11px] text-on-surface-variant">
                Tuned to {user.aesthetics.join(', ') || 'Soft Pastel'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setChatOpen(false)}
            aria-label="Close Stylist Chat"
            className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-surface">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[84%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-on-primary rounded-br-sm'
                    : 'bg-surface-container-lowest text-on-surface rounded-bl-sm'
                }`}
              >
                <p>{msg.text}</p>
                {msg.isFallback && (
                  <button
                    type="button"
                    onClick={() => {
                      setChatOpen(false);
                      navigate('pair');
                    }}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-primary underline"
                  >
                    Open AI Outfit Pairing
                    <span className="material-symbols-outlined text-xs">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-surface-container-lowest px-4 py-2.5 rounded-2xl text-[13px] text-on-surface-variant flex items-center gap-2 shadow-sm">
                <span className="material-symbols-outlined text-base animate-spin text-primary">
                  progress_activity
                </span>
                <span>Curating your pastel pairing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar bg-surface-container-low/60">
          {quickPrompts.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="shrink-0 px-3 py-1.5 rounded-full bg-surface-container-lowest text-primary text-[11px] font-semibold shadow-sm hover:bg-primary-fixed transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="p-3 pb-safe bg-surface-container-low flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask for outfit pairings, colors, sizing..."
            className="flex-1 bg-surface-container-lowest text-on-surface text-[13px] px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-md disabled:opacity-50 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
