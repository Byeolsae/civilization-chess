import { AbilityGame, type AbilityAction } from "./AbilityGame";
import type { Difficulty } from "./matchSettings";
import type { Color } from "chess.js";
const value = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 2000 };
export function score(game: AbilityGame, color: Color) {
  const winner = game.winner();
  if (winner) return winner === color ? 100000 : -100000;
  if (game.isCheckmate()) return game.turn() === color ? -100000 : 100000;
  let total = 0;
  for (const p of game.units())
    if (p.square || game.units().some((n) => n.cargo.includes(p.id))) {
      const sign = p.owner === color ? 1 : -1;
      const center = p.square
        ? 7 -
          Math.abs(p.square.charCodeAt(0) - 97 - 3.5) -
          Math.abs(Number(p.square[1]) - 1 - 3.5)
        : 0;
      total +=
        sign *
        (value[p.type] +
          (p.lives - 1) * 70 +
          p.glory * 35 -
          (p.judgment && !p.judgment.executedAt ? value[p.type] * (.12 + p.judgment.kills * .22) : 0) -
          Object.keys(p.effects).length * 25 +
          center * (p.type === "n" ? 10 : 3));
    }
  if (game.checked(color)) total -= 130;
  if (game.checked(color === "w" ? "b" : "w")) total += 130;
  return total;
}
export function chooseAbilityAction(
  game: AbilityGame,
  difficulty: Difficulty,
): AbilityAction | null {
  const actions = game.actions();
  if (!actions.length) return null;
  const c = game.turn(),
    deadline =
      performance.now() + { easy: 250, normal: 900, hard: 2000 }[difficulty];
  // Prioritize captures and tactical abilities before considering large area-target sets.
  actions.sort((a, b) => priority(b) - priority(a));
  function priority(a: AbilityAction) {
    const p = game.unit(a.to);
    return (
      (p && p.owner !== game.turn() ? value[p.type] : 0) +
      (a.kind === "move" ? 10 : 0) +
      (a.skill === "ballista" ? 200 : 0) +
      (a.skill === "osiris" ? 500 : 0) +
      (a.skill === "anubis" ? (a.id?.split(",").reduce((sum, id) => sum + value[game.state.pieces[id].type] * .25, 0) ?? 0) : 0)
    );
  }
  let best = actions[0],
    bestScore = -Infinity;
  for (const action of actions) {
    if (performance.now() > deadline) break;
    game.perform(action);
    let result: number;
    try {
      result =
        score(game, c) + (difficulty === "easy" ? Math.random() * 100 : 0);
      if (
        difficulty !== "easy" &&
        game.turn() !== c &&
        Math.abs(result) < 90000 &&
        performance.now() < deadline
      ) {
        const replies = game
          .actions()
          .sort((a, b) => priority(b) - priority(a))
          .slice(0, difficulty === "hard" ? 12 : 5);
        for (const reply of replies) {
          if (performance.now() > deadline) break;
          game.perform(reply);
          try {
            result = Math.min(result, score(game, c));
          } finally {
            game.undo();
          }
        }
      }
    } finally {
      game.undo();
    }
    if (result > bestScore) {
      bestScore = result;
      best = action;
    }
  }
  return best;
}
