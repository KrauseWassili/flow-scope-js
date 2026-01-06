import { SystemEvent } from "@/lib/events";

type SystemMapProps = {
  events: SystemEvent[];
};

export default function SystemMap({ events }: SystemMapProps) {
  const lastEvent = events.at(-1);

  if (!lastEvent || lastEvent.type !== "MESSAGE_SENT") {
    return null;
  }

  const fromActive = lastEvent.from === "User";
  const toActive = lastEvent.to === "Messenger_Window";

  return (
    <div className="flex gap-4">
      <div className={fromActive ? "bg-amber-300" : ""}>
        [{lastEvent.from}]
      </div>
      <div className={toActive ? "bg-amber-300" : ""}>
        [{lastEvent.to}]
      </div>
    </div>
  );
}
