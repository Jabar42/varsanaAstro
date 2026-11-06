-- Solicitudes de cambio al sitio enviadas por miembros de Varsana.
-- Formulario: /solicitud-cambios → POST /api/change-requests
CREATE TABLE IF NOT EXISTS change_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,            -- VC-YYMMDD-NN legible para el equipo
  requester_name TEXT NOT NULL,
  requester_contact TEXT NOT NULL,      -- email o WhatsApp
  area TEXT,                            -- área/rol del solicitante
  type TEXT NOT NULL,                   -- contenido | correccion | imagen | precio_fechas | evento | funcionalidad | error | otro
  page TEXT,                            -- ruta o sección afectada
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'media', -- baja | media | alta | urgente
  deadline TEXT,                        -- fecha límite YYYY-MM-DD (opcional)
  reference_url TEXT,
  status TEXT NOT NULL DEFAULT 'nuevo', -- nuevo | en_proceso | hecho | descartado
  ip_hash TEXT,
  user_agent TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_change_requests_created ON change_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_change_requests_status ON change_requests(status);
CREATE INDEX IF NOT EXISTS idx_change_requests_ip ON change_requests(ip_hash, created_at);
