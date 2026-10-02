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
  const [restored] = useState(() => { try { return decodeMatch(localStorage.getItem(STORAGE_KEY)); } catch { return null; } });
  const [preparation] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(SETUP_KEY) ?? 'null');
      if (isMatchSettings(saved)) return saved;
      if (restoreDraft(localStorage.getItem(DRAFT_KEY)).length) return localSettings;
    } catch { /* A fresh setup works without storage. */ }
    return null;
  });
  const [settings, setSettings] = useState<MatchSettings>(restored?.settings ?? preparation ?? defaultSettings);
  const [setupReady, setSetupReady] = useState(!!restored || !!preparation);
  const [game, setGame] = useState(() => restored?.game ?? new Chess());
  const [players, setPlayers] = useState<Players>(() => restored?.players ?? { w: 'greece', b: 'egypt' });
  const [loadouts, setLoadouts] = useState<Loadouts | null>(restored?.loadouts ?? null);
  const [started, setStarted] = useState(!!restored);
  const [resigned, setResigned] = useState<Color | null>(restored?.resigned ?? null);
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Square | null>(null);
  const [flipped, setFlipped] = useState(restored?.settings.mode === 'ai' && restored.settings.humanColor === 'b');
  const [promotion, setPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [confirm, setConfirm] = useState<'new' | 'resign' | null>(null);
  const [storageError, setStorageError] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const skipAnimationFen = useRef<string | null>(null);
  useMoveAnimation(boardRef, game, flipped, skipAnimationFen);
  const dragRef = useRef<DragSession | null>(null);
  const suppressClick = useRef(false);
  const [dragVisual, setDragVisual] = useState<DragVisual | null>(null);
  const status = gameStatus(game, resigned);
  const aiTurn = started && settings.mode === 'ai' && game.turn() !== settings.humanColor && !status.over;
  const humanTurn = started && !status.over && !aiTurn;
  const resigningColor = settings.mode === 'ai' ? settings.humanColor : game.turn();
  const ai = useAiTurn(game, revision, aiTurn && !confirm, settings.difficulty, setRevision);
  const modeLabel = settings.mode === 'ai' ? `AI 대전 · ${difficultyNames[settings.difficulty]}` : '로컬 2인 대전';
  const moves = selected && humanTurn ? legalMoves(game, selected) : [];
  const history = game.history({ verbose: true });
  const lastMove = history.at(-1);
  const ranks = flipped ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];
  const files = (flipped ? 'hgfedcba' : 'abcdefgh').split('');
  const topColor: Color = flipped ? 'w' : 'b';
  const bottomColor = opposite(topColor);

  useEffect(() => {
    try {
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
    if (!humanTurn || promotion || confirm) return;
    if (selected === square) { setSelected(null); return; }
    if (selected && requestMove(selected, square)) return;
    const piece = game.get(square);
    setSelected(piece?.color === game.turn() ? square : null);
  }

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>, from: Square) {
    if (!event.isPrimary || dragRef.current) return;
    suppressClick.current = false;
    if (event.button !== 0 || !humanTurn || promotion || confirm) return;
    const piece = game.get(from);
    if (!piece || piece.color !== game.turn()) return;
    dragRef.current = { pointerId: event.pointerId, from, type: piece.type, color: piece.color, startX: event.clientX, startY: event.clientY, size: event.currentTarget.getBoundingClientRect().width, active: false, targets: legalMoves(game, from).map(move => move.to) };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveDrag(event: ReactPointerEvent<HTMLButtonElement>) {
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
    ai.cancel(); setSetupReady(false); setFlipped(false); dragRef.current = null; setDragVisual(null);
    setGame(new Chess()); setStarted(false); setResigned(null); setSelected(null);
    setPromotion(null); setConfirm(null); setRevision(0); setLoadouts(null);
    try { localStorage.removeItem(DRAFT_KEY); localStorage.removeItem(SETUP_KEY); } catch { /* Draft handles save failures. */ }
  }

  function undo() {
    ai.cancel(); dragRef.current = null; setDragVisual(null);
    if (resigned) setResigned(null);
    else undoTurn(game, settings);
    setSelected(null); setPromotion(null); setRevision(value => value + 1);
  }

  function playerBar(color: Color) {
    const civ = getCivilization(players[color]);
    const captured = history.filter(move => move.color === color && move.captured).map(move => move.captured!);
    return <div className={`player-bar ${started && !status.over && game.turn() === color ? 'current-player' : ''}`}>
      {hasCivilizationIcon(players[color]) && <div className={`player-avatar ${color}`}><CivilizationIcon civilization={players[color]} color={color} size={36} /></div>}
      <div className="player-identity"><strong>{civ.name}{settings.mode === 'ai' && <small className="opponent-label">{color === settings.humanColor ? '나' : 'AI'}</small>}<span className={`color-chip ${color}`}>{colorNames[color]}</span></strong><span>{started ? (game.turn() === color && !status.over ? (settings.mode === 'ai' && color !== settings.humanColor ? ai.error ? 'AI 계산 중단' : 'AI가 생각하는 중…' : '당신의 차례') : status.over ? '대전 종료' : '상대의 수를 기다리는 중') : '문명 선택 중'}</span></div>
      <div className="captured" aria-label={`${colorNames[color]}이 잡은 기물: ${captured.map(p => pieceNames[p]).join(', ') || '없음'}`}>
        {captured.map((type, index) => <Piece key={index} type={type} color={opposite(color)} civilization={players[opposite(color)]} small />)}
      </div>
      {started && game.turn() === color && !status.over && <span className="turn-tag">차례</span>}
    </div>;
  }

  return <div className="app-shell">
    <header className="site-header">
      <a href="/" className="brand" aria-label="문명체스 홈"><span className="brand-icon"><Crown size={25} /></span><span>문명체스<small>CIVILIZATION CHESS</small></span></a>
      <div className="header-right"><span className="mode-label"><Swords size={15} /> {setupReady || started ? modeLabel : '대전 준비'}</span><span className="version">ALPHA 0.3</span></div>
    </header>

    <main>
      {!started ? !setupReady ? <MatchSetup initial={settings} onContinue={next => {
        try {
          if (JSON.stringify(next) !== JSON.stringify(settings)) localStorage.removeItem(DRAFT_KEY);
          localStorage.setItem(SETUP_KEY, JSON.stringify(next));
        } catch { setStorageError(true); }
        setSettings(next); setSetupReady(true);
      }} /> : <Draft settings={settings} onSettings={() => setSetupReady(false)} onStart={(nextPlayers, nextLoadouts) => { setPlayers(nextPlayers); setLoadouts(nextLoadouts); setFlipped(settings.mode === 'ai' && settings.humanColor === 'b'); setStarted(true); }} /> : <>
      <div className="page-heading"><div><div className="eyebrow">THE FIRST AGE</div><h1>한 수로 시작하는 문명</h1></div><span className="rules-badge"><Shield size={15} /> 기본 체스</span></div>
      <div className="game-layout">
        <section className="board-section" aria-label="체스 대전">
          {playerBar(topColor)}
          <div className={`board-frame ${!started ? 'awaiting-start' : ''}`}>
            <div className={`board ${dragVisual ? 'is-dragging' : ''}`} ref={boardRef} role="group" aria-label="체스판. 클릭 또는 드래그로 이동. 방향키로 칸 이동, Enter로 선택">
              {ranks.flatMap((rank, row) => files.map((file, column) => {
                const square = `${file}${rank}` as Square;
                const piece = game.get(square);
                const possible = moves.some(move => move.to === square);
                const checked = piece?.type === 'k' && piece.color === game.turn() && game.isCheck();
                return <button key={square} type="button" data-square={square}
                  className={`square ${(file.charCodeAt(0) - 97 + rank) % 2 === 1 ? 'dark' : 'light'} ${selected === square ? 'selected' : ''} ${lastMove?.from === square || lastMove?.to === square ? 'last-move' : ''} ${checked ? 'in-check' : ''} ${piece?.color === game.turn() && humanTurn ? 'can-drag' : ''} ${dragVisual?.from === square ? 'drag-origin' : ''} ${dragVisual?.over === square ? 'drop-target' : ''}`}
                  aria-label={`${square}${piece ? ` ${colorNames[piece.color]} ${pieceNames[piece.type]}` : ' 빈 칸'}${possible ? ' 이동 가능' : ''}${checked ? ' 체크' : ''}`}
                  aria-pressed={selected === square} disabled={!humanTurn}
                  onPointerDown={event => beginDrag(event, square)}
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
                  {column === 0 && <span className="rank-label">{rank}</span>}
                  {row === 7 && <span className="file-label">{file}</span>}
                  {piece && <Piece key={`${square}-${piece.type}-${piece.color}`} type={piece.type} color={piece.color} civilization={players[piece.color]} />}
                  {possible && <span className={piece ? 'capture-ring' : 'move-dot'} />}
                </button>;
              }))}
            </div>
          </div>
          {playerBar(bottomColor)}
          <div className="board-toolbar"><span>{started ? `${Math.floor(history.length / 2) + 1} 라운드 · ${history.length}수 진행` : '백이 먼저 시작합니다'}</span><div>
            <button onClick={undo} disabled={!started || (!canUndoTurn(game, settings) && !resigned)}><RotateCcw size={16} /> {settings.mode === 'ai' ? '내 차례로 무르기' : '한 수 무르기'}</button>
            <button onClick={() => setFlipped(value => !value)}><ArrowLeftRight size={16} /> 보드 뒤집기</button>
          </div></div>
        </section>

        <aside className="side-panel">
          <>
            <section className={`status-panel ${status.kind}`} aria-live="polite"><div className="panel-kicker">{status.over ? 'GAME OVER' : aiTurn ? 'AI TURN' : 'YOUR MOVE'}</div><div className="status-title">{status.over ? <Crown size={25} /> : <span className={`side-dot large ${game.turn()}`} />}<h2>{aiTurn ? ai.error ? 'AI 계산 중단' : 'AI가 생각하는 중…' : status.title}</h2></div><p>{aiTurn ? ai.error ?? `${difficultyNames[settings.difficulty]} AI가 다음 수를 고르고 있어요.` : status.detail}</p>{aiTurn && ai.error && <button className="secondary-button" onClick={ai.retry}>AI 다시 시도</button>}{status.over && <button className="primary-button" onClick={() => setConfirm('new')}>새로운 대전 <ArrowRight size={17} /></button>}</section>
            <section className="history-panel"><div className="section-title"><h3><ScrollText size={18} /> 대전 기록</h3><span>{history.length}수</span></div><div className="history-labels"><span>#</span><span>백</span><span>흑</span></div>
              <div className="history-list" ref={historyRef} aria-label="기보">
                {!history.length ? <div className="history-empty"><Swords size={29} strokeWidth={1.2} /><p>첫 수를 기다리고 있어요</p><span>{aiTurn ? 'AI의 첫 수를 기다리고 있어요.' : '체스판에서 내 기물을 선택하세요.'}</span></div> : Array.from({ length: Math.ceil(history.length / 2) }, (_, index) => <div className="history-row" key={index}><span>{index + 1}.</span>{[history[index * 2], history[index * 2 + 1]].map((move, side) => <span key={side} className={move && move === lastMove ? 'latest-san' : ''}>{move ? <><Piece type={move.piece} color={move.color} civilization={players[move.color]} small /><b>{move.san}</b></> : '—'}</span>)}</div>)}
              </div>
            </section>
            <div className="match-actions"><button onClick={() => setConfirm('new')}><RotateCcw size={16} /> 새 대전</button><button onClick={() => setConfirm('resign')} disabled={status.over}><Flag size={16} /> 기권</button></div>
            <details className="match-loadouts"><summary>선택한 스킬 보기</summary><LoadoutList players={players} loadouts={loadouts} /><p>선택 저장됨 · 현재 스킬 효과 미적용</p></details>
            <div className="match-civilizations"><span>{getCivilization(players.w).name}</span><span>VS</span><span>{getCivilization(players.b).name}</span><small>문명 능력 미적용 · 기본 체스</small></div>
          </>
          <details className="rules-details"><summary>플레이 안내 <ChevronRight size={16} /></summary><div><p>기물을 클릭한 뒤 목적지를 누르거나, 마우스·터치로 기물을 끌어서 놓으세요. 둘 수 없는 칸이나 보드 밖에 놓으면 원래 자리로 돌아옵니다. Esc로 드래그를 취소할 수 있습니다.</p><p>캐슬링, 앙파상, 폰 승격을 지원합니다. 체크 상태에서는 킹을 보호해야 하며 체크메이트로 승패가 결정됩니다.</p><p>스테일메이트와 기물 부족은 무승부입니다. 이 버전은 3회 동형 반복과 50수 규칙도 별도 청구 없이 자동 무승부로 처리합니다.</p><p>대전은 이 브라우저에 자동 저장됩니다. {settings.mode === 'ai' ? '무르기를 누르면 AI의 응수와 내 수를 되돌려 내 이전 차례로 돌아갑니다.' : '한 수 무르기는 두 플레이어가 합의하고 사용하세요.'}</p></div></details>
          {storageError && <p role="alert" className="storage-warning">자동 저장을 사용할 수 없습니다. 새로고침하면 대전이 사라질 수 있습니다.</p>}
        </aside>
      </div>
      </>}
      <footer><span>문명체스</span><span>같은 체스판, 서로 다른 문명의 시작.</span><span>{settings.mode === 'ai' ? 'VS AI · NO TIMER' : 'LOCAL PLAY · NO TIMER'}</span></footer>
    </main>
    {dragVisual && <div className="drag-layer" aria-hidden="true"><div className="drag-piece" style={{ left: dragVisual.x, top: dragVisual.y, width: dragVisual.size, height: dragVisual.size }}><Piece type={dragVisual.type} color={dragVisual.color} civilization={players[dragVisual.color]} /></div></div>}
    {promotion && <Modal title="폰을 승격하세요" onClose={() => setPromotion(null)}><p className="muted">마지막 줄에 도착했습니다. 새로운 기물을 선택하세요.</p><div className="promotion-options">{(['q', 'r', 'b', 'n'] as Promotion[]).map(type => <button key={type} onClick={() => commit(promotion.from, promotion.to, type)}><Piece type={type} color={game.turn()} civilization={players[game.turn()]} /><span>{pieceNames[type]}</span></button>)}</div></Modal>}
    {confirm && <Modal title={confirm === 'new' ? '새로운 대전을 시작할까요?' : `${colorNames[resigningColor]}이 기권할까요?`} onClose={() => setConfirm(null)}><p className="muted">{confirm === 'new' ? '현재 기록을 지우고 대전 설정 화면으로 돌아갑니다.' : `${colorNames[opposite(resigningColor)]}의 승리로 대전이 종료됩니다.`}</p><div className="modal-actions"><button className="secondary-button" onClick={() => setConfirm(null)}>계속 두기</button><button className="primary-button" onClick={() => { if (confirm === 'new') reset(); else { ai.cancel(); setResigned(resigningColor); setSelected(null); setConfirm(null); } }}>{confirm === 'new' ? '대전 다시 설정' : '기권하기'}</button></div></Modal>}
  </div>;
}
