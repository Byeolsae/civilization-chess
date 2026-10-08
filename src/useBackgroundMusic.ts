import { useEffect, useRef, useState } from 'react';

type MusicStatus = 'idle' | 'loading' | 'playing' | 'blocked' | 'error';
export function useBackgroundMusic(src: string | null, enabled: boolean, volume: number) {
  const current = useRef<HTMLAudioElement | null>(null);
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
    audio.volume = 0;
    let fadeFrame = 0;
    let fadeStarted = false;
    const fadeIn = () => {
      if (fadeStarted) return;
      fadeStarted = true;
      const start = performance.now();
      const tick = () => {
        if (!active) return;
        const fraction = Math.min(1, (performance.now() - start) / 700);
        audio.volume = volumeRef.current * fraction;
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
      void audio.play().then(() => {
        if (active) { setStatus('playing'); fadeIn(); }
      }).catch((error: DOMException) => {
        if (active && error.name !== 'AbortError') setStatus(error.name === 'NotAllowedError' ? 'blocked' : 'error');
      });
    };
    audio.onerror = () => { if (active) setStatus('error'); };
    const visibility = () => { if (document.hidden) audio.pause(); else play(); };
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
      const initialVolume = audio.volume;
      const start = performance.now();
      const release = () => { audio.pause(); audio.removeAttribute('src'); audio.load(); };
      const retire = () => {
        const fraction = Math.min(1, (performance.now() - start) / 450);
        audio.volume = initialVolume * (1 - fraction);
        if (fraction < 1 && !document.hidden) setTimeout(retire, 25);
        else release();
      };
      if (audio.paused || document.hidden) release(); else retire();
      current.current = null;
    };
  }, [src, enabled]);
  useEffect(() => { if (current.current) current.current.volume = volume; }, [volume]);
  return { status, retry: () => retryRef.current() };
}
