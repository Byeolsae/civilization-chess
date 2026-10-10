import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
import { applyEffect } from '../src/abilityState';
const none = { passive:'pending', active:'pending', piece:'pending' };
const loadouts = { w:{...none,passive:'roads'}, b:{...none,passive:'pyramid'} };

test('placement blocks actions without ending the game and proceeds white then black', () => {
  const g = new AbilityGame(loadouts).beginPlacement();
  assert.equal(g.placementOwner(),'w');
  assert.deepEqual(g.actions(),[]);
  assert.equal(g.isGameOver(),false);
  assert.throws(()=>g.move({from:'e2',to:'e4'}));
  assert.throws(()=>g.placePassive('b',{square:'f7',axis:'row'}));
  g.placePassive('w',{square:'c3',axis:'column'});
  assert.equal(g.placementOwner(),'b');
  g.placePassive('b',{square:'f7',axis:'row'});
  assert.equal(g.placementOwner(),undefined);
  assert.equal(g.turn(),'w');
  assert.equal(g.history().length,0);
  assert.ok(g.actions().length);
  assert.throws(()=>g.placePassive('w',{square:'a1',axis:'row'}));
});

test('chosen roads affect landing squares instead of legacy rows', () => {
  const g = new AbilityGame({w:loadouts.w,b:none}).beginPlacement();
  g.placePassive('w',{square:'a4',axis:'row'});
  const moves=g.moves({square:'a1',verbose:true});
  assert.ok(moves.some(m=>m.to==='a4'));
  assert.equal(moves.some(m=>m.to==='a3'),false);
  assert.equal(g.state.zones[0].squares.length,16);
});

test('chosen pyramid protects its new neighborhood', () => {
  const g = new AbilityGame({w:none,b:loadouts.b}).beginPlacement();
  g.placePassive('b',{square:'g7',axis:'row'});
  assert.equal(applyEffect(g.state,'b-h7','shock',2),false);
  assert.equal(applyEffect(g.state,'b-c7','shock',2),true);
  assert.equal(g.state.zones[0].center,'g7');
});

test('unfinished setup, completed setup, replay and undo preserve placements', () => {
  const g = new AbilityGame(loadouts).beginPlacement();
  assert.equal(AbilityGame.restoreSave(g.save()).placementOwner(),'w');
  g.placePassive('w',{square:'h4',axis:'column'});
  const resumed=AbilityGame.restoreSave(g.save());
  assert.equal(resumed.placementOwner(),'b');
  assert.deepEqual(new Set(resumed.state.zones[0].squares.map(s=>s[0])),new Set(['g','h']));
  resumed.placePassive('b',{square:'a8',axis:'row'});
  assert.equal(resumed.state.zones[1].squares.length,4);
  resumed.move({from:'e2',to:'e4'});
  const replay=AbilityGame.restoreSave(resumed.save());
  assert.deepEqual(replay.state.zones,resumed.state.zones);
  replay.undo();
  assert.equal(replay.placementOwner(),undefined);
  assert.equal(replay.turn(),'w');
  assert.deepEqual(replay.state.zones,resumed.state.zones);
});

test('philosophy has no clock during or after setup and non-placeable passives start immediately', () => {
  const g = new AbilityGame({w:{...none,passive:'philosophy'},b:loadouts.b}).beginPlacement();
  assert.equal(g.state.clocks,null);
  g.tick(5000);assert.equal(g.state.clocks,null);
  g.placePassive('b',{square:'f6',axis:'row'});
  g.tick(1000);assert.equal(g.state.clocks,null);
  assert.equal(new AbilityGame({w:none,b:none}).beginPlacement().placementOwner(),undefined);
});
