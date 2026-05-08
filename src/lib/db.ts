import { getAdminClient } from './supabase';

export async function getAvailableStock(contentType: string, contentId: string) {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from('inventory')
    .select('stock_max, stock_reserved')
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (error || !data) return null;
  return {
    max: data.stock_max,
    reserved: data.stock_reserved,
    available: data.stock_max - data.stock_reserved,
  };
}

export async function reserveStock(contentType: string, contentId: string, quantity: number) {
  const admin = getAdminClient();
  // Atomic increment — only if enough remaining
  const { data, error } = await admin.rpc('decrement_stock', {
    p_content_type: contentType,
    p_content_id: contentId,
    p_quantity: quantity,
  });
  if (error) throw error;
  return data;
}

/**
 * Release reserved stock when a payment fails or is declined.
 * Atomically decrements stock_reserved by the given quantity.
 */
export async function releaseStock(contentType: string, contentId: string, quantity: number) {
  const admin = getAdminClient();
  const { error } = await admin.rpc('release_stock', {
    p_content_type: contentType,
    p_content_id: contentId,
    p_quantity: quantity,
  });
  if (error) throw error;
}
