import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame, type PassivePlacement } from '../src/AbilityGame';
const none={passive:'pending',active:'pending',piece:'pending'};
const law={law:'military-code'} as const;
test('law is required before play, rejects placeholders, and survives save and undo',()=>{
 const g=new AbilityGame({w:{...none,passive:'twelve-tables'},b:none}).beginPlacement();
 assert.equal(g.placementOwner(),'w');assert.equal(g.actions().length,0);
 assert.throws(()=>g.placePassive('b',law));
 assert.throws(()=>g.placePassive('w',{law:'unavailable'} as unknown as PassivePlacement));
 assert.throws(()=>g.placePassive('w',{square:'a1',axis:'row'}));
 assert.equal(g.placementOwner(),'w');
 g.placePassive('w',law);assert.equal(g.state.zones.length,0);assert.equal(g.placementOwner(),undefined);
 g.move({from:'e2',to:'e4'});
 const r=AbilityGame.restoreSave(g.save());assert.equal(r.state.laws?.w,'military-code');r.undo();assert.equal(r.state.laws?.w,'military-code');
 assert.throws(()=>r.placePassive('w',law));
});
test('military code adds one turn only to the opponent and is reconstructed in replay',()=>{
 const g=new AbilityGame({w:{...none,passive:'twelve-tables',piece:'minotaur'},b:{...none,piece:'minotaur'}}).beginPlacement();
 g.placePassive('w',law);
 g.perform(g.actions().find(a=>a.skill==='minotaur'&&a.from==='b1')!);
 assert.equal(g.unit('b1')!.cooldownUntil-g.state.turns.w,5);
 g.perform(g.actions().find(a=>a.skill==='minotaur'&&a.from==='b8')!);
 assert.equal(g.unit('b8')!.cooldownUntil-g.state.turns.b,6);
 const r=AbilityGame.restoreSave(g.save());assert.equal(r.unit('b8')!.cooldownUntil,g.unit('b8')!.cooldownUntil);
});
test('two Roman law holders both keep their exemption',()=>{
 const side={...none,passive:'twelve-tables',piece:'minotaur'};
 const g=new AbilityGame({w:side,b:side}).beginPlacement();g.placePassive('w',law);assert.equal(g.placementOwner(),'b');g.placePassive('b',law);
 g.perform(g.actions().find(a=>a.skill==='minotaur')!);g.perform(g.actions().find(a=>a.skill==='minotaur')!);
 assert.equal(g.unit('b8')!.cooldownUntil-g.state.turns.b,5);
});
test('ballista reload is extended while the law holder remains exempt',()=>{
 const g=new AbilityGame({w:{...none,piece:'ballista'},b:{...none,passive:'twelve-tables'}},'7k/8/3p4/8/8/3R4/8/K7 w - - 0 1').beginPlacement();
 g.placePassive('b',law);g.perform(g.actions().find(a=>a.skill==='ballista'&&a.to==='d6')!);
 assert.equal(g.unit('d3')!.cooldownUntil-g.state.turns.w,5);
});
