import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
      }}
      className="flex flex-col gap-3"
    >
      <input
        placeholder="Email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        className="border px-2 py-1 rounded"
      />
      <input
        placeholder="Password"
        type="password"
        value={pass}
        onChange={e => setPass(e.target.value)}
        required
        className="border px-2 py-1 rounded"
      />
      <button type="submit" className="bg-blue-500 text-white px-3 py-1 rounded">
        Login
      </button>
    </form>
  );
}