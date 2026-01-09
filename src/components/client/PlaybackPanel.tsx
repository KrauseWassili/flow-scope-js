import { useObservedEvents } from "@/hooks/useObservedEvents";
import { PlaybackControls } from "@/lib/playback";
import { useState } from "react";

type PlaybackPanelProps = {
  controls: PlaybackControls;
  mode: "live" | "replay";
  replayIndex: number;
  isPlaying: boolean;
};

export default function PlaybackPanel({ controls, mode, replayIndex, isPlaying }: PlaybackPanelProps) {
  const [tab, setTab] = useState<
    "messenger" | "playback" | "login" | "register"
  >("messenger");

  return (
    <div>
      <h2>Playback panel</h2>

      <p>Current mode: {mode}</p>
      <p>Replay index: {replayIndex}</p>
      <p>Status: {isPlaying ? "Playing" : "Paused"}</p>

      <p className="text-xs text-gray-500 p-2">
        ␣ Play/Pause · ← → Step · ↑ ↓ Speed · M Mark
      </p>

      <div className="flex gap-2">
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
        <button
          onClick={() => controls.setSpeed(0.5)}
          className="w-10 h-8 border-2 bg-blue-300"
        >
          0.5x
        </button>
        <button
          onClick={() => controls.setSpeed(1)}
          className="w-10 h-8 border-2 bg-blue-300"
        >
          1
        </button>
        <button
          onClick={() => controls.setSpeed(2)}
          className="w-10 h-8 border-2 bg-blue-300"
        >
          2
        </button>
      </div>
    </div>
  );
}
