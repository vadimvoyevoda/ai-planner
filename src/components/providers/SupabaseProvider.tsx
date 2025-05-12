import { createContext, useContext, useEffect, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClientSupabase } from "@/lib/supabase";

interface SupabaseContext {
  supabase: SupabaseClient | null;
  user: User | null;
  isLoading: boolean;
}

const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | undefined;

    const initializeSupabase = async () => {
      try {
        const client = createClientSupabase();
        setSupabase(client);

        const {
          data: { subscription: authSubscription },
        } = client.auth.onAuthStateChange((_, session) => {
          setUser(session?.user ?? null);
        });

        subscription = authSubscription;
        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing Supabase client:", error);
        setIsLoading(false);
      }
    };

    initializeSupabase();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return <Context.Provider value={{ supabase, user, isLoading }}>{children}</Context.Provider>;
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
};
