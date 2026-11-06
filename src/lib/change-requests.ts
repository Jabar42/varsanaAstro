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

/**
 * Adjuntos de una solicitud.
 *
 * Reglas de dominio (hardcodeadas a propósito: son el contrato con el equipo):
 * - Máximo 3 archivos de 8 MB (20 MB en total): fotos de referencia y PDF.
 * - El tipo se decide por los BYTES (magic number), nunca por el nombre ni por
 *   el Content-Type que manda el navegador — un .jpg puede ser un HTML.
 * - Nada de SVG/HTML: son vectores de XSS servidos desde el propio dominio.
 * - La clave en R2 es impredecible (fecha + código + aleatorio) porque el link
 *   se comparte por Telegram y no hay login.
 */
export const ATTACHMENTS = {
  maxFiles: 3,
  maxFileBytes: 8 * 1024 * 1024,
  maxTotalBytes: 20 * 1024 * 1024,
  prefix: 'change-requests/',
  maxName: 80,
} as const;

export interface Attachment {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

/** Tipo real del archivo por magic number. Devuelve null si no está permitido. */
export function sniffType(bytes: Uint8Array): { mime: string; ext: string } | null {
  const b = bytes;
  const starts = (sig: number[]) => sig.every((v, i) => b[i] === v);
  if (starts([0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg' };
  if (starts([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png' };
  if (starts([0x47, 0x49, 0x46, 0x38])) return { mime: 'image/gif', ext: 'gif' };
  if (starts([0x52, 0x49, 0x46, 0x46]) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' };
  }
  if (starts([0x25, 0x50, 0x44, 0x46])) return { mime: 'application/pdf', ext: 'pdf' };
  // AVIF / HEIC: caja 'ftyp' en el offset 4.
  if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) {
    const brand = String.fromCharCode(b[8], b[9], b[10], b[11]);
    if (brand === 'avif' || brand === 'avis') return { mime: 'image/avif', ext: 'avif' };
    if (['heic', 'heix', 'hevc', 'mif1', 'msf1'].includes(brand)) return { mime: 'image/heic', ext: 'heic' };
  }
  return null;
}

/** Nombre para mostrar: sin rutas, sin caracteres de control, acotado. */
export function sanitizeFileName(name: string): string {
  const base = (name || '')
    .split(/[\\/]/)
    .pop()!
    .replace(/[\u0000-\u001f\u007f]/g, '')
    .trim();
  return clamp(base || 'archivo', ATTACHMENTS.maxName);
}

function randomHex(bytes = 8): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((x) => x.toString(16).padStart(2, '0'))
    .join('');
}

export type StoreResult =
  | { ok: true; attachments: Attachment[] }
  | { ok: false; message: string };

/**
 * Guarda los adjuntos en R2 bajo `change-requests/AAAA/MM/DD/…`.
 * Devuelve las URLs públicas (relativas) que van a D1 y a Telegram.
 */
export async function storeAttachments(
  bucket: R2Bucket,
  files: File[],
  code: string,
  origin: string,
): Promise<StoreResult> {
  const candidates = files.filter((f) => f && f.size > 0);
  if (candidates.length > ATTACHMENTS.maxFiles) {
    return { ok: false, message: `Máximo ${ATTACHMENTS.maxFiles} archivos por solicitud` };
  }
  const total = candidates.reduce((sum, f) => sum + f.size, 0);
  if (total > ATTACHMENTS.maxTotalBytes) {
    return { ok: false, message: 'Los archivos suman más de 20 MB' };
  }

  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const folder = `${ATTACHMENTS.prefix}${yyyy}/${mm}/${dd}/`;

  const attachments: Attachment[] = [];
  for (const [i, file] of candidates.entries()) {
    const name = sanitizeFileName(file.name);
    if (file.size > ATTACHMENTS.maxFileBytes) {
      return { ok: false, message: `"${name}" pesa ${(file.size / 1024 / 1024).toFixed(1)} MB (máximo 8 MB)` };
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    const kind = sniffType(buffer);
    if (!kind) {
      return {
        ok: false,
        message: `"${name}" no es una foto (JPG, PNG, WebP, GIF, AVIF) ni un PDF`,
      };
    }
    const key = `${folder}${code}-${String(i + 1).padStart(2, '0')}-${randomHex(4)}.${kind.ext}`;
    await bucket.put(key, buffer, {
      httpMetadata: { contentType: kind.mime },
      customMetadata: { request: code, original: name },
    });
    attachments.push({
      key,
      name,
      size: file.size,
      type: kind.mime,
      url: `${origin}/api/change-requests/attachments/${key}`,
    });
  }

  return { ok: true, attachments };
}

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

/**
 * Código legible del día: VC-YYMMDD-NN (NN = consecutivo diario).
 * Se toma el último código DEL DÍA (por id, no por COUNT): borrar una
 * solicitud no debe repetir un código ya usado (la columna es UNIQUE).
 */
export async function nextCode(db: D1Database): Promise<string> {
  const now = new Date();
  const yy = String(now.getUTCFullYear()).slice(2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  const prefix = `VC-${yy}${mm}${dd}`;
  const row = await db
    .prepare('SELECT code FROM change_requests WHERE code LIKE ? ORDER BY id DESC LIMIT 1')
    .bind(`${prefix}-%`)
    .first<{ code: string }>();
  const last = row ? Number.parseInt(row.code.split('-')[2] ?? '0', 10) : 0;
  const next = Number.isFinite(last) ? last + 1 : 1;
  return `${prefix}-${String(next).padStart(2, '0')}`;
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
  meta: { code: string; ipHash: string; userAgent: string; attachments?: Attachment[] },
): Promise<string> {
  await db
    .prepare(
      `INSERT INTO change_requests
        (code, requester_name, requester_contact, area, type, page, title, description, priority, deadline, reference_url, ip_hash, user_agent, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
      JSON.stringify(meta.attachments ?? []),
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
  attachments: Attachment[] = [],
): string {
  const adjuntos = attachments.map((a) => {
    const icono = a.type === 'application/pdf' ? '📄' : '🖼️';
    return `${icono} <a href="${escapeHtml(a.url)}">${escapeHtml(a.name)}</a> (${Math.max(1, Math.round(a.size / 1024))} KB)`;
  });

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
    ...(adjuntos.length ? ['', `<b>Adjuntos (${adjuntos.length}):</b>`, ...adjuntos] : []),
  ];
  return lines.filter((l) => l !== '').join('\n');
}
