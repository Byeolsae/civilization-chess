import test from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { AbilityGame } from '../src/AbilityGame';
import { boardEvaluation } from '../src/boardEvaluation';
const pending = { passive: 'pending', active: 'pending', piece: 'pending' };
test('white advantage keeps its sign across turns', () => {
  for (const turn of ['w', 'b']) {
    const g = new Chess(`4k3/8/8/8/8/8/4Q3/4K3 ${turn} - - 0 1`);
    const result = boardEvaluation(g)!;
    assert.ok(result.whiteShare > 50);
    assert.ok(result.label.startsWith('+'));
  }
});
test('initial balance, resignation, checkmate and draw', () => {
  assert.equal(boardEvaluation(new Chess())?.whiteShare, 50);
  assert.equal(boardEvaluation(new Chess(), 'w')?.whiteShare, 0);
  const mate = new Chess();
  for (const move of ['f3', 'e5', 'g4', 'Qh4#']) mate.move(move);
  assert.equal(boardEvaluation(mate)?.label, '흑 승');
  assert.equal(boardEvaluation(new Chess('4k3/8/8/8/8/8/8/4K3 w - - 0 1'))?.label, '무승부');
});
test('variant evaluation reflects extra lives without mutating the game', () => {
  const g = new AbilityGame({ w: { ...pending }, b: { ...pending } });
  const before = boardEvaluation(g)!;
  g.unit('b1')!.lives += 1;
  const fen = g.fen();
  assert.ok(boardEvaluation(g)!.whiteShare > before.whiteShare);
  assert.equal(g.fen(), fen);
});
test('sandstorm hides evaluation only for its affected viewer', () => {
  const g = new AbilityGame({ w: { ...pending }, b: { ...pending } });
  g.state.stormUntil.w = g.state.turns.w + 2;
  assert.equal(boardEvaluation(g, null, 'w'), null);
  assert.ok(boardEvaluation(g, null, 'b'));
});
