"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import MessengerPanel from "./MessengerPanel";
import AuthPanel from "./AuthPanel";
import UserStatus from "./UserStatus";
import { Profile } from "@/lib/profile";
import ContactSelect from "./ContactSelect";
import { emitEvent } from "@/lib/events/emitEvent";
import { emitSystemEvent } from "@/lib/events/system/emitSystemEvent";

type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: Date;
};

function parseRedisMsg(raw: any[]): Message {
  const [id, arr] = raw;
  const obj: any = {};
  for (let i = 0; i < arr.length; i += 2) {
    obj[arr[i]] = arr[i + 1];
  }
  return {
    id,
    ...obj,
    timestamp: obj.timestamp ? new Date(obj.timestamp) : new Date(),
  };
}

export default function ClientArea() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState<Profile[]>([]);
  const [peerId, setPeerId] = useState<string | undefined>();
  const [tab, setTab] = useState<"messenger" | "auth">("messenger");
  const [messages, setMessages] = useState<Message[]>([]);

  /* =========================
     Socket listeners
  ========================= */

  useEffect(() => {
    if (!socket) return;

    socket.emit("get_history");

    const onNewMessage = (msg: any) => {
      setMessages((prev) => [
        ...prev,
        { ...msg, timestamp: new Date(msg.timestamp) },
      ]);
    };

    const onHistory = (rawMsgs: any[]) => {
      setMessages(rawMsgs.map(parseRedisMsg));
    };

    socket.on("message:new", onNewMessage);
    socket.on("message_history", onHistory);

    return () => {
      socket.off("message:new", onNewMessage);
      socket.off("message_history", onHistory);
    };
  }, [socket]);

  /* =========================
     Load contacts
  ========================= */

  useEffect(() => {
    if (!user) return;

    fetch(`/api/peers?selfId=${user.id}`)
      .then((res) => res.json())
      .then(setUsers)
      .catch(console.error);
  }, [user]);

  /* =========================
     Send message
  ========================= */

  const handleSendMessage = (to: string, text: string) => {
    if (!socket || !user) return;
    const traceId = crypto.randomUUID();

    emitSystemEvent({
      traceId,
      type: "MESSAGE_EXCHANGE",
      stage: "client:emit",
    });

    emitEvent({
      traceId,
      type: "MESSAGE_EXCHANGE",
      from: user.id,
      to,
      payload: { text },
    });

    // 🔹 Real message
    socket.emit("message:send", { to, text });
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  const selfId = user?.id;

  const visibleMessages = messages.filter(
    (m) =>
      (m.from === selfId && m.to === peerId) ||
      (m.from === peerId && m.to === selfId)
  );

  return (
    <div className="flex-1 flex flex-col border-b min-h-0">
      <div className="flex gap-2 border-b p-2 flex-shrink-0">
        <button onClick={() => setTab("messenger")}>Messenger</button>
        <button onClick={() => setTab("auth")}>Login / Registration</button>

        {user && (
          <ContactSelect users={users} value={peerId} onChange={setPeerId} />
        )}

        <UserStatus />
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {tab === "messenger" &&
          (selfId && peerId ? (
            <MessengerPanel
              selfId={selfId}
              peerId={peerId}
              messages={visibleMessages}
              onSend={(text) => handleSendMessage(peerId, text)}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center text-xs opacity-60">
              {selfId
                ? "Select a contact to start chatting"
                : "Please log in to use messenger"}
            </div>
          ))}

        {tab === "auth" && <AuthPanel />}
      </div>
    </div>
  );
}
