/**
 * Inicialización de clientes Supabase en dos niveles de privilegio:
 * - Cliente público (supabase, exportado por defecto): usa la anon key y está
 *   sujeto a Row Level Security; seguro en cliente y servidor.
 * - getAdminClient(): crea un cliente con la service role key que bypassa RLS;
 *   solo debe importarse en rutas API y contexto de servidor.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Admin client — only importable in API routes / server context.
 * Uses SERVICE_ROLE key, bypasses RLS.
 */
export function getAdminClient() {
  return createClient(
    supabaseUrl,
    import.meta.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
