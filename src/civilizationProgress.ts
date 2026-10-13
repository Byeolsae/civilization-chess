import { civilizationAppearance, type Civilization } from './civilizations';
import { civilizationMedia } from './civilizationMedia';
import { civilizationReadiness } from './civilizationReadiness';

export type Completion = 'done' | 'progress' | 'pending';
export const progressFields = [
  ['palette','색배합','Colors'], ['logo','로고','Emblem'], ['background','배경','Background'],
  ['icons','스킬 아이콘','Skill icons'], ['skills','스킬','Skills'],
  ['intro','소개 문구','Introduction'], ['history','역사 설명','History'],
  ['bgm','BGM','BGM'], ['sfx','효과음','Sound effects'], ['animation','연출','Animation'], ['qa','검수','QA'],
] as const;
export type ProgressField = typeof progressFields[number][0];
export type Progress = Record<ProgressField, Completion>;
export const progressStages = [
  { color:'#e8bf60', ko:'전체 구현 완료', en:'Fully complete', koRule:'모든 항목 완료', enRule:'Every item complete' },
  { color:'#b799ef', ko:'스킬까지 완료', en:'Skills complete', koRule:'색배합·로고·배경·아이콘·스킬', enRule:'Colors, emblem, background, icons and skills' },
  { color:'#73a9f4', ko:'스킬 아이콘까지 완료', en:'Skill icons complete', koRule:'색배합·로고·배경·아이콘', enRule:'Colors, emblem, background and icons' },
  { color:'#53c2c6', ko:'배경까지 완료', en:'Background complete', koRule:'색배합·로고·배경', enRule:'Colors, emblem and background' },
  { color:'#8dc47b', ko:'색배합·로고 완료', en:'Colors & emblem complete', koRule:'색배합·로고', enRule:'Colors and emblem' },
  { color:'#e7a06c', ko:'색배합 완료', en:'Colors complete', koRule:'색배합', enRule:'Colors' },
  { color:'#9299a5', ko:'기초 준비 중', en:'Foundation pending', koRule:'색배합 미완료 · 세부 상태 확인', enRule:'Colors incomplete; see individual items' },
] as const;

export function progressStage(progress: Progress): number {
  if (Object.values(progress).every(value=>value==='done')) return 0;
  const required: ProgressField[]=['palette','logo','background','icons','skills'];
  let completed=0;
  for(const field of required){if(progress[field]!=='done')break;completed++;}
  return 6-completed;
}

// Shared dynasty artwork is provisional, not a completed individual design.
// Global test success is not a civilization-specific final QA sign-off.
export function civilizationProgress(id: Civilization): Progress {
  const unique=['greece','egypt','rome','korea','aztec','qing'].includes(id);
  const shared=civilizationAppearance[id]!=='classic';
  const playable=['greece','egypt','rome'].includes(id);
  const readiness=civilizationReadiness(id);
  return {
    palette:unique?'done':shared?'progress':'pending', logo:unique?'done':shared?'progress':'pending',
    background:civilizationMedia[id]?.background?'done':'pending',
    icons:playable?'done':'pending', skills:readiness==='ready'?'done':playable?'progress':'pending',
    intro:'pending', history:['sengoku','edo','ming','goryeo'].includes(id)?'progress':'pending',
    bgm:civilizationMedia[id]?.bgm?'done':'pending', sfx:'pending', animation:playable?'progress':'pending', qa:'pending',
  };
}
