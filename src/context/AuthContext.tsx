"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/auth/supabaseClient";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  accessToken: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthCtx>({
  user: null,
  session: null,
  accessToken: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const prevUserRef = useRef<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      console.log("AUTH EVENT", event, s);
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  // 🔐 LOGIN TRACE (only on transition null → user)
  useEffect(() => {
    if (!loading && user && !prevUserRef.current) {
      sendTraceEvent({
        traceId: crypto.randomUUID(),
        type: "USER_LOGIN",
        node: "client_1",
        actorId: user.id,
        payload: {
          method:
            user.app_metadata?.provider === "google" ? "oauth" : "password",
          email: user.email,
        },
        outcome: "success",
        timestamp: Date.now(),
      });
    }
  }, [user, loading]);

  // 🔐 LOGOUT TRACE (only on transition user → null)
  useEffect(() => {
    if (!loading && !user && prevUserRef.current) {
      sendTraceEvent({
        traceId: crypto.randomUUID(),
        type: "USER_LOGOUT",
        node: "client_1",
        actorId: prevUserRef.current.id,
        event: "logout",
        outcome: "success",
        timestamp: Date.now(),
      });
    }

    prevUserRef.current = user;
  }, [user, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        accessToken: session?.access_token ?? null,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
