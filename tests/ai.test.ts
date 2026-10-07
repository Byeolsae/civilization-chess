import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { chooseAiMove } from '../src/ai';
import { canUndoTurn, undoTurn } from '../src/aiMatch';
import { decodeMatch, encodeMatch } from '../src/game';
import { completeDraft, confirmPick, draftSteps, optionsAt, previousHumanPick, restoreDraft } from '../src/draft';
import { isMatchSettings, localSettings, type MatchSettings } from '../src/matchSettings';

const blackAI: MatchSettings = { mode: 'ai', humanColor: 'w', difficulty: 'normal' };
const whiteAI: MatchSettings = { mode: 'ai', humanColor: 'b', difficulty: 'hard' };
const limits = { maxTimeMs: 10000, maxNodes: 100000, maxDepth: 2, random: () => 0 };

test('all AI levels return legal moves and leave board and repetition history intact', () => {
  for (const difficulty of ['easy', 'normal', 'hard'] as const) {
    const game = new Chess();
    ['e4', 'e5', 'Nf3'].forEach(move => game.move(move));
    const before = game.fen();
    const history = game.history();
    const result = chooseAiMove(game, difficulty, { ...limits, maxDepth: 1 });
    assert.ok(result.move);
    assert.equal(game.fen(), before);
    assert.deepEqual(game.history(), history);
    assert.ok(game.move(result.move));
  }
});

test('AI takes immediate checkmate and captures a hanging queen', () => {
  const mate = new Chess();
  ['f3', 'e5', 'g4'].forEach(move => mate.move(move));
  const move = chooseAiMove(mate, 'normal', limits).move!;
  mate.move(move);
  assert.equal(mate.isCheckmate(), true);
  const queen = new Chess('4k3/8/8/8/8/8/4q3/4K3 w - - 0 1');
  assert.equal(chooseAiMove(queen, 'normal', limits).move?.to, 'e2');
});

test('AI promotes and escapes check using legal moves', () => {
  const promotion = new Chess('8/P6k/8/8/8/8/8/7K w - - 0 1');
  const choice = chooseAiMove(promotion, 'normal', { ...limits, maxDepth: 1 }).move!;
  assert.equal(choice.promotion, 'q');
  assert.ok(promotion.move(choice));
  const check = new Chess('4r1k1/8/8/8/8/8/8/4K3 w - - 0 1');
  assert.equal(check.isCheck(), true);
  const legal = check.moves({ verbose: true });
  const escape = chooseAiMove(check, 'normal', limits).move!;
  assert.ok(legal.some(move => move.from === escape.from && move.to === escape.to));
});

test('finished positions stop AI, including threefold repetition', () => {
  for (const fen of ['7k/5Q2/6K1/8/8/8/8/8 b - - 0 1', '7k/8/6K1/8/8/8/8/8 w - - 0 1', '7k/8/6K1/8/8/8/R7/8 w - - 100 70']) {
    assert.equal(chooseAiMove(new Chess(fen), 'hard', limits).move, null);
  }
  const game = new Chess();
  ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'].forEach(move => game.move(move));
  assert.equal(chooseAiMove(game, 'normal', limits).move, null);
});

test('interrupted search returns a legal fallback without mutating the game', () => {
  const game = new Chess();
  const before = game.fen();
  const result = chooseAiMove(game, 'hard', { maxNodes: 1, maxTimeMs: 10000 });
  assert.equal(game.fen(), before);
  assert.deepEqual(game.history(), []);
  assert.ok(result.move && game.move(result.move));
});

test('AI undo returns to the human turn before or after a reply for either color', () => {
  const game = new Chess();
  game.move('e4'); undoTurn(game, blackAI);
  assert.equal(game.history().length, 0);
  ['e4', 'e5'].forEach(move => game.move(move)); undoTurn(game, blackAI);
  assert.equal(game.history().length, 0);
  game.move('e4');
  assert.equal(canUndoTurn(game, whiteAI), false);
  undoTurn(game, whiteAI);
  assert.deepEqual(game.history(), ['e4']);
  ['e5', 'Nf3'].forEach(move => game.move(move)); undoTurn(game, whiteAI);
  assert.deepEqual(game.history(), ['e4']);
  assert.equal(game.turn(), 'b');
  game.move('e5'); undoTurn(game, localSettings);
  assert.deepEqual(game.history(), ['e4']);
});

test('AI settings survive saves while legacy matches remain local and invalid settings fail safely', () => {
  const game = new Chess(); game.move('e4');
  const raw = encodeMatch(game, { w: 'greece', b: 'rome' }, null, null, whiteAI);
  const restored = decodeMatch(raw)!;
  assert.deepEqual(restored.settings, whiteAI);
  assert.equal(restored.game.turn(), 'b');
  const legacy = { version: 2, moves: [], players: { w: 'greece', b: 'rome' }, resigned: null, loadouts: null };
  assert.deepEqual(decodeMatch(JSON.stringify(legacy))?.settings, localSettings);
  for (const settings of [null, {}, { ...whiteAI, humanColor: 'x' }, { ...whiteAI, difficulty: 'constructor' }, { ...whiteAI, mode: 'unknown' }]) {
    assert.equal(isMatchSettings(settings), false);
    assert.equal(decodeMatch(JSON.stringify({ ...JSON.parse(raw), settings })), null);
  }
});

test('automated draft can complete both sides and rewind only human choices', () => {
  for (const human of ['w', 'b'] as const) {
    let picks: string[] = [];
    picks = confirmPick(picks, 'greece');
    picks = confirmPick(picks, 'rome');
    while (!completeDraft(picks)) picks = confirmPick(picks, optionsAt(picks)[0]);
    assert.deepEqual(restoreDraft(JSON.stringify(picks)), picks);
    const previous = previousHumanPick(picks, human)!;
    assert.equal(draftSteps[previous.length].color, human);
    assert.equal(previousHumanPick(['greece'], 'b'), null);
    assert.ok(completeDraft(picks));
  }
});
