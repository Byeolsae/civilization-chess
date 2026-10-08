import { Chess } from 'chess.js';
import { AbilityGame } from './AbilityGame';

export function reviewPosition(game: Chess, ply: number): Chess {
  if (game instanceof AbilityGame) return game.reviewPosition(ply);
  const moves = game.history({ verbose: true });
  if (!Number.isInteger(ply) || ply < 0 || ply > moves.length) throw Error('Invalid review position');
  return new Chess(ply === moves.length ? game.fen() : moves[ply].before);
}
