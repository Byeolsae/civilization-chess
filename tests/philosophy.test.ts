import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
const none = { passive: 'pending', active: 'pending', piece: 'pending' };
function setup(passive = 'philosophy') {
  const g = new AbilityGame({ w: { ...none, passive, piece: 'minotaur' }, b: none }, '7k/8/3r4/8/3P4/5N2/8/K7 w - - 0 1');
  g.perform(g.actions().find(a => a.skill === 'minotaur')!);
  g.move({from:'d6',to:'d4'});
  return g;
}
test('dialogue marks a killer, reduces the recapturing skill cooldown, and survives snapshots and undo', () => {
  const g = setup();
  assert.deepEqual(g.unit('d4')!.question, {owner:'w',until:2});
  assert.equal(g.unit('f3')!.cooldownUntil,6);
  const replay = g;
  replay.restore(g.snapshot());
  assert.deepEqual(replay.unit('d4')!.question,g.unit('d4')!.question);
  replay.move({from:'f3',to:'d4'});
  assert.equal(replay.unit('d4')!.cooldownUntil,5);
  assert.equal(replay.unit('d4')!.question,undefined);

  replay.undo();
  assert.equal(replay.unit('f3')!.cooldownUntil,6);
  assert.deepEqual(replay.unit('d4')!.question,{owner:'w',until:2});
});
test('missing the immediate reply expires the question and gives no later reward', () => {
  const g=setup();
  g.move({from:'a1',to:'b1'});
  assert.equal(g.unit('d4')!.question,undefined);
  g.move({from:'h8',to:'g8'});
  g.move({from:'f3',to:'d4'});
  assert.equal(g.unit('d4')!.cooldownUntil,6);
});
test('no philosophy means no mark or reduction', () => {
  const g=setup('pending');
  assert.equal(g.unit('d4')!.question,undefined);
  g.move({from:'f3',to:'d4'});
  assert.equal(g.unit('d4')!.cooldownUntil,6);
});
test('a ready skill cannot bank a cooldown reduction', () => {
  const g=new AbilityGame({w:{...none,passive:'philosophy',piece:'minotaur'},b:none},'7k/8/3r4/8/3P4/5N2/8/K7 b - - 0 1');
  g.move({from:'d6',to:'d4'});
  g.move({from:'f3',to:'d4'});
  assert.equal(g.unit('d4')!.cooldownUntil,g.state.turns.w);
});
test('losing a Spartan shield does not mark the attacker', () => {
  const g=new AbilityGame({w:{...none,passive:'philosophy',piece:'sparta'},b:none},'7k/8/3r4/8/3P4/8/8/K7 b - - 0 1');
  g.move({from:'d6',to:'d4'});
  assert.equal(g.unit('d6')!.question,undefined);
  assert.equal(g.unit('d4')!.lives,1);
});
test('ballista recapture reduces its newly started reload by one turn', () => {
  const g=new AbilityGame({w:{...none,passive:'philosophy',piece:'ballista'},b:none},'7k/8/3r4/8/3P4/3R4/8/K7 b - - 0 1');
  g.move({from:'d6',to:'d4'});
  g.perform(g.actions().find(a=>a.skill==='ballista'&&a.to==='d4')!);
  assert.equal(g.unit('d3')!.cooldownUntil,g.state.turns.w+3);
});

test('question marks are reconstructed from ordinary game history', () => {
  const g=new AbilityGame({w:{...none,passive:'philosophy'},b:none});
  g.move({from:'e2',to:'e4'});g.move({from:'d7',to:'d5'});
  g.move({from:'g1',to:'f3'});g.move({from:'d5',to:'e4'});
  const restored=AbilityGame.restoreSave(g.save());
  assert.deepEqual(restored.unit('e4')!.question,g.unit('e4')!.question);
  assert.deepEqual(restored.snapshot(),g.snapshot());
});
