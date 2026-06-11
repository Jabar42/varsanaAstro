/// <reference types="@cloudflare/workers-types" />

/**
 * Capa de acceso a D1 para el control de inventario.
 * Reemplaza la anterior implementación con Supabase RPCs.
 * Las funciones reciben `DB` como argumento (D1Database binding)
 * porque es inyectado por el runtime de Workers via `context.locals.runtime.env`.
 */

export interface InventoryRow {
  max: number;
  reserved: number;
  available: number;
}

export async function getAvailableStock(
  db: D1Database,
  contentType: string,
  contentId: string,
  eventDate: string
): Promise<InventoryRow | null> {
  const row = await db
    .prepare(
      `SELECT stock_max, stock_reserved
       FROM inventory
       WHERE content_type = ? AND content_id = ? AND event_date = ?`
    )
    .bind(contentType, contentId, eventDate)
    .first<{ stock_max: number; stock_reserved: number }>();

  if (!row) return null;
  return {
    max: row.stock_max,
    reserved: row.stock_reserved,
    available: row.stock_max - row.stock_reserved,
  };
}

/**
 * Reserva stock atómicamente.
 * La fila debe existir (creada por ensureInventoryAndReserve o manualmente).
 * Retorna true si la reserva fue exitosa, false si no hay stock suficiente.
 */
export async function reserveStock(
  db: D1Database,
  contentType: string,
  contentId: string,
  quantity: number,
  eventDate: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE inventory
       SET stock_reserved = stock_reserved + ?, updated_at = datetime('now')
       WHERE content_type = ?
         AND content_id = ?
         AND event_date = ?
         AND (stock_max - stock_reserved) >= ?`
    )
    .bind(quantity, contentType, contentId, eventDate, quantity)
    .run();

  return result.meta.changes > 0;
}

/**
 * Libera stock reservado (cuando un pago falla o se rechaza).
 */
export async function releaseStock(
  db: D1Database,
  contentType: string,
  contentId: string,
  quantity: number,
  eventDate: string
): Promise<void> {
  await db
    .prepare(
      `UPDATE inventory
       SET stock_reserved = MAX(stock_reserved - ?, 0), updated_at = datetime('now')
       WHERE content_type = ? AND content_id = ? AND event_date = ?`
    )
    .bind(quantity, contentType, contentId, eventDate)
    .run();
}

/**
 * Operación atómica: inicializa la fila de inventario si no existe,
 * verifica stock disponible y reserva.
 * Retorna { success, available?, requested? }.
 */
export async function ensureInventoryAndReserve(
  db: D1Database,
  contentType: string,
  contentId: string,
  eventDate: string,
  stockMax: number,
  quantity: number
): Promise<{ success: boolean; available?: number; requested?: number }> {
  // 1. Inicializar fila si no existe (no-op si ya existe)
  await db
    .prepare(
      `INSERT INTO inventory (content_type, content_id, event_date, stock_max, stock_reserved)
       VALUES (?, ?, ?, ?, 0)
       ON CONFLICT(content_type, content_id, event_date) DO NOTHING`
    )
    .bind(contentType, contentId, eventDate, stockMax)
    .run();

  // 2. Reserva atómica con check
  const success = await reserveStock(db, contentType, contentId, quantity, eventDate);

  if (!success) {
    // Consultar disponibilidad actual para reportar
    const stock = await getAvailableStock(db, contentType, contentId, eventDate);
    return {
      success: false,
      available: stock?.available ?? 0,
      requested: quantity,
    };
  }

  return { success: true };
}
