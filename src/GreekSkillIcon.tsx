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
  zeus: <>
    <path d="M49 39L39 26 45 26 29 7 34 29 28 28 41 45Z M57 37L63 21 69 25 76 5 76 32 69 29 63 43Z M43 59L34 70 29 65 20 91 41 75 37 73 52 65Z M61 57L70 72 65 72 80 92 75 68 81 70 68 53Z"/>
    <path d="M42 40L61 34 70 51 52 67 34 53Z" fill="none" stroke="currentColor" strokeWidth="5"/>
    <path d="M40 46L57 40 M45 53L62 46 M50 60L66 52" className="icon-line"/>
    <path d="M15 27L23 35 M80 44H91 M11 60L23 57" className="icon-line" opacity=".5"/>
  </>,
  poseidon: <>
    <path d="M48 9L40 25H45V84L40 92H56L51 84V25H56Z"/>
    <path d="M21 19L14 36H20V43Q20 60 45 62V55Q27 54 27 43V36H32Z M75 19L64 36H69V43Q69 54 51 55V62Q76 60 76 43V36H82Z"/>
    <path d="M37 66H59 M37 72H59" className="icon-line"/>
    <path d="M13 86Q21 80 28 86 M68 86Q76 80 84 86" className="icon-line" opacity=".45"/>
  </>,
  hades: <>
    <path d="M27 33Q26 12 48 12Q70 12 69 33V46L59 51V63H37V51L27 46Z"/>
    <path d="M34 33L43 36 40 43H34Z M62 33L53 36 56 43H62Z M48 42L43 51H53Z M43 56V63 M53 56V63" className="sculpture-cut"/>
    <g fill="none" stroke="currentColor" strokeWidth="5"><rect x="15" y="61" width="18" height="26" rx="8" transform="rotate(-38 24 74)"/><rect x="29" y="71" width="18" height="26" rx="8" transform="rotate(-38 38 84)"/><rect x="63" y="61" width="18" height="26" rx="8" transform="rotate(38 72 74)"/><rect x="49" y="71" width="18" height="26" rx="8" transform="rotate(38 58 84)"/></g>
  </>,
};
export default function GreekSkillIcon({skill}:{skill:string}) {
  const active: Record<string,ReactNode> = {
    zeus: <path d="M14 3L5 13H11L10 21 19 10H13Z"/>,
    poseidon: <><path d="M12 3V21 M9 6L12 3 15 6 M5 5V10Q5 14 12 14Q19 14 19 10V5 M3 7L5 5 7 7 M17 7L19 5 21 7 M9 21H15"/></>,
    hades: <><path d="M6 10V8a6 6 0 0 1 12 0v2l-3 2v3H9v-3Z"/><circle cx="9.5" cy="8" r=".6" fill="currentColor"/><circle cx="14.5" cy="8" r=".6" fill="currentColor"/><path d="M11 12h2 M7 16l-2-1a2 2 0 0 0-2 3l4 3a2 2 0 0 0 3-2 M17 16l2-1a2 2 0 0 1 2 3l-4 3a2 2 0 0 1-3-2 M8 18l3 2h2l3-2"/></>,
  };
  if (active[skill]) return <svg className="greek-active-symbol" width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{active[skill]}</svg>;
  return <svg className="greek-skill-icon" viewBox="0 0 100 100" aria-hidden="true" fill="currentColor" strokeLinejoin="round" strokeLinecap="round">{artwork[skill]}</svg>;
}
export const hasGreekSkillIcon = (skill:string) => Object.hasOwn(artwork,skill);
