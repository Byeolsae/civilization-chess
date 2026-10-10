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
  assert.deepEqual(info.actions.map(a => a.to), ['b2']);
  g.perform(info.actions[0]);
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
