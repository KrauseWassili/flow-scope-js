"use client";

import { useState } from "react";
import { supabase } from "@/lib/auth/supabaseClient";
import { sendTraceEvent } from "@/lib/trace/sendTraceEvent";

type AuthPanelProps = {
  setTab: (tabName: "messenger" | "auth") => void;
};

export default function AuthPanel({ setTab }: AuthPanelProps) {
  console.log("AuthPanel rendered!");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signInGoogle = async () => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    setBusy(true);
    setError(null);
    const traceId = crypto.randomUUID();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
    });

    if (error) {
      setError(error.message);
    }
    setBusy(false);
  };

  const submit = async () => {
    setBusy(true);
    setError(null);

    const traceId = crypto.randomUUID();

    const { error, data } =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    if (error) {
      sendTraceEvent({
        traceId,
        type: mode === "login" ? "USER_LOGIN" : "USER_REGISTER",
        node: "client_1",
        actorId: "",
        event: mode === "login" ? "login error" : "register error",
        payload: { email: email },
        error: { message: error.message },
        outcome: "error",
        timestamp: Date.now(),
      });

      setError(error.message);
    }
    setBusy(false);
    if (!error) {
      setTab("messenger");
    }
  };

  return (
    <div className="p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Login / Registration</div>
        <button
          className="text-xs underline disabled:opacity-50"
          disabled={busy}
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "Create account" : "Have an account? Login"}
        </button>
      </div>

      <button
        className="input bg-active! text-accent! font-semibold"
        disabled={busy}
        onClick={signInGoogle}
      >
        Continue with Google
      </button>

      <div className="text-xs opacity-60">or</div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!busy && email && password) {
            submit();
          }
        }}
      >
        <input
          className="input"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={busy}
        />

        <input
          className="input"
          placeholder="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={busy}
        />

        <button
          type="submit"
          className="input bg-active! text-accent! font-semibold"
          disabled={busy || !email || !password}
        >
          {mode === "login" ? "Login" : "Register"}
        </button>
      </form>

      {error && <div className="text-xs text-red-600">{error}</div>}
    </div>
  );
}
