import test from 'node:test';
import assert from 'node:assert/strict';
import { civilizations } from '../src/civilizations';
import { civilizationMedia, defaultMediaPreferences, mediaForCivilization, opponentCivilization, parseMediaPreferences } from '../src/civilizationMedia';
import { defaultSettings, localSettings } from '../src/matchSettings';
import type { Players } from '../src/game';

test('AI atmosphere always belongs to the opponent regardless of turn', () => {
  const players: Players = { w: 'greece', b: 'egypt' };
  for (const turn of ['w', 'b'] as const) {
    assert.equal(opponentCivilization(players, defaultSettings, turn), 'egypt');
    assert.equal(opponentCivilization(players, { ...defaultSettings, humanColor: 'b' }, turn), 'greece');
  }
});

test('local atmosphere follows the current player opponent, including shared civilizations', () => {
  const players: Players = { w: 'korea', b: 'tang' };
  assert.equal(opponentCivilization(players, localSettings, 'w'), 'tang');
  assert.equal(opponentCivilization(players, localSettings, 'b'), 'korea');
  assert.equal(opponentCivilization({ w: 'korea', b: 'korea' }, localSettings, 'b'), 'korea');
});

test('all civilizations have a silent default and individual dynasty overrides', () => {
  for (const { id } of civilizations) assert.deepEqual(mediaForCivilization(id), { background: null, bgm: null, ...civilizationMedia[id] });
  const savedTang = civilizationMedia.tang;
  const savedSong = civilizationMedia.song;
  delete civilizationMedia.song;
  civilizationMedia.tang = { background: '/media/tang/background.webp', bgm: '/media/tang/bgm.mp3' };
  try {
    assert.equal(mediaForCivilization('tang').bgm, '/media/tang/bgm.mp3');
    assert.equal(mediaForCivilization('song').bgm, null);
  } finally {
    if (savedTang) civilizationMedia.tang = savedTang; else delete civilizationMedia.tang;
    if (savedSong) civilizationMedia.song = savedSong; else delete civilizationMedia.song;
  }
});

test('media preferences handle corrupted and old storage and clamp volume', () => {
  for (const input of [null, 'null', '[]', '{}', 'broken', '{"music":"false","volume":"50"}']) {
    assert.deepEqual(parseMediaPreferences(input), defaultMediaPreferences);
  }
  assert.deepEqual(parseMediaPreferences('{"music":true,"volume":0.6,"background":false}'), { music: true, volume: 0.6, background: false });
  assert.equal(parseMediaPreferences('{"volume":100}').volume, 1);
  assert.equal(parseMediaPreferences('{"volume":-1}').volume, 0);
});
