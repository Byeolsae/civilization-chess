import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Color } from 'chess.js';
import { Crown, Handshake, X } from 'lucide-react';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizations, civilizationAppearance } from './civilizations';
import type { Players } from './game';
import palettes from '../scripts/piece-palettes.json';
import './victoryScene.css';

function Wing() {
  return <g className="victory-wing">
    <path d="M248 140C181 145 95 107 17 28C28 84 80 145 151 167C184 180 222 178 248 160Z" fill="currentColor" opacity=".25"/>
    {[0,1,2,3,4,5].map(i => <path key={i} d={`M${244-i*7} ${143+i*4} Q${108+i*12} ${120+i*9} ${22+i*16} ${35+i*22} Q${51+i*17} ${112+i*13} ${133+i*12} ${157+i*6} Q218 192 248 156Z`} fill="currentColor" fillOpacity={.9-i*.1} stroke="currentColor" strokeWidth="1"/>)}
    <path d="M242 149Q123 141 30 44" fill="none" stroke="#fff6dc" strokeOpacity=".7" strokeWidth="2"/>
  </g>;
}
export default function VictoryScene({ winner, players, detail, onNew }: {
  winner: Color | null; players: Players; detail: string; onNew: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [dismissed, setDismissed] = useState(false);
  const civilization = winner ? players[winner] : null;
  const name = civilization ? civilizations.find(c => c.id === civilization)!.name : '';
  const paletteMap: Record<string, Record<Color, { fill: string; accent?: string; ornament?: string }>> = palettes;
  const palette = civilization && winner ? paletteMap[civilizationAppearance[civilization]]?.[winner] : null;
  const accent = palette?.ornament ?? palette?.accent ?? '#e8ce91';
  useEffect(() => {
    const element = dialog.current;
    const previous = document.activeElement as HTMLElement | null;
    element?.showModal();
    return () => { element?.close(); previous?.focus(); };
  }, []);
  const close = () => { dialog.current?.close(); setDismissed(true); };
  if (dismissed) return null;
  return <dialog ref={dialog} className={`victory-scene ${winner ? '' : 'is-draw'}`} style={{ '--victory-accent': accent } as CSSProperties}
    aria-labelledby="victory-heading" aria-describedby="victory-detail" onCancel={event => { event.preventDefault(); close(); }}>
    <button className="victory-close" onClick={close} aria-label="승패 연출 닫고 보드 보기"><X size={24}/></button>
    <div className="victory-content">
      <div className="victory-crest" aria-hidden="true">
        <div className="victory-halo"/>
        {winner && <svg className="victory-wings" viewBox="0 0 600 260"><Wing/><g transform="translate(600 0) scale(-1 1)"><Wing/></g></svg>}
        <div className="victory-emblem">{civilization && winner && hasCivilizationIcon(civilization) ? <CivilizationIcon civilization={civilization} color={winner} size={120}/> : winner ? <Crown size={86}/> : <Handshake size={76}/>}</div>
        {winner && <div className="victory-particles">{Array.from({length:20},(_,i)=><i key={i} style={{ '--angle': `${i*18}deg`, '--delay': `${.3+(i%5)*.12}s`, '--distance': `${110+(i%4)*27}px` } as CSSProperties}/>)}</div>}
      </div>
      <div className="victory-copy"><span className="victory-kicker">{winner ? `${winner === 'w' ? '백' : '흑'} 진영 · VICTORY` : 'DRAW'}</span>
        <h2 id="victory-heading">{winner ? `${name} 승리` : '무승부'}</h2><p id="victory-detail">{detail}</p>
      </div>
      <div className="victory-actions"><button onClick={() => { close(); onNew(); }}>다시 대전</button><button onClick={close}>보드 보기</button></div>
    </div>
  </dialog>;
}
