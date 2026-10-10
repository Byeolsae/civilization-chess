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

test('March Law restricts the enemy opening pawn move but exempts Rome',()=>{
 const g=new AbilityGame({w:{...none,passive:'twelve-tables'},b:none}).beginPlacement();
 g.placePassive('w',{law:'march-law'});
 assert.ok(g.actions().some(a=>a.from==='e2'&&a.to==='e4'));
 g.move({from:'e2',to:'e4'});
 assert.ok(g.actions().some(a=>a.from==='e7'&&a.to==='e6'));
 assert.equal(g.actions().some(a=>a.from==='e7'&&a.to==='e5'),false);
 assert.throws(()=>g.move({from:'e7',to:'e5'}));
 assert.equal(AbilityGame.restoreSave(g.save()).actions().some(a=>a.from==='e7'&&a.to==='e5'),false);
});
test('Conscription Law removes queen promotions including capture promotions, retaining other choices',()=>{
 const g=new AbilityGame({w:none,b:{...none,passive:'twelve-tables'}},'2r4k/1P6/8/8/8/8/8/K7 w - - 0 1').beginPlacement();
 g.placePassive('b',{law:'conscription-law'});
 for(const to of ['b8','c8'])assert.deepEqual(g.actions().filter(a=>a.from==='b7'&&a.to===to).map(a=>a.promotion).sort(),['b','n','r']);
 assert.throws(()=>g.move({from:'b7',to:'b8',promotion:'q'}));
 g.move({from:'b7',to:'b8',promotion:'r'});assert.equal(g.unit('b8')!.type,'r');
});
test('different Roman laws still grant each holder an exemption',()=>{
 const g=new AbilityGame({w:{...none,passive:'twelve-tables'},b:{...none,passive:'twelve-tables'}},'7k/1P6/8/8/8/8/8/K7 w - - 0 1').beginPlacement();
 g.placePassive('w',{law:'march-law'});g.placePassive('b',{law:'conscription-law'});
 assert.ok(g.actions().some(a=>a.promotion==='q'));
 g.move({from:'b7',to:'b8',promotion:'q'});assert.equal(g.unit('b8')!.type,'q');
});
test('March Law blocks initial double steps but retains River Flow',()=>{
 const g=new AbilityGame({w:{...none,passive:'nile'},b:{...none,passive:'twelve-tables'}}).beginPlacement();
 g.placePassive('b',{law:'march-law'});g.state.turns.w=4;
 assert.equal(g.actions().some(a=>a.from==='e2'&&a.to==='e4'),false);
 g.move({from:'e2',to:'e3'});g.move({from:'a7',to:'a6'});
 assert.ok(g.actions().some(a=>a.from==='e3'&&a.to==='f3'));
 assert.equal(g.actions().some(a=>a.from==='e2'&&a.to==='e5'),false);
});

test('Conscription Law also makes wave-induced promotions become rooks',()=>{
 const g=new AbilityGame({w:{...none,passive:'twelve-tables',active:'poseidon'},b:none},'7k/8/8/8/8/K7/3p4/8 w - - 0 1').beginPlacement();
 g.placePassive('w',{law:'conscription-law'});
 g.perform(g.actions().find(a=>a.skill==='poseidon'&&a.to==='d1'&&a.direction===3)!);
 assert.equal(g.unit('d1')!.type,'r');
});
