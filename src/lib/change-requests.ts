/**
 * Solicitudes de cambio al sitio (formulario /solicitud-cambios).
 *
 * Reglas de dominio:
 * - El vocabulario de `type` y `priority` es CERRADO: es lo que hace que las
 *   solicitudes lleguen estructuradas y filtrables. Si se agrega un valor,
 *   debe agregarse en TYPES / PRIORITIES, en el diccionario
 *   `solicitudCambios.ts` y en el <select> de la página.
 * - El `area` es libre a propósito (las áreas internas cambian).
 * - Todo texto se recorta y se limita; nada entra a D1 sin pasar por validate().
 */

export const TYPES = [
  'contenido',
  'correccion',
  'imagen',
  'precio_fechas',
  'evento',
  'funcionalidad',
  'error',
  'otro',
] as const;

export const PRIORITIES = ['baja', 'media', 'alta', 'urgente'] as const;

export const STATUSES = ['nuevo', 'en_proceso', 'hecho', 'descartado'] as const;

export type ChangeRequestType = (typeof TYPES)[number];
export type ChangeRequestPriority = (typeof PRIORITIES)[number];
export type ChangeRequestStatus = (typeof STATUSES)[number];

export const LIMITS = {
  requester_name: 120,
  requester_contact: 160,
  area: 80,
  page: 200,
  title: 160,
  description: 4000,
  deadline: 10,
  reference_url: 500,
} as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+\d][\d\s()-]{6,}$/;

export interface ChangeRequestInput {
  requester_name: string;
  requester_contact: string;
  area: string;
  type: ChangeRequestType;
  page: string;
  title: string;
  description: string;
  priority: ChangeRequestPriority;
  deadline: string;
  reference_url: string;
}

export type ValidationResult =
  | { ok: true; value: ChangeRequestInput }
  | { ok: false; message: string };

function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim();
}

function clamp(s: string, max: number): string {
  return s.slice(0, max);
}

/** `contacto` acepta email o teléfono/WhatsApp; se valida que sea uno de los dos. */
export function isValidContact(value: string): boolean {
  return EMAIL_RE.test(value) || PHONE_RE.test(value);
}

export function validate(raw: Record<string, unknown>): ValidationResult {
  const name = clamp(str(raw.requester_name), LIMITS.requester_name);
  const contact = clamp(str(raw.requester_contact), LIMITS.requester_contact);
  const title = clamp(str(raw.title), LIMITS.title);
  const description = clamp(str(raw.description), LIMITS.description);
  const type = str(raw.type) as ChangeRequestType;
  const priority = (str(raw.priority) || 'media') as ChangeRequestPriority;
  const deadline = clamp(str(raw.deadline), LIMITS.deadline);
  const referenceUrl = clamp(str(raw.reference_url), LIMITS.reference_url);

  if (!name) return { ok: false, message: 'Falta el nombre del solicitante' };
  if (!contact) return { ok: false, message: 'Falta un email o WhatsApp de contacto' };
  if (!isValidContact(contact)) return { ok: false, message: 'El contacto no es un email ni un teléfono válido' };
  if (!TYPES.includes(type)) return { ok: false, message: 'Tipo de cambio inválido' };
  if (!title) return { ok: false, message: 'Falta el título de la solicitud' };
  if (description.length < 10) return { ok: false, message: 'La descripción es demasiado corta' };
  if (!PRIORITIES.includes(priority)) return { ok: false, message: 'Prioridad inválida' };
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return { ok: false, message: 'Fecha límite inválida' };
  if (referenceUrl && !/^https?:\/\//i.test(referenceUrl)) {
    return { ok: false, message: 'La referencia debe ser un enlace http(s)' };
  }

  return {
    ok: true,
    value: {
      requester_name: name,
      requester_contact: contact,
      area: clamp(str(raw.area), LIMITS.area),
      type,
      page: clamp(str(raw.page), LIMITS.page),
      title,
      description,
      priority,
      deadline,
      reference_url: referenceUrl,
    },
  };
}

/** Hash corto de la IP: sirve para rate limit y para no guardar IPs en claro. */
export async function hashIp(ip: string): Promise<string> {
  if (!ip) return '';
  const data = new TextEncoder().encode(`varsana-cr:${ip}`);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .slice(0, 12)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Código legible del día: VC-YYMMDD-NN (NN = consecutivo diario). */
export async function nextCode(db: D1Database): Promise<string> {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const prefix = `VC-${yy}${mm}${dd}`;
  const row = await db
    .prepare("SELECT COUNT(*) AS n FROM change_requests WHERE code LIKE ?")
    .bind(`${prefix}-%`)
    .first<{ n: number }>();
  return `${prefix}-${String((row?.n ?? 0) + 1).padStart(2, '0')}`;
}

export async function countRecentByIp(db: D1Database, ipHash: string, minutes = 10): Promise<number> {
  if (!ipHash) return 0;
  const row = await db
    .prepare(
      "SELECT COUNT(*) AS n FROM change_requests WHERE ip_hash = ? AND created_at > datetime('now', ?)",
    )
    .bind(ipHash, `-${minutes} minutes`)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

export async function insertChangeRequest(
  db: D1Database,
  input: ChangeRequestInput,
  meta: { code: string; ipHash: string; userAgent: string },
): Promise<string> {
  await db
    .prepare(
      `INSERT INTO change_requests
        (code, requester_name, requester_contact, area, type, page, title, description, priority, deadline, reference_url, ip_hash, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      meta.code,
      input.requester_name,
      input.requester_contact,
      input.area,
      input.type,
      input.page,
      input.title,
      input.description,
      input.priority,
      input.deadline,
      input.reference_url,
      meta.ipHash,
      meta.userAgent.slice(0, 300),
    )
    .run();
  return meta.code;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

const PRIORITY_LABEL: Record<ChangeRequestPriority, string> = {
  baja: '🟢 Baja',
  media: '🟡 Media',
  alta: '🟠 Alta',
  urgente: '🔴 Urgente',
};

const TYPE_LABEL: Record<ChangeRequestType, string> = {
  contenido: 'Contenido nuevo',
  correccion: 'Corrección de texto',
  imagen: 'Imagen / foto',
  precio_fechas: 'Precio o fechas',
  evento: 'Evento o pasadía',
  funcionalidad: 'Funcionalidad del sitio',
  error: 'Error técnico',
  otro: 'Otro',
};

/** Mensaje estructurado para el chat del equipo. */
export function buildChangeRequestMessage(
  input: ChangeRequestInput,
  code: string,
): string {
  const lines = [
    `🛠️ <b>Nueva solicitud de cambio</b> — <code>${escapeHtml(code)}</code>`,
    '',
    `<b>Solicita:</b> ${escapeHtml(input.requester_name)}${input.area ? ` (${escapeHtml(input.area)})` : ''}`,
    `<b>Contacto:</b> ${escapeHtml(input.requester_contact)}`,
    `<b>Tipo:</b> ${TYPE_LABEL[input.type]}`,
    `<b>Prioridad:</b> ${PRIORITY_LABEL[input.priority]}`,
    `<b>Página:</b> ${input.page ? escapeHtml(input.page) : 'No especificada'}`,
    input.deadline ? `<b>Fecha límite:</b> ${escapeHtml(input.deadline)}` : '',
    '',
    `<b>${escapeHtml(input.title)}</b>`,
    escapeHtml(input.description.slice(0, 1200)),
    input.reference_url ? `\n🔗 ${escapeHtml(input.reference_url)}` : '',
  ];
  return lines.filter((l) => l !== '').join('\n');
}
