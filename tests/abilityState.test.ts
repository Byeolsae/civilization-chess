import test from "node:test";
import assert from "node:assert/strict";
import { Chess } from "chess.js";
import {
  adjacentSquares,
  advanceAbilityTurn,
  applyEffect,
  cloneAbilityState,
  createAbilityState,
  effectActive,
  sealGraves,
} from "../src/abilityState";

test("piece identities and ability snapshots survive independent modifications", () => {
  const state = createAbilityState(new Chess().board());
  const snapshot = cloneAbilityState(state);
  state.pieces["w-a2"].square = "a4";
  state.pieces["w-a2"].cargo.push("w-b2");
  assert.equal(Object.keys(state.pieces).length, 32);
  assert.equal(snapshot.pieces["w-a2"].square, "a2");
  assert.deepEqual(snapshot.pieces["w-a2"].cargo, []);
});

test("one opposing turn of disarm expires after that player finishes their next turn", () => {
  const state = createAbilityState(new Chess().board());
  const target = state.pieces["b-a7"];
  applyEffect(state, target.id, "disarm", 1);
  advanceAbilityTurn(state, "b");
  assert.equal(effectActive(state, target, "disarm"), true);
  advanceAbilityTurn(state, "w");
  advanceAbilityTurn(state, "b");
  assert.equal(effectActive(state, target, "disarm"), false);
});

test("flame protection is consumed per piece; pyramid protection persists", () => {
  const state = createAbilityState(new Chess().board());
  state.zones.push({
    id: "flame",
    kind: "flame",
    owner: "w",
    center: "a3",
    squares: ["a2"],
    expiresAfter: 4,
    protectedPieces: [],
  });
  assert.equal(applyEffect(state, "w-a2", "stun", 2), false);
  assert.equal(applyEffect(state, "w-a2", "shock", 2), true);
  state.zones.push({
    id: "pyramid",
    kind: "pyramid",
    owner: "w",
    center: "b3",
    squares: ["b2"],
    expiresAfter: null,
    protectedPieces: [],
  });
  assert.equal(applyEffect(state, "w-b2", "stun", 2), false);
  assert.equal(applyEffect(state, "w-b2", "shock", 2), false);
  assert.equal(applyEffect(state, "w-b2", "disarm", 2), true);
});

test("Hades requires three distinct enemy dead pieces and excludes transported pawns", () => {
  const state = createAbilityState(new Chess().board());
  for (const id of ["b-a7", "b-b7", "b-c7"]) state.pieces[id].square = null;
  state.pieces["b-b8"].cargo = ["b-a7"];
  assert.equal(sealGraves(state, "w", ["b-a7", "b-b7", "b-c7"]), false);
  state.pieces["b-b8"].cargo = [];
  assert.equal(sealGraves(state, "w", ["b-a7", "b-a7", "b-c7"]), false);
  assert.equal(sealGraves(state, "w", ["b-a7", "b-b7", "b-c7"]), true);
  assert.equal(state.pieces["b-a7"].sealed, true);
  assert.equal(sealGraves(state, "w", ["b-a7", "b-b7", "b-c7"]), false);
});

test("neighborhoods stop at board edges and orthogonal cargo exits exclude diagonals", () => {
  assert.equal(adjacentSquares("d4").length, 8);
  assert.equal(adjacentSquares("a1").length, 3);
  assert.deepEqual(adjacentSquares("a1", false), ["a2", "b1"]);
});
