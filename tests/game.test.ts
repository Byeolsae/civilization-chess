import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { decodeMatch, encodeMatch, gameStatus, legalMoves, playMove } from '../src/game';

test('opening position has 20 legal moves and enforces turns', () => {
  const game = new Chess();
  assert.equal(game.moves().length, 20);
  assert.equal(playMove(game, 'e7', 'e5'), null);
  assert.equal(playMove(game, 'e2', 'e5'), null);
  assert.ok(playMove(game, 'e2', 'e4'));
  assert.equal(game.turn(), 'b');
  assert.equal(playMove(game, 'd2', 'd4'), null);
});

test('a pinned piece cannot expose its king', () => {
  const game = new Chess('4r1k1/8/8/8/8/8/4R3/4K3 w - - 0 1');
  assert.equal(playMove(game, 'e2', 'd2'), null);
  assert.ok(legalMoves(game, 'e2').every(move => move.to[0] === 'e'));
});

test('castling moves the rook and is forbidden through check', () => {
  const game = new Chess('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
  assert.ok(playMove(game, 'e1', 'g1'));
  assert.equal(game.get('f1')?.type, 'r');
  assert.equal(game.get('h1'), undefined);
  const checkedPath = new Chess('r3kr2/8/8/8/8/8/8/R3K2R w KQ - 0 1');
  assert.equal(playMove(checkedPath, 'e1', 'g1'), null);
});

test('en passant removes the bypassed pawn and expires after one turn', () => {
  const game = new Chess();
  ['e4', 'a6', 'e5', 'd5'].forEach(move => game.move(move));
  assert.ok(playMove(game, 'e5', 'd6'));
  assert.equal(game.get('d5'), undefined);
  assert.equal(game.get('d6')?.color, 'w');
  game.undo(); game.move('Nf3'); game.move('a5');
  assert.equal(playMove(game, 'e5', 'd6'), null);
});

test('promotion waits for an explicit choice and supports all four pieces', () => {
  for (const promotion of ['q', 'r', 'b', 'n'] as const) {
    const game = new Chess('8/P6k/8/8/8/8/8/7K w - - 0 1');
    assert.equal(playMove(game, 'a7', 'a8'), null);
    assert.equal(game.get('a7')?.type, 'p');
    assert.ok(playMove(game, 'a7', 'a8', promotion));
    assert.equal(game.get('a8')?.type, promotion);
  }
});

test('checkmate ends play; undo makes the position playable again', () => {
  const game = new Chess();
  ['f3', 'e5', 'g4', 'Qh4#'].forEach(move => game.move(move));
  assert.equal(gameStatus(game).title, '흑 승리');
  assert.equal(gameStatus(game).over, true);
  assert.equal(playMove(game, 'a2', 'a3'), null);
  game.undo();
  assert.equal(gameStatus(game).over, false);
});

test('stalemate, insufficient material, 50 moves and repetition are draws', () => {
  for (const fen of ['7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', '7k/8/6K1/8/8/8/8/8 w - - 0 1', '7k/8/6K1/8/8/8/R7/8 w - - 100 70']) {
    assert.equal(gameStatus(new Chess(fen)).kind, 'draw');
  }
  const game = new Chess();
  ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'].forEach(move => game.move(move));
  assert.equal(gameStatus(game).kind, 'draw');
});

test('saved matches retain civilizations, full history, repetition and resignation', () => {
  const game = new Chess();
  ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'].forEach(move => game.move(move));
  const restored = decodeMatch(encodeMatch(game, { w: 'rome', b: 'rome' }, null))!;
  assert.equal(restored.game.fen(), game.fen());
  assert.equal(restored.game.isThreefoldRepetition(), true);
  assert.deepEqual(restored.players, { w: 'rome', b: 'rome' });
  restored.game.undo();
  assert.equal(gameStatus(restored.game).over, false);
  assert.equal(gameStatus(new Chess(), 'w').title, '흑 승리');
});

test('invalid saved data is rejected without breaking startup', () => {
  for (const value of [null, '{', '{}', JSON.stringify({ version: 1, moves: ['e5'], players: { w: 'greece', b: 'rome' }, resigned: null }), JSON.stringify({ version: 1, moves: [], players: { w: 'unknown', b: 'rome' }, resigned: null })]) {
    assert.equal(decodeMatch(value), null);
  }
});
