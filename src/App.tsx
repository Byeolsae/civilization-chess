import { useOnlineRoom } from './useOnlineRoom';
import { OnlineLobby, OnlineBanner, OnlineQuiz } from './OnlineLobby';
import { completeDraft } from './draft';
import { desertTerrainMask } from './desertTerrain';
import { useEffect, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { ArrowRight, ArrowLeftRight, ChevronRight, Crown, Flag, RotateCcw, ScrollText, Shield, Swords, X } from 'lucide-react';
import { civilizations, colorNames, decodeMatch, encodeMatch, gameStatus, legalMoves, opposite, pieceNames, playMove, STORAGE_KEY, type Civilization, type Players, type Promotion } from './game';

import Draft, { LoadoutList } from './DraftScreen';
import { DRAFT_KEY, restoreDraft, type Loadouts } from './draft';
import MatchSetup from './MatchSetup';
import { defaultSettings, localSettings, isMatchSettings, SETUP_KEY, difficultyNames, type MatchSettings } from './matchSettings';
import { canUndoTurn, undoTurn } from './aiMatch';
import { useAiTurn } from './useAiTurn';
import { useMoveAnimation } from './useMoveAnimation';
import MatchAtmosphere from './MatchAtmosphere';
import { opponentCivilization } from './civilizationMedia';
import { AbilityGame, type AbilityAction } from './AbilityGame';
import { AbilityPanel, SphinxChallenge } from './AbilityPanel';
import { useActiveTargeting } from './useActiveTargeting';
import { ActiveButton, ActiveGuide } from './ActiveToolbar';
import { PieceSkillGuide } from './PieceSkillGuide';
import { pieceSkillInfo } from './pieceSkills';
import SkillEffects from './SkillEffects';
import { PieceStatusEffects, Sandstorm } from './StatusEffects';
import { squareAtPoint } from './boardPointer';
import Piece from './Piece';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';

type DragSession = { pointerId: number; from: Square; type: PieceSymbol; color: Color; startX: number; startY: number; size: number; active: boolean; targets: Square[] };
type DragVisual = { from: Square; type: PieceSymbol; color: Color; x: number; y: number; size: number; over: Square | null };

const getCivilization = (id: Civilization) => civilizations.find(c => c.id === id)!;

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="modal" onCancel={onClose} aria-labelledby="modal-title">
    <div className="modal-heading"><h2 id="modal-title">{title}</h2><button className="icon-button" onClick={onClose} aria-label="닫기"><X size={20} /></button></div>
    {children}
  </dialog>;
}

export default function App() {
  const online = useOnlineRoom();
  const [onlineRequested] = useState(() => !!online.session || new URL(location.href).searchParams.has('room'));
  const onlineApplied = useRef('');
  const [restored] = useState(() => { try { return onlineRequested ? null : decodeMatch(localStorage.getItem(STORAGE_KEY)); } catch { return null; } });
  const [preparation] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETUP_KEY) ?? 'null');
      if (isMatchSettings(saved)) return saved;
      if (restoreDraft(localStorage.getItem(DRAFT_KEY)).length) return localSettings;
    } catch { /* A fresh setup works without storage. */ }
    return null;
  });
  const [settings, setSettings] = useState<MatchSettings>(onlineRequested ? {...defaultSettings,mode:'online',humanColor:online.session?.color??'w'} : restored?.settings ?? preparation ?? defaultSettings);
  const [setupReady, setSetupReady] = useState(onlineRequested || !!restored || !!preparation);
  const [game, setGame] = useState(() => restored?.game ?? new Chess());
  const [players, setPlayers] = useState<Players>(() => restored?.players ?? { w: 'greece', b: 'egypt' });
  const [loadouts, setLoadouts] = useState<Loadouts | null>(restored?.loadouts ?? null);
  const [started, setStarted] = useState(!!restored);
  const [resigned, setResigned] = useState<Color | null>(restored?.resigned ?? null);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [pieceMode, setPieceMode] = useState('');
  const [pieceCargo, setPieceCargo] = useState('');
  const [flipped, setFlipped] = useState(onlineRequested ? online.session?.color === 'b' : restored?.settings.mode === 'ai' ? restored.settings.humanColor === 'b' : restored?.game.turn() === 'b');
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [quiz, setQuiz] = useState<AbilityAction | null>(null);
  const [, refreshClock] = useState(0);
  const [confirm, setConfirm] = useState<'new' | 'resign' | null>(null);
  const [storageError, setStorageError] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const skipAnimationFen = useRef<string | null>(null);
  useMoveAnimation(boardRef, game, flipped, skipAnimationFen);
  const dragRef = useRef<DragSession | null>(null);
  const suppressClick = useRef(false);
  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null);
  const placementOwner = game instanceof AbilityGame ? game.placementOwner() : undefined;
  const [placementSquare, setPlacementSquare] = useState<Square | null>(null);
  const [placementAxis, setPlacementAxis] = useState<'row' | 'column'>('row');
  const placementHuman = !!placementOwner && (settings.mode === 'local' || placementOwner === settings.humanColor) && (settings.mode !== 'online' || (online.connected && !online.busy));
  const placementArea = game instanceof AbilityGame && placementOwner && placementSquare ? game.placementSquares(placementOwner, {square:placementSquare,axis:placementAxis}) : [];
  useEffect(() => { setPlacementSquare(null); setPlacementAxis('row'); }, [game, placementOwner]);
  useEffect(() => {
    if (!(game instanceof AbilityGame) || !placementOwner || settings.mode !== 'ai' || placementOwner === settings.humanColor) return;
    const timer = setTimeout(() => {
      game.placePassive(placementOwner, {square:placementOwner === 'w' ? 'd2' : game.loadouts.b.passive === 'roads' ? 'd6' : 'd7',axis:'row'});
      setRevision(value => value + 1);
    }, 650);
    return () => clearTimeout(timer);
  }, [game, placementOwner, settings.mode, settings.humanColor]);
  useEffect(() => {
    if (!online.session) return;
    setSettings({...defaultSettings,mode:'online',humanColor:online.session.color});
    setSetupReady(true);setFlipped(online.session.color === 'b');
  }, [online.session]);
  useEffect(() => {
    const room=online.room;if (!online.session || !room) return;
    const key=room.id+':'+room.revision;
    if (room.variant && onlineApplied.current !== key) {
      const complete=completeDraft(room.picks);if(!complete)return;
      if(game instanceof AbilityGame && started && JSON.stringify(game.loadouts)===JSON.stringify(room.variant.loadouts)) game.acceptOnlineSave(room.variant);
      else setGame(AbilityGame.restoreSave(room.variant));
      setPlayers(complete.players);setLoadouts(complete.loadouts);setStarted(true);setResigned(room.resigned);
      setSelected(null);setPromotion(null);setRevision(value=>value+1);onlineApplied.current=key;
    } else if (room.variant?.clocks && game instanceof AbilityGame) {
      game.state.clocks={...room.variant.clocks};
      game.state.timedOut=room.variant.clocks.w===0?'w':room.variant.clocks.b===0?'b':null;
    }
  }, [online.room,online.session]);
  const status = gameStatus(game, resigned);
  const aiTurn = !placementOwner && started && settings.mode === 'ai' && game.turn() !== settings.humanColor && !status.over;
  const humanTurn = !placementOwner && started && !status.over && !aiTurn && !quiz && (settings.mode !== 'online' || (!!online.room && online.connected && !online.busy && game.turn() === settings.humanColor && !online.room.quiz));
  const resigningColor = settings.mode !== 'local' ? settings.humanColor : game.turn();
  const ai = useAiTurn(game, revision, aiTurn && !confirm, settings.difficulty, setRevision);
  const modeLabel = settings.mode === 'online' ? '온라인 PvP' : settings.mode === 'ai' ? `AI 대전 · ${difficultyNames[settings.difficulty]}` : '로컬 2인 대전';
  const activeOwner = settings.mode !== 'local' ? settings.humanColor : game.turn();
  const activeTarget = useActiveTargeting(game, humanTurn && !confirm && !promotion && !(game instanceof AbilityGame && game.state.duel), revision, flipped, activeOwner, performAbility);
  const pieceInfo = game instanceof AbilityGame && selected ? pieceSkillInfo(game, selected) : null;
  const pieceActions = humanTurn && !confirm && !promotion && !activeTarget.armed ? pieceInfo?.actions ?? [] : [];
  const pieceTargets = new Set(pieceActions.filter(a => !pieceMode || (a.skill === pieceMode && (pieceMode !== 'deploy' || a.id === pieceCargo))).map(a => a.to));
  const pieceArea = pieceMode === 'minotaur' ? pieceInfo?.area ?? [] : [];
  const moves = selected && humanTurn && !activeTarget.armed && !pieceMode ? legalMoves(game, selected) : [];
  useEffect(() => { setPieceMode(''); setPieceCargo(''); }, [selected, revision, game, flipped, humanTurn, confirm, promotion, activeTarget.armed]);
  useEffect(() => {
    const cancel = (e: KeyboardEvent) => { if (e.key === 'Escape') { setPieceMode(''); setPieceCargo(''); } };
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, []);
  const history = game.history({ verbose: true });
  const lastMove = history.at(-1);
  const turn = game.turn();
  const autoFlipPrevious = useRef({ game, count: history.length });
  useEffect(() => {
    const previous = autoFlipPrevious.current;
    autoFlipPrevious.current = { game, count: history.length };
    if (!started || settings.mode !== 'local' || status.over) return;
    // Finish the move/skill effect before handing the board to the next player.
    const newAction = previous.game === game && history.length > previous.count;
    const delay = newAction ? lastMove?.flags.includes('s') ? 1300 : 360 : 0;
    const timer = setTimeout(() => {
      dragRef.current = null; setDragVisual(null); setSelected(null);
      setFlipped((placementOwner ?? turn) === 'b');
    }, delay);
    return () => clearTimeout(timer);
  }, [game, turn, started, settings.mode, status.over, placementOwner]);
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = (flipped ? 'hgfedcba' : 'abcdefgh').split('');
  const topColor: Color = flipped ? 'w' : 'b';
  const bottomColor = opposite(topColor);

  useEffect(() => {
    if (placementOwner || !started || status.over || !(game instanceof AbilityGame) || !game.state.clocks) return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now(); const ended = game.tick(now - last); last = now;
      refreshClock(value => value + 1);
      if (ended) { ai.cancel(); setQuiz(null); setRevision(value => value + 1); }
      try { if (settings.mode !== 'online') localStorage.setItem(STORAGE_KEY, encodeMatch(game, players, resigned, loadouts, settings)); } catch { /* Main save reports errors. */ }
    }, 250);
    return () => clearInterval(timer);
  }, [game, started, status.over, players, resigned, loadouts, settings, placementOwner]);

  function performAbility(action: AbilityAction) {
    if (settings.mode === 'online') { if (humanTurn && !confirm) {void online.send({kind:'action',action});setSelected(null);} return; }
    if (!(game instanceof AbilityGame) || status.over || aiTurn || confirm) return;
    if (action.quiz === undefined && action.skill === 'ballista' && game.needsQuiz(action.from, action.to)) { setQuiz(action); return; }
    try { game.perform(action); setSelected(null); setPromotion(null); setQuiz(null); setRevision(value => value + 1); }
    catch { setQuiz(null); }
  }

  useEffect(() => {
    try {
      if (settings.mode === 'online') return;
      if (started) localStorage.setItem(STORAGE_KEY, encodeMatch(game, players, resigned, loadouts, settings));
      else localStorage.removeItem(STORAGE_KEY);
      setStorageError(false);
    } catch { setStorageError(true); }
  }, [game, players, resigned, revision, started, loadouts, settings]);

  useEffect(() => { historyRef.current?.scrollTo({ top: historyRef.current.scrollHeight, behavior: 'smooth' }); }, [revision]);

  useEffect(() => {
    function cancel() {
      if (dragRef.current?.active) suppressClick.current = true;
      dragRef.current = null;
      setDragVisual(null);
    }
    function keydown(event: KeyboardEvent) { if (event.key === 'Escape') cancel(); }
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', keydown);
    return () => { window.removeEventListener('blur', cancel); window.removeEventListener('keydown', keydown); };
  }, []);

  function commit(from: Square, to: Square, choice?: Promotion) {
    if (!humanTurn) return;
    if (settings.mode === 'online' && game instanceof AbilityGame) {
      const action=game.actions().find(a=>a.kind==='move'&&a.from===from&&a.to===to&&(!choice||a.promotion===choice));
      if(action)void online.send({kind:'action',action});setSelected(null);setPromotion(null);return;
    }
    if (game instanceof AbilityGame && game.needsQuiz(from, to)) {
      setQuiz({ kind: 'move', from, to, ...(choice ? { promotion: choice } : {}) }); return;
    }
    if (playMove(game, from, to, choice)) {
      setSelected(null);
      setPromotion(null);
      setRevision(value => value + 1);
    }
  }

  function requestMove(from: Square, to: Square) {
    if (!humanTurn || promotion || confirm) return false;
    const options = legalMoves(game, from).filter(move => move.to === to);
    if (!options.length) return false;
    if (options.some(move => move.promotion)) setPromotion({ from, to });
    else commit(from, to);
    return true;
  }

  function selectSquare(square: Square) {
    if (placementOwner) { if (placementHuman && !confirm) setPlacementSquare(square); return; }
    if (!humanTurn || promotion || confirm) return;
    if (activeTarget.armed) { activeTarget.select(square); return; }
    if (pieceMode) {
      const action = pieceActions.find(a => a.skill === pieceMode && a.to === square && (pieceMode !== 'deploy' || a.id === pieceCargo));
      if (action) { setPieceMode(''); setPieceCargo(''); performAbility(action); }
      return;
    }
    if (selected === square) { setSelected(null); return; }
    if (selected && requestMove(selected, square)) return;
    const piece = game.get(square);
    setSelected(piece?.color === game.turn() ? square : null);
  }

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>, from: Square) {
    if (activeTarget.armed) { suppressClick.current = true; activeTarget.down(event, from); return; }
    if (pieceMode) { suppressClick.current = false; return; }
    if (!event.isPrimary || dragRef.current) return;
    suppressClick.current = false;
    if (event.button !== 0 || !humanTurn || promotion || confirm) return;
    const piece = game.get(from);
    if (!piece || piece.color !== game.turn()) return;
    dragRef.current = { pointerId: event.pointerId, from, type: piece.type, color: piece.color, startX: event.clientX, startY: event.clientY, size: event.currentTarget.getBoundingClientRect().width, active: false, targets: legalMoves(game, from).map(move => move.to) };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    if (activeTarget.armed) { activeTarget.move(event); return; }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (!drag.active && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    event.preventDefault();
    if (!drag.active) { drag.active = true; setSelected(drag.from); }
    const bounds = boardRef.current?.getBoundingClientRect();
    const target = bounds ? squareAtPoint(event.clientX, event.clientY, bounds, flipped) : null;
    setDragVisual({ from: drag.from, type: drag.type, color: drag.color, size: drag.size, x: event.clientX, y: event.clientY, over: target && drag.targets.includes(target) ? target : null });
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) {
    if (activeTarget.armed) { activeTarget.up(event, cancelled); return; }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    setDragVisual(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!drag.active) return; // A tap still follows the existing click-to-move path.
    suppressClick.current = true;
    const bounds = boardRef.current?.getBoundingClientRect();
    const target = !cancelled && bounds ? squareAtPoint(event.clientX, event.clientY, bounds, flipped) : null;
    if (target && target !== drag.from) {
      const before = game.fen();
      requestMove(drag.from, target);
      // A dragged piece is already at its destination; don't replay its travel.
      if (game.fen() !== before) skipAnimationFen.current = game.fen();
    }
  }

  function reset() {
    if (online.session) online.leave(); onlineApplied.current='';
    ai.cancel(); setSetupReady(false); setFlipped(false); dragRef.current = null; setDragVisual(null);
    setGame(new Chess()); setStarted(false); setResigned(null); setSelected(null);
    setPromotion(null); setQuiz(null); setConfirm(null); setRevision(0); setLoadouts(null);
    try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(SETUP_KEY); } catch { /* Draft handles save failures. */ }
  }

  function undo() {
    if (settings.mode === 'online') return;
    ai.cancel(); dragRef.current = null; setDragVisual(null);
    if (resigned) setResigned(null);
    else undoTurn(game, settings);
    setSelected(null); setPromotion(null); setQuiz(null); setRevision(value => value + 1);
  }

  function confirmPlacement() {
    if (!(game instanceof AbilityGame) || !placementOwner || !placementSquare) return;
    const placement={square:placementSquare,axis:placementAxis};
    if(settings.mode==='online')void online.send({kind:'place',placement});
    else {game.placePassive(placementOwner,placement);setRevision(value=>value+1);}
  }
  async function leaveOnline() {
    if (online.connected && online.room?.variant && !online.room.resigned && !status.over) {if(!await online.send({kind:'resign'}))return;}
    reset();
  }
  function playerBar(color: Color) {
    const civ = getCivilization(players[color]);
    const captured = game instanceof AbilityGame ? game.graves(opposite(color)).map(piece => piece.type) : history.filter(move => move.color === color && move.captured).map(move => move.captured!);
    return <div className={`player-bar ${started && !status.over && (placementOwner ?? game.turn()) === color ? 'current-player' : ''}`}>
      {hasCivilizationIcon(players[color]) && <div className={`player-avatar ${color}`}><CivilizationIcon civilization={players[color]} color={color} size={36} /></div>}
      <div className="player-identity"><strong>{civ.name}{settings.mode !== 'local' && <small className="opponent-label">{color === settings.humanColor ? '나' : settings.mode === 'online' ? '상대' : 'AI'}</small>}<span className={`color-chip ${color}`}>{colorNames[color]}</span></strong><span>{placementOwner ? placementOwner === color ? '시작 지형 배치 중' : '상대 배치를 기다리는 중' : started ? (game.turn() === color && !status.over ? (settings.mode === 'online' && color !== settings.humanColor ? '상대의 차례' : settings.mode === 'ai' && color !== settings.humanColor ? ai.error ? 'AI 계산 중단' : 'AI가 생각하는 중…' : '당신의 차례') : status.over ? '대전 종료' : '상대의 수를 기다리는 중') : '문명 선택 중'}</span></div>
      <div className="captured" aria-label={`${colorNames[color]}이 잡은 기물: ${captured.map(p => pieceNames[p]).join(', ') || '없음'}`}>
        {captured.map((type, index) => <Piece key={index} type={type} color={opposite(color)} civilization={players[opposite(color)]} revived={game instanceof AbilityGame ? game.graves(opposite(color))[index]?.revived : undefined} lives={game instanceof AbilityGame ? game.graves(opposite(color))[index]?.lives : undefined} skill={game instanceof AbilityGame ? game.loadouts[opposite(color)].piece : undefined} small />)}
      </div>
      {started && (placementOwner ?? game.turn()) === color && !status.over && <span className="turn-tag">{placementOwner ? '배치' : '차례'}</span>}
    </div>;
  }

  return <div className="app-shell">
    <header className="site-header">
      <a href="/" className="brand" aria-label="문명체스 홈"><span className="brand-icon"><Crown size={25} /></span><span>문명체스<small>CIVILIZATION CHESS</small></span></a>
      <div className="header-right"><span className="mode-label"><Swords size={15} /> {setupReady || started ? modeLabel : '대전 준비'}</span><span className="version">ALPHA 0.3</span></div>
    </header>

    <main>
      {settings.mode === 'online' && online.session && <OnlineBanner online={online} onLeave={()=>void leaveOnline()}/>}
      {!started ? !setupReady ? <MatchSetup initial={settings} onContinue={next => {
        try {
          if (JSON.stringify(next) !== JSON.stringify(settings)) localStorage.removeItem(DRAFT_KEY);
          localStorage.setItem(SETUP_KEY, JSON.stringify(next));
        } catch { setStorageError(true); }
        setSettings(next); setSetupReady(true);
      }} /> : settings.mode === 'online' ? !online.session ? <OnlineLobby online={online} onBack={()=>setSetupReady(false)}/> : !online.room?.joined ? <section className="online-lobby"><h1>친구의 입장을 기다리고 있어요</h1><p>위의 초대 링크나 방 코드를 공유하세요.</p></section> : <Draft settings={settings} network={{picks:online.room.picks,color:online.session.color,busy:online.busy,connected:online.connected,onPick:choice=>online.send({kind:'pick',choice})}} onSettings={()=>void leaveOnline()} onStart={()=>{}}/> : <Draft settings={settings} onSettings={() => setSetupReady(false)} onStart={(nextPlayers, nextLoadouts) => { setPlayers(nextPlayers); setLoadouts(nextLoadouts); setGame(Object.values(nextLoadouts).some(l => Object.values(l).some(id => id !== 'pending')) ? new AbilityGame(nextLoadouts).beginPlacement() : new Chess()); setFlipped(settings.mode === 'ai' && settings.humanColor === 'b'); setStarted(true); }} /> : <>
      <div className="page-heading"><div><div className="eyebrow">THE FIRST AGE</div><h1>한 수로 시작하는 문명</h1></div><span className="rules-badge"><Shield size={15} /> {game instanceof AbilityGame ? '문명 능력 대전' : '기본 체스'}</span></div>
      {placementOwner && game instanceof AbilityGame && <section className="placement-guide" aria-label="시작 지형 배치">
        <div><strong>{colorNames[placementOwner]} · {game.loadouts[placementOwner].passive === 'pyramid' ? '피라미드 배치' : '로마길 배치'}</strong><p>{!placementHuman ? settings.mode === 'online' ? '상대 배치 또는 서버 응답을 기다리고 있어요.' : 'AI가 시작 지형을 배치하고 있어요.' : game.loadouts[placementOwner].passive === 'pyramid' ? '중심 칸을 누르세요. 주변 8칸까지 보호합니다. 기물이 있는 칸도 선택할 수 있어요.' : '방향을 고르고 보드에서 인접한 두 줄을 선택하세요.'}</p></div>
        {placementHuman && <><div className="placement-controls">{game.loadouts[placementOwner].passive === 'roads' && <>{(['row','column'] as const).map(axis => <button key={axis} aria-pressed={placementAxis === axis} onClick={() => setPlacementAxis(axis)}>{axis === 'row' ? '가로 2행' : '세로 2열'}</button>)}</>}<button className="primary-button" disabled={!placementSquare} onClick={confirmPlacement}>배치 확정</button></div><small>모든 배치가 끝나면 백부터 시작합니다.</small></>}
      </section>}
      <div className="game-layout">
        <section className="board-section" aria-label="체스 대전">
          {playerBar(topColor)}
          <div className={game instanceof AbilityGame ? 'board-with-active' : ''}>
          {game instanceof AbilityGame && <ActiveButton game={game} target={activeTarget} owner={activeOwner} onToggle={() => { setSelected(null); activeTarget.toggle(); }} />}
          <div className={`board-frame ${!started ? 'awaiting-start' : ''}`}>
            <div className={`board ${dragVisual ? 'is-dragging' : ''} ${activeTarget.armed || pieceMode ? 'is-targeting' : ''}`} ref={boardRef} role="group" aria-label="체스판. 클릭 또는 드래그로 이동. 방향키로 칸 이동, Enter로 선택">
              {ranks.flatMap((rank, row) => files.map((file, column) => {
                const square = `${file}${rank}` as Square;
                const piece = game.get(square);
                const possible = moves.some(move => move.to === square); const abilityNote = game instanceof AbilityGame ? game.squareNote(square) : ''; const viewer = settings.mode !== 'local' ? settings.humanColor : game.turn(); const fogged = game instanceof AbilityGame && game.state.stormUntil[viewer] > 0 && game.state.stormUntil[viewer] >= game.state.turns[viewer] && (viewer === 'w' ? rank >= 5 : rank <= 4);
                const markerNote = abilityNote.split(' · ').filter(note => !note.startsWith('영광 ') && !['행동불가', '무장해제', '매혹', '추가 목숨', '사막'].includes(note)).join(' · ');
                const desertMask = game instanceof AbilityGame ? desertTerrainMask(square, game.state.zones.filter(zone => zone.kind === 'desert').flatMap(zone => zone.squares), flipped) : undefined;
                const checked = piece?.type === 'k' && piece.color === game.turn() && game.isCheck();
                return <button key={square} type="button" data-square={square}
                  className={`square ${placementArea.includes(square) ? 'placement-preview' : ''} ${activeTarget.valid.has(square) ? 'active-target' : ''} ${activeTarget.area.includes(square) ? 'active-area' : ''} ${(file.charCodeAt(0) - 97 + rank) % 2 === 1 ? 'dark' : 'light'} ${selected === square ? 'selected' : ''} ${lastMove?.from === square || lastMove?.to === square ? 'last-move' : ''} ${checked ? 'in-check' : ''} ${piece?.color === game.turn() && humanTurn ? 'can-drag' : ''} ${dragVisual?.from === square ? 'drag-origin' : ''} ${dragVisual?.over === square ? 'drop-target' : ''}`}
                  title={abilityNote || undefined} aria-label={`${square}${fogged ? ' 시야 제한' : piece ? ` ${colorNames[piece.color]} ${pieceNames[piece.type]}` : ' 빈 칸'}${possible ? ' 이동 가능' : ''}${checked ? ' 체크' : ''}`}
                  aria-pressed={selected === square} disabled={placementOwner ? !placementHuman : !humanTurn || (game instanceof AbilityGame && !!game.state.duel)}
                  onPointerDown={event => beginDrag(event, square)}
                  onPointerEnter={() => activeTarget.hover(square)}
                  onPointerLeave={() => activeTarget.hover(null)}
                  onPointerMove={moveDrag}
                  onPointerUp={event => endDrag(event)}
                  onPointerCancel={event => endDrag(event, true)}
                  onLostPointerCapture={event => endDrag(event, true)}
                  onClick={event => {
                    if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
                    selectSquare(square);
                  }}
                  onKeyDown={event => {
                    if (event.key === 'Escape') { setSelected(null); return; }
                    const offsets: Record<string, number> = { ArrowUp: -8, ArrowDown: 8, ArrowLeft: -1, ArrowRight: 1 };
                    if (!(event.key in offsets)) return;
                    event.preventDefault();
                    if ((event.key === 'ArrowLeft' && column === 0) || (event.key === 'ArrowRight' && column === 7)) return;
                    const next = row * 8 + column + offsets[event.key];
                    if (next >= 0 && next < 64) boardRef.current?.querySelectorAll('button')[next]?.focus();
                  }}>
                  {game instanceof AbilityGame && game.state.zones.some(z => z.kind === 'road' && z.squares.includes(square)) && <span className="passive-road" aria-hidden="true"/>}
                  {game instanceof AbilityGame && game.state.zones.some(z => z.kind === 'pyramid' && z.center === square) && <span className="passive-pyramid" aria-hidden="true">△</span>}
                  {desertMask && <span className="desert-terrain" style={{ backgroundPosition: `${column / 7 * 100}% ${row / 7 * 100}%`, maskImage: desertMask, WebkitMaskImage: desertMask }} aria-hidden="true" />}
                  {(pieceTargets.has(square) || pieceArea.includes(square)) && <span className={`piece-target-mark ${pieceMode ? 'armed' : ''} ${pieceArea.includes(square) ? 'area' : ''}`} aria-label={pieceMode ? '스킬 적용 대상' : '스킬 가능 대상'} />}
                  {activeTarget.area.includes(square) && <span className="target-mark" />}{column === 0 && <span className="rank-label">{rank}</span>}
                  {row === 7 && <span className="file-label">{file}</span>}
                  {!fogged && piece && <Piece key={`${square}-${piece.type}-${piece.color}`} type={piece.type} color={piece.color} civilization={players[piece.color]} revived={game instanceof AbilityGame ? game.unit(square)?.revived : undefined} lives={game instanceof AbilityGame ? game.unit(square)?.lives : undefined} skill={game instanceof AbilityGame ? game.loadouts[piece.color].piece : undefined} />}
                  {!fogged && game instanceof AbilityGame && <PieceStatusEffects game={game} square={square} />}{markerNote && !fogged && <span className="ability-marker">{markerNote}</span>}{possible && <span className={piece ? 'capture-ring' : 'move-dot'} />}
                </button>;
              }))}
              {game instanceof AbilityGame && <Sandstorm game={game} viewer={settings.mode !== 'local' ? settings.humanColor : game.turn()} flipped={flipped} />}
              <SkillEffects game={game} flipped={flipped} />
            </div>
          </div>
          </div>
          {game instanceof AbilityGame && <ActiveGuide game={game} target={activeTarget} players={players} />}
          {game instanceof AbilityGame && selected && !activeTarget.armed && <PieceSkillGuide game={game} square={selected} players={players} mode={pieceMode} cargo={pieceCargo} enabled={humanTurn && !confirm && !promotion && !game.state.duel} onMode={mode => { setPieceMode(mode); setPieceCargo(mode === 'deploy' ? pieceInfo?.cargo[0] ?? '' : ''); }} onCargo={setPieceCargo} />}
          {playerBar(bottomColor)}
          <div className="board-toolbar"><span>{started ? game instanceof AbilityGame ? `백 ${game.state.turns.w}턴 · 흑 ${game.state.turns.b}턴 · ${history.length}행동` : `${Math.floor(history.length / 2) + 1} 라운드 · ${history.length}수 진행` : '백이 먼저 시작합니다'}</span><div>
            <button onClick={undo} disabled={settings.mode === 'online' || !started || (!canUndoTurn(game, settings) && !resigned)}><RotateCcw size={16} /> {settings.mode === 'ai' ? '내 차례로 무르기' : '한 수 무르기'}</button>
            <button onClick={() => setFlipped(value => !value)}><ArrowLeftRight size={16} /> 보드 뒤집기</button>
          </div></div>
        </section>

        <aside className="side-panel">
          <>
            <section className={`status-panel ${status.kind}`} aria-live="polite"><div className="panel-kicker">{placementOwner ? 'PLACEMENT' : status.over ? 'GAME OVER' : aiTurn ? 'AI TURN' : 'YOUR MOVE'}</div><div className="status-title">{status.over ? <Crown size={25} /> : <span className={`side-dot large ${game.turn()}`} />}<h2>{placementOwner ? `${colorNames[placementOwner]} 지형 배치` : aiTurn ? ai.error ? 'AI 계산 중단' : 'AI가 생각하는 중…' : status.title}</h2></div><p>{placementOwner ? '보드에서 위치를 선택하고 배치를 확정하세요.' : aiTurn ? ai.error ?? `${difficultyNames[settings.difficulty]} AI가 다음 수를 고르고 있어요.` : status.detail}</p>{aiTurn && ai.error && <button className="secondary-button" onClick={ai.retry}>AI 다시 시도</button>}{status.over && <button className="primary-button" onClick={() => setConfirm('new')}>새로운 대전 <ArrowRight size={17} /></button>}</section>
            <section className="history-panel"><div className="section-title"><h3><ScrollText size={18} /> 대전 기록</h3><span>{history.length}수</span></div><div className="history-labels"><span>#</span><span>백</span><span>흑</span></div>
              <div className="history-list" ref={historyRef} aria-label="기보">
                {!history.length ? <div className="history-empty"><Swords size={29} strokeWidth={1.2} /><p>첫 수를 기다리고 있어요</p><span>{placementOwner ? '먼저 시작 지형을 배치하세요.' : aiTurn ? 'AI의 첫 수를 기다리고 있어요.' : '체스판에서 내 기물을 선택하세요.'}</span></div> : game instanceof AbilityGame ? history.map((move, index) => <div className="history-row" key={index}><span>{index + 1}.</span>{(['w','b'] as const).map(color => <span key={color} className={move === lastMove && move.color === color ? 'latest-san' : ''}>{move.color === color ? <b>{move.san}</b> : '—'}</span>)}</div>) : Array.from({ length: Math.ceil(history.length / 2) }, (_, index) => <div className="history-row" key={index}><span>{index + 1}.</span>{[history[index * 2], history[index * 2 + 1]].map((move, side) => <span key={side} className={move && move === lastMove ? 'latest-san' : ''}>{move ? <><Piece type={move.piece} color={move.color} civilization={players[move.color]} small /><b>{move.san}</b></> : '—'}</span>)}</div>)}
              </div>
            </section>
            <div className="match-actions"><button onClick={() => setConfirm('new')}><RotateCcw size={16} /> 새 대전</button><button onClick={() => setConfirm('resign')} disabled={status.over}><Flag size={16} /> 기권</button></div>
            {game instanceof AbilityGame && <AbilityPanel game={game} players={players} enabled={humanTurn && !confirm} onAction={performAbility} />}<MatchAtmosphere civilization={opponentCivilization(players, settings, game.turn())} />
            <details className="match-loadouts"><summary>선택한 스킬 보기</summary><LoadoutList players={players} loadouts={loadouts} /><p>{game instanceof AbilityGame ? '능력 적용 중 · 12표법 준비 중' : '기본 체스 · 기존 저장 대전'}</p></details>
            <div className="match-civilizations"><span>{getCivilization(players.w).name}</span><span>VS</span><span>{getCivilization(players.b).name}</span><small>{game instanceof AbilityGame ? '문명 능력 적용 · 실험 규칙 v1' : '기본 체스'}</small></div>
          </>
          <details className="rules-details"><summary>플레이 안내 <ChevronRight size={16} /></summary><div><p>기물을 클릭한 뒤 목적지를 누르거나, 마우스·터치로 기물을 끌어서 놓으세요. 둘 수 없는 칸이나 보드 밖에 놓으면 원래 자리로 돌아옵니다. Esc로 드래그를 취소할 수 있습니다.</p><p>캐슬링, 앙파상, 폰 승격을 지원합니다. 체크 상태에서는 킹을 보호해야 하며 체크메이트로 승패가 결정됩니다.</p><p>{game instanceof AbilityGame ? '능력 대전은 특수 행동까지 포함해 합법적 행동이 없을 때 스테일메이트를 판정합니다. 반복·50수·기물 부족 자동 무승부는 사용하지 않습니다.' : '스테일메이트, 기물 부족, 3회 동형 반복, 50수 규칙은 자동 무승부입니다.'}</p><p>{settings.mode === 'online' ? '온라인 방은 서버에 저장되며 같은 탭에서 새로고침하면 복원됩니다. 온라인 대전에서는 무르기를 지원하지 않습니다.' : '대전은 이 브라우저에 자동 저장됩니다.'} {settings.mode === 'online' ? '' : settings.mode === 'ai' ? '무르기를 누르면 AI의 응수와 내 수를 되돌려 내 이전 차례로 돌아갑니다.' : '한 수 무르기는 두 플레이어가 합의하고 사용하세요.'}</p></div></details>
          {storageError && <p role="alert" className="storage-warning">자동 저장을 사용할 수 없습니다. 새로고침하면 대전이 사라질 수 있습니다.</p>}
        </aside>
      </div>
      </>}
      <footer><span>문명체스</span><span>같은 체스판, 서로 다른 문명의 시작.</span><span>{(settings.mode === 'online' ? 'ONLINE PVP' : settings.mode === 'ai' ? 'VS AI' : 'LOCAL PLAY') + (game instanceof AbilityGame && game.state.clocks ? ' · TIMED' : ' · NO TIMER')}</span></footer>
    </main>
    {dragVisual && <div className="drag-layer" aria-hidden="true"><div className="drag-piece" style={{ left: dragVisual.x, top: dragVisual.y, width: dragVisual.size, height: dragVisual.size }}><Piece type={dragVisual.type} color={dragVisual.color} civilization={players[dragVisual.color]} revived={game instanceof AbilityGame ? game.unit(dragVisual.from)?.revived : undefined} lives={game instanceof AbilityGame ? game.unit(dragVisual.from)?.lives : undefined} skill={game instanceof AbilityGame ? game.loadouts[dragVisual.color].piece : undefined} /></div></div>}
    {settings.mode === 'online' && <OnlineQuiz online={online}/>}
    {quiz && <SphinxChallenge onResolve={correct => performAbility({ ...quiz, quiz: correct })} />}{promotion && !quiz && <Modal title="폰을 승격하세요" onClose={() => setPromotion(null)}><p className="muted">마지막 줄에 도착했습니다. 새로운 기물을 선택하세요.</p><div className="promotion-options">{(['q', 'r', 'b', 'n'] as Promotion[]).map(type => <button key={type} onClick={() => commit(promotion.from, promotion.to, type)}><Piece type={type} color={game.turn()} civilization={players[game.turn()]} skill={game instanceof AbilityGame ? game.loadouts[game.turn()].piece : undefined} /><span>{pieceNames[type]}</span></button>)}</div></Modal>}
    {confirm && <Modal title={confirm === 'new' ? '새로운 대전을 시작할까요?' : `${colorNames[resigningColor]}이 기권할까요?`} onClose={() => setConfirm(null)}><p className="muted">{confirm === 'new' ? '현재 기록을 지우고 대전 설정 화면으로 돌아갑니다.' : `${colorNames[opposite(resigningColor)]}의 승리로 대전이 종료됩니다.`}</p><div className="modal-actions"><button className="secondary-button" onClick={() => setConfirm(null)}>계속 두기</button><button className="primary-button" onClick={() => { if (confirm === 'new') { if(settings.mode==='online')void leaveOnline();else reset(); } else if(settings.mode==='online'){void online.send({kind:'resign'});setConfirm(null);} else { ai.cancel(); setResigned(resigningColor); setSelected(null); setConfirm(null); } }}>{confirm === 'new' ? '대전 다시 설정' : '기권하기'}</button></div></Modal>}
  </div>;
}
