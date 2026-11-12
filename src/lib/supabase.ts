import { createClient } from "@supabase/supabase-js";

// Supabase URL ও publishable key Vite env থেকে আসবে (.env.local) — কোডে hardcode করা হবে না
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabase = url && key ? createClient(url, key) : null;
