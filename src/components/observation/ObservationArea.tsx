import { SystemEvent } from "@/lib/events";
import EventTimeline from "./EventTimeline";
import SystemMap from "./SystemMap";
import { Marker } from "@/lib/Markers";
import { EventStage, ObservedEvent } from "@/hooks/useObservedEvents";

type ObservationAreaProps = {
  events: ObservedEvent[];
  isPlaying: boolean;
  activeEvent: SystemEvent | null;
  mode: "live" | "replay";
  markers: Marker[];
  onJumpToEvent: (eventId: string) => void;
};

export default function ObservationArea({
  events,
  mode,
  activeEvent,
  markers,
  onJumpToEvent,
}: ObservationAreaProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 border-b p-2">
        <button className="text-transparent">Messenger</button>        
      </div>
      <div className="h-1/2 max-h-1/2 overflow-auto border-b">
        <SystemMap events={events} activeEvent={activeEvent} />
      </div>
      <div className="h-1/2 min-h-0 overflow-auto">
        <EventTimeline
          events={events}
          mode={mode}
          activeEvent={activeEvent}
          markers={markers}
          onJumpToEvent={onJumpToEvent}
        />
      </div>
    </div>
  );
}
