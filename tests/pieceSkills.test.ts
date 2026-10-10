import test from 'node:test';
import assert from 'node:assert/strict';
import { AbilityGame } from '../src/AbilityGame';
import { pieceSkillInfo } from '../src/pieceSkills';
const none = { passive: 'pending', active: 'pending', piece: 'pending' };
const game = (piece: string, fen?: string) => new AbilityGame({ w: { ...none, piece }, b: none }, fen);
test('piece skill targets belong only to the selected piece and exclude actives', () => {
  const g = game('trojan');
  assert.equal(pieceSkillInfo(g, 'a1'), null);
  const info = pieceSkillInfo(g, 'b1')!;
  assert.deepEqual(info.actions.map(a => a.to).sort(), ['a2','b2','c2']);
  g.perform(info.actions.find(a=>a.to==='b2')!);
  g.move({ from: 'a7', to: 'a6' });
  const loaded = pieceSkillInfo(g, 'b1')!;
  assert.deepEqual(loaded.cargo, ['w-b2']);
  assert.ok(loaded.actions.some(a => a.skill === 'deploy' && a.id === 'w-b2' && a.to === 'b2'));
});
test('self-target stun exposes affected neighbors and a cooldown after use', () => {
  const g = game('minotaur');
  const info = pieceSkillInfo(g, 'b1')!;
  assert.equal(info.actions[0].to, 'b1');
  assert.ok(info.area.includes('a2'));
  g.perform(info.actions[0]);
  g.move({ from: 'a7', to: 'a6' });
  assert.match(pieceSkillInfo(g, 'b1')!.status, /재사용/);
  assert.equal(pieceSkillInfo(g, 'b1')!.actions.length, 0);
});
test('automatic Sphinx belongs to knights, and exhausted duel cannot be activated', () => {
  const g = game('sphinx');
  assert.equal(pieceSkillInfo(g, 'b1')!.automatic, true);
  assert.equal(pieceSkillInfo(g, 'c1'), null);
  const duel = game('gladiator');
  duel.unit('c1')!.duelUses = 2;
  assert.match(pieceSkillInfo(duel, 'c1')!.status, /사용 완료/);
  assert.equal(pieceSkillInfo(duel, 'c1')!.actions.length, 0);
});


test('finalized Minotaur stuns both sides for three own turns and recharges after five', () => {
  const g = game('minotaur', '7k/8/8/3p4/3NP3/8/8/K7 w - - 0 1');
  g.perform(pieceSkillInfo(g, 'd4')!.actions[0]);
  for (let round = 1; round <= 5; round++) {
    assert.equal(g.moves({ square: 'd5', verbose: true }).length === 0, round <= 3);
    g.move({ from: round % 2 ? 'h8' : 'h7', to: round % 2 ? 'h7' : 'h8' });
    assert.equal(g.moves({ square: 'e4', verbose: true }).length === 0, round <= 3);
    const info = pieceSkillInfo(g, 'd4')!;
    assert.equal(info.cooldown, 5 - round);
    assert.equal(info.actions.some(a => a.skill === 'minotaur'), round === 5);
    if (round < 5) g.move({ from: round % 2 ? 'a1' : 'a2', to: round % 2 ? 'a2' : 'a1' });
  }
});

test('Trojan horse embarks and deploys diagonally, consuming an action each',()=>{
 const g=game('trojan','7k/8/8/8/3N4/2P5/8/K7 w - - 0 1');
 g.perform(g.actions().find(a=>a.skill==='trojan'&&a.to==='c3')!);
 assert.equal(g.unit('c3'),undefined);assert.equal(g.unit('d4')!.cargo.length,1);assert.equal(g.turn(),'b');
 g.move({from:'h8',to:'g8'});
 const drops=g.actions().filter(a=>a.skill==='deploy');assert.equal(new Set(drops.map(a=>a.to)).size,8);
 g.perform(drops.find(a=>a.to==='e5')!);assert.equal(g.unit('e5')!.type,'p');assert.equal(g.unit('d4')!.cargo.length,0);assert.equal(g.turn(),'b');
 g.undo();assert.equal(g.unit('d4')!.cargo.length,1);
});
test('Trojan horse still enforces capacity, vacant destinations and incapacitation',()=>{
 const g=game('trojan','7k/8/8/8/3N4/2Pp4/8/K7 w - - 0 1');
 g.unit('d4')!.cargo=['a','b','c','d'];
 assert.equal(g.actions().some(a=>a.skill==='trojan'),false);
 assert.equal(g.actions().some(a=>a.skill==='deploy'&&['c3','d3'].includes(a.to)),false);
 g.unit('d4')!.effects.stun=2;assert.equal(g.actions().some(a=>a.from==='d4'),false);
});
