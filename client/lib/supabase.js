import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://dookfukissvnwozeatmw.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvb2tmdWtpc3N2bndvemVhdG13Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODgxMTEsImV4cCI6MjA5MTI2NDExMX0.MSPk9lRYmvwwsswOn2wUWNlx90GnLrO-hlPEliM2Uyo";

export function createClerkSupabaseClient(getToken) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      fetch: async (url, options = {}) => {
        const clerkToken = await getToken({ template: "supabase" });
        const headers = new Headers(options.headers);
        headers.set("Authorization", `Bearer ${clerkToken}`);
        return fetch(url, { ...options, headers });
      },
    },
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
