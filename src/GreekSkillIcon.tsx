import type { ReactNode } from 'react';

const artwork: Record<string, ReactNode> = {
  olympics: <>
    <ellipse cx="81" cy="19" rx="11" ry="4" transform="rotate(-28 81 19)"/>
    <circle cx="47" cy="31" r="7"/>
    <path d="M48 40Q56 36 62 42L67 54 57 61 44 51 29 52 15 43 18 39 32 45 45 43Z"/>
    <path d="M56 41L67 30 76 19 81 23 72 37 64 48 M58 57L66 67 59 80 66 88H54L48 80 54 68 43 65 36 78 27 88H16L30 73 36 55"/>
    <path d="M38 50L52 56 M50 64L58 66" className="sculpture-cut"/>
    <path d="M13 93H82" className="icon-line"/>
  </>,
  democracy: <>
    {[{x:9,y:36,r:-16},{x:29,y:19,r:-7},{x:51,y:9,r:0},{x:72,y:26,r:12}].map(({x,y,r})=><g key={x} transform={`translate(${x} ${y}) rotate(${r} 9 30)`}><path d="M3 67L3 33 -2 22Q-4 17 0 17L6 24V7Q6 2 9 4V21H11V2Q12 -2 15 2V21H17V5Q18 1 21 5V23H23V12Q25 8 27 12V31Q27 40 22 45V67Z"/><path d="M9 29Q19 27 20 35" className="sculpture-cut"/></g>)}
  </>,
  philosophy: <>
    <path d="M58 58H79V88H48V73Z" opacity=".35"/>
    <path d="M44 15Q54 10 61 17L62 26 55 33 44 28 40 21Z"/>
    <path d="M47 34Q56 30 62 36L70 52 64 66 47 63 38 56 31 41 36 38 46 50 54 51 50 42Z"/>
    <path d="M60 39L49 43 43 31 48 25 54 29 51 32 55 36Z M44 58L31 69 24 85 16 89H36L41 72 54 68 M57 62L63 76 56 86 49 90H69L75 76 69 61"/>
    <path d="M44 55L56 59 M57 37L60 48" className="sculpture-cut"/>
    <path d="M13 94H83" className="icon-line"/>
  </>,

};
export default function GreekSkillIcon({skill}:{skill:string}) {
  if (['zeus','poseidon','hades'].includes(skill)) return <svg className="greek-active-symbol greek-vector-portrait" width="64" height="64" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true"><use href={`/skills/greek-vector-v1/${skill}.svg#art`}/></svg>;
  return <svg className="greek-skill-icon" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor" strokeLinejoin="round" strokeLinecap="round">{artwork[skill]}</svg>;
}
export const hasGreekSkillIcon = (skill:string) => Object.hasOwn(artwork,skill) || ['zeus','poseidon','hades'].includes(skill);
