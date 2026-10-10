import DuelArena from './DuelArena';
import { romanLaws } from './romanLaws';
import { SphinxRiddle } from './SphinxRiddle';
import { translateUi } from './i18n';
import { useEffect, useState } from "react";
import { AbilityGame, abilityNames, type AbilityAction } from "./AbilityGame";
import { skills } from "./draft";
import { type Players, colorNames, pieceNames } from "./game";
import "./abilities.css";
import Piece from './Piece';
export function AbilityPanel({
  game,
  players,
  enabled,
  onAction,
  onUndo,
  undoEnabled,
  undoLabel,
}: {
  game: AbilityGame;
  players: Players;
  enabled: boolean;
  onAction: (action: AbilityAction) => void;
  onUndo?: () => void;
  undoEnabled?: boolean;
  undoLabel?: string;
}) {
  const [category, setCategory] = useState("");
  const [choice, setChoice] = useState("");
  const actions = enabled
    ? game.actions().filter((a) => a.kind === "duel" || a.kind === "pass")
    : [];
  const groups = [...new Set(actions.map((a) => a.skill ?? a.kind))];
  const options = actions.filter((a) => (a.skill ?? a.kind) === category);
  const selection = options.find((a) => JSON.stringify(a) === choice);
  const c = game.turn(),
    duel = game.state.duel;
  const actionLabel = (a: AbilityAction) => {
    if (a.direction !== undefined)
      return `${a.direction < 2 ? a.to[1] + "행" : a.to[0] + "열"} · ${["오른쪽", "왼쪽", "위", "아래"][a.direction]}`;
    const carried = a.id
      ?.split(",")
      .map((id) => {
        const p = game.state.pieces[id];
        return p
          ? `${colorNames[p.owner]} ${pieceNames[p.type]} (${id.slice(2)} 출신)`
          : "";
      })
      .join(", ");
    const target = game.unit(a.to);
    return `${game.loadouts[c].active === a.skill ? "" : a.from + " → "}${a.to}${target ? " · " + colorNames[target.owner] + " " + pieceNames[target.type] : ""}${carried ? " · " + carried : ""}`;
  };
  const clock = (n: number) =>
    `${Math.floor(Math.ceil(n / 1000) / 60)}:${String(Math.ceil(n / 1000) % 60).padStart(2, "0")}`;
  if(duel)return <DuelArena game={game} players={players} enabled={enabled} onAction={onAction} onUndo={onUndo} undoEnabled={undoEnabled} undoLabel={undoLabel}/>;
  return (
    <section className="ability-panel" aria-label={translateUi("문명 능력")}>
      <h3>
        {translateUi(duel ? "콜로세움 결투" : "문명 능력")} <small>{translateUi("실험 규칙 v1")}</small>
      </h3>
      {translateUi(game.state.clocks && (
        <div className="ability-clocks">{translateUi("백")}{translateUi(clock(game.state.clocks.w))}{translateUi(" · 흑 ")}{translateUi(clock(game.state.clocks.b))}
        </div>
      ))}
      <p>
        {translateUi(colorNames[c])} ·{translateUi(" ")}
        {translateUi(game.state.extraAction
          ? "올림픽: 방금 포획한 기물로 추가 행동"
          : game.loadouts[c].active === "pending"
              ? "등록된 액티브 없음"
              : game.state.activeUsed[c]
                ? "일회용 액티브 사용 완료"
                : "액티브 1회 남음")}
      </p>
      {translateUi(!duel && <p>{translateUi("기물을 클릭하면 보드 아래에서 스킬과 사용 조건을 확인할 수 있습니다.")}</p>)}
      {translateUi(!!groups.length && <><label>{translateUi("능력 / 특수 행동")}<select
          aria-label={translateUi("능력 선택")}
          disabled={!enabled || !groups.length}
          value={groups.includes(category) ? category : ""}
          onChange={(e) => {
            setCategory(e.target.value);
            setChoice("");
          }}
        >
          <option value="">
            {translateUi(enabled ? "사용할 능력 선택" : "상대 행동 중")}
          </option>
          {translateUi(groups.map((id) => (
            <option value={id} key={id}>
              {translateUi(abilityNames[id] ?? (id === "duel" ? "결투 이동" : "대기"))}
            </option>
          )))}
        </select>
      </label>
      {translateUi(!!options.length && (
        <label>{translateUi("대상")}<select
            aria-label={translateUi("능력 대상")}
            value={selection ? choice : ""}
            onChange={(e) => setChoice(e.target.value)}
          >
            <option value="">{translateUi("대상을 선택하세요")}</option>
            {translateUi(options.map((a) => (
              <option key={JSON.stringify(a)} value={JSON.stringify(a)}>
                {translateUi(actionLabel(a))}
              </option>
            )))}
          </select>
        </label>
      ))}
      <button
        disabled={!enabled || !selection}
        onClick={() => {
          if (selection) {
            onAction(selection);
            setChoice("");
          }
        }}
      >{translateUi("선택한 행동 실행")}</button></>)}
      <details>
        <summary>{translateUi("선택한 능력과 규칙")}</summary>
        <p>{translateUi("능력도 한 행동을 사용합니다. 지속시간·재장전은 각 플레이어의 턴 기준입니다. 올림픽 추가 행동은 턴 수를 늘리지 않습니다.")}</p>
        {translateUi((["w", "b"] as const).map((color) => (
          <div key={color}>
            <strong>{translateUi(colorNames[color])}</strong>
            {game.state.laws?.[color] && <p>{translateUi('선택한 법')}: {translateUi(romanLaws.find(law=>law.id===game.state.laws?.[color])?.name ?? '')}</p>}
            {translateUi(Object.entries(game.loadouts[color]).map(([cat, id]) => {
              const skill = skills[players[color]][
                cat as "passive" | "active" | "piece"
              ].find((s) => s.id === id);
              return (
                skill && (
                  <p key={id}>
                    <b>{translateUi(skill.name)}</b> — {translateUi(skill.description)} {translateUi(skill.detail)}
                  </p>
                )
              );
            }))}
          </div>
        )))}
        <p>{translateUi("민주주의는 킹을 잡혀도 계속하며, 수송 중인 폰은 생존으로 셉니다. 승격한 폰은 폰 수에 포함하지 않습니다. 능력 대전은 반복·50수·기물 부족 자동 무승부를 사용하지 않습니다. AI는 능력의 합법성과 기물·상태 가치를 평가하는 실험 버전입니다.")}</p>
      </details>
    </section>
  );
}
export function SphinxChallenge({
  onResolve,
}: {
  onResolve: (correct: boolean) => void;
}) {
  const [problem] = useState(() => ({
    a: 2 + Math.floor(Math.random() * 8),
    b: 2 + Math.floor(Math.random() * 8),
    end: Date.now() + 5000,
  }));
  const [answer, setAnswer] = useState(""),
    [left, setLeft] = useState(5);
  useEffect(() => {
    const id = setInterval(() => {
      const remaining = problem.end - Date.now();
      setLeft(Math.max(0, Math.ceil(remaining / 1000)));
      if (remaining <= 0) onResolve(false);
    }, 100);
    return () => clearInterval(id);
  }, [problem, onResolve]);
  return (
    <div className="quiz-overlay">
      <section role="dialog" aria-modal="true" aria-label={translateUi("스핑크스의 수수께끼")}>
        <SphinxRiddle seconds={left}/>
        <p className="sphinx-question">{problem.a} × {problem.b} = ?</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onResolve(
              Date.now() <= problem.end &&
                Number(answer) === problem.a * problem.b,
            );
          }}
        >
          <input
            autoFocus
            type="number"
            aria-label={translateUi("수수께끼 정답")}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
          <button type="submit">{translateUi("정답 제출")}</button>
        </form>
        <p>{translateUi("오답·시간 초과는 공격이 무효화되고 차례가 끝납니다. AI는 계산 문제에 정답을 냅니다.")}</p>
      </section>
    </div>
  );
}
