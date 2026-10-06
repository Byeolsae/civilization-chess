import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
import { boardPoint, skillEffects } from '../src/skillEffectEvents';
const none = { passive: 'pending', active: 'pending', piece: 'pending' };
test('effect coordinates follow board orientation', () => {
  assert.deepEqual(boardPoint('a8', false), {x:50,y:50});
  assert.deepEqual(boardPoint('a8', true), {x:750,y:750});
  assert.deepEqual(boardPoint('h1', true), {x:50,y:50});
});
test('committed wave effect covers exactly its target file and retains direction', () => {
  const game = new AbilityGame({w:{...none,active:'poseidon'},b:none});
  const before = structuredClone(game.state);
  const action = game.actions().find(a => a.skill === 'poseidon' && a.to === 'd1' && a.direction === 3)!;
  game.perform(action);
  const events = skillEffects(action,before,game.state);
  assert.equal(events.length,1);
  assert.equal(events[0].direction,3);
  assert.deepEqual(events[0].squares,['d1','d2','d3','d4','d5','d6','d7','d8']);
});
test('normal moves are quiet while a consumed Sparta life produces shield feedback', () => {
  const game = new AbilityGame({w:none,b:{...none,piece:'sparta'}},'4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1');
  const before = structuredClone(game.state);
  const action = {kind:'move' as const,from:'c3' as const,to:'d4' as const};
  game.perform(action);
  assert.equal(skillEffects(action,before,game.state)[0].skill,'shield');
  assert.deepEqual(skillEffects({kind:'move',from:'a2',to:'a3'},before,before),[]);
});
