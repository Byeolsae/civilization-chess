import type { Chess, Color } from 'chess.js';
import { AbilityGame } from './AbilityGame';
import { evaluate } from './ai';
import { score } from './abilityAi';
import { gameStatus, opposite } from './game';

// Always white-relative. The bar's share is a visual scale, not a win probability.
export function boardEvaluation(game: Chess, resigned: Color | null = null, viewer: Color = game.turn()) {
  const status = gameStatus(game, resigned);
  if (status.over) {
    const winner = status.kind === 'draw' ? null : resigned ? opposite(resigned)
      : game instanceof AbilityGame && game.winner() || opposite(game.turn());
    return { whiteShare: winner === 'w' ? 100 : winner === 'b' ? 0 : 50, label: winner ? `${winner === 'w' ? '백' : '흑'} 승` : '무승부', description: status.title };
  }
  // Do not expose hidden material during sandstorm or misjudge pieces in the duel arena.
  if (game instanceof AbilityGame && (game.state.duel || game.placementOwner()
    || (game.state.stormUntil[viewer] > 0 && game.state.stormUntil[viewer] >= game.state.turns[viewer]))) return null;
  const cp = game instanceof AbilityGame ? score(game, 'w') : evaluate(game) * (game.turn() === 'w' ? 1 : -1);
  const pawns = Math.round(cp / 10) / 10;
  const label = `${pawns > 0 ? '+' : ''}${pawns.toFixed(1)}`;
  return { whiteShare: Math.max(3, Math.min(97, 50 + 47 * Math.tanh(cp / 600))), label,
    description: `${pawns > 0 ? '백 우세' : pawns < 0 ? '흑 우세' : '균형'} ${label}. 기물·위치·스킬 상태에 따른 간이 평가이며 승률이 아닙니다.` };
}
