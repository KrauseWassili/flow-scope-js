import { SystemEvent } from "@/lib/events";
import EventTimeline from "../observation/EventTimeline";
import SystemMap from "../observation/SystemMap";
import { useState } from "react";

type ObservationAreaProps = {
  events: SystemEvent[];
  mode: "live" | "replay";
  replayIndex: number;
  isPlaying: boolean;
};

export default function ObservationArea({
  events,
  mode,
  replayIndex,
  isPlaying,
}: ObservationAreaProps) {
  const activeEvent =
    mode === "live" ? events.at(-1) ?? null : events[replayIndex] ?? null;

  return (
    <div>
      <h2>System map</h2>
      <p>Current mode: {mode}</p>
      <p>Replay index: {replayIndex}</p>
      <p>Status: {isPlaying ? "Playing" : "Paused"}</p>

      <SystemMap events={events} activeEvent={activeEvent}/>
      <EventTimeline events={events} mode={mode} activeEvent={activeEvent} />
      <h3>User</h3>
      <h3>Messenger</h3>
      <h3>Redis</h3>
      <h3>Supabase</h3>
    </div>
  );
}
