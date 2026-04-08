import { createContext, useContext, useMemo } from "react";
import { useUser, useAuth as useClerkAuth } from "@clerk/clerk-react";
import { createClerkSupabaseClient } from "../supabase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded } = useUser();
  const { getToken } = useClerkAuth();

  const supabase = useMemo(() => {
    if (!user) return null;
    return createClerkSupabaseClient(getToken);
  }, [user, getToken]);

  return (
    <AuthContext.Provider value={{ user, loading: !isLoaded, supabase }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
