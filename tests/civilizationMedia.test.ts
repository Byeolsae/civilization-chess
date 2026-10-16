import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import { civilizations } from '../src/civilizations';
import { civilizationMedia, defaultMediaPreferences, mediaForCivilization, opponentCivilization, parseMediaPreferences } from '../src/civilizationMedia';
import { defaultSettings, localSettings } from '../src/matchSettings';
import type { Players } from '../src/game';

test('only the seven approved civilizations have deployed background assets', () => {
  const approved = new Set(['egypt', 'rome', 'greece', 'korea', 'qing', 'aztec', 'ming']);
  for (const { id } of civilizations) {
    const background = mediaForCivilization(id).background;
    if (approved.has(id)) {
      assert.ok(background && existsSync(`public${background}`), `${id} background missing`);
      const bytes = readFileSync(`public${background}`);
      assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    } else assert.equal(background, null, id);
  }
  for (const id of ['sengoku', 'edo', 'ming', 'goryeo'] as const) assert.equal(mediaForCivilization(id).bgm, null);
});

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


test('six civilization tracks exist and have matching measured loudness', () => {
  const report = JSON.parse(readFileSync('public/media/audio-processing.json', 'utf8'));
  const levels: number[] = [];
  for (const id of ['greece', 'egypt', 'rome', 'aztec', 'korea', 'qing'] as const) {
    const path = mediaForCivilization(id).bgm;
    assert.ok(path && existsSync(`public${path}`), `${id} audio missing`);
    const track = report[id];
    assert.ok(track.loop_seconds > 30);
    assert.equal(track.crossfade_seconds, 6);
    assert.ok(Math.abs(track.integrated_lufs + 18) < 1, `${id} loudness out of range`);
    assert.ok(track.true_peak_dbtp < -1, `${id} lacks peak headroom`);
    levels.push(track.integrated_lufs);
  }
  assert.ok(Math.max(...levels) - Math.min(...levels) < 1);
});
