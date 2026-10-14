import { readFileSync } from 'node:fs';
// User-requested exact reference silhouettes; Song remains the prior hand-drawn design.
const references=JSON.parse(readFileSync(new URL('./dynasty-reference-paths.json',import.meta.url),'utf8'));
export const dynastyEmblems = {ming:'vermilion-bird',goryeo:'three-legged-crow',yuan:'flame-sun-crescent',song:'crane',han:'heavenly-horse'};
const motif = body => `<g transform="scale(.64)" fill="var(--main)">${body}</g>`;
export const dynastyMotifs = {
 ...Object.fromEntries(Object.entries(references).map(([id,ref])=>[id,`<g transform="translate(4.8 4.8) scale(.85)"><path fill="var(--main)" fill-rule="evenodd" d="${ref.path}"/></g>`])),
 song:motif(`<path d="M47 61C34 53 21 36 18 10C25 18 31 27 34 35C30 22 30 16 32 10C36 25 43 36 47 47C42 29 45 20 54 19C61 19 65 23 64 28L84 32L63 33C58 31 55 33 56 39C60 48 58 55 56 58C69 47 72 26 88 18C85 33 80 44 73 52C82 46 87 41 92 35C88 49 77 62 64 65L78 71C66 75 59 70 54 70C47 74 39 71 36 65Z"/>
 <path d="M22 24C28 40 36 53 44 59M30 25C35 44 41 50 46 55M39 36C42 47 46 52 49 55M80 33C73 50 67 58 59 62M82 43C73 58 68 62 62 65M52 34C49 38 52 47 51 52" fill="none" stroke="var(--base)" stroke-width="1.4" stroke-linecap="round"/>
 <path d="M46 70L43 91L33 94M43 91L47 95M54 70L58 83L68 87L64 91" fill="none" stroke="var(--main)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="M49 25C51 20 56 20 60 23" stroke="var(--detail)" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="59" cy="27" r="1.3" fill="var(--base)"/>`)
};
