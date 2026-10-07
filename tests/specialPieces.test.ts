import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { specialPieceSkill, specialPieceTypes, specialPieceVariant } from '../src/specialPieces';
import { AbilityGame } from '../src/AbilityGame';
test('Spartan shield follows life loss and undo, while previews retain the shield', () => {
  const none={passive:'pending',active:'pending',piece:'pending'};
  const game=new AbilityGame({w:none,b:{...none,piece:'sparta'}},'4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1');
  const variant=()=>specialPieceVariant('p','sparta',game.unit('d4')!.lives);
  assert.equal(variant(),'sparta');
  game.move({from:'c3',to:'d4'});
  assert.equal(variant(),'sparta-unshielded');
  game.undo();
  assert.equal(variant(),'sparta');
  assert.equal(specialPieceVariant('p','sparta'),'sparta');
  assert.equal(specialPieceVariant('q','sparta',1),null);
  for(const color of ['w','b']) {
    const svg=readFileSync(new URL(`../public/pieces/special/${color}-sparta-unshielded.svg`,import.meta.url),'utf8');
    assert.doesNotMatch(svg,/<ellipse cx="36"|M26 73 L36 53 L46 73/);
  }
});
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
    for (const svg of assets) { assert.match(svg,/viewBox="[-\d.]+ [-\d.]+ 100 100"/); assert.doesNotMatch(svg,/ACCENT|TRIM|OUTLINE/); }
  }
});
