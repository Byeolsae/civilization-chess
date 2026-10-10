import type { Color, PieceSymbol, Square } from "chess.js";

// Ability state is independent of chess.js history. Every action snapshots both.
export type EffectKind = "stun" | "shock" | "disarm";
export type AbilityPiece = {
  id: string;
  owner: Color;
  type: PieceSymbol;
  square: Square | null;
  lives: number;
  glory: number;
  revived: boolean;
  sealed: boolean;
  cargo: string[];
  effects: Partial<Record<EffectKind, number>>;
  cooldownUntil: number;
  question?: { owner: Color; until: number };
  judgment?: { caster: Color; kills: number; executedAt?: Square };
};
export type AbilityZone = {
  id: string;
  kind: "desert" | "siege" | "flame" | "trap" | "pyramid" | "road";
  owner: Color;
  squares: Square[];
  center: Square;
  expiresAfter: number | null;
  protectedPieces: string[];
};
export type AbilityState = {
  version: 1;
  turns: Record<Color, number>;
  activeUsed: Record<Color, boolean>;
  pieces: Record<string, AbilityPiece>;
  zones: AbilityZone[];
  extraAction: string | null;
};

export function createAbilityState(
  board: ({ square: Square; type: PieceSymbol; color: Color } | null)[][],
): AbilityState {
  const pieces: Record<string, AbilityPiece> = {};
  for (const row of board)
    for (const piece of row)
      if (piece) {
        const id = `${piece.color}-${piece.square}`;
        pieces[id] = {
          id,
          owner: piece.color,
          type: piece.type,
          square: piece.square,
          lives: 1,
          glory: 0,
          revived: false,
          sealed: false,
          cargo: [],
          effects: {},
          cooldownUntil: 0,
        };
      }
  return {
    version: 1,
    turns: { w: 1, b: 0 },
    activeUsed: { w: false, b: false },
    pieces,
    zones: [],
    extraAction: null,
  };
}

export function cloneAbilityState(state: AbilityState): AbilityState {
  return structuredClone(state);
}

export function adjacentSquares(square: Square, diagonals = true): Square[] {
  const x = square.charCodeAt(0) - 97,
    y = Number(square[1]) - 1;
  const result: Square[] = [];
  for (let dx = -1; dx <= 1; dx++)
    for (let dy = -1; dy <= 1; dy++) {
      if ((!dx && !dy) || (!diagonals && dx && dy)) continue;
      if (x + dx >= 0 && x + dx < 8 && y + dy >= 0 && y + dy < 8)
        result.push(
          `${String.fromCharCode(97 + x + dx)}${y + dy + 1}` as Square,
        );
    }
  return result;
}

export function effectActive(
  state: AbilityState,
  piece: AbilityPiece,
  effect: EffectKind,
) {
  const expiry = piece.effects[effect];
  return expiry !== undefined && state.turns[piece.owner] <= expiry;
}

// Expiry is measured in affected player's turns, never render ticks or AI actions.
export function applyEffect(
  state: AbilityState,
  id: string,
  effect: EffectKind,
  throughTurn: number,
) {
  const piece = state.pieces[id];
  if (!piece?.square) return false;
  const protection = state.zones.find(
    (zone) =>
      zone.owner === piece.owner &&
      zone.squares.includes(piece.square!) &&
      (zone.kind === "pyramid" ||
        (zone.kind === "flame" && !zone.protectedPieces.includes(id))) &&
      effect !== "disarm",
  );
  if (protection) {
    if (protection.kind === "flame") protection.protectedPieces.push(id);
    return false;
  }
  piece.effects[effect] = Math.max(piece.effects[effect] ?? 0, throughTurn);
  return true;
}

export function advanceAbilityTurn(state: AbilityState, color: Color) {
  state.turns[color]++;
  for (const piece of Object.values(state.pieces))
    if (piece.owner === color) {
      for (const kind of Object.keys(piece.effects) as EffectKind[]) {
        if (piece.effects[kind]! < state.turns[color])
          delete piece.effects[kind];
      }
    }
  state.zones = state.zones.filter(
    (zone) =>
      zone.expiresAfter === null ||
      state.turns[zone.owner] <= zone.expiresAfter,
  );
}

export function sealGraves(state: AbilityState, caster: Color, ids: string[]) {
  if (state.activeUsed[caster] || ids.length !== 3 || new Set(ids).size !== 3)
    return false;
  const cargo = new Set(
    Object.values(state.pieces).flatMap((piece) => piece.cargo),
  );
  if (
    ids.some(
      (id) =>
        !state.pieces[id] ||
        state.pieces[id].owner === caster ||
        state.pieces[id].square !== null ||
        cargo.has(id) ||
        state.pieces[id].sealed,
    )
  )
    return false;
  for (const id of ids) state.pieces[id].sealed = true;
  state.activeUsed[caster] = true;
  return true;
}
