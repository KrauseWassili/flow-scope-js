"use client";

import { Profile } from "@/lib/auth/profile";

type ContactSelectProps = {
  users: Profile[];
  value?: string | null;
  onChange: (userId: string) => void;
};

export default function PeerSelect({
  users,
  value,
  onChange,
}: ContactSelectProps) {
  return (
    <select
      className="btn sm:w-35! bg-inactive!"
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        if (v) onChange(v);
      }}
    >
      <option value="" disabled>
        Select peer
      </option>

      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.fullName ?? u.email?.split("@")[0]}
        </option>
      ))}
    </select>
  );
}
