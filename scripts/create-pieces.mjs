import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Original, reference-inspired artwork. Shadows are clipped to the silhouette,
// with the outline painted last to keep every contour crisp at small sizes.
const palettes = JSON.parse(readFileSync(new URL('./piece-palettes.json', import.meta.url), 'utf8'));
const selected = process.argv.slice(2);
for (const [civilization, sides] of Object.entries(palettes)) {
if (selected.length && !selected.includes(civilization)) continue;
const directory = fileURLToPath(new URL(`../public/pieces/${civilization}/`, import.meta.url));
mkdirSync(directory, { recursive: true });
for (const color of ['w', 'b']) {
  const { fill, shade, line, accent, ornament, trimColor, heraldry } = sides[color];
  const trim = (left = 26, right = 74) => accent ? `<path d="M${left} 84.5 H${right}" fill="none" stroke="${trimColor ?? accent}" stroke-width="2.8" stroke-linecap="round"/>` : '';
  let clipIndex = 0;
  const outline = d => `<path d="${d}" fill="none"/>`;
  const shape = (d, shadow = '') => {
    const id = `s${clipIndex++}`;
    return `<path d="${d}" fill="${fill}" stroke="none" fill-rule="evenodd"/>` +
      `<defs><clipPath id="${id}"><path d="${d}" clip-rule="evenodd"/></clipPath></defs>` +
      (shadow ? `<path d="${shadow}" fill="${shade}" stroke="none" clip-path="url(#${id})"/>` : '') +
      (ornament ? `<g stroke="none" clip-path="url(#${id})"><path d="M10 68 H90 V74 H10 Z" fill="${ornament}"/><path d="M10 78 H90 V82 H10 Z" fill="${accent}"/>${heraldry ? Object.values(heraldry).map((color, i) => `<path d="M${24+i*10.4} 69 H${34.4+i*10.4} V73 H${24+i*10.4} Z" fill="${color}"/>`).join('') : ''}</g>` : '') +
      `<path d="${d}" fill="none"/>`;
  };
  const base = () => shape('M22 89 V84 C22 79 26 77 33 77 H67 C74 77 78 79 78 84 V89 Z', 'M21 85 H79 V90 H21 Z') + trim();
  const pieces = {
    P: shape('M43 47 A12 12 0 1 1 57 47 L64 53 L57 56 C57 66 62 71 69 76 C74 80 76 84 76 89 H24 C24 84 26 80 31 76 C38 71 43 66 43 56 L36 53 Z', 'M53 21 C68 31 65 42 55 48 L62 54 L55 56 C55 71 72 74 72 91 H60 C60 77 47 71 49 55 L53 49 C61 39 62 28 53 21 Z') + outline('M43 56 H57') + trim(29, 71),
    R: shape('M34 38 H66 C63 55 65 66 71 78 H29 C35 66 37 55 34 38 Z', 'M54 37 H67 C64 58 65 67 72 79 H59 C59 63 59 48 54 37 Z') + shape('M23 17 H34 V26 H44 V17 H56 V26 H66 V17 H77 L73 39 Q50 43 27 39 Z', 'M67 16 H78 L73 40 L65 41 Z') + base(),
    N: shape('M30 77 C33 66 46 63 49 50 L40 56 L35 55 L29 62 C27 65 24 64 20 61 L17 59 C15 57 16 54 18 51 L29 34 C31 30 34 28 37 26 L39 14 Q40 9 43 13 L49 22 C68 24 80 40 80 59 C80 66 78 72 74 77 Z', 'M53 24 C70 28 81 43 80 59 C80 66 78 72 74 78 H57 C67 62 72 43 53 24 Z') + outline('M30 77 C34 67 47 62 49 50 L53 44') + `<path d="M37 34 Q40 31 43 33 L40 37 H36 Z" fill="${line}" stroke="none"/>` + base(),
    B: shape('M40 77 C29 69 25 60 28 48 C31 35 44 25 51 19 C49 16 50 11 53 9 C57 6 62 8 63 12 C64 15 62 18 59 21 L48 49 H55 L64 28 C72 37 76 47 74 56 C72 67 65 73 60 77 Z', 'M65 28 C77 40 79 57 67 70 L59 78 H48 C69 64 73 45 65 28 Z') + base(),
    Q: shape('M28 77 L18 37 C10 38 8 28 14 25 C21 22 26 31 22 35 L38 48 L36 22 C28 20 30 9 37 9 C45 9 46 20 41 22 L50 45 L59 22 C54 20 55 9 63 9 C70 9 72 20 64 22 L62 48 L78 35 C74 31 79 22 86 25 C92 28 90 38 82 37 L72 77 Z', 'M65 22 L62 48 L78 35 L83 36 L72 78 H59 Z') + base(),
    K: shape('M45 8 H55 V16 H63 V24 H55 V33 H45 V24 H37 V16 H45 Z') + shape('M31 77 C28 66 18 61 14 51 C7 34 24 27 38 32 L45 36 V31 H55 V36 L62 32 C76 27 93 34 86 51 C82 61 72 66 69 77 Z M29 43 C21 43 24 52 40 61 V48 C36 45 32 43 29 43 Z M71 43 C68 43 64 45 60 48 V61 C76 52 79 43 71 43 Z', 'M78 31 C89 35 91 43 86 51 C82 61 72 66 69 78 H59 C65 65 80 54 81 43 C81 38 80 34 78 31 Z') + base(),
  };
  for (const [type, body] of Object.entries(pieces)) {
    const path = `${directory}${color}${type}.svg`;
    const viewBox = existsSync(path) ? readFileSync(path, 'utf8').match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 100 100' : '0 0 100 100';
    writeFileSync(path, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><g fill="${fill}" stroke="${line}" stroke-width="2.25" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>\n`);
  }
}
}
console.log(`Created ${Object.keys(palettes).filter(id => !selected.length || selected.includes(id)).length * 12} piece assets.`);
