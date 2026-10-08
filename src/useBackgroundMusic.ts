import { createMusicOutput } from './musicOutput';
import { useEffect, useRef, useState } from 'react';

type MusicStatus = 'idle' | 'loading' | 'playing' | 'blocked' | 'error';
export function useBackgroundMusic(src: string | null, enabled: boolean, volume: number) {
  const current = useRef<HTMLAudioElement | null>(null);
  const outputRef = useRef<ReturnType<typeof createMusicOutput> | null>(null);
  const fadeGain = useRef(0);
  const positions = useRef(new Map<string, number>());
  const volumeRef = useRef(volume);
  volumeRef.current = volume;
  const [status, setStatus] = useState<MusicStatus>('idle');
  const retryRef = useRef<() => void>(() => {});
  useEffect(() => {
    setStatus('idle');
    if (!src || !enabled) return;
    let active = true;
    const audio = new Audio(src);
    current.current = audio;
    audio.loop = true;
    audio.preload = 'auto';
    let output: ReturnType<typeof createMusicOutput>;
    try { output = createMusicOutput(audio); }
    catch { setStatus('error'); return; }
    outputRef.current = output;
    fadeGain.current = 0;
    let fadeFrame = 0;
    let fadeStarted = false;
    const fadeIn = () => {
      if (fadeStarted) return;
      fadeStarted = true;
      const start = performance.now();
      const tick = () => {
        if (!active) return;
        const fraction = Math.min(1, (performance.now() - start) / 4000);
        fadeGain.current = fraction * fraction * (3 - 2 * fraction);
        output.setLevel(volumeRef.current * fadeGain.current);
        if (fraction < 1) fadeFrame = requestAnimationFrame(tick);
      };
      tick();
    };
    audio.onloadedmetadata = () => {
      const saved = positions.current.get(src) ?? 0;
      if (Number.isFinite(audio.duration) && saved < audio.duration) audio.currentTime = saved;
    };
    const play = () => {
      if (!active || document.hidden) return;
      setStatus('loading');
      void output.resume().catch(() => { if (active) setStatus('blocked'); });
      void audio.play().then(() => {
        if (active) { if (!output.running()) { audio.pause(); setStatus('blocked'); return; } setStatus('playing'); fadeIn(); }
      }).catch((error: DOMException) => {
        if (active && error.name !== 'AbortError') setStatus(error.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    };
    audio.onerror = () => { if (active) setStatus('error'); };
    const visibility = () => { if (document.hidden) { audio.pause(); cancelAnimationFrame(fadeFrame); fadeStarted = false; fadeGain.current = 0; output.setLevel(0, true); } else play(); };
    retryRef.current = play;
    document.addEventListener('visibilitychange', visibility);
    play();
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', visibility);
      retryRef.current = () => {};
      cancelAnimationFrame(fadeFrame);
      positions.current.set(src, audio.currentTime);
      audio.onerror = null;
      audio.onloadedmetadata = null;
      // Short retirement fade overlaps the next civilization's fade-in.
      const initialVolume = output.level();
      const start = performance.now();
      const release = () => { audio.pause(); audio.removeAttribute('src'); audio.load(); output.dispose(); };
      const retire = () => {
        const fraction = Math.min(1, (performance.now() - start) / 2200);
        output.setLevel(initialVolume * (1 - fraction * fraction * (3 - 2 * fraction)));
        if (fraction < 1 && !document.hidden) setTimeout(retire, 25);
        else release();
      };
      if (audio.paused || document.hidden) release(); else retire();
      current.current = null;
      outputRef.current = null;
    };
  }, [src, enabled]);
  useEffect(() => { outputRef.current?.setLevel(volume * fadeGain.current); }, [volume]);
  return { status, retry: () => retryRef.current() };
}
