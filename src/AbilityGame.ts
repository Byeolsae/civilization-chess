import {
  Chess,
  Move,
  SQUARES,
  type Color,
  type Square,
  type PieceSymbol,
} from "chess.js";
import type { Loadouts } from "./draft.js";
import {
  createAbilityState,
  adjacentSquares,
  advanceAbilityTurn,
  effectActive,
  applyEffect,
  sealGraves,
  type AbilityState,
  type AbilityPiece,
} from "./abilityState.js";

export type AbilityAction = {
  kind: "move" | "skill" | "duel" | "pass";
  from: Square;
  to: Square;
  skill?: string;
  promotion?: string;
  id?: string;
  direction?: number;
  quiz?: boolean;
};
type ExtraPiece = AbilityPiece & {
  mummyAt?: Square;
  mummyTurn?: number;
  charmed?: { owner: Color; until: number };
  legion?: boolean;
  legionSpent?: boolean;
  duelUses?: number;
};
type Duel = {
  attacker: string;
  defender: string;
  origin: Record<string, Square>;
  positions: Record<string, Square>;
  actions: number;
  initiator: Color;
};
type State = AbilityState & {
  pieces: Record<string, ExtraPiece>;
  turn: Color;
  ply: number;
  ep: Square | null;
  rights: string;
  stormUsed: Record<Color, boolean>;
  stormUntil: Record<Color, number>;
  duel: Duel | null;
  clocks: Record<Color, number> | null;
  timedOut: Color | null;
};
export type PassivePlacement = { square: Square; axis: "row" | "column"; law?: never } | { law: "military-code"; square?: never; axis?: never };
export type AbilitySave = {
  placements?: Partial<Record<Color, PassivePlacement>>;
  version: 1;
  loadouts: Loadouts;
  actions: AbilityAction[];
  clocks: Record<Color, number> | null;
  clocksBefore: (Record<Color, number> | null)[];
};
const other = (c: Color): Color => (c === "w" ? "b" : "w");
const xy = (s: Square) => [s.charCodeAt(0) - 97, Number(s[1]) - 1];
const at = (x: number, y: number): Square | null =>
  x >= 0 && x < 8 && y >= 0 && y < 8
    ? (`${String.fromCharCode(97 + x)}${y + 1}` as Square)
    : null;
const distance = (a: Square, b: Square) => {
  const [x, y] = xy(a),
    [u, v] = xy(b);
  return Math.max(Math.abs(x - u), Math.abs(y - v));
};
const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];
export const abilityNames: Record<string, string> = {
  zeus: "제우스",
  poseidon: "포세이돈",
  hades: "하데스",
  osiris: "오시리스",
  set: "세트",
  anubis: "아누비스",
  alesia: "알레시아 포위망",
  vesta: "베스타의 성화",
  pilum: "필룸 투척",
  trojan: "목마 탑승",
  deploy: "목마 하차",
  minotaur: "미노타우르스",
  cleopatra: "매혹",
  gladiator: "콜로세움",
  ballista: "발리스타",
  pass: "행동 대기",
};

// Separate variant rules; chess.js remains the board renderer and standard-game engine.
export class AbilityGame extends Chess {
  state: State;
  readonly loadouts: Loadouts;
  private replayingLegacyAnubis = false;
  private placements?: Partial<Record<Color, PassivePlacement>>;
  private journal: { before: State; action: AbilityAction; move: Move }[] = [];
  private actionCache: { key: string; actions: AbilityAction[] } | null = null;
  constructor(loadouts: Loadouts, initialFen?: string) {
    super(initialFen);
    this.loadouts = structuredClone(loadouts);
    this.state = {
      ...createAbilityState(super.board()),
      turn: super.turn(),
      ply: 0,
      ep: null,
      rights: super.fen().split(" ")[2],
      stormUsed: { w: false, b: false },
      stormUntil: { w: 0, b: 0 },
      duel: null,
      clocks: null,
      timedOut: null,
    };
    this.state.turns =
      this.state.turn === "w" ? { w: 1, b: 0 } : { w: 0, b: 1 };
    for (const p of Object.values(this.state.pieces))
      if (p.type === "p" && this.has(p.owner, "sparta")) p.lives = 2;
    for (const c of ["w", "b"] as Color[])
      if (this.has(c, "pyramid")) {
        const center = (c === "w" ? "d2" : "d7") as Square;
        this.state.zones.push({
          id: `pyramid-${c}`,
          kind: "pyramid",
          owner: c,
          center,
          squares: [center, ...adjacentSquares(center)],
          expiresAfter: null,
          protectedPieces: [],
        });
      }
    this.updateLegion();
  }
  beginPlacement() {
    if (this.journal.length || this.placements) throw Error("Placement already started");
    this.placements = {};
    this.state.zones = this.state.zones.filter(z => z.kind !== "pyramid" && z.kind !== "road");
    this.actionCache = null;
    return this;
  }
  placementOwner(): Color | undefined {
    if (!this.placements) return undefined;
    return (["w", "b"] as Color[]).find(c => ["pyramid", "roads", "twelve-tables"].includes(this.loadouts[c].passive) && !this.placements![c]);
  }
  placementSquares(owner: Color, choice: PassivePlacement): Square[] {
    if (choice.law !== undefined) return [];
    if (!SQUARES.includes(choice.square) || !["row", "column"].includes(choice.axis)) throw Error("Invalid placement");
    if (this.has(owner, "pyramid")) return [choice.square, ...adjacentSquares(choice.square)];
    if (!this.has(owner, "roads")) return [];
    const index = choice.axis === "row" ? 1 : 0;
    const start = Math.min(6, xy(choice.square)[index]);
    return SQUARES.filter(s => xy(s)[index] === start || xy(s)[index] === start + 1);
  }
  placePassive(owner: Color, choice: PassivePlacement) {
    if (this.placementOwner() !== owner) throw Error("Not placement turn");
    if (this.has(owner, "twelve-tables")) {
      if (choice.law !== "military-code" || choice.square !== undefined || choice.axis !== undefined) throw Error("Invalid law");
      this.state.laws = { ...this.state.laws, [owner]: choice.law };
      this.placements![owner] = { law: choice.law };
      this.actionCache = null;
      return;
    }
    if (choice.law !== undefined) throw Error("Unexpected law");
    const squares = this.placementSquares(owner, choice);
    this.state.zones.push({ id: this.loadouts[owner].passive + "-" + owner, kind: this.has(owner, "pyramid") ? "pyramid" : "road", owner, center: choice.square, squares, expiresAfter: null, protectedPieces: [] });
    this.placements![owner] = structuredClone(choice);
    this.actionCache = null;
  }
  private cooldownPenalty(c: Color) {
    // Both law holders retain their Roman exemption.
    return this.state.laws?.[other(c)] === "military-code" && this.state.laws?.[c] !== "military-code" ? 1 : 0;
  }
  has(c: Color, skill: string) {
    return Object.values(this.loadouts[c]).includes(skill);
  }
  units() {
    return Object.values(this.state.pieces);
  }
  unit(s: Square) {
    return this.units().find((p) => p.square === s);
  }
  override turn() {
    return this.state?.turn ?? super.turn();
  }
  private sync() {
    const ranks: string[] = [];
    for (let y = 7; y >= 0; y--) {
      let row = "",
        empty = 0;
      for (let x = 0; x < 8; x++) {
        const p = this.unit(at(x, y)!);
        if (!p) empty++;
        else {
          if (empty) row += empty;
          empty = 0;
          row += p.owner === "w" ? p.type.toUpperCase() : p.type;
        }
      }
      if (empty) row += empty;
      ranks.push(row);
    }
    super.load(
      `${ranks.join("/")} ${this.turn()} ${this.state.rights || "-"} ${this.state.ep ?? "-"} 0 ${Math.floor(this.state.ply / 2) + 1}`,
      { skipValidation: true },
    );
  }
  reviewPosition(ply: number) {
    if (!Number.isInteger(ply) || ply < 0 || ply > this.journal.length) throw Error("Invalid review position");
    const copy = new AbilityGame(this.loadouts);
    copy.restore(ply === this.journal.length ? this.state : this.journal[ply].before);
    return copy;
  }
  snapshot() {
    return structuredClone(this.state);
  }
  restore(state: State) {
    this.state = structuredClone(state);
    this.sync();
  }
  save(): AbilitySave {
    return {
      version: 1,
      ...(this.placements ? { placements: structuredClone(this.placements) } : {}),
      loadouts: this.loadouts,
      actions: this.journal.map((j) => j.action),
      clocks: this.state.clocks,
      clocksBefore: this.journal.map((j) => j.before.clocks),
    };
  }
  static restoreSave(data: AbilitySave) {
    if (
      data.version !== 1 ||
      !Array.isArray(data.actions) ||
      data.actions.length > 2000
    )
      throw Error("Invalid ability save");
    const game = new AbilityGame(data.loadouts);
    if (data.placements !== undefined) {
      game.beginPlacement();
      for (const c of ["w", "b"] as Color[]) if (data.placements[c]) game.placePassive(c, data.placements[c]!);
    }
    for (const [index, action] of data.actions.entries()) {
      if (game.state.clocks) {
        const clock = data.clocksBefore?.[index];
        if (!clock) throw Error("Missing clock history");
        for (const c of ["w", "b"] as Color[]) {
          if (
            !Number.isFinite(clock[c]) ||
            clock[c] < 0 ||
            clock[c] > game.state.clocks[c]
          )
            throw Error("Invalid clock history");
        }
        game.state.clocks = { ...clock };
      }
      // Older saved matches used an empty-square trap. Replay only, never a new action.
      game.replayingLegacyAnubis = action.skill === "anubis" && !action.id;
      game.actionCache = null;
      try { game.perform(action); } finally { game.replayingLegacyAnubis = false; game.actionCache = null; }
    }
    if (game.state.clocks && data.clocks)
      for (const c of ["w", "b"] as Color[]) {
        if (
          !Number.isFinite(data.clocks[c]) ||
          data.clocks[c] < 0 ||
          data.clocks[c] > game.state.clocks[c]
        )
          throw Error("Invalid clock");
        game.state.clocks[c] = data.clocks[c];
        if (data.clocks[c] === 0) game.state.timedOut = c;
      }
    return game;
  }
  acceptOnlineSave(data: AbilitySave) {
    if (JSON.stringify(data.loadouts) !== JSON.stringify(this.loadouts)) throw Error('Loadout mismatch');
    const restored = AbilityGame.restoreSave(data);
    this.state = restored.state; this.journal = restored.journal; this.placements = restored.placements;
    this.actionCache = null; this.sync();
  }
  tick(ms: number) {
    if (this.placementOwner() || !this.state.clocks || this.state.timedOut) return false;
    const c = this.turn();
    this.state.clocks[c] = Math.max(0, this.state.clocks[c] - ms);
    if (this.state.clocks[c] === 0) {
      this.state.timedOut = c;
      return true;
    }
    return false;
  }
  override history: Chess["history"] = ((options?: { verbose?: boolean }) =>
    options?.verbose
      ? this.journal.map((j) => j.move)
      : this.journal.map((j) => JSON.stringify(j.action))) as Chess["history"];
  override undo() {
    const entry = this.journal.pop();
    if (!entry) return null;
    this.restore(entry.before);
    return entry.move;
  }
  private disabled(p: ExtraPiece) {
    return (
      effectActive(this.state, p, "stun") ||
      effectActive(this.state, p, "shock")
    );
  }
  private zoneBlocks(p: ExtraPiece, from: Square, to: Square) {
    return this.state.zones.some(
      (z) =>
        z.kind === "siege" &&
        z.owner !== p.owner &&
        z.squares.includes(from) !== z.squares.includes(to),
    );
  }
  private limited(p: ExtraPiece, from: Square, to: Square) {
    if (p.type === "n") return false;
    const desert = this.state.zones.some(
      (z) =>
        z.kind === "desert" &&
        z.owner !== p.owner &&
        (z.squares.includes(from) || z.squares.includes(to)),
    );
    const storm =
      this.state.stormUntil[p.owner] >= this.state.turns[p.owner] &&
      this.state.stormUntil[p.owner] > 0;
    return (
      (desert && distance(from, to) > 1) ||
      (storm && ["r", "b", "q"].includes(p.type) && distance(from, to) > 3)
    );
  }
  private onRoad(c: Color, s: Square) {
    if (this.placements) return this.state.zones.some(z => z.kind === "road" && z.owner === c && z.squares.includes(s));
    return (
      this.has(c, "roads") &&
      (c === "w" ? ["2", "3"].includes(s[1]) : ["6", "7"].includes(s[1]))
    );
  }
  private geometries(p: ExtraPiece, attacks = false): AbilityAction[] {
    if (!p.square || this.disabled(p)) return [];
    const from = p.square,
      [x, y] = xy(from),
      result: AbilityAction[] = [];
    const add = (to: Square | null, captureOnly = false) => {
      if (!to || this.zoneBlocks(p, from, to) || this.limited(p, from, to))
        return;
      const target = this.unit(to);
      if (target?.owner === p.owner) return;
      if ((target || captureOnly) && effectActive(this.state, p, "disarm"))
        return;
      const promotions =
        p.type === "p" && (to[1] === "1" || to[1] === "8")
          ? ["q", "r", "b", "n"]
          : [undefined];
      for (const promotion of promotions)
        result.push({
          kind: "move",
          from,
          to,
          ...(promotion ? { promotion } : {}),
        });
    };
    if (p.type === "p") {
      const dy = p.owner === "w" ? 1 : -1;
      for (const dx of [-1, 1]) {
        const to = at(x + dx, y + dy);
        if (to && (attacks || this.unit(to) || to === this.state.ep))
          add(to, true);
      }
      if (!attacks) {
        const flood =
          this.has(p.owner, "nile") &&
          this.state.turns[p.owner] % 4 === 0 &&
          (p.owner === "w" ? y <= 3 : y >= 4);
        const max = (y === (p.owner === "w" ? 1 : 6) ? 2 : 1) + (flood ? 1 : 0);
        for (let d = 1; d <= max; d++) {
          const to = at(x, y + dy * d);
          if (!to || this.unit(to) || this.zoneBlocks(p, from, to)) break;
          add(to);
        }
      }
    } else if (p.type === "n") {
      for (const [dx, dy] of [
        [1, 2],
        [2, 1],
        [-1, 2],
        [-2, 1],
        [1, -2],
        [2, -1],
        [-1, -2],
        [-2, -1],
      ])
        add(at(x + dx, y + dy));
    } else {
      const dirs =
        p.type === "b"
          ? directions.slice(4)
          : p.type === "r"
            ? directions.slice(0, 4)
            : directions;
      for (const [dx, dy] of dirs) {
        let jumped = false;
        for (let d = 1; d <= (p.type === "k" ? 1 : 7); d++) {
          const to = at(x + dx * d, y + dy * d);
          if (!to) break;
          if (this.zoneBlocks(p, from, to)) break;
          const target = this.unit(to);
          if (target?.owner === p.owner) {
            if (p.type !== "k" && !jumped && this.has(p.owner, "roads")) {
              jumped = true;
              continue;
            }
            break;
          }
          if (!jumped || this.onRoad(p.owner, to)) add(to);
          if (target) break;
        }
      }
      if (p.type === "k" && !attacks && !this.checked(p.owner)) {
        const rank = p.owner === "w" ? "1" : "8";
        if (from === `e${rank}`)
          for (const side of ["k", "q"]) {
            const right = p.owner === "w" ? side.toUpperCase() : side;
            if (!this.state.rights.includes(right)) continue;
            const rook = this.unit(
              `${side === "k" ? "h" : "a"}${rank}` as Square,
            );
            const path = (side === "k" ? ["f", "g"] : ["d", "c", "b"]).map(
              (f) => `${f}${rank}` as Square,
            );
            if (
              !rook ||
              rook.owner !== p.owner ||
              rook.type !== "r" ||
              this.disabled(rook) ||
              path.some((s) => this.unit(s))
            )
              continue;
            if (path.slice(0, 2).some((s) => this.attacked(s, other(p.owner))))
              continue;
            const to = path[1];
            if (!this.zoneBlocks(p, from, to) && !this.limited(p, from, to))
              add(to);
          }
      }
    }
    return result;
  }
  private guard(c: Color, s: Square) {
    return this.has(c, "praetorian")
      ? this.units().find(
          (p) =>
            p.owner === c &&
            p.type === "n" &&
            p.square &&
            distance(p.square, s) === 1 &&
            !this.disabled(p),
        )
      : undefined;
  }
  private attacked(s: Square, by: Color) {
    return this.units().some(
      (p) => p.owner === by && this.geometries(p, true).some((m) => m.to === s),
    );
  }
  checked(c: Color) {
    if (this.has(c, "democracy")) return false;
    const king = this.units().find(
      (p) => p.owner === c && p.type === "k" && p.square,
    );
    return (
      !king ||
      (!this.guard(c, king.square!) && this.attacked(king.square!, other(c)))
    );
  }
  override isCheck() {
    return this.state ? this.checked(this.turn()) : false;
  }
  override isInsufficientMaterial() {
    return false;
  }
  override isDrawByFiftyMoves() {
    return false;
  }
  override isThreefoldRepetition() {
    return false;
  }
  override isCheckmate() {
    return !this.placementOwner() && !this.state.duel && this.isCheck() && !this.actions().length;
  }
  override isStalemate() {
    return !this.placementOwner() && !this.state.duel && !this.isCheck() && !this.actions().length;
  }
  override isDraw() {
    return this.isStalemate();
  }
  override isGameOver() {
    return !!this.winner() || this.isCheckmate() || this.isStalemate();
  }
  winner(): Color | null {
    if (this.state.timedOut) return other(this.state.timedOut);
    for (const c of ["w", "b"] as Color[])
      if (
        this.has(c, "democracy") &&
        !this.units().some(
          (p) =>
            p.owner === c &&
            p.type === "p" &&
            (p.square || this.units().some((n) => n.cargo.includes(p.id)) || this.state.duel?.attacker === p.id || this.state.duel?.defender === p.id),
        )
      )
        return other(c);
    return null;
  }
  private kill(p: ExtraPiece) {
    const square = p.square;
    p.square = null;
    p.effects = {};
    delete p.judgment;
    for (const id of p.cargo) this.kill(this.state.pieces[id]);
    p.cargo = [];
    if (
      square &&
      p.type === "p" &&
      this.has(p.owner, "mummy") &&
      !p.revived &&
      !p.sealed
    ) {
      p.mummyAt = square;
      p.mummyTurn = this.state.turns[p.owner] + 1;
    }
  }
  private creditKill(p: ExtraPiece, victim: ExtraPiece) {
    const question = victim.question;
    if (p.square && question?.owner === p.owner &&
        question.until === this.state.turns[p.owner] && this.has(p.owner, "philosophy")) {
      p.cooldownUntil = Math.max(this.state.turns[p.owner], p.cooldownUntil - 1);
    }
    delete victim.question;
    if (p.square && victim.owner !== p.owner && this.has(victim.owner, "philosophy")) {
      p.question = { owner: victim.owner, until: this.state.turns[victim.owner] + 1 };
    }
    const judgment = p.judgment;
    if (!judgment || judgment.executedAt || !p.square) return;
    judgment.kills++;
    if (judgment.kills >= 2) {
      const executedAt = p.square;
      this.kill(p);
      p.judgment = { ...judgment, executedAt };
      if (this.state.extraAction === p.id) this.state.extraAction = null;
    }
  }
  private capture(p: ExtraPiece) {
    if (p.lives > 1) {
      p.lives--;
      return false;
    }
    this.kill(p);
    return true;
  }
  private immune(p: ExtraPiece) {
    if (!p.square) return true;
    if (
      this.state.zones.some(
        (z) =>
          z.kind === "pyramid" &&
          z.owner === p.owner &&
          z.squares.includes(p.square!),
      )
    )
      return true;
    if (p.legion && !p.legionSpent) {
      p.legionSpent = true;
      return true;
    }
    const flame = this.state.zones.find(
      (z) =>
        z.kind === "flame" &&
        z.owner === p.owner &&
        z.squares.includes(p.square!) &&
        !z.protectedPieces.includes(p.id),
    );
    if (flame) {
      flame.protectedPieces.push(p.id);
      return true;
    }
    return false;
  }
  private afflict(p: ExtraPiece, kind: "shock" | "stun", duration = 1) {
    if (!this.immune(p))
      applyEffect(this.state, p.id, kind, this.state.turns[p.owner] + duration);
  }
  private updateLegion() {
    for (const p of this.units()) {
      let formed = false;
      if (p.square && p.type === "p" && this.has(p.owner, "legion")) {
        const [x, y] = xy(p.square);
        let count = 1;
        for (const d of [-1, 1])
          for (let n = 1; n < 8; n++) {
            const s = at(x + d * n, y);
            const q = s ? this.unit(s) : undefined;
            if (q?.owner !== p.owner || q.type !== "p") break;
            count++;
          }
        formed = count >= 3;
      }
      if (formed && !p.legion) p.legionSpent = false;
      p.legion = formed;
    }
  }
  private skillCandidates(): AbilityAction[] {
    const c = this.turn(),
      out: AbilityAction[] = [];
    if (this.state.extraAction) return out;
    const living = this.units().filter((p) => p.square),
      friendly = living.filter((p) => p.owner === c),
      enemies = living.filter((p) => p.owner !== c);
    const origin =
      friendly.find((p) => p.type === "k")?.square ??
      friendly[0]?.square ??
      "a1";
    const add = (
      skill: string,
      from: Square,
      to: Square,
      extra: Partial<AbilityAction> = {},
    ) => out.push({ kind: "skill", skill, from, to, ...extra });
    const active = this.loadouts[c].active;
    if (!this.state.activeUsed[c]) {
      if (["zeus", "pilum"].includes(active))
        for (const p of enemies) add(active, origin, p.square!);
      if (active === "poseidon")
        for (const s of SQUARES)
          for (const direction of [0, 1, 2, 3])
            if (direction < 2 ? s[0] === "a" : s[1] === "1")
              add(active, origin, s, { direction });
      if (active === "hades") {
        const dead = this.graves(other(c)).filter((p) => !p.sealed);
        if (dead.length >= 3)
          for (let i = 0; i < dead.length - 2; i++)
            for (let j = i + 1; j < dead.length - 1; j++)
              for (let k = j + 1; k < dead.length; k++)
                add(active, origin, origin, {
                  id: [dead[i].id, dead[j].id, dead[k].id].join(","),
                });
      }
      if (active === "osiris")
        for (const p of this.graves(c).filter(
          (p) => !p.sealed && (p.type !== "k" || this.has(c, "democracy")),
        ))
          for (const s of SQUARES)
            if (
              !this.unit(s) &&
              (c === "w" ? Number(s[1]) <= 4 : Number(s[1]) >= 5) &&
              !(p.type === "p" && ["1", "8"].includes(s[1]))
            )
              add(active, origin, s, { id: p.id });
      if (active === "anubis" && !this.replayingLegacyAnubis) {
        const targets = enemies.filter(p => p.type !== "k" && !p.judgment);
        for (let i = 0; i < targets.length - 1; i++)
          for (let j = i + 1; j < targets.length; j++)
            add(active, origin, targets[i].square!, { id: [targets[i].id, targets[j].id].join(",") });
      }
      if (["set", "vesta"].includes(active) || (active === "anubis" && this.replayingLegacyAnubis))
        for (const s of SQUARES) if (!this.unit(s)) add(active, origin, s);
      if (active === "alesia")
        for (const s of SQUARES) {
          const [x, y] = xy(s);
          if (x > 6 || y > 6) continue;
          const area = [s, at(x + 1, y)!, at(x, y + 1)!, at(x + 1, y + 1)!];
          if (!area.some((s) => this.unit(s)?.type === "k"))
            add(active, origin, s);
        }
    }
    for (const p of friendly) {
      if (this.disabled(p)) continue;
      const from = p.square!;
      if (p.type === "n" && this.has(c, "trojan")) {
        for (const to of adjacentSquares(from, false)) {
          const q = this.unit(to);
          if (q?.owner === c && q.type === "p" && p.cargo.length < 4)
            add("trojan", from, to, { id: q.id });
          if (!q) for (const id of p.cargo) add("deploy", from, to, { id });
        }
      }
      if (
        p.type === "n" &&
        this.has(c, "minotaur") &&
        this.state.turns[c] >= p.cooldownUntil
      )
        add("minotaur", from, from);
      if (
        p.type === "q" &&
        this.has(c, "cleopatra") &&
        !this.units().some((q) => q.charmed && q.owner === c)
      )
        for (const m of this.geometries(p, true))
          if (this.unit(m.to)?.type === "p") add("cleopatra", from, m.to);
      if (
        p.type === "r" &&
        this.has(c, "ballista") &&
        this.state.turns[c] >= p.cooldownUntil &&
        !effectActive(this.state, p, "disarm")
      ) {
        const [x, y] = xy(from);
        for (const [dx, dy] of directions)
          for (let n = 1; n <= 5; n++) {
            const to = at(x + dx * n, y + dy * n);
            if (!to || this.zoneBlocks(p, from, to)) break;
            const q = this.unit(to);
            if (q && q.owner !== c) {
              if (q.type !== "k" || this.has(q.owner, "democracy"))
                add("ballista", from, to);
              break;
            }
          }
      }
      if (
        p.type === "b" &&
        this.has(c, "gladiator") &&
        (p.duelUses ?? 0) < 2 &&
        !this.checked(c)
      )
        for (const q of enemies)
          if (q.type !== "k") add("gladiator", from, q.square!);
    }
    return out;
  }
  graves(c: Color) {
    const held = new Set(this.units().flatMap((p) => p.cargo));
    const duel = this.state.duel;
    return this.units().filter(
      (p) =>
        p.owner === c &&
        !p.square &&
        !held.has(p.id) &&
        p.id !== duel?.attacker &&
        p.id !== duel?.defender,
    );
  }
  private duelCandidates(): AbilityAction[] {
    const d = this.state.duel!;
    const id = [d.attacker, d.defender].find(
      (id) => this.state.pieces[id].owner === this.turn(),
    )!;
    const p = this.state.pieces[id],
      from = d.positions[id],
      [x, y] = xy(from);
    const targetId = id === d.attacker ? d.defender : d.attacker,
      toEnemy = d.positions[targetId];
    const result: AbilityAction[] = [];
    const inner = d.actions >= 4;
    for (let u = inner ? 1 : 0; u < (inner ? 3 : 4); u++)
      for (let v = inner ? 1 : 0; v < (inner ? 3 : 4); v++) {
        const to = at(u, v)!;
        if (to === from) continue;
        const dx = Math.abs(u - x),
          dy = Math.abs(v - y);
        const allowed =
          p.type === "b"
            ? dx === dy
            : p.type === "r"
              ? !dx || !dy
              : p.type === "q"
                ? !dx || !dy || dx === dy
                : p.type === "n"
                  ? dx * dy === 2
                  : p.type === "k"
                    ? Math.max(dx, dy) === 1
                    : v - y === (p.owner === "w" ? 1 : -1) &&
                      (to === toEnemy ? dx === 1 : dx === 0);
        if (allowed) result.push({ kind: "duel", from, to });
      }
    if (!result.length) result.push({ kind: "pass", from, to: from });
    return result;
  }
  actions(): AbilityAction[] {
    if (this.placementOwner()) return [];
    const cacheKey = JSON.stringify({ ...this.state, clocks: null });
    if (this.actionCache?.key === cacheKey)
      return this.actionCache.actions.slice();
    if (this.winner()) return [];
    if (this.state.duel) return this.duelCandidates();
    const c = this.turn();
    const candidates = this.units()
      .filter(
        (p) =>
          p.owner === c &&
          (!this.state.extraAction || p.id === this.state.extraAction),
      )
      .flatMap((p) => this.geometries(p));
    candidates.push(...this.skillCandidates());
    const valid: AbilityAction[] = [];
    for (const action of candidates) {
      const before = this.snapshot();
      try {
        this.execute(action);
        if (!this.checked(c)) valid.push(action);
      } catch {
        /* Invalid royal capture. */
      } finally {
        this.state = before;
      }
    }
    if (
      !valid.length &&
      !this.checked(c) &&
      (this.state.extraAction ||
        this.units().some((p) => p.owner === c && p.square && this.disabled(p)))
    )
      valid.push({ kind: "pass", from: "a1", to: "a1" });
    this.actionCache = { key: cacheKey, actions: valid };
    return valid.slice();
  }
  override moves: Chess["moves"] = ((options?: {
    verbose?: boolean;
    square?: Square;
    piece?: PieceSymbol;
  }) => {
    const actions = this.actions().filter(
      (a) =>
        a.kind === "move" &&
        (!options?.square || a.from === options.square) &&
        (!options?.piece || this.unit(a.from)?.type === options.piece),
    );
    return options?.verbose
      ? actions.map((a) => this.describe(a))
      : actions.map((a) => this.describe(a).san);
  }) as Chess["moves"];
  private describe(a: AbilityAction): Move {
    const p = this.unit(a.from);
    const q = this.unit(a.to);
    let flags = a.kind === "move" ? "n" : "s";
    if (a.kind === "move" && p?.type === "k" && distance(a.from, a.to) === 2)
      flags = a.to[0] === "g" ? "k" : "q";
    if (a.kind === "move" && p?.type === "p" && a.to === this.state.ep && !q)
      flags = "e";
    if (q && q.owner !== p?.owner && a.kind === "move") flags = "c";
    const captured =
      a.kind === "move"
        ? q?.type
        : a.skill === "ballista"
          ? q?.type
          : undefined;
    return Object.assign(Object.create(Move.prototype), {
      color: this.turn(),
      from: a.from,
      to: a.to,
      piece: p?.type ?? "k",
      flags,
      captured,
      promotion: a.promotion,
      san:
        a.kind === "move"
          ? `${p?.type?.toUpperCase() ?? ""}${a.from}${captured ? "×" : "–"}${a.to}${a.promotion ? "=" + a.promotion.toUpperCase() : ""}`
          : a.kind === "duel"
            ? `결투 ${a.from}→${a.to}`
            : a.kind === "pass"
              ? "대기"
              : `${abilityNames[a.skill!] ?? a.skill} ${a.to}`,
      lan: a.from + a.to,
      before: super.fen(),
      after: "",
    }) as Move;
  }
  override move(input: Parameters<Chess["move"]>[0]): Move {
    if (typeof input === "string") {
      try {
        return this.perform(JSON.parse(input));
      } catch {
        throw Error("Invalid variant action");
      }
    }
    if (!input) throw Error("Move required");
    return this.perform({
      kind: "move",
      from: input.from as Square,
      to: input.to as Square,
      ...(input.promotion ? { promotion: input.promotion } : {}),
    });
  }
  perform(action: AbilityAction): Move {
    const key = (a: AbilityAction) => JSON.stringify({ ...a, quiz: undefined });
    const found = this.actions().find((a) => key(a) === key(action));
    if (!found) throw Error("Illegal ability action");
    const before = this.snapshot(),
      move = this.describe(action),
      actor = this.turn();
    try {
      this.execute(action);
      // Displacement, death and transport must never restore castling rights.
      for (const old of Object.values(before.pieces))
        if (old.square !== this.state.pieces[old.id].square) {
          if (old.type === "k")
            this.state.rights = this.state.rights.replace(
              old.owner === "w" ? /[KQ]/g : /[kq]/g,
              "",
            );
          if (old.type === "r")
            for (const [square, right] of Object.entries({
              a1: "Q",
              h1: "K",
              a8: "q",
              h8: "k",
            }))
              if (old.square === square)
                this.state.rights = this.state.rights.replace(right, "");
        }
      const victim = Object.values(before.pieces).find(
        (p) => p.square === action.to && p.owner !== actor,
      );
      if (victim && this.state.pieces[victim.id].square) {
        move.captured = undefined;
        if (action.kind === "move") move.flags = "s";
      }
      this.state.ply++;
      if (!this.state.duel) {
        this.updateLegion();
        if (this.state.extraAction) this.state.turn = actor;
        else {
          const ended = before.duel ? this.turn() : actor;
          for (const p of this.units())
            if (p.owner === ended)
              for (const kind of Object.keys(
                p.effects,
              ) as (keyof typeof p.effects)[])
                if (p.effects[kind]! <= this.state.turns[ended])
                  delete p.effects[kind];
          for (const p of Object.values(this.state.pieces))
            if (p.question && (!p.square || (p.question.owner === ended && p.question.until <= this.state.turns[ended])))
              delete p.question;
          this.state.turn = other(ended);
          this.beginTurn(this.state.turn);
        }
      }
      this.sync();
      move.after = super.fen();
      this.journal.push({ before, action: structuredClone(action), move });
      return move;
    } catch (error) {
      this.restore(before);
      throw error;
    }
  }
  private beginTurn(c: Color) {
    advanceAbilityTurn(this.state, c);
    for (const p of this.units()) {
      if (
        p.charmed &&
        p.charmed.owner === c &&
        this.state.turns[c] >= p.charmed.until
      ) {
        p.owner = c;
        delete p.charmed;
      }
      if (p.owner === c && p.mummyAt && p.mummyTurn! <= this.state.turns[c]) {
        if (!p.sealed && !this.unit(p.mummyAt)) {
          p.square = p.mummyAt;
          delete p.judgment;
          p.lives = 1;
        }
        // Check at the start of each of the next three owner turns.
        // A captor occupying the grave on the first turn no longer wastes revival.
        if (p.square || p.sealed || this.state.turns[c] >= p.mummyTurn! + 2) {
          p.revived = true;
          delete p.mummyAt;
          delete p.mummyTurn;
        }
      }
    }
    for (const owner of ["w", "b"] as Color[])
      if (
        this.has(owner, "sandstorm") &&
        !this.state.stormUsed[owner] &&
        this.graves(owner).length >= 4
      ) {
        this.state.stormUsed[owner] = true;
        this.state.stormUntil[other(owner)] =
          this.state.turns[other(owner)] + (c === other(owner) ? 1 : 2);
      }
    this.updateLegion();
  }
  private execute(a: AbilityAction) {
    const c = this.turn();
    this.state.extraAction = null;
    if (this.state.duel) {
      this.executeDuel(a);
      return;
    }
    if (a.kind === "pass") return;
    if (a.kind === "skill") {
      this.executeSkill(a);
      this.state.ep = null;
      return;
    }
    const p = this.unit(a.from)!;
    let q = this.unit(a.to);
    const wasPawn = p.type === "p";
    if (wasPawn && !q && a.to === this.state.ep)
      q = this.unit(`${a.to[0]}${a.from[1]}` as Square);
    this.state.ep = null;
    if (q) {
      if (q.type === "k" && !this.has(q.owner, "democracy")) {
        const guard = this.guard(q.owner, q.square!);
        if (!guard) throw Error("Royal king is not capturable");
        this.kill(guard);
        this.kill(p);
        return;
      }
      if (q.type === "n" && this.has(q.owner, "sphinx") && a.quiz === false)
        return;
      if (!this.capture(q)) return;
      if (this.has(c, "olympics")) {
        p.glory++;
        if (p.glory === 3) {
          p.glory = 0;
          this.state.extraAction = p.id;
        }
      }
    }
    p.square = a.to;
    if (p.type === "k") {
      this.state.rights = this.state.rights.replace(
        c === "w" ? /[KQ]/g : /[kq]/g,
        "",
      );
      if (distance(a.from, a.to) === 2) {
        const rook = this.unit(
          `${a.to[0] === "g" ? "h" : "a"}${a.from[1]}` as Square,
        );
        if (rook)
          rook.square = `${a.to[0] === "g" ? "f" : "d"}${a.from[1]}` as Square;
      }
    }
    for (const [square, right] of Object.entries({
      a1: "Q",
      h1: "K",
      a8: "q",
      h8: "k",
    }))
      if (a.from === square || a.to === square)
        this.state.rights = this.state.rights.replace(right, "");
    if (wasPawn && distance(a.from, a.to) === 2)
      this.state.ep =
        `${a.from[0]}${(Number(a.from[1]) + Number(a.to[1])) / 2}` as Square;
    if (a.promotion) p.type = a.promotion as PieceSymbol;
    this.arrive(p);
    if (q) this.creditKill(p, q);
    if (this.state.extraAction && !p.square) this.state.extraAction = null;
  }
  private arrive(p: ExtraPiece) {
    const trap = this.state.zones.find(
      (z) => z.kind === "trap" && z.owner !== p.owner && z.center === p.square,
    );
    if (trap && !(p.type === "k" && !this.has(p.owner, "democracy"))) {
      this.kill(p);
      this.state.zones = this.state.zones.filter((z) => z !== trap);
    }
    this.state.zones = this.state.zones.filter(
      (z) =>
        !(z.kind === "flame" && z.owner !== p.owner && z.center === p.square),
    );
  }
  private executeSkill(a: AbilityAction) {
    const c = this.turn(),
      skill = a.skill!,
      p = this.unit(a.from),
      q = this.unit(a.to);
    if (this.loadouts[c].active === skill) this.state.activeUsed[c] = true;
    if (skill === "pilum" && q)
      applyEffect(this.state, q.id, "disarm", this.state.turns[q.owner] + 1);
    if (skill === "zeus" && q) {
      const visited = new Set<string>();
      let next: ExtraPiece | undefined = q;
      for (let i = 0; i < 4 && next; i++) {
        visited.add(next.id);
        const s: Square = next.square!;
        const blocked = this.immune(next);
        if (blocked) break;
        applyEffect(
          this.state,
          next.id,
          "shock",
          this.state.turns[next.owner] + 1,
        );
        next = this.units()
          .filter(
            (t) =>
              t.square && !visited.has(t.id) && distance(s, t.square) === 1,
          )
          .sort((a, b) => a.square!.localeCompare(b.square!))[0];
      }
    }
    if (skill === "poseidon") {
      const horizontal = a.direction! < 2;
      const delta = a.direction! % 2 === 0 ? 1 : -1;
      const targets = this.units()
        .filter(
          (t) =>
            t.owner !== c &&
            t.square &&
            (horizontal ? t.square[1] === a.to[1] : t.square[0] === a.to[0]),
        )
        .sort((p, q) => {
          const x = xy(p.square!),
            y = xy(q.square!);
          return delta * (horizontal ? y[0] - x[0] : y[1] - x[1]);
        });
      for (const t of targets) {
        if (this.immune(t)) continue;
        const [x, y] = xy(t.square!);
        const to = at(
          x + (horizontal ? delta : 0),
          y + (horizontal ? 0 : delta),
        );
        if (to && !this.unit(to) && !this.zoneBlocks(t, t.square!, to)) {
          t.square = to;
          if (t.type === "p" && ["1", "8"].includes(to[1])) t.type = "q";
          this.arrive(t);
        }
      }
    }
    if (skill === "hades") {
      this.state.activeUsed[c] = false;
      if (!sealGraves(this.state, c, a.id!.split(",")))
        throw Error("Invalid graves");
    }
    if (skill === "osiris") {
      const dead = this.state.pieces[a.id!];
      dead.square = a.to;
      dead.lives = 1;
      delete dead.judgment;
      delete dead.mummyAt;
      delete dead.mummyTurn;
      dead.effects = { stun: this.state.turns[c] };
      this.arrive(dead);
    }
    if (skill === "anubis" && a.id) {
      for (const id of a.id.split(",")) this.state.pieces[id].judgment = { caster: c, kills: 0 };
    }
    if (["set", "vesta", "alesia"].includes(skill) || (skill === "anubis" && this.replayingLegacyAnubis && !a.id)) {
      const kind =
        skill === "set"
          ? "desert"
          : skill === "anubis"
            ? "trap"
            : skill === "vesta"
              ? "flame"
              : "siege";
      const [x, y] = xy(a.to);
      const squares =
        kind === "trap"
          ? [a.to]
          : kind === "siege"
            ? [a.to, at(x + 1, y)!, at(x, y + 1)!, at(x + 1, y + 1)!]
            : [a.to, ...adjacentSquares(a.to)];
      this.state.zones.push({
        id: `${skill}-${c}`,
        kind,
        owner: c,
        center: a.to,
        squares,
        expiresAfter:
          kind === "trap"
            ? null
            : this.state.turns[c] + (kind === "flame" ? 2 : 1),
        protectedPieces: [],
      });
    }
    if (skill === "trojan" && p && q) {
      p.cargo.push(q.id);
      q.square = null;
    }
    if (skill === "deploy" && p) {
      const pawn = this.state.pieces[a.id!];
      p.cargo = p.cargo.filter((id) => id !== pawn.id);
      pawn.square = a.to;
      if (["1", "8"].includes(a.to[1])) pawn.type = "q";
      this.arrive(pawn);
    }
    if (skill === "minotaur" && p) {
      for (const t of this.units())
        if (t.square && t.id !== p.id && distance(t.square, p.square!) === 1)
          this.afflict(t, "stun", 3);
      p.cooldownUntil = this.state.turns[c] + 5 + this.cooldownPenalty(c);
    }
    if (skill === "cleopatra" && q) {
      q.charmed = { owner: q.owner, until: this.state.turns[q.owner] + 2 };
      q.owner = c;
    }
    if (skill === "ballista" && p && q) {
      p.cooldownUntil = this.state.turns[c] + 4 + this.cooldownPenalty(c);
      if (!(q.type === "n" && this.has(q.owner, "sphinx") && a.quiz === false))
        if (this.capture(q)) this.creditKill(p, q);
    }
    if (skill === "gladiator" && p && q) {
      p.duelUses = (p.duelUses ?? 0) + 1;
      this.state.duel = {
        attacker: p.id,
        defender: q.id,
        origin: { [p.id]: p.square!, [q.id]: q.square! },
        positions: { [p.id]: "b1", [q.id]: "c4" },
        actions: 0,
        initiator: c,
      };
      p.square = null;
      q.square = null;
    }
  }
  private executeDuel(a: AbilityAction) {
    const d = this.state.duel!;
    const id = [d.attacker, d.defender].find(
      (id) => this.state.pieces[id].owner === this.turn(),
    )!;
    const enemy = id === d.attacker ? d.defender : d.attacker;
    let loser: string | null = null;
    if (a.kind !== "pass") {
      if (a.to === d.positions[enemy]) loser = enemy;
      d.positions[id] = a.to;
    }
    d.actions++;
    if (!loser && d.actions === 4) {
      const edge = (id: string) => {
        const [x, y] = xy(d.positions[id]);
        return x === 0 || x === 3 || y === 0 || y === 3;
      };
      if (edge(d.attacker)) loser = d.attacker;
      else if (edge(d.defender)) loser = d.defender;
    }
    if (!loser && d.actions >= 6) loser = d.attacker;
    if (loser) {
      for (const pieceId of [d.attacker, d.defender]) {
        const p = this.state.pieces[pieceId];
        p.square = d.origin[pieceId];
        if (pieceId === loser) this.kill(p);
      }
      const winner = this.state.pieces[loser === d.attacker ? d.defender : d.attacker];
      this.creditKill(winner, this.state.pieces[loser]);
      this.state.turn = d.initiator;
      this.state.duel = null;
    } else this.state.turn = other(this.turn());
  }
  needsQuiz(from: Square, to: Square) {
    const p = this.unit(to);
    return (
      !!p &&
      p.owner !== this.turn() &&
      p.type === "n" &&
      this.has(p.owner, "sphinx") &&
      this.unit(from)?.owner === this.turn()
    );
  }
  squareNote(s: Square) {
    const p = this.unit(s);
    const notes: string[] = [];
    if (p) {
      if (p.judgment && !p.judgment.executedAt) notes.push(`심판 ${p.judgment.kills}/2`);
      if (p.lives > 1) notes.push("추가 목숨");
      if (p.glory) notes.push(`영광 ${p.glory}/3`);
      if (this.disabled(p)) notes.push("행동불가");
      if (effectActive(this.state, p, "disarm")) notes.push("무장해제");
      if (p.cargo.length) notes.push(`탑승 ${p.cargo.length}`);
      if (p.charmed) notes.push("매혹");
      if (p.cooldownUntil > this.state.turns[p.owner])
        notes.push(`재사용 ${p.cooldownUntil - this.state.turns[p.owner]}턴`);
    }
    for (const z of this.state.zones)
      if (z.squares.includes(s))
        notes.push(
          {
            desert: "사막",
            siege: "포위망",
            flame: "성화",
            trap: "함정",
            pyramid: "피라미드",
            road: "도로",
          }[z.kind],
        );
    for (const c of ["w", "b"] as Color[])
      if (this.onRoad(c, s)) notes.push("도로");
    return [...new Set(notes)].join(" · ");
  }
}
