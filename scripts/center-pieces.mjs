// Run after either piece generator. Pass a sharp package path when not installed locally.
// Centers the painted bounds (including strokes), without changing piece size.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const sharp = require(process.argv[2] || 'sharp');
const root = new URL('../public/pieces/', import.meta.url);
let count = 0;
async function visit(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = new URL(entry.name + (entry.isDirectory() ? '/' : ''), dir);
    if (entry.isDirectory()) { await visit(path); continue; }
    if (!entry.name.endsWith('.svg')) continue;
    const svg = readFileSync(path, 'utf8');
    const match = svg.match(/viewBox="([^"]+)"/);
    if (!match) throw Error(`Missing viewBox: ${path}`);
    const [vx, vy, width, height] = match[1].split(/\s+/).map(Number);
    const { data, info } = await sharp(Buffer.from(svg)).resize(600, 600, { fit: 'fill' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    let left=info.width, right=-1, top=info.height, bottom=-1;
    for (let y=0;y<info.height;y++) for (let x=0;x<info.width;x++) {
      if (data[(y*info.width+x)*info.channels+3] < 32) continue;
      left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
    }
    if (right < 0) throw Error(`Empty asset: ${path}`);
    const x=+(vx+(left+right+1)/2/info.width*width-width/2).toFixed(3);
    const y=+(vy+(top+bottom+1)/2/info.height*height-height/2).toFixed(3);
    writeFileSync(path, svg.replace(match[0], `viewBox="${x} ${y} ${width} ${height}"`));
    count++;
  }
}
await visit(root);
console.log(`Centered ${count} piece silhouettes`);
