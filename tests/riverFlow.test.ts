import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
const none={passive:'pending',active:'pending',piece:'pending'};
const sides={w:{...none,passive:'nile'},b:{...none,passive:'nile'}};
const can=(g:AbilityGame,from:string,to:string)=>g.actions().some(a=>a.kind==='move'&&a.from===from&&a.to===to);
test('River Flow moves sideways every turn in own half, uses the turn and never creates en passant',()=>{
 const g=new AbilityGame(sides,'7k/8/8/8/3p4/3P4/8/K7 w - - 0 1');
 assert.ok(can(g,'d3','c3'));assert.ok(can(g,'d3','e3'));assert.equal(can(g,'d3','d4'),false);
 g.move({from:'d3',to:'e3'});assert.equal(g.turn(),'b');assert.equal(g.state.ep,null);
 assert.equal(g.unit('e3')!.type,'p');g.undo();assert.ok(g.unit('d3'));
});
test('white rank 4 and black rank 5 are included, enemy half is excluded',()=>{
 for(const [fen,from,to,expected] of [
 ['7k/8/8/8/3P4/8/8/K7 w - - 0 1','d4','e4',true],
 ['7k/8/8/3P4/8/8/8/K7 w - - 0 1','d5','e5',false],
 ['7k/8/8/3p4/8/8/8/K7 b - - 0 1','d5','e5',true],
 ['7k/8/8/8/3p4/8/8/K7 b - - 0 1','d4','e4',false],
 ] as const) assert.equal(can(new AbilityGame(sides,fen),from,to),expected);
});
test('sideways movement cannot capture, enter an ally square, or attack a king',()=>{
 const g=new AbilityGame(sides,'7k/8/8/8/2p5/2pPP3/8/K7 w - - 0 1');
 assert.equal(can(g,'d3','c3'),false);assert.equal(can(g,'d3','e3'),false);assert.ok(can(g,'d3','c4'));
 const k=new AbilityGame(sides,'8/8/8/8/8/3Pk3/8/K7 b - - 0 1');assert.equal(k.isCheck(),false);
});
test('River Flow respects pins and stun',()=>{
 const pinned=new AbilityGame(sides,'3r3k/8/8/8/8/3P4/8/3K4 w - - 0 1');assert.equal(can(pinned,'d3','e3'),false);
 const g=new AbilityGame(sides,'7k/8/8/8/8/3P4/8/K7 w - - 0 1');g.unit('d3')!.effects.stun=2;assert.equal(can(g,'d3','e3'),false);
});
test('sideways game history restores and undoes correctly',()=>{
 const g=new AbilityGame(sides);g.move({from:'e2',to:'e3'});g.move({from:'e7',to:'e6'});g.move({from:'e3',to:'f3'});
 const r=AbilityGame.restoreSave(g.save());assert.deepEqual(r.snapshot(),g.snapshot());r.undo();assert.ok(r.unit('e3'));assert.ok(can(r,'e3','f3'));
});
