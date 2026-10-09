import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
import { createSkillScenario } from '../src/skillScenarios';
import { skillEffects } from '../src/skillEffectEvents';
const none={passive:'pending',active:'pending',piece:'pending'};
function game(fen='7k/8/3r2n1/8/3P4/3P4/8/K7 w - - 0 1',white={},black={}) {
  return new AbilityGame({w:{...none,active:'anubis',...white},b:{...none,...black}},fen);
}
function mark(g:AbilityGame) { const action=g.actions().find(a=>a.skill==='anubis');assert.ok(action);g.perform(action);return action; }

test('Anubis selects two distinct living enemies, excludes kings and spends one action',()=>{
 const g=game();const a=mark(g);assert.equal(new Set(a.id!.split(',')).size,2);
 assert.equal(g.state.activeUsed.w,true);assert.equal(g.turn(),'b');
 assert.deepEqual(g.unit('d6')!.judgment,{caster:'w',kills:0});
 assert.equal(g.unit('g6')!.judgment?.kills,0);assert.equal(g.unit('h8')!.judgment,undefined);
 const single=game('7k/8/3r4/8/3P4/8/8/K7 w - - 0 1');
 assert.equal(single.actions().some(a=>a.skill==='anubis'),false);
 assert.throws(()=>game().perform({...a,id:a.id!.split(',')[0]}));
});
test('two kills are counted independently, the second capture completes before judgment, and undo restores it',()=>{
 const scenario=createSkillScenario('anubis')!;const g=scenario.game;
 scenario.steps[0].run(g);scenario.steps[1].run(g);
 assert.equal(g.unit('d4')!.judgment?.kills,1);assert.equal(g.unit('g6')!.judgment?.kills,0);
 scenario.steps[2].run(g);const before=g.snapshot();scenario.steps[3].run(g);
 assert.equal(g.get('d3'),undefined);assert.equal(g.state.pieces['b-d6'].judgment?.executedAt,'d3');
 assert.equal(g.state.pieces['w-d3'].square,null);assert.equal(g.unit('g6')!.judgment?.kills,0);
 const action=JSON.parse(g.history().at(-1)!);
 assert.ok(skillEffects(action,before,g.state).some(e=>e.skill==='judgment'&&e.to==='d3'));
 g.undo();assert.deepEqual(g.snapshot(),before);
});
test('Sparta shield loss and a failed Sphinx attack do not count as kills',()=>{
 const g=game(undefined,{piece:'sparta'});mark(g);g.move({from:'d6',to:'d4'});
 assert.equal(g.unit('d6')!.judgment?.kills,0);assert.equal(g.unit('d4')!.lives,1);
 g.move({from:'a1',to:'b1'});g.move({from:'d6',to:'d4'});assert.equal(g.unit('d4')!.judgment?.kills,1);
 const s=game('7k/8/3r2n1/8/3N4/8/8/K7 w - - 0 1',{piece:'sphinx'});mark(s);
 s.perform({kind:'move',from:'d6',to:'d4',quiz:false});assert.equal(s.unit('d6')!.judgment?.kills,0);
});
test('ballista kills trigger judgment at the shooter square',()=>{
 const g=game(undefined,{}, {piece:'ballista'});mark(g);g.unit('d6')!.judgment!.kills=1;
 const before=g.snapshot(),a=g.actions().find(a=>a.skill==='ballista'&&a.from==='d6'&&a.to==='d4');assert.ok(a);g.perform(a);
 assert.equal(g.get('d6'),undefined);assert.equal(g.get('d4'),undefined);
 assert.ok(skillEffects(a,before,g.state).some(e=>e.skill==='judgment'&&e.to==='d6'));
});
test('judgment cancels an Olympic extra action and ignores extra lives',()=>{
 const g=game(undefined,{}, {passive:'olympics'});mark(g);const rook=g.unit('d6')!;
 rook.judgment!.kills=1;rook.glory=2;rook.lives=2;
 g.move({from:'d6',to:'d4'});assert.equal(g.get('d4'),undefined);assert.equal(g.state.extraAction,null);assert.equal(g.turn(),'w');
});
test('duel winners earn a kill and are judged on return to the main board',()=>{
 const g=game('7k/8/3b2n1/8/3R4/8/8/K7 w - - 0 1',{}, {piece:'gladiator'});mark(g);
 const bishop=g.unit('d6')!;bishop.judgment!.kills=1;
 const a=g.actions().find(a=>a.skill==='gladiator'&&a.from==='d6'&&a.to==='d4');assert.ok(a);g.perform(a);
 const d=g.state.duel!;d.positions[d.attacker]='b2';d.positions[d.defender]='c3';g.state.turn='b';
 g.perform({kind:'duel',from:'b2',to:'c3'});
 assert.equal(g.state.duel,null);assert.equal(g.state.pieces[bishop.id].square,null);assert.equal(g.state.pieces[bishop.id].judgment?.executedAt,'d6');
});
test('new judgment actions survive saved match replay',()=>{
 const g=new AbilityGame({w:{...none,active:'anubis'},b:none});mark(g);
 g.move({from:'e7',to:'e5'});g.move({from:'e2',to:'e4'});
 const restored=AbilityGame.restoreSave(g.save());assert.deepEqual(restored.snapshot(),g.snapshot());
});
test('revival effects include both Osiris and automatic mummy revival',()=>{
 for(const id of ['osiris','mummy']){
  const s=createSkillScenario(id)!;let seen=false;
  for(const step of s.steps){const before=s.game.snapshot();step.run(s.game);const action=JSON.parse(s.game.history().at(-1)!);seen ||= skillEffects(action,before,s.game.state).some(e=>e.skill===(id==='osiris'?'osiris':'revive'));}
  assert.ok(seen,id);
 }
});
