import { translateUi } from './i18n';
import { useEffect, useId, useRef, useState, type CSSProperties } from 'react';
import type { Color } from 'chess.js';
import { Crown, Handshake, X } from 'lucide-react';
import CivilizationIcon, { hasCivilizationIcon } from './CivilizationIcon';
import { civilizations, civilizationAppearance } from './civilizations';
import type { Players } from './game';
import palettes from '../scripts/piece-palettes.json';
import './victoryScene.css';

function Wing({ metal }: { metal: string }) {
  const tips = [[12,10],[14,45],[23,80],[40,113],[62,144],[89,170],[121,190],[155,201]];
  return <g className="victory-wing">
    {translateUi(tips.map(([x,y],i) => {
      const rootX = 248-i*2, rootY = 115+i*6;
      return <g key={i} className="victory-feather" style={{ '--feather-delay': `${.16+i*.055}s` } as CSSProperties}>
        <path d={`M${rootX} ${rootY} C${rootX-58} ${rootY-35} ${x+45} ${y+36} ${x} ${y} Q${x+7} ${y+39} ${x+38} ${y+55} Q${rootX-39} ${rootY+34} ${rootX} ${rootY+11}Z`} fill={`url(#${metal})`} stroke="#231d2e" strokeWidth="2"/>
        <path d={`M${rootX-6} ${rootY+5} Q${x+69} ${y+63} ${x+10} ${y+13}`} fill="none" stroke="#fff4d5" strokeOpacity=".66" strokeWidth="1.6"/>
      </g>;
    }))}
    <path d="M254 114Q222 85 185 87L201 115 175 118 208 142 189 147Q217 175 254 165Z" fill={`url(#${metal})`} stroke="#fff0c3" strokeOpacity=".65" strokeWidth="1.5"/>
  </g>;
}
export default function VictoryScene({ winner, players, detail, onNew }: {
  winner: Color | null; players: Players; detail: string; onNew: () => void;
}) {
  const metal = useId();
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
    <button className="victory-close" onClick={close} aria-label={translateUi("승패 연출 닫고 보드 보기")}><X size={24}/></button>
    <div className="victory-content">
      <div className="victory-crest" aria-hidden="true">
        <div className="victory-halo"/>{translateUi(winner && <><div className="victory-burst"/><div className="victory-shock-ring"/></>)}
        {translateUi(winner && <svg className="victory-wings" viewBox="0 0 600 260"><defs><linearGradient id={metal} x1="0" y1="0" x2=".3" y2="1"><stop stopColor="#fff6da"/><stop offset=".28" stopColor="currentColor"/><stop offset=".52" stopColor="#fff0c4"/><stop offset=".67" stopColor="currentColor"/><stop offset="1" stopColor="#504052"/></linearGradient></defs><Wing metal={metal}/><g transform="translate(600 0) scale(-1 1)"><Wing metal={metal}/></g></svg>)}
        <div className="victory-emblem">{translateUi(civilization && winner && hasCivilizationIcon(civilization) ? <CivilizationIcon civilization={civilization} color={winner} size={120}/> : winner ? <Crown size={86}/> : <Handshake size={76}/>)}</div>
        {translateUi(winner && <div className="victory-particles">{translateUi(Array.from({length:20},(_,i)=><i key={i} style={{ '--angle': `${i*18}deg`, '--delay': `${.3+(i%5)*.12}s`, '--distance': `${110+(i%4)*27}px` } as CSSProperties}/>))}</div>)}
      </div>
      <div className="victory-copy"><span className="victory-kicker">{translateUi(winner ? `${winner === 'w' ? '백' : '흑'} 진영 · VICTORY` : 'DRAW')}</span>
        <h2 id="victory-heading">{translateUi(winner ? `${name} 승리` : '무승부')}</h2><p id="victory-detail">{translateUi(detail)}</p>
      </div>
      <div className="victory-actions"><button onClick={() => { close(); onNew(); }}>{translateUi("다시 대전")}</button><button onClick={close}>{translateUi("보드 보기")}</button></div>
    </div>
  </dialog>;
}
