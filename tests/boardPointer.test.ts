import { test } from 'node:test';
import assert from 'node:assert/strict';
import { squareAtPoint } from '../src/boardPointer';

const bounds = { left: 40, top: 120, width: 400, height: 400 };

test('drop coordinates resolve correctly in both board orientations', () => {
  assert.equal(squareAtPoint(65, 145, bounds, false), 'a8');
  assert.equal(squareAtPoint(415, 495, bounds, false), 'h1');
  assert.equal(squareAtPoint(265, 345, bounds, false), 'e4');
  assert.equal(squareAtPoint(65, 145, bounds, true), 'h1');
  assert.equal(squareAtPoint(415, 495, bounds, true), 'a8');
  assert.equal(squareAtPoint(215, 295, bounds, true), 'e4');
});

test('off-board drops and invalid board bounds never produce a square', () => {
  for (const [x, y] of [[39, 140], [440, 140], [60, 119], [60, 520], [NaN, 145]]) {
    assert.equal(squareAtPoint(x, y, bounds, false), null);
  }
  assert.equal(squareAtPoint(40, 120, { ...bounds, width: 0 }, false), null);
});

test('small and scrolled boards use client coordinates without rounding past edges', () => {
  const small = { left: 13.5, top: -60, width: 337, height: 337 };
  assert.equal(squareAtPoint(13.5 + 337 * 4.5 / 8, -60 + 337 * 6.5 / 8, small, false), 'e2');
  assert.equal(squareAtPoint(350.49, 276.99, small, false), 'h1');
});
