import { SystemEvent } from "@/lib/events";
import { PlaybackControls } from "@/lib/playback";
import React, { useState } from "react";

type ControlAreaProps = {
  onSend1: () => void;
  onSend2: () => void;
  controls: PlaybackControls;
  mode: "live" | "replay";
  activeEvent: SystemEvent | null;
  addMarker: (arg0: string) => void;
};

export default function ControlArea({
  onSend1,
  onSend2,
  controls,
  mode,
  activeEvent,
  addMarker,
}: ControlAreaProps) {
  return (
    <div>
      <h2>Control area</h2>

      <h3>Messenger (coming soon)</h3>
      <div className="flex gap-2">
        <button onClick={onSend1} disabled={mode === "replay"} className="w-35 h-8 border-2 bg-blue-300">Send message 1</button>
        <button onClick={onSend2} disabled={mode === "replay"} className="w-35 h-8 border-2 bg-blue-300">Send message 2</button>
        <button
          onClick={controls.mode}
          className="w-30 h-8 border-2 bg-blue-300"
        >
          ToggleMode
        </button>
        <button onClick={controls.prev}>⏮️</button>
        <button onClick={controls.pause}>⏸️</button>
        <button onClick={controls.play}>▶️</button>
        <button onClick={controls.next}>⏭️</button>
        <button onClick={() => controls.setSpeed(0.5)} className="w-10 h-8 border-2 bg-blue-300">0.5x</button>
        <button onClick={() => controls.setSpeed(1)} className="w-10 h-8 border-2 bg-blue-300">1</button>
        <button onClick={() => controls.setSpeed(2)} className="w-10 h-8 border-2 bg-blue-300">2</button>
        <button onClick={() => activeEvent && addMarker(activeEvent.id)} disabled={!activeEvent} className="w-10 h-8 border-2 bg-blue-300">★ Mark</button>
      </div>
      <h3>Login (coming soon)</h3>
      <h3>Register (coming soon)</h3>
    </div>
  );
}
