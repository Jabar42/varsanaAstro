import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';

// ---------------------------------------------------------------------------
// Config — separate from component for easy env-var injection per deploy
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.PUBLIC_HERMES_API_URL ?? 'http://localhost:8642';
const API_KEY=import..._KEY ?? '';

const STORAGE_KEY = 'varsana-chat-session';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface SessionResponse {
  session: { id: string };
}

interface ChatResponse {
  message: { role: string; content: string };
}

interface HistoryMessage {
  role: string;
  content: string;
}

type Message = { role: 'user' | 'bot' | 'error'; text: string };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function createSession(): Promise<string> {
  const res = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title: 'Chat Web Varsana ' + Date.now() }),
  });
  if (!res.ok) throw new Error(`Error al crear sesión: ${res.status}`);
  const data: SessionResponse = await res.json();
  return data.session.id;
}

async function sendChat(sessionId: string, message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/chat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(errText || `Error ${res.status}`);
  }
  const data: ChatResponse = await res.json();
  return data.message.content;
}

async function loadHistory(sessionId: string): Promise<Message[]> {
  const res = await fetch(`${API_BASE}/api/sessions/${sessionId}/messages`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const msgs = data.messages ?? data.data ?? [];
  return msgs
    .filter((m: HistoryMessage) => m.role === 'user' || m.role === 'assistant')
    .map((m: HistoryMessage) => ({
      role: m.role === 'assistant' ? 'bot' as const : 'user' as const,
      text: m.content,
    }));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const messagesEnd = useRef<HTMLDivElement>(null);
  const [closing, setClosing] = useState(false);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Lock background scroll when panel is open
  useEffect(() => {
    if (open && !closing) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, closing]);

  // Load history on mount
  useEffect(() => {
    async function init() {
      if (sessionId) {
        const history = await loadHistory(sessionId);
        if (history.length > 0) {
          setMessages(history);
          setInitialLoading(false);
          return;
        }
      }
      // No session or empty history → show welcome
      setMessages([
        { role: 'bot', text: '🌿 ¡Hola! Soy el asistente de Varsana. ¿En qué puedo ayudarte?' },
      ]);
      setInitialLoading(false);
    }
    init();
  }, []);

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);

    try {
      let sid = sessionId;
      if (!sid) {
        sid = await createSession();
        setSessionId(sid);
        localStorage.setItem(STORAGE_KEY, sid);
      }
      const reply = await sendChat(sid, text);
      setMessages((prev) => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const msg = err?.message ?? 'Error inesperado';
      // Reset session on 404 / invalid session
      if (msg.includes('404') || msg.includes('session_not_found')) {
        setSessionId(null);
        localStorage.removeItem(STORAGE_KEY);
      }
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: `⚠ ${msg}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <>
      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slide-down {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(100%);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.4s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.3s ease-in forwards;
        }
      `}</style>

      {/* Floating button — only opens */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="
            fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl
            bg-forest text-white shadow-airbnb
            flex items-center justify-center
            transition-all duration-600 ease-in-out
            hover:brightness-90 hover:scale-105
            active:scale-95
          "
          aria-label="Abrir chat"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div
          className={`
            fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50
            w-full sm:w-[360px]
            h-full sm:max-h-[520px] sm:h-[520px]
            sm:rounded-3xl
            bg-sacred-sand shadow-airbnb border border-gray-200/50
            flex flex-col
            ${closing ? 'animate-slide-down' : 'animate-slide-up'}
          `}
        >
          {/* Header */}
          <div className="bg-forest text-white px-5 py-3.5 shrink-0 flex items-center justify-between sm:rounded-t-3xl">
            <div>
              <h3 className="font-display font-semibold text-base">Varsana Eco Aldea</h3>
              <p className="text-xs text-white/75 mt-0.5">Asistente virtual</p>
            </div>
            <button
              onClick={() => {
                setClosing(true);
                setTimeout(() => {
                  setOpen(false);
                  setClosing(false);
                }, 300);
              }}
              aria-label="Cerrar chat"
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2.5">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`
                  max-w-[85%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${m.role === 'user'
                    ? 'self-end bg-forest text-white rounded-br-md'
                    : m.role === 'error'
                      ? 'self-start bg-red-50 text-red-700 rounded-bl-md'
                      : 'self-start bg-white border border-gray-200/60 text-near-black rounded-bl-md'
                  }
                `}
              >
                {m.text}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-white border border-gray-200/60 text-gray-400 text-sm px-3.5 py-2.5 rounded-2xl rounded-bl-md">
                Escribiendo...
              </div>
            )}
            <div ref={messagesEnd} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="shrink-0 flex gap-2 px-4 py-3 border-t border-gray-200/60 bg-white/60">
            <input
              type="text"
              inputMode="text"
              name="chat"
              autoComplete="off"
              data-1p-ignore
              data-lpignore="true"
              data-form-type="other"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu mensaje..."
              disabled={loading}
              className="flex-1 px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-near-black placeholder-gray-400 focus:outline-none focus:border-forest disabled:opacity-50 transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              title="Enviar"
              className="shrink-0 w-10 h-10 bg-forest text-white rounded-xl hover:brightness-90 disabled:opacity-40 transition-all flex items-center justify-center"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
