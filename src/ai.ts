import { Chess, type Move, type PieceSymbol } from 'chess.js';
import type { Difficulty } from './matchSettings';

export type AiMove = Pick<Move, 'from' | 'to' | 'promotion'>;
export type SearchResult = { move: AiMove | null; depth: number; nodes: number };
const values: Record<PieceSymbol, number> = { p: 100, n: 320, b: 335, r: 500, q: 900, k: 0 };
const profiles = {
  easy: { maxDepth: 1, maxTimeMs: 250, maxNodes: 1500 },
  normal: { maxDepth: 3, maxTimeMs: 850, maxNodes: 14000 },
  hard: { maxDepth: 5, maxTimeMs: 2200, maxNodes: 50000 },
};
const MATE = 100000;

export function evaluate(game: Chess) {
  const board = game.board();
  let material = 0;
  for (const row of board) for (const p of row) if (p && p.type !== 'p') material += values[p.type];
  let score = 0;
  for (let rank = 0; rank < 8; rank++) for (let file = 0; file < 8; file++) {
    const piece = board[rank][file];
    if (!piece) continue;
    const advance = piece.color === 'w' ? 6 - rank : rank - 1;
    const center = 7 - Math.abs(3.5 - file) - Math.abs(3.5 - rank);
    let position = 0;
    if (piece.type === 'p') position = advance * (material < 1800 ? 20 : 9) + center * 3;
    if (piece.type === 'n') position = center * 12;
    if (piece.type === 'b') position = center * 7;
    if (piece.type === 'r') position = advance * 3;
    if (piece.type === 'q') position = center * 3;
    if (piece.type === 'k') position = material < 1800 ? center * 12 : -center * 8 + (file === 2 || file === 6 ? 25 : 0);
    score += (piece.color === 'w' ? 1 : -1) * (values[piece.type] + position);
  }
  return score * (game.turn() === 'w' ? 1 : -1);
}

function movePriority(move: Move) {
  return (move.captured ? 10 * values[move.captured] - values[move.piece] : 0)
    + (move.promotion ? values[move.promotion] : 0) + (move.san.includes('+') ? 40 : 0)
    + (move.san.includes('#') ? MATE : 0) + (move.san.startsWith('O-O') ? 30 : 0);
}

// Searches a disposable board in a Web Worker. Every branch unwinds even on timeout.
export function chooseAiMove(game: Chess, difficulty: Difficulty, overrides: Partial<typeof profiles.hard> & { random?: () => number } = {}): SearchResult {
  const limits = { ...profiles[difficulty], ...overrides };
  const deadline = performance.now() + limits.maxTimeMs;
  const random = overrides.random ?? Math.random;
  const timeout = Symbol('search timeout');
  let nodes = 0;
  const drawn = () => game.isInsufficientMaterial() || game.isThreefoldRepetition() || game.isDrawByFiftyMoves();
  const rootMoves = game.moves({ verbose: true }).sort((a, b) => movePriority(b) - movePriority(a));
  if (!rootMoves.length || drawn()) return { move: null, depth: 0, nodes };
  let best = rootMoves[0];
  let completedDepth = 0;

  function search(depth: number, alpha: number, beta: number, ply: number, quietLeft: number): number {
    if (++nodes > limits.maxNodes || performance.now() >= deadline) throw timeout;
    const moves = game.moves({ verbose: true });
    if (!moves.length) return game.isCheck() ? -MATE + ply : 0;
    if (drawn()) return 0;
    const checked = game.isCheck();
    if (depth <= 0) {
      const standing = evaluate(game);
      if (quietLeft <= 0) return standing;
      if (!checked) {
        if (standing >= beta) return standing;
        alpha = Math.max(alpha, standing);
      }
    }
    const candidates = depth > 0 || checked ? moves : moves.filter(move => move.captured || move.promotion);
    candidates.sort((a, b) => movePriority(b) - movePriority(a));
    for (const move of candidates) {
      game.move(move);
      let value: number;
      try { value = -search(depth - 1, -beta, -alpha, ply + 1, depth <= 0 ? quietLeft - 1 : quietLeft); }
      finally { game.undo(); }
      if (value >= beta) return value;
      alpha = Math.max(alpha, value);
    }
    return alpha;
  }

  for (let depth = 1; depth <= limits.maxDepth; depth++) {
    const scored: { move: Move; score: number }[] = [];
    rootMoves.sort((a, b) => (b === best ? MATE * 2 : movePriority(b)) - (a === best ? MATE * 2 : movePriority(a)));
    let alpha = -Infinity;
    try {
      for (const move of rootMoves) {
        game.move(move);
        let score: number;
        try { score = -search(depth - 1, -Infinity, difficulty === 'easy' ? Infinity : -alpha, 1, difficulty === 'easy' ? 0 : 3); }
        finally { game.undo(); }
        scored.push({ move, score });
        alpha = Math.max(alpha, score);
      }
    } catch (error) {
      if (error !== timeout) throw error;
      break; // Use only a fully evaluated iteration; keep a legal fallback at depth zero.
    }
    scored.sort((a, b) => b.score - a.score);
    best = scored[0].move;
    completedDepth = depth;
    if (difficulty === 'easy' && scored[0].score < MATE / 2) {
      const choices = scored.filter(candidate => candidate.score >= scored[0].score - 180).slice(0, 5);
      best = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))].move;
    }
    if (scored[0].score >= MATE / 2) break;
  }
  return { move: { from: best.from, to: best.to, ...(best.promotion ? { promotion: best.promotion } : {}) }, depth: completedDepth, nodes };
}
