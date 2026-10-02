import type { Chess } from 'chess.js';
import type { MatchSettings } from './matchSettings';

export function canUndoTurn(game: Chess, settings: MatchSettings) {
  return settings.mode === 'local' ? game.history().length > 0
    : game.history({ verbose: true }).some(move => move.color === settings.humanColor);
}

export function undoTurn(game: Chess, settings: MatchSettings) {
  if (!canUndoTurn(game, settings)) return;
  if (settings.mode === 'local') { game.undo(); return; }
  // Remove the reply (if any) and the human move, leaving the human to play again.
  let move;
  do { move = game.undo(); } while (move && move.color !== settings.humanColor);
}
