import { Chess } from 'chess.js';
import { chooseAiMove, type SearchResult } from './ai';
import type { Difficulty } from './matchSettings';

export type AiRequest = { history: string[]; difficulty: Difficulty };
export type AiResponse = { result: SearchResult } | { error: string };

self.onmessage = (event: MessageEvent<AiRequest>) => {
  try {
    const game = new Chess();
    // Replaying moves preserves repetition rights, castling and en passant.
    for (const move of event.data.history) game.move(move);
    self.postMessage({ result: chooseAiMove(game, event.data.difficulty) } satisfies AiResponse);
  } catch {
    self.postMessage({ error: 'AI 계산을 완료하지 못했습니다.' } satisfies AiResponse);
  }
};
