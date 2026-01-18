"use client";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/auth/supabaseClient";

type UserStatusProps = {
  onSetTab: () => void;
};

function getInitials(email?: string, name?: string) {
  if (name) {
    return name
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) {
    return email[0].toUpperCase();
  }
  return "?";
}

export default function UserStatus({ onSetTab }: UserStatusProps) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user)
    return (
      <div className="flex items-center h-10 text-title">
        <button className="btn" onClick={onSetTab}>
          Login
        </button>
        <div className="p-2">Not logged in</div>
      </div>
    );

  const avatarUrl =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || null;

  const name = user.user_metadata?.full_name;
  const initials = getInitials(user.email, name);

  return (
    <div className="flex items-center gap-2 h-10 pl-2">
      {/* Logout */}

      <button
        className="btn"
        onClick={async () => {
          await supabase.auth.signOut();
        }}
      >
        Logout
      </button>

      {/* Avatar */}
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          style={{
            filter: "drop-shadow(-1px 1px 1px rgba(0,0,0,0.55))",
          }}
          className="h-10 w-10 border-active border rounded-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          style={{ boxShadow: "-1px 1px 1px 0 rgba(0,0,0,0.15)" }}
          className="h-10 w-10 border-active border rounded-full bg-background flex items-center justify-center"
        >
          {initials}
        </div>
      )}

      <span
        style={{ textShadow: "-1px 1px 1px rgba(0,0,0,0.15)" }}
        className="h-10 w-10 flex items-center opacity-70 break-all w-35"
      >
        {name ?? user.email?.split("@")[0]}
      </span>
    </div>
  );
}
