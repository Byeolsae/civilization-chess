// Reuse one audio context; each retired track disconnects its own nodes.
let context: AudioContext | undefined;
export function createMusicOutput(audio: HTMLAudioElement) {
  context ??= new AudioContext();
  const ctx = context;
  const source = ctx.createMediaElementSource(audio);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0, ctx.currentTime);
  source.connect(gain);
  gain.connect(ctx.destination);
  audio.volume = 1;
  let level = 0;
  return {
    resume: () => ctx.resume(),
    running: () => ctx.state === 'running',
    level: () => level,
    setLevel(value: number, immediate = false) {
      level = Math.max(0, Math.min(1, value));
      gain.gain.cancelScheduledValues(ctx.currentTime);
      if (immediate) gain.gain.setValueAtTime(level, ctx.currentTime);
      else gain.gain.setTargetAtTime(level, ctx.currentTime, 0.015);
    },
    dispose() { source.disconnect(); gain.disconnect(); },
  };
}
