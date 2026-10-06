import test from "node:test";
import assert from "node:assert/strict";
import { AbilityGame, type AbilityAction } from "../src/AbilityGame";
import type { Loadouts } from "../src/draft";
import { chooseAbilityAction } from "../src/abilityAi";
const blank = { passive: "pending", active: "pending", piece: "pending" };
const create = (
  w: Partial<typeof blank> = {},
  b: Partial<typeof blank> = {},
  fen?: string,
) =>
  new AbilityGame(
    { w: { ...blank, ...w }, b: { ...blank, ...b } } as Loadouts,
    fen,
  );
const skill = (g: AbilityGame, id: string, from?: string, to?: string) => {
  const a = g
    .actions()
    .find(
      (a) =>
        a.skill === id && (!from || a.from === from) && (!to || a.to === to),
    );
  assert.ok(a, `Missing ${id} ${from} ${to}`);
  g.perform(a);
};

test("variant starts with normal moves and restores board and abilities after undo", () => {
  const g = create();
  assert.equal(g.moves({ verbose: true }).length, 20);
  const before = g.fen();
  g.move({ from: "e2", to: "e4" });
  g.move({ from: "e7", to: "e5" });
  g.undo();
  g.undo();
  assert.equal(g.fen(), before);
});
test("Sparta loses a life without displacing either combatant", () => {
  const g = create(
    {},
    { piece: "sparta" },
    "4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1",
  );
  g.move({ from: "c3", to: "d4" });
  assert.equal(g.get("c3")?.type, "b");
  assert.equal(g.get("d4")?.color, "b");
  assert.equal(g.unit("d4")?.lives, 1);
  assert.equal(g.turn(), "b");
  g.undo();
  assert.equal(g.unit("d4")?.lives, 2);
});
test("democracy permits king capture and loses only when its last pawn is gone", () => {
  const g = create(
    {},
    { passive: "democracy" },
    "4k3/p7/8/8/8/8/4R3/4K3 w - - 0 1",
  );
  g.move({ from: "e2", to: "e8" });
  assert.equal(g.winner(), null);
  assert.equal(g.turn(), "b");
  g.move({ from: "a7", to: "a6" });
  assert.ok(g.moves({ verbose: true }).length);
});
test("Pilum prevents captures but permits quiet moves through the next affected turn", () => {
  const g = create(
    { active: "pilum" },
    {},
    "4k3/8/8/8/3r4/3P4/8/4K3 w - - 0 1",
  );
  skill(g, "pilum", undefined, "d4");
  const moves = g.moves({ square: "d4", verbose: true });
  assert.ok(moves.length);
  assert.equal(
    moves.some((m) => m.to === "d3"),
    false,
  );
  g.move({ from: "d4", to: "d5" });
  g.move({ from: "e1", to: "f1" });
  assert.equal(g.unit("d5")?.effects.disarm, undefined);
});
test("Zeus is once per game and pyramid blocks shock propagation", () => {
  const g = create({ active: "zeus" }, { passive: "pyramid" });
  skill(g, "zeus", undefined, "d7");
  assert.equal(g.unit("d7")?.effects.shock, undefined);
  assert.equal(g.state.activeUsed.w, true);
  g.undo();
  assert.equal(g.state.activeUsed.w, false);
});
test("ballista penetrates allies and imposes three intervening own turns of reload", () => {
  const g = create(
    { piece: "ballista" },
    {},
    "4k3/8/8/8/p7/8/P7/R3K3 w - - 0 1",
  );
  skill(g, "ballista", "a1", "a4");
  assert.equal(g.get("a4"), undefined);
  assert.equal(g.get("a1")?.type, "r");
  assert.equal(g.unit("a1")?.cooldownUntil, 5);
});
test("trojan carries and deploys pawns without creating graves", () => {
  const g = create({ piece: "trojan" });
  skill(g, "trojan", "b1", "b2");
  assert.equal(g.get("b2"), undefined);
  assert.equal(g.graves("w").length, 0);
  g.move({ from: "e7", to: "e5" });
  skill(g, "deploy", "b1", "b2");
  assert.equal(g.get("b2")?.type, "p");
});
test("mummy revives once only when its capture square is empty at its next turn", () => {
  const g = create({ piece: "mummy" }, {}, "4k3/8/8/8/1b6/P7/8/4K3 b - - 0 1");
  g.move({ from: "b4", to: "a3" });
  assert.equal(g.get("a3")?.color, "b");
  assert.equal(g.state.pieces["w-a3"].revived, true);
  assert.equal(g.state.pieces["w-a3"].square, null);
});
test("Osiris restores a dead ally and Hades can seal three distinct enemy graves", () => {
  const g = create(
    { active: "osiris" },
    {},
    "4k3/8/8/8/1b6/P7/8/4K3 b - - 0 1",
  );
  g.move({ from: "b4", to: "a3" });
  skill(g, "osiris", undefined, "a2");
  assert.equal(g.get("a2")?.type, "p");
  assert.equal(g.state.activeUsed.w, true);
  const h = create({ active: "hades" });
  for (const id of ["b-a7", "b-b7", "b-c7"]) h.state.pieces[id].square = null;
  skill(h, "hades");
  assert.equal(h.state.pieces["b-a7"].sealed, true);
});
test("desert limits sliders while knights retain their leap; siege excludes kings", () => {
  const g = create({ active: "set" }, {}, "4k3/8/8/3r4/8/8/8/4K3 w - - 0 1");
  skill(g, "set", undefined, "d4");
  assert.equal(
    g.moves({ square: "d5", verbose: true }).some((m) => m.to === "d1"),
    false,
  );
  const s = create({ active: "alesia" });
  assert.equal(
    s.actions().some((a) => a.skill === "alesia" && a.to === "d1"),
    false,
  );
});
test("anubis kills an arriving enemy and disappears", () => {
  const g = create({ active: "anubis" }, {}, "4k3/p7/8/8/8/8/8/4K3 w - - 0 1");
  skill(g, "anubis", undefined, "a6");
  g.move({ from: "a7", to: "a6" });
  assert.equal(g.get("a6"), undefined);
  assert.equal(g.state.zones.length, 0);
});
test("Cleopatra changes allegiance temporarily without moving either piece", () => {
  const g = create(
    { piece: "cleopatra" },
    {},
    "4k3/8/8/8/3p4/2Q5/8/4K3 w - - 0 1",
  );
  skill(g, "cleopatra", "c3", "d4");
  assert.equal(g.get("d4")?.color, "w");
  assert.equal(g.get("c3")?.type, "q");
  g.move({ from: "e8", to: "f8" });
  g.move({ from: "e1", to: "f1" });
  assert.equal(g.get("d4")?.color, "b");
});
test("Sphinx failed answer cancels capture but spends the attackers turn", () => {
  const g = create(
    {},
    { piece: "sphinx" },
    "4k3/8/8/8/3n4/2B5/8/4K3 w - - 0 1",
  );
  assert.equal(g.needsQuiz("c3", "d4"), true);
  g.perform({ kind: "move", from: "c3", to: "d4", quiz: false });
  assert.equal(g.get("d4")?.type, "n");
  assert.equal(g.get("c3")?.type, "b");
  assert.equal(g.turn(), "b");
});
test("gladiator opens a bounded duel, resumes the main game and supports undo", () => {
  const g = create(
    { piece: "gladiator" },
    {},
    "4k3/8/8/8/3r4/2B5/8/4K3 w - - 0 1",
  );
  const before = g.fen();
  skill(g, "gladiator", "c3", "d4");
  assert.ok(g.state.duel);
  assert.equal(g.get("c3"), undefined);
  for (let n = 0; n < 6 && g.state.duel; n++) g.perform(g.actions()[0]);
  assert.equal(g.state.duel, null);
  while (g.history().length) g.undo();
  assert.equal(g.fen(), before);
});
test("philosophy allocates time and timeout wins for the opponent", () => {
  const g = create({ passive: "philosophy" });
  assert.deepEqual(g.state.clocks, { w: 780000, b: 600000 });
  assert.equal(g.tick(780000), true);
  assert.equal(g.winner(), "b");
  assert.deepEqual(g.actions(), []);
});
test("ability journal replay preserves effects and AI returns a legal action without mutation", () => {
  const g = create({ active: "pilum" });
  skill(g, "pilum", undefined, "b8");
  const data = g.save();
  const restored = AbilityGame.restoreSave(data);
  assert.equal(restored.fen(), g.fen());
  assert.deepEqual(restored.state, g.state);
  const before = JSON.stringify(g.state);
  const action = chooseAbilityAction(g, "easy");
  assert.ok(action);
  assert.equal(JSON.stringify(g.state), before);
  g.perform(action);
});
test("Olympics grants one same-piece action on the third successful capture", () => {
  const g = create(
    { passive: "olympics" },
    {},
    "4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1",
  );
  g.unit("c3")!.glory = 2;
  g.move({ from: "c3", to: "d4" });
  assert.equal(g.turn(), "w");
  assert.equal(g.state.extraAction, "w-c3");
  assert.ok(g.moves({ verbose: true }).every((m) => m.from === "d4"));
  g.move({ from: "d4", to: "c3" });
  assert.equal(g.turn(), "b");
  assert.equal(g.state.turns.w, 1);
});
test("Nile provides a third straight step on every fourth own turn only", () => {
  const g = create({ passive: "nile" });
  g.state.turns.w = 4;
  assert.ok(
    g.moves({ square: "a2", verbose: true }).some((m) => m.to === "a5"),
  );
  g.state.turns.w = 5;
  assert.equal(
    g.moves({ square: "a2", verbose: true }).some((m) => m.to === "a5"),
    false,
  );
});
test("roads jump one ally onto a road but never jump an enemy", () => {
  const g = create({ passive: "roads" });
  assert.ok(
    g.moves({ square: "a1", verbose: true }).some((m) => m.to === "a3"),
  );
  g.state.pieces["w-a2"].owner = "b";
  assert.equal(
    g.moves({ square: "a1", verbose: true }).some((m) => m.to === "a3"),
    false,
  );
});
test("legion absorbs one shock per pawn and Minotaur stuns neighboring enemies", () => {
  const g = create({ active: "zeus" }, { passive: "legion" });
  skill(g, "zeus", undefined, "a7");
  assert.equal(g.unit("a7")?.effects.shock, undefined);
  assert.equal(g.unit("a7")?.legionSpent, true);
  const m = create(
    { piece: "minotaur" },
    {},
    "4k3/8/8/8/3p4/3N4/8/4K3 w - - 0 1",
  );
  skill(m, "minotaur", "d3", "d3");
  assert.equal(m.moves({ square: "d4", verbose: true }).length, 0);
  assert.equal(m.unit("d3")?.cooldownUntil, 4);
});
test("Praetorian substitutes for a royal king and dies with the attacker", () => {
  const g = create(
    { piece: "praetorian" },
    {},
    "4k3/8/8/8/8/4r3/3N4/4K3 b - - 0 1",
  );
  g.move({ from: "e3", to: "e1" });
  assert.equal(g.get("e1")?.type, "k");
  assert.equal(g.get("d2"), undefined);
  assert.equal(g.get("e3"), undefined);
});
test("sandstorm starts at four deaths and lasts two opponent turns", () => {
  const g = create({ passive: "sandstorm" });
  for (const id of ["w-a2", "w-b2", "w-c2", "w-d2"])
    g.state.pieces[id].square = null;
  g.move({ from: "e2", to: "e4" });
  assert.equal(g.state.stormUsed.w, true);
  assert.equal(g.state.stormUntil.b, 2);
});
test("Poseidon cannot push off-board and Vesta blocks one effect", () => {
  const g = create(
    { active: "poseidon" },
    {},
    "4k3/8/8/8/7p/8/8/4K3 w - - 0 1",
  );
  const a = g
    .actions()
    .find((a) => a.skill === "poseidon" && a.to === "a4" && a.direction === 0)!;
  g.perform(a);
  assert.equal(g.get("h4")?.type, "p");
  const v = create({ active: "vesta" }, { active: "zeus" });
  skill(v, "vesta", undefined, "a3");
  skill(v, "zeus", undefined, "a2");
  assert.equal(v.unit("a2")?.effects.shock, undefined);
});
test("variant castling and en passant preserve ordinary chess behavior", () => {
  const g = create({}, {}, "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1");
  g.move({ from: "e1", to: "g1" });
  assert.equal(g.get("f1")?.type, "r");
  assert.equal(g.get("h1"), undefined);
  const e = create();
  for (const [from, to] of [
    ["e2", "e4"],
    ["a7", "a6"],
    ["e4", "e5"],
    ["d7", "d5"],
  ])
    e.move({ from, to });
  e.move({ from: "e5", to: "d6" });
  assert.equal(e.get("d5"), undefined);
  assert.equal(e.get("d6")?.color, "w");
});
test("time spent before moves survives reload and undo", () => {
  const g = create({ passive: "philosophy" });
  g.tick(1500);
  g.move({ from: "e2", to: "e4" });
  g.tick(2000);
  g.move({ from: "e7", to: "e5" });
  g.tick(1000);
  const restored = AbilityGame.restoreSave(g.save());
  assert.deepEqual(restored.state.clocks, g.state.clocks);
  restored.undo();
  assert.deepEqual(restored.state.clocks, { w: 778500, b: 598000 });
});
test("mixed ability matches keep legal royal positions and replay complete action journals", () => {
  const loadouts: Loadouts[] = [
    {
      w: { passive: "democracy", active: "poseidon", piece: "trojan" },
      b: { passive: "nile", active: "osiris", piece: "mummy" },
    },
    {
      w: { passive: "roads", active: "alesia", piece: "gladiator" },
      b: { passive: "pyramid", active: "set", piece: "sphinx" },
    },
    {
      w: { passive: "olympics", active: "zeus", piece: "minotaur" },
      b: { passive: "legion", active: "vesta", piece: "praetorian" },
    },
  ];
  for (const loadout of loadouts) {
    const g = new AbilityGame(loadout);
    for (let n = 0; n < 18; n++) {
      const actions = g.actions();
      if (!actions.length) break;
      const a = actions[(n * 37 + 13) % actions.length];
      g.perform(a);
    }
    const replay = AbilityGame.restoreSave(g.save());
    assert.deepEqual(replay.state, g.state);
    assert.equal(replay.fen(), g.fen());
    while (g.history().length) g.undo();
    assert.equal(g.history().length, 0);
  }
});
test("variant checkmate remains checkmate and failed captures do not animate the defender", () => {
  const g = create();
  for (const [from, to] of [
    ["f2", "f3"],
    ["e7", "e5"],
    ["g2", "g4"],
    ["d8", "h4"],
  ])
    g.move({ from, to });
  assert.equal(g.isCheckmate(), true);
  const s = create(
    {},
    { piece: "sparta" },
    "4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1",
  );
  const move = s.move({ from: "c3", to: "d4" });
  assert.equal(move.captured, undefined);
  assert.equal(move.flags, "s");
});
test('a democracy pawn remains alive while participating in a duel',()=>{
 const g=create({piece:'gladiator'}, {passive:'democracy'},'4k3/8/8/8/3p4/2B5/8/4K3 w - - 0 1');skill(g,'gladiator','c3','d4');assert.equal(g.winner(),null);assert.ok(g.actions().length);
});
