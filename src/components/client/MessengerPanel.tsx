import { useEffect, useRef, useState } from "react";

type MessengerPanelProps = {
  selfId: string;
  peerId: string;
  messages: Message[];
  onSend: (text: string) => void;
};

type Message = {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp?: Date;
};

export default function MessengerPanel({
  selfId,
  peerId,
  messages,
  onSend,
}: MessengerPanelProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const filteredMessages = messages.filter(
    (m) =>
      (m.from === selfId && m.to === peerId) ||
      (m.from === peerId && m.to === selfId)
  );

  return (
    <div className="flex flex-col w-full h-full min-h-0 shadow-lg p-4">
      <div className="flex-1 flex flex-col-reverse overflow-y-auto space-y-2 pb-2">
        {[...filteredMessages].reverse().map((msg) => {

          const isSelf = msg.from === selfId;
          return (
            <div
              key={msg.id}
              className={`flex ${isSelf ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-3 py-2 rounded-2xl shadow
                  ${
                    isSelf ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
                  }
                `}
                title={msg.timestamp?.toLocaleTimeString()}
              >
                <div className="text-sm">{msg.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      <div className="flex gap-2 pt-2">
        <input
          className="flex-1 rounded px-2 py-1 text-black"
          placeholder="Enter message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
        />
        <button
          className="px-4 py-1 bg-blue-500 text-white rounded"
          onClick={() => {
            if (input.trim()) {
              onSend(input);
              setInput("");
            }
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
