import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
// Shared piece palettes keep the six emblems and both player sides in sync.
const palettes = JSON.parse(readFileSync(new URL('./piece-palettes.json', import.meta.url), 'utf8'));
const leaf = (x,y,angle) => `<path d="M0 0C-4-3-4-8 0-12C4-8 4-3 0 0Z" transform="translate(${x} ${y}) rotate(${angle})"/>`;
const leftLeaves = [[23,46,-64],[19,39,-58],[18,31,-46],[20,23,-28],[25,17,5],[24,43,25],[22,35,38],[23,27,47]]
  .map(([x,y,angle]) => leaf(x,y,angle)).join('');
const motifs = {
  japan: `<g fill="var(--main)" stroke="var(--base)" stroke-width=".8">${Array.from({length:5},(_,i)=>`<path d="M32 33C24 28 19 17 25 10Q28 7 32 13Q36 7 39 10C45 17 40 28 32 33Z" transform="rotate(${i*72} 32 32)"/>`).join('')}</g><circle cx="32" cy="32" r="4" fill="var(--detail)"/>${Array.from({length:5},(_,i)=>`<g transform="rotate(${i*72} 32 32)"><path d="M32 29V23" stroke="var(--detail)" stroke-width="1.2"/><circle cx="32" cy="22" r="1.4" fill="var(--detail)"/></g>`).join('')}`,
  korea: `<g transform="translate(64 0) scale(-1 1)"><circle cx="32" cy="32" r="19" fill="var(--blue)"/><path d="M13 32A19 19 0 0 1 51 32C51 42.5 32 42.5 32 32C32 21.5 13 21.5 13 32Z" fill="var(--main)"/></g>`,
  china: `<g transform="scale(.5)"><path fill="var(--main)" d="M10 61C19 50 31 44 43 44L33 32L50 40C44 32 43 23 45 15C49 28 54 37 64 42C58 34 57 25 60 18C62 28 69 38 78 43C85 47 94 49 97 54L99 63L111 65L116 71L113 77L113 84L108 79L106 74L101 75L98 72L95 76L90 73L86 77L81 73C74 71 72 64 68 61C65 59 62 62 63 66C65 75 75 80 88 81C96 82 103 81 108 84L107 89C98 97 80 96 66 87L69 94L58 99L48 98L58 94C53 91 50 87 48 84L40 86L46 94L33 89L22 89L30 82L17 85C21 80 28 77 35 74L17 73C24 66 33 63 41 62C30 57 20 58 10 61Z"/><path fill="var(--main)" d="M101 90C99 97 93 101 85 104C87 100 88 98 89 96C84 99 79 100 74 100C80 97 83 93 83 90Z"/><path fill="var(--base)" d="M74 57C78 56 82 58 84 61C83 65 80 67 77 66C74 64 73 60 74 57Z"/><path fill="var(--base)" d="M105 67L110 69L109 72L105 71Z"/></g>`,
  greece: `<path fill="var(--main)" d="M14 45H24V42C17 39 13 33 13 26C13 15 21 9 32 9C43 9 51 15 51 26C51 33 47 39 40 42V45H50V51H34V39C40 37 44 32 44 26C44 18 39 14 32 14C25 14 20 18 20 26C20 32 24 37 30 39V51H14Z"/><path d="M17 48H27M37 48H47" stroke="var(--detail)" stroke-width="1.3"/>`,
  egypt: `<path d="M10 23C23 11 38 11 52 20" fill="none" stroke="var(--main)" stroke-width="3.3" stroke-linecap="round"/><path d="M8 30C20 18 35 18 47 29L56 27L48 34C33 42 19 38 8 30ZM14 30C24 36 34 37 44 30C35 23 24 23 14 30Z" fill="var(--main)" fill-rule="evenodd"/><ellipse cx="29" cy="29.5" rx="4.5" ry="6" fill="var(--main)"/><path d="M23 38L16 49L20 38Z" fill="var(--main)"/><path d="M32 38V46C32 53 43 54 45 47C46 43 41 41 39 45" fill="none" stroke="var(--main)" stroke-width="2.7" stroke-linecap="round"/><path d="M34 39L45 43" stroke="var(--detail)" stroke-width="2" stroke-linecap="round"/>`,
  rome: `<g fill="var(--main)">${leftLeaves}<g transform="translate(64 0) scale(-1 1)">${leftLeaves}</g></g><path d="M31 53C13 45 13 25 26 12M33 53C51 45 51 25 38 12" fill="none" stroke="var(--main)" stroke-width="1.6" stroke-linecap="round"/><path d="M26 50L38 55M38 50L26 55" stroke="var(--detail)" stroke-width="2.4" stroke-linecap="round"/>`,
};
// Concentric, alternating halves from the royal standard supplied by the user.
motifs.joseon = `<circle cx="32" cy="32" r="23" fill="#F0AD73"/><path d="M32 9A23 23 0 0 1 32 55Z" fill="#FFFFFF"/><circle cx="32" cy="32" r="17" fill="#FFFFFF"/><path d="M32 15A17 17 0 0 1 32 49Z" fill="#F0AD73"/><circle cx="32" cy="32" r="10.5" fill="#F0AD73"/><path d="M32 21.5A10.5 10.5 0 0 1 32 42.5Z" fill="#FFFFFF"/><circle cx="32" cy="32" r="5.2" fill="#FFFFFF"/><path d="M32 26.8A5.2 5.2 0 0 1 32 37.2Z" fill="#F0AD73"/>`;
const directory = new URL('../public/civilizations/', import.meta.url);
mkdirSync(directory, { recursive: true });
for (const [id, body] of Object.entries(motifs)) {
  for (const side of ['w','b']) {
    const palette = palettes[id][side];
    const main = id === 'joseon' ? palette.ornament : id === 'korea' ? palettes.korea.b.shade : palette.accent;
    const detail = palette.ornament;
    const motif = id === 'joseon' ? (side === 'b' ? body.replace(/#F0AD73|#FFFFFF/g, color => color === '#F0AD73' ? '#FFFFFF' : '#F0AD73') : body.replace(/#FFFFFF/g, '#C00D45')) + '<circle cx="32" cy="32" r="23" fill="none" stroke="#F0AD73" stroke-width="1.2"/>' : body;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="--main:${main};--detail:${detail};--base:${palette.fill};--blue:${id === 'joseon' ? (side === 'w' ? '#BE0840' : '#FFFCF5') : palettes.korea.w.accent}"><circle cx="32" cy="32" r="30" fill="${palette.fill}" stroke="${detail}" stroke-width="1.4"/><circle cx="32" cy="32" r="27.5" fill="none" stroke="${main}" stroke-opacity=".18" stroke-width=".6"/><g transform="translate(6.4 6.4) scale(.8)">${motif}</g></svg>\n`;
    writeFileSync(new URL(`${id}-${side}.svg`,directory),svg);
    if (side === 'w') writeFileSync(new URL(`${id}.svg`,directory),svg);
  }
}
writeFileSync(new URL('./civilization-emblems.json', import.meta.url), JSON.stringify({greece:'omega',egypt:'eye-of-horus',rome:'laurel-wreath',japan:'cherry-blossom',korea:'taegeuk',china:'dragon-head',joseon:'royal-standard-concentric-taegeuk'},null,2)+'\n');
console.log('Created civilization emblems with matching white and black piece palettes.');
