import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';

// ---------------------------------------------------------------------------
// Config — separate from component for easy env-var injection per deploy
// ---------------------------------------------------------------------------

const API_BASE = import.meta.env.PUBLIC_HERMES_API_URL ?? 'http://localhost:8642';
const API_KEY = import.meta.env.PUBLIC_HERMES_API_KEY ?? '';

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

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '🌿 ¡Hola! Soy el asistente de Varsana. ¿En qué puedo ayudarte?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(() => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
  });
  const messagesEnd = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Health check on mount
  useEffect(() => {
    fetch(`${API_BASE}/health`, {
      headers: { Authorization: `Bearer ${API_KEY}` },
    }).catch(() => {
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: '⚠ El chat no está disponible en este momento.' },
      ]);
    });
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
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className={`
          fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl
          bg-forest text-white shadow-airbnb
          flex items-center justify-center
          transition-all duration-600 ease-in-out
          hover:brightness-90 hover:scale-105
          active:scale-95
        `}
        aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={`
            fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)]
            max-h-[520px] h-[520px]
            bg-sacred-sand rounded-3xl shadow-airbnb
            border border-gray-200/50
            flex flex-col overflow-hidden
            transition-all duration-600 ease-in-out
          `}
        >
          {/* Header */}
          <div className="bg-forest text-white px-5 py-3.5 shrink-0">
            <h3 className="font-display font-semibold text-base">Varsana Eco Aldea</h3>
            <p className="text-xs text-white/75 mt-0.5">Asistente virtual</p>
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
              name="chat-message"
              autoComplete="off"
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
