import { Chess } from 'chess.js';
import { chooseAiMove, type SearchResult } from './ai';
import type { Difficulty } from './matchSettings';
import { AbilityGame, type AbilitySave, type AbilityAction } from './AbilityGame';
import { chooseAbilityAction } from './abilityAi';

export type AiRequest = { history: string[]; difficulty: Difficulty; variant?: AbilitySave };
export type AiResponse = { result: SearchResult } | { action: AbilityAction | null } | { error: string };

self.onmessage = (event: MessageEvent<AiRequest>) => {
  try {
    if (event.data.variant) {
      const game = AbilityGame.restoreSave(event.data.variant);
      self.postMessage({ action: chooseAbilityAction(game, event.data.difficulty) } satisfies AiResponse);
      return;
    }
    const game = new Chess();
    // Replaying moves preserves repetition rights, castling and en passant.
    for (const move of event.data.history) game.move(move);
    self.postMessage({ result: chooseAiMove(game, event.data.difficulty) } satisfies AiResponse);
  } catch {
    self.postMessage({ error: 'AI 계산을 완료하지 못했습니다.' } satisfies AiResponse);
  }
};
