import { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthPanel() {
  const [tab, setTab] = useState<"login" | "register">("login");

  return (
    <div className="p-4 max-w-md mx-auto">
      <div className="flex gap-4 justify-center mb-4">
        <button
          onClick={() => setTab("login")}
          className={tab === "login" ? "font-bold underline" : "text-gray-600"}
        >
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          className={tab === "register" ? "font-bold underline" : "text-gray-600"}
        >
          Registration
        </button>
      </div>
      {tab === "login" && <LoginForm />}
      {tab === "register" && <RegisterForm />}
    </div>
  );
}