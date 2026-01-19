import { AuthProvider } from "@/context/AuthContext";
import { MessengerSocketProvider } from "@/context/MessengerSocketContext";
import { SocketProvider } from "@/context/SocketContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <MessengerSocketProvider>
        <SocketProvider>{children}</SocketProvider>
      </MessengerSocketProvider>
    </AuthProvider>
  );
}
