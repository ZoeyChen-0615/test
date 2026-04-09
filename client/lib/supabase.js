import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function createClerkSupabaseClient(getToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        let clerkToken = await getToken({ template: "supabase" });
        if (!clerkToken) {
          clerkToken = await getToken();
        }
        const headers = new Headers(options.headers);
        if (clerkToken) {
          headers.set("Authorization", `Bearer ${clerkToken}`);
        }
        return fetch(url, { ...options, headers });
      },
    },
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
