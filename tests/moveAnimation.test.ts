import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { movingSquares } from '../src/useMoveAnimation';

test('ordinary moves and captures animate only the moving piece', () => {
  const game = new Chess();
  assert.deepEqual(movingSquares(game.move('e4')), [{ from: 'e2', to: 'e4' }]);
  game.move('d5');
  assert.deepEqual(movingSquares(game.move('exd5')), [{ from: 'e4', to: 'd5' }]);
});

test('both castling sides move the matching rook for either color', () => {
  for (const color of ['w', 'b']) {
    for (const side of ['O-O', 'O-O-O']) {
      const game = new Chess(`r3k2r/8/8/8/8/8/8/R3K2R ${color} KQkq - 0 1`);
      const rank = color === 'w' ? '1' : '8';
      const kingSide = side === 'O-O';
      assert.deepEqual(movingSquares(game.move(side)), [
        { from: `e${rank}`, to: `${kingSide ? 'g' : 'c'}${rank}` },
        { from: `${kingSide ? 'h' : 'a'}${rank}`, to: `${kingSide ? 'f' : 'd'}${rank}` },
      ]);
    }
  }
});

test('promotion and en passant keep their actual travel squares', () => {
  const promotion = new Chess('7k/P7/8/8/8/8/8/7K w - - 0 1');
  assert.deepEqual(movingSquares(promotion.move('a8=Q')), [{ from: 'a7', to: 'a8' }]);
  const game = new Chess();
  for (const san of ['e4', 'a6', 'e5', 'd5']) game.move(san);
  assert.deepEqual(movingSquares(game.move('exd6')), [{ from: 'e5', to: 'd6' }]);
});
