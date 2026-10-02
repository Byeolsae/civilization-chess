import { useEffect, useRef, useState } from 'react';

type MusicStatus = 'idle' | 'loading' | 'playing' | 'blocked' | 'error';
export function useBackgroundMusic(src: string | null, enabled: boolean, volume: number) {
  const current = useRef<HTMLAudioElement | null>(null);
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
    audio.volume = volumeRef.current;
    const play = () => {
      if (!active || document.hidden) return;
      setStatus('loading');
      void audio.play().then(() => {
        if (active) setStatus('playing');
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
      audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      current.current = null;
    };
  }, [src, enabled]);
  useEffect(() => { if (current.current) current.current.volume = volume; }, [volume]);
  return { status, retry: () => retryRef.current() };
}
