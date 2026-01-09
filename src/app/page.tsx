"use client";

import KeyboardControls from "@/components/KeyboardControls";
import ClientArea from "@/components/client/ClientArea";
import ObservationArea from "@/components/observation/ObservationArea";
import { useEventsApi } from "@/hooks/useEventsApi";
import { useObservedEvents } from "@/hooks/useObservedEvents";
import { Marker } from "@/lib/Markers";
import { PlaybackControls } from "@/lib/playback";
import { SystemEventInput } from "@/lib/schemas/systemEvent";
import { useEffect, useState } from "react";

export default function Home() {
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [replayIndex, setReplayIndex] = useState(0);
  const [replaySpeed, setReplaySpeed] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const { observedList, upsertDbEvents, markStage } = useObservedEvents();
  const { data: events, refetch } = useEventsApi();
  const activeEvent =
    mode === "live"
      ? observedList.at(-1) ?? null
      : observedList[replayIndex] ?? null;

  async function sendEvent(eventData: SystemEventInput) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(eventData),
    });

    if (!res.ok) {
      alert("send message error");
      throw new Error("Send event failed");
    }

    const event = await res.json();
    const withDate = {
      ...event,
      timestamp: new Date(event.timestamp),
    };

    upsertDbEvents([withDate]);

    return withDate;
  }

  function handleSend(text: string) {
    if (mode === "replay") return;
    const event: SystemEventInput = {
      type: "MESSAGE_SENT",
      from: "User",
      to: "Messenger_Window",
      payload: { text: text },
    };

    sendEvent(event);
  }

  function addMarker(eventId: string) {
    setMarkers((prev) => {
      if (prev.some((m) => m.eventId === eventId)) {
        return prev;
      }
      return [...prev, { eventId, createdAt: new Date() }];
    });
  }

  function jumpToEvent(eventId: string) {
    if (mode !== "replay") return;
    const index = observedList.findIndex((e) => e.id === eventId);
    if (index === -1) return;

    setReplayIndex(index);
  }

  useEffect(() => {
    if (!isPlaying || mode !== "replay") return;
    const baseInterval = 600;
    const intervalMs = baseInterval / replaySpeed;
    const timer = setInterval(() => {
      setReplayIndex((prev) => {
        if (prev >= observedList.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, mode, observedList.length]);

  useEffect(() => {
    if (events) upsertDbEvents(events);
  }, [events]);

  const playbackControls: PlaybackControls = {
    mode: () => {
      setIsPlaying(false);
      return mode === "live" ? setMode("replay") : setMode("live");
    },
    play: () => setIsPlaying(true),
    pause: () => setIsPlaying(false),
    next: () =>
      setReplayIndex((prev) => Math.min(prev + 1, observedList.length - 1)),
    prev: () => setReplayIndex((prev) => Math.max(prev - 1, 0)),
    setSpeed: setReplaySpeed,
  };

  return (
    <main className="h-screen grid grid-cols-2">
      <div className="h-full min-h-0 flex flex-col border-r">
        <ClientArea
          controls={playbackControls}
          mode={mode}
          replayIndex={replayIndex}
          isPlaying={isPlaying}
          handleSend={handleSend}
        />
      </div>
      <div className="h-full min-h-0 flex flex-col">
        <ObservationArea
          events={observedList}
          mode={mode}
          isPlaying={isPlaying}
          activeEvent={activeEvent}
          markers={markers}
          onJumpToEvent={jumpToEvent}
        />
      </div>

      <KeyboardControls
        mode={mode}
        isPlaying={isPlaying}
        replaySpeed={replaySpeed}
        activeEvent={activeEvent}
        controls={playbackControls}
        addMarker={addMarker}
      />
    </main>
  );
}
