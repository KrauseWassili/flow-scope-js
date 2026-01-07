"use client";

import ControlArea from "@/components/layout/ControlArea";
import ObservationArea from "@/components/layout/ObservationArea";
import { SystemEvent } from "@/lib/events";
import { Marker } from "@/lib/Markers";
import { PlaybackControls } from "@/lib/playback";
import { useEffect, useState } from "react";

export default function Home() {
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([]);

  const activeEvent =
    mode === "live" ? events.at(-1) ?? null : events[replayIndex] ?? null;

  function handleSend1() {
    if (mode === "replay") return;
    const event: SystemEvent = {
      id: crypto.randomUUID(),
      type: "MESSAGE_SENT",
      from: "User",
      to: "Messenger_Window",
      payload: { text: "Hello from FlowScope" },
      timestamp: new Date(),
    };

    setEvents((prev) => [...prev, event]);
  }

  function handleSend2() {
    if (mode === "replay") return;
    const event: SystemEvent = {
      id: crypto.randomUUID(),
      type: "MESSAGE_SENT",
      from: "Messenger_Window",
      to: "User",
      payload: { text: "Hello from FlowScope" },
      timestamp: new Date(),
    };

    setEvents((prev) => [...prev, event]);
  }

  function addMarker(eventId: string) {
    setMarkers((prev) => {
      if (prev.some((m) => m.eventId === eventId)) {
        return prev;
      }
      return [...prev, { eventId, createdAt: new Date() }];
    });
  }

  function jumpToEvent (eventId: string) {
    if (mode !== "replay") return;
    const index = events.findIndex(e => e.id===eventId);
    if (index === -1) return;

    setReplayIndex(index);
  }

  useEffect(() => {
    if (!isPlaying || mode !== "replay") return;
    const baseInterval = 600;
    const intervalMs = baseInterval / replaySpeed;
    const timer = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= events.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, mode, events.length]);

  const playbackControls: PlaybackControls = {
    mode: () => {
      setIsPlaying(false);
      return mode === "live" ? setMode("replay") : setMode("live");
    },
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () => setReplayIndex((prev) => Math.min(prev + 1, events.length - 1)),
    prev: () => setReplayIndex((prev) => Math.max(prev - 1, 0)),
    setSpeed: setReplaySpeed,
  };

  return (
    <main className="h-screen grid grid-cols-2">
      <ControlArea
        onSend1={handleSend1}
        onSend2={handleSend2}
        controls={playbackControls}
        mode={mode}
        activeEvent={activeEvent}
        addMarker={addMarker}
      />
      <ObservationArea
        events={events}
        mode={mode}
        replayIndex={replayIndex}
        isPlaying={isPlaying}
        activeEvent={activeEvent}
        markers={markers}
        onJumpToEvent={jumpToEvent}
      />
    </main>
  );
}
