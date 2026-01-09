import { PlaybackControls } from "@/lib/playback";
import MessengerPanel from "./MessengerPanel";
import PlaybackPanel from "./PlaybackPanel";
import AuthPanel from "./AuthPanel";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ClientAreaProps = {
  controls: PlaybackControls;
  mode: "live" | "replay";
  replayIndex: number;
  isPlaying: boolean;
  handleSend: (text: string) => void;
};

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
    timestamp: obj.timestamp ? new Date(obj.timestamp) : undefined,
  };
}

export default function ClientArea({
  controls,
  mode,
  replayIndex,
  isPlaying,
  handleSend,
}: ClientAreaProps) {
  const [tab, setTab] = useState<"messenger" | "playback" | "auth">("auth");
  const [messages, setMessages] = useState<Message[]>([]);
  const socketRef = useRef<Socket | null>(null);
  async function handleSendMessage(from: string, to: string, text: string) {
    if (socketRef.current) {
      socketRef.current.emit("send_message", { from, to, text });
    }
  }

  useEffect(() => {
    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("new_message", (raw) => {
      setMessages((prev) => [...prev, parseRedisMsg(raw)]);
    });

    socket.on("message_history", (msgs) => {
      setMessages(msgs.map(parseRedisMsg));
    });

    socket.emit("get_history");

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 border-b p-2">
        <button onClick={() => setTab("messenger")}>Messenger</button>
        <button onClick={() => setTab("playback")}>Playback</button>
        <button onClick={() => setTab("auth")}>Login / Registration</button>
      </div>
      <div className="h-full min-h-0">
        {tab === "messenger" && (
          <div className="flex flex-col h-full min-h-0">
            <div className="h-1/2 min-h-0 border-b">
              <MessengerPanel
                selfId="user-1"
                peerId="user-2"
                messages={messages}
                onSend={(text) => handleSendMessage("user-1", "user-2", text)}
              />
            </div>
            <div className="h-1/2 min-h-0">
              <MessengerPanel
                selfId="user-2"
                peerId="user-1"
                messages={messages}
                onSend={(text) => handleSendMessage("user-2", "user-1", text)}
              />
            </div>
          </div>
        )}
        {tab === "playback" && (
          <PlaybackPanel
            controls={controls}
            mode={mode}
            replayIndex={replayIndex}
            isPlaying={isPlaying}
          />
        )}
        {tab === "auth" && <AuthPanel />}
      </div>
    </div>
  );
}
