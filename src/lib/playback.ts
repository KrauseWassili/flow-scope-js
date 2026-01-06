export type PlaybackControls = {
  mode: () => void;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  setSpeed: (speed: number) => void;
};
