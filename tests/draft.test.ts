import { draftCivilizations, draftCivilizationIds } from '../src/draftRoster';
import { civilizationIntros } from '../src/civilizationIntros';
import { chooseAiDraftPick } from '../src/civilizationReadiness';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Chess } from 'chess.js';
import { readFileSync } from 'node:fs';
import { categories, completeDraft, confirmPick, optionsAt, previousPick, restoreDraft, skills } from '../src/draft';
import { civilizations, decodeMatch, encodeMatch } from '../src/game';

import { civilizationAppearance } from '../src/civilizations';

const picks = ['greece', 'egypt', 'olympics', 'pyramid', 'zeus', 'osiris', 'sparta', 'mummy'];

test('all registered civilizations each have all twelve nonempty piece assets', () => {
  assert.equal(civilizations.length, 87);
  assert.equal(new Set(civilizations.map(civ => civ.id)).size, 87);
  assert.equal(new Set(civilizations.map(civ => civ.name)).size, 87);
  for (const civ of civilizations) for (const color of ['w', 'b']) for (const piece of ['P', 'N', 'B', 'R', 'Q', 'K']) {
    const palette = civilizationAppearance[civ.id];
    const svg = readFileSync(new URL(`../public/pieces/${palette}/${color}${piece}.svg`, import.meta.url), 'utf8');
    assert.ok(svg.startsWith('<svg') && svg.includes('</svg>'));
  }
});

test('configured civilizations offer three cards; new civilizations have no invented skills', () => {
  const ids = new Set<string>();
  for (const civ of civilizations) for (const category of categories) {
    assert.equal(skills[civ.id][category.id].length, ['greece', 'egypt', 'rome'].includes(civ.id) ? 3 : 0);
    for (const skill of skills[civ.id][category.id]) {
      assert.ok(!ids.has(skill.id)); ids.add(skill.id);
      assert.ok(skill.name && skill.description && skill.detail);
    }
  }
  assert.equal(ids.size, 27);
});

test('picks follow both civilizations then paired passive, active and piece choices', () => {
  let draft: string[] = [];
  for (const pick of picks) {
    assert.equal(completeDraft(draft), null);
    assert.ok(optionsAt(draft).includes(pick));
    draft = confirmPick(draft, pick);
  }
  assert.deepEqual(completeDraft(draft), {
    players: { w: 'greece', b: 'egypt' },
    loadouts: { w: { passive: 'olympics', active: 'zeus', piece: 'sparta' }, b: { passive: 'pyramid', active: 'osiris', piece: 'mummy' } },
  });
  assert.deepEqual(optionsAt(draft), []);
  assert.equal(confirmPick(draft, 'zeus'), draft);
});

test('wrong civilization, category or incomplete draft cannot start a game', () => {
  const draft = ['greece', 'egypt'];
  assert.equal(confirmPick(draft, 'pyramid'), draft);
  assert.equal(confirmPick(draft, 'zeus'), draft);
  assert.equal(completeDraft([...picks.slice(0, 7), 'sparta']), null);
  assert.equal(completeDraft(picks.slice(0, 7)), null);
  assert.deepEqual(optionsAt(['rome', 'rome']), ['roads', 'legion', 'twelve-tables']);
});

test('partial drafts survive reload; corrupt drafts are safely discarded', () => {
  for (let length = 0; length <= picks.length; length++) {
    assert.deepEqual(restoreDraft(JSON.stringify(picks.slice(0, length))), picks.slice(0, length));
  }
  for (const raw of ['{', '{}', '["invalid"]', JSON.stringify([...picks, 'extra'])]) assert.deepEqual(restoreDraft(raw), []);
  const rewound = picks.slice(0, 1);
  const changed = confirmPick(rewound, 'rome');
  assert.equal(completeDraft(changed), null);
  assert.deepEqual(optionsAt(confirmPick(changed, 'olympics')), ['roads', 'legion', 'twelve-tables']);
});

test('new saves retain both loadouts and reject incompatible skills', () => {
  const selected = completeDraft(picks)!;
  const raw = encodeMatch(new Chess(), selected.players, null, selected.loadouts);
  assert.deepEqual(decodeMatch(raw)?.loadouts, selected.loadouts);
  const tampered = JSON.parse(raw);
  tampered.loadouts.w.active = 'osiris';
  assert.equal(decodeMatch(JSON.stringify(tampered)), null);
});

test('legacy games remain playable without inventing chosen skills', () => {
  const restored = decodeMatch(JSON.stringify({ version: 1, moves: ['e4'], players: { w: 'greece', b: 'rome' }, resigned: null }));
  assert.ok(restored);
  assert.equal(restored.loadouts, null);
  assert.deepEqual(restored.game.history(), ['e4']);
});

test('all selectable civilization pairings complete, reload and save with pending skills skipped', () => {
  for (const white of draftCivilizations) for (const black of draftCivilizations) {
    let draft = confirmPick(confirmPick([], white.id), black.id);
    while (!completeDraft(draft)) {
      assert.deepEqual(restoreDraft(JSON.stringify(draft)), draft);
      const choices = optionsAt(draft);
      assert.equal(choices.length, 3);
      draft = confirmPick(draft, choices[0]);
    }
    const ready = completeDraft(draft)!;
    assert.deepEqual(restoreDraft(JSON.stringify(draft)), draft);
    const game = new Chess(); game.move('e4');
    const saved = decodeMatch(encodeMatch(game, ready.players, null, ready.loadouts));
    assert.deepEqual(saved?.players, { w: white.id, b: black.id });
    assert.deepEqual(saved?.loadouts, ready.loadouts);
    assert.deepEqual(saved?.game.history(), ['e4']);
    const back = previousPick(draft);
    assert.notEqual(draft[back.length], 'pending');
    assert.deepEqual(confirmPick(back, draft[back.length]), draft);
  }
});

test('changing a new civilization after going back clears skipped skill slots', () => {
  const ready = confirmPick(['tang'], 'korea');
  assert.ok(completeDraft(ready));
  assert.deepEqual(previousPick(ready), ['tang']);
  const mixed = confirmPick(previousPick(ready), 'greece');
  assert.deepEqual(mixed, ['tang', 'greece', 'pending']);
  assert.ok(optionsAt(mixed).includes('olympics'));
  assert.equal(completeDraft(['greece', 'rome', ...Array(6).fill('pending')]), null);
});

test('removed civilizations are rejected in saved drafts and matches', () => {
  for (const removed of ['japan', 'china', 'unknown-civilization']) {
    assert.deepEqual(restoreDraft(JSON.stringify([removed])), []);
    assert.deepEqual(restoreDraft(JSON.stringify(['korea', removed])), []);
    assert.equal(decodeMatch(JSON.stringify({ version: 2, moves: ['e4'], players: { w: 'korea', b: removed }, resigned: null, loadouts: null })), null);
  }
});

test('temporary pick roster is exactly the 25 working factions with reviewed bilingual intros', () => {
  assert.equal(draftCivilizationIds.length, 25);
  assert.equal(new Set(draftCivilizationIds).size, 25);
  assert.deepEqual(new Set(optionsAt([])), new Set(draftCivilizationIds));
  assert.deepEqual(new Set(optionsAt(['rome'])), new Set(draftCivilizationIds));
  assert.deepEqual(new Set(draftCivilizationIds), new Set(civilizations.filter(c => civilizationAppearance[c.id] !== 'classic').map(c => c.id)));
  for (const id of draftCivilizationIds) {
    assert.ok(civilizationIntros[id]?.ko);
    assert.ok(civilizationIntros[id]?.en);
  }
  for (const c of civilizations.filter(c => !draftCivilizations.some(d => d.id === c.id))) {
    assert.deepEqual(confirmPick([], c.id), []);
    assert.deepEqual(restoreDraft(JSON.stringify([c.id])), []);
    // Restrict new picks, not the registry used by old matches/replays.
    assert.ok(decodeMatch(encodeMatch(new Chess(), { w: c.id, b: 'rome' }, null, null)));
  }
  for (let n = 0; n < 1000; n++) {
    assert.ok(optionsAt([]).includes(chooseAiDraftPick([], () => (n + 0.5) / 1000)!));
  }
});
