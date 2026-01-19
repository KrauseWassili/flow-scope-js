import { useEffect, useState } from "react";
import { TraceEvent } from "@/lib/trace/sсhemas";

export function useReplay(events: TraceEvent[]) {
  const [mode, setMode] = useState<"live" | "replay">("live");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [index, setIndex] = useState(0);

  const sortedEvents = [...events].sort((a, b) => {
    if (a.timestamp !== b.timestamp) {
      return (a.timestamp ?? 0) - (b.timestamp ?? 0);
    }
    return a.node.localeCompare(b.node);
  });

  const playedEvents = sortedEvents.slice(0, index);

  const activeEvent =
    mode === "replay" && index > 0 ? sortedEvents[index - 1] : null;

  function jumpToTrace(traceId: string) {
    console.log("jumpToTrace");
    const targetIndex = sortedEvents.findIndex((e) => e.traceId === traceId);

    if (targetIndex !== -1) {
      setIsPlaying(false);
      setIndex(targetIndex + 1);
    }
  }

  useEffect(() => {
    if (mode !== "replay" || !isPlaying) return;
    if (index >= events.length) return;

    const delay = 300 / speed;

    const id = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, events.length));
    }, delay);

    return () => clearTimeout(id);
  }, [mode, isPlaying, speed, index, events.length]);

  useEffect(() => {
    if (mode === "replay" && isPlaying && index >= events.length) {
      setIsPlaying(false);
    }
  }, [index, events.length, mode, isPlaying]);

  useEffect(() => {
    setIsPlaying(false);
    setIndex(0);
  }, [events]);

  const controls = {
    toggleMode: () => {
      setMode((m) => (m === "live" ? "replay" : "live"));
      setIsPlaying(false);
      setIndex(0);
    },
    play_pause: () => (isPlaying ? setIsPlaying(false) : setIsPlaying(true)),
    next: () => setIndex((i) => Math.min(i + 1, events.length)),
    prev: () => setIndex((i) => Math.max(i - 1, 0)),
    setSpeed,
  };

  return {
    mode,
    isPlaying,
    speed,
    index,

    playedEvents,
    activeEvent,

    controls,
    jumpToTrace,
  };
}
