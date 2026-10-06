import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { specialPieceSkill, specialPieceTypes } from '../src/specialPieces';
test('skill skins only replace the matching piece type, including promotions', () => {
  assert.equal(specialPieceSkill('n','sphinx'),'sphinx');
  assert.equal(specialPieceSkill('b','sphinx'),null);
  assert.equal(specialPieceSkill('q','mummy'),null);
  assert.equal(specialPieceSkill('q','cleopatra'),'cleopatra');
  assert.equal(specialPieceSkill('p','pending'),null);
});
test('every transformed piece has distinct white and black SVG assets', () => {
  for (const skill of Object.keys(specialPieceTypes)) {
    const paths=['w','b'].map(color => new URL(`../public/pieces/special/${color}-${skill}.svg`,import.meta.url));
    assert.ok(paths.every(path=>existsSync(path)),skill);
    const assets=paths.map(path=>readFileSync(path,'utf8'));
    assert.notEqual(assets[0],assets[1]);
    for (const svg of assets) { assert.match(svg,/viewBox="0 0 100 100"/); assert.doesNotMatch(svg,/ACCENT|TRIM|OUTLINE/); }
  }
});
