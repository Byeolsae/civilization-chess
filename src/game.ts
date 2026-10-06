import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { isMatchSettings, localSettings, type MatchSettings } from './matchSettings';
import { validLoadouts, type Loadouts } from './draft';
import { AbilityGame } from './AbilityGame';

import type { Civilization } from './civilizations';
import { civilizations } from './civilizations';
export { civilizations, type Civilization } from './civilizations';
export type Players = Record<Color, Civilization>;
export type Promotion = 'q' | 'r' | 'b' | 'n';
export const pieceNames: Record<PieceSymbol, string> = { p: '폰', n: '나이트', b: '비숍', r: '룩', q: '퀸', k: '킹' };
export const colorNames: Record<Color, string> = { w: '백', b: '흑' };
export const opposite = (color: Color): Color => color === 'w' ? 'b' : 'w';

export function gameStatus(game: Chess, resigned: Color | null = null) {
  if (resigned) return { over: true, title: `${colorNames[opposite(resigned)]} 승리`, detail: `${colorNames[resigned]}이 기권했습니다.`, kind: 'win' };
  if (game instanceof AbilityGame) {
    const winner = game.winner();
    if (winner) return { over: true, title: `${colorNames[winner]} 승리`, detail: game.state.timedOut ? '시간 초과' : '민주주의 · 상대의 폰이 모두 사라졌습니다.', kind: 'win' };
    if (game.state.duel) return { over: false, title: `${colorNames[game.turn()]}의 결투`, detail: '콜로세움에서 행동을 선택하세요. 본 보드의 시간은 결투 동안에도 흐릅니다.', kind: 'playing' };
  }
  if (game.isCheckmate()) return { over: true, title: `${colorNames[opposite(game.turn())]} 승리`, detail: '체크메이트 · 킹을 지킬 수 있는 수가 없습니다.', kind: 'win' };
  if (game.isStalemate()) return { over: true, title: '무승부', detail: '스테일메이트 · 체크는 아니지만 가능한 수가 없습니다.', kind: 'draw' };
  if (game.isInsufficientMaterial()) return { over: true, title: '무승부', detail: '체크메이트에 필요한 기물이 부족합니다.', kind: 'draw' };
  if (game.isThreefoldRepetition()) return { over: true, title: '무승부', detail: '같은 포지션이 세 번 반복되었습니다.', kind: 'draw' };
  if (game.isDrawByFiftyMoves()) return { over: true, title: '무승부', detail: '폰 이동과 포획 없이 양쪽이 50수씩 두었습니다.', kind: 'draw' };
  return { over: false, title: `${colorNames[game.turn()]}의 차례`, detail: game.isCheck() ? '체크! 킹을 보호하는 수를 두세요.' : '기물을 선택하고 이동할 칸을 누르세요.', kind: game.isCheck() ? 'check' : 'playing' };
}

export function legalMoves(game: Chess, square: Square) {
  if (gameStatus(game).over) return [];
  return game.moves({ square, verbose: true });
}

export function playMove(game: Chess, from: Square, to: Square, promotion?: Promotion) {
  const candidates = legalMoves(game, from).filter(move => move.to === to);
  if (!candidates.length) return null;
  if (candidates.some(move => move.promotion) && !promotion) return null;
  try { return game.move({ from, to, ...(promotion ? { promotion } : {}) }); }
  catch { return null; }
}

export const STORAGE_KEY = 'civilization-chess.match.v1';
export function encodeMatch(game: Chess, players: Players, resigned: Color | null, loadouts: Loadouts | null = null, settings: MatchSettings = localSettings) {
  if (game instanceof AbilityGame) return JSON.stringify({ version: 4, variant: game.save(), players, resigned, loadouts, settings });
  return JSON.stringify({ version: 3, moves: game.history(), players, resigned, loadouts, settings });
}

export function decodeMatch(raw: string | null): { game: Chess; players: Players; resigned: Color | null; loadouts: Loadouts | null; settings: MatchSettings } | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    const ids = civilizations.map(c => c.id as string);
    if (![1, 2, 3, 4].includes(data.version) || (data.version !== 4 && (!Array.isArray(data.moves) || data.moves.length > 10000)) || !ids.includes(data.players?.w) || !ids.includes(data.players?.b) || ![null, 'w', 'b'].includes(data.resigned)) return null;
    const loadouts = data.version >= 2 ? data.loadouts : null;
    if (loadouts !== null && !validLoadouts(data.players, loadouts)) return null;
    const settings = data.version >= 3 ? data.settings : localSettings;
    if (!isMatchSettings(settings)) return null;
    if (data.version === 4) {
      if (!loadouts || JSON.stringify(data.variant?.loadouts) !== JSON.stringify(loadouts)) return null;
      return { game: AbilityGame.restoreSave(data.variant), players: data.players, resigned: data.resigned, loadouts, settings };
    }
    const game = new Chess();
    for (const move of data.moves) {
      if (typeof move !== 'string' || gameStatus(game).over) return null;
      game.move(move);
    }
    return { game, players: data.players, resigned: data.resigned, loadouts, settings };
  } catch { return null; }
}
