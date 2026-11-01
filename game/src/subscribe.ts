// Optional parent email, collected at the Ad-free purchase (behind the parent gate).
// Stored in Supabase table public.curio_parents (insert-only for the app; see supabase/curio_parents.sql).
const URL_ = 'https://sdomtcctsxtynglmxriu.supabase.co/rest/v1/curio_parents';
const KEY = 'sb_publishable_ehjKPBQNhkFnBVRCawIjAA_vLyVADVI';   // publishable key: safe to ship, the table only allows inserts

export const validEmail = (e: string) => e.length <= 254 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

/** Best effort: a network problem must never block a purchase. */
export async function saveParentEmail(email: string, lang: string): Promise<boolean> {
  try {
    const r = await fetch(URL_, {
      method: 'POST',
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'resolution=ignore-duplicates,return=minimal' },
      body: JSON.stringify({ email: email.trim().toLowerCase(), source: 'ad_free', lang }),
    });
    return r.ok;
  } catch { return false; }
}
