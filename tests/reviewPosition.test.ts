import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { AbilityGame } from '../src/AbilityGame';
import { reviewPosition } from '../src/reviewPosition';

test('review restores standard moves without mutating the live match', () => {
  const game = new Chess();
  const initial = game.fen();
  game.move('e4'); const first = game.fen(); game.move('e5');
  const live = game.fen();
  assert.equal(reviewPosition(game, 0).fen(), initial);
  assert.equal(reviewPosition(game, 1).fen(), first);
  reviewPosition(game, 1).move('c5');
  assert.equal(game.fen(), live);
  assert.equal(game.history().length, 2);
  assert.throws(() => reviewPosition(game, -1));
  assert.throws(() => reviewPosition(game, 3));
});

test('variant review preserves placed terrain and skill state in independent snapshots', () => {
  const none = { passive: 'pending', active: 'pending', piece: 'pending' };
  const game = new AbilityGame({ w: { ...none, passive: 'pyramid', active: 'set' }, b: none }).beginPlacement();
  game.placePassive('w', { square: 'c3', axis: 'row' });
  const initial = game.snapshot();
  const action = game.actions().find(a => a.skill === 'set');
  assert.ok(action);
  game.perform(action);
  const live = game.snapshot();
  const start = reviewPosition(game, 0) as AbilityGame;
  const end = reviewPosition(game, 1) as AbilityGame;
  assert.deepEqual(start.state, initial);
  assert.deepEqual(end.state, live);
  assert.ok(end.state.zones.some(z => z.kind === 'desert'));
  start.state.zones.length = 0;
  end.state.activeUsed.w = false;
  assert.deepEqual(game.state, live);
  assert.throws(() => reviewPosition(game, 2));
});
