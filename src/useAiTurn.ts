import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import type { Chess } from 'chess.js';
import type { Difficulty } from './matchSettings';
import type { AiRequest, AiResponse } from './ai.worker';
import { AbilityGame } from './AbilityGame';

export function useAiTurn(game: Chess, revision: number, enabled: boolean, difficulty: Difficulty, setRevision: Dispatch<SetStateAction<number>>) {
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const cancelRef = useRef<() => void>(() => {});
  useEffect(() => {
    setError(null);
    if (!enabled) return;
    let cancelled = false;
    let worker: Worker | undefined;
    let watchdog: ReturnType<typeof setTimeout> | undefined;
    const fen = game.fen();
    const history = game.history();
    const cancel = () => {
      cancelled = true;
      clearTimeout(delay);
      clearTimeout(watchdog);
      worker?.terminate();
    };
    function fail() {
      if (cancelled) return;
      cancel();
      setError('AI가 수를 계산하지 못했어요. 다시 시도하거나 이전 수로 돌아가세요.');
    }
    const delay = setTimeout(() => {
      try {
        worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });
        worker.onerror = event => { event.preventDefault(); fail(); };
        worker.onmessageerror = fail;
        worker.onmessage = (event: MessageEvent<AiResponse>) => {
          if (cancelled || game.fen() !== fen || game.history().length !== history.length) return;
          const data = event.data;
          if (data && 'action' in data && game instanceof AbilityGame) {
            try {
              if (!data.action) { fail(); return; }
              game.perform(data.action); cancel(); setRevision(value => value + 1);
            } catch { fail(); }
            return;
          }
          if (!data || !('result' in data) || !data.result?.move) { fail(); return; }
          try {
            game.move(data.result.move);
            cancel();
            setRevision(value => value + 1);
          } catch { fail(); }
        };
        watchdog = setTimeout(fail, 15000);
        worker.postMessage({ history, difficulty, ...(game instanceof AbilityGame ? { variant: game.save() } : {}) } satisfies AiRequest);
      } catch { fail(); }
    }, 350);
    cancelRef.current = cancel;
    return cancel;
  }, [game, revision, enabled, difficulty, attempt, setRevision]);
  return { error, retry: () => setAttempt(value => value + 1), cancel: () => cancelRef.current() };
}
