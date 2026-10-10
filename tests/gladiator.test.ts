import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
import { chooseAbilityAction } from '../src/abilityAi';
const none={passive:'pending',active:'pending',piece:'pending'};
function setup(){const g=new AbilityGame({w:{...none,piece:'gladiator'},b:none});g.perform(g.actions().find(a=>a.skill==='gladiator'&&a.from==='c1'&&a.to==='a8')!);return g;}
function move(g:AbilityGame,to:string){const a=g.actions().find(a=>a.to===to);assert.ok(a,`Missing arena action ${to}`);g.perform(a);}
test('8x8 arena gives gladiator queen moves, pauses main turns and saves independently',()=>{
 const g=setup(),d=g.state.duel!;assert.equal(d.positions[d.attacker],'b2');assert.equal(d.positions[d.defender],'g6');
 assert.ok(g.actions().some(a=>a.to==='b8'));assert.ok(g.actions().some(a=>a.to==='h2'));assert.ok(g.actions().some(a=>a.to==='f6'));
 assert.equal(g.actions().some(a=>a.to==='g6'),false);
 const turns={...g.state.turns};move(g,'c2');assert.deepEqual(g.state.turns,turns);
 assert.throws(()=>g.move({from:'e7',to:'e5'}));
 const r=AbilityGame.restoreSave(g.save());assert.deepEqual(r.state.duel,g.state.duel);assert.deepEqual(r.state.turns,turns);
 r.state.clocks={w:10000,b:10000};r.tick(1000);assert.deepEqual(r.state.clocks,{w:10000,b:10000});
});
test('after action 4 only central 6x6 is legal; after action 8 only gladiator dies',()=>{
 const g=setup(),d=g.state.duel!,attacker=d.attacker,defender=d.defender;
 for(const to of ['c2','g5','d2','g4'])move(g,to);
 assert.equal(g.state.duel!.actions,4);
 assert.ok(g.actions().length);assert.ok(g.actions().every(a=>!'ah'.includes(a.to[0])&&!'18'.includes(a.to[1])));
 for(const to of ['c2','g5','d2','g4'])move(g,to);
 assert.equal(g.state.duel,null);assert.equal(g.state.pieces[attacker].square,null);assert.equal(g.state.pieces[defender].square,'a8');assert.equal(g.turn(),'b');
 assert.deepEqual(g.state.turns,{w:1,b:1});
 g.undo();assert.equal(g.state.duel!.actions,7);
});
test('collapse kills both participants when both stay on the outside ring',()=>{
 const g=setup(),d=g.state.duel!;for(const to of ['a2','h6','a3','h5'])move(g,to);
 assert.equal(g.state.duel,null);assert.equal(g.state.pieces[d.attacker].square,null);assert.equal(g.state.pieces[d.defender].square,null);
});
test('gladiator can capture along a rank and returns to its original bishop square',()=>{
 const g=setup(),d=g.state.duel!;move(g,'b5');move(g,'g5');move(g,'g5');
 assert.equal(g.state.duel,null);assert.equal(g.state.pieces[d.attacker].square,'c1');assert.equal(g.state.pieces[d.attacker].type,'b');assert.equal(g.state.pieces[d.defender].square,null);
});
test('defender can kill the gladiator using its own movement',()=>{
 const g=setup(),d=g.state.duel!;move(g,'b6');move(g,'b6');assert.equal(g.state.duel,null);assert.equal(g.state.pieces[d.attacker].square,null);assert.equal(g.state.pieces[d.defender].square,'a8');
});
test('duel AI chooses a legal action without advancing the match',()=>{
 const g=setup(),before=g.snapshot();const action=chooseAbilityAction(g,'normal');assert.ok(action);assert.ok(g.actions().some(a=>JSON.stringify(a)===JSON.stringify(action)));assert.deepEqual(g.snapshot(),before);
});

test('queen movement cannot leap over the opposing piece',()=>{
 const g=setup();move(g,'b6');
 assert.ok(g.actions().some(a=>a.to==='b6'));
 assert.equal(g.actions().some(a=>a.to==='a6'),false);
});
