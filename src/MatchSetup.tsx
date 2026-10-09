import { translateUi } from './i18n';
import { useState } from 'react';
import { ArrowRight, Bot, Users, Shield } from 'lucide-react';
import { difficultyNames, type MatchSettings, type Difficulty } from './matchSettings';

export default function MatchSetup({ initial, onContinue }: { initial: MatchSettings; onContinue: (settings: MatchSettings) => void }) {
  const [settings, setSettings] = useState(initial);
  return <section className="match-setup" aria-label={translateUi("대전 설정")}>
    <div className="setup-intro"><span className="eyebrow">CHOOSE YOUR OPPONENT</span><h1>{translateUi("누구와 겨룰까요?")}</h1><p>{translateUi("상대를 정하고, 당신의 문명을 선택하세요.")}</p></div>
    <div className="setup-modes" role="group" aria-label={translateUi("대전 방식")}>
      <button aria-pressed={settings.mode === 'ai'} onClick={() => setSettings({ ...settings, mode: 'ai' })}><Bot size={34} /><strong>{translateUi("AI 대전")}</strong><span>{translateUi("혼자서, 나만의 속도로")}</span></button>
      <button aria-pressed={settings.mode === 'local'} onClick={() => setSettings({ ...settings, mode: 'local' })}><Users size={34} /><strong>{translateUi("로컬 2인 대전")}</strong><span>{translateUi("한 화면에서 번갈아 두기")}</span></button>
      <button aria-pressed={settings.mode === 'online'} onClick={() => setSettings({ ...settings, mode: 'online' })}><Users size={34} /><strong>{translateUi("온라인 PvP")}</strong><span>{translateUi("친구를 초대해서 대전하기")}</span></button>
    </div>
    {translateUi(settings.mode === 'ai' && <div className="setup-ai-options">
      <fieldset><legend>{translateUi("난이도")}</legend><div className="setup-segments">{translateUi((Object.keys(difficultyNames) as Difficulty[]).map(difficulty => <button key={difficulty} aria-pressed={settings.difficulty === difficulty} onClick={() => setSettings({ ...settings, difficulty })}>{translateUi(difficultyNames[difficulty])}</button>))}</div><p>{translateUi(settings.difficulty === 'easy' ? '가볍게 연습해 보세요. AI가 실수하기도 합니다.' : settings.difficulty === 'normal' ? '기물의 가치와 상대의 응수를 살핍니다.' : '더 깊이 수를 읽습니다. 계산에 잠시 시간이 걸릴 수 있어요.')}</p></fieldset>
      <fieldset><legend>{translateUi("내 진영")}</legend><div className="setup-segments">{translateUi((['w', 'b'] as const).map(color => <button key={color} aria-pressed={settings.humanColor === color} onClick={() => setSettings({ ...settings, humanColor: color })}><span className={`side-dot ${color}`} />{translateUi(color === 'w' ? '백 · 먼저 두기' : '흑 · 나중에 두기')}</button>))}</div></fieldset>
    </div>)}
    <p className="setup-note"><Shield size={16} />{translateUi("그리스·이집트·로마의 선택한 능력이 적용됩니다. 철학을 고르면 10분 대전(+철학 3분)이며, 나머지는 시간제한이 없습니다.")}</p>
    <button className="primary-button setup-continue" onClick={() => onContinue(settings)}>{translateUi(settings.mode === 'online' ? '온라인 방으로' : '문명 선택으로')} <ArrowRight size={18} /></button>
  </section>;
}
