import {test} from 'node:test';
import assert from 'node:assert/strict';
import {displayGeometry,parseDisplay,defaultDisplay} from '../src/displayPreferences';
import {squareAtPoint} from '../src/boardPointer';

const viewports=[[390,844],[844,390],[1024,768],[1366,768],[1920,1080],[2560,1440],[3440,1440],[3840,2160]];
test('every device keeps the same QHD viewport and fits without scrolling',()=>{
 for(const [w,h] of viewports)for(const mode of ['auto','qhd'] as const)for(const size of [0,80,90,100]){
  const g=displayGeometry(w,h,{mode,size});
  assert.equal(g.mode,'qhd');assert.equal(g.width,2560);assert.equal(g.height,1440);
  assert.ok(g.scale>0);assert.ok(g.width*g.scale<=w+.001);assert.ok(g.height*g.scale<=h+.001);
  if(!size)assert.ok(Math.abs(g.width*g.scale-w)<.001||Math.abs(g.height*g.scale-h)<.001);
 }
});
test('known resolutions scale uniformly instead of rearranging UI',()=>{
 assert.equal(displayGeometry(1920,1080,defaultDisplay).scale,.75);
 assert.equal(displayGeometry(3840,2160,defaultDisplay).scale,1.5);
 assert.equal(displayGeometry(3440,1440,defaultDisplay).scale,1);
 assert.equal(displayGeometry(390,844,defaultDisplay).scale,390/2560);
});
test('legacy responsive and oversize preferences migrate to uniform fit',()=>{
 for(const raw of [null,'bad','{"mode":"bad","size":999}','{"mode":"responsive","size":110}','{"mode":"auto","size":120}'])assert.deepEqual(parseDisplay(raw),defaultDisplay);
 assert.deepEqual(parseDisplay('{"mode":"responsive","size":90}'),{mode:'auto',size:90});
 assert.deepEqual(parseDisplay('{"mode":"qhd","size":90}'),{mode:'qhd',size:90});
 assert.equal(displayGeometry(1920,1080,{mode:'auto',size:120}).scale,.75);
});
test('letterboxed coordinate mapping preserves every square, orientation and drag endpoint',()=>{
 const board={left:300,top:240,width:960,height:960};
 for(const [w,h] of viewports)for(const size of [0,80,90,100]){
  const g=displayGeometry(w,h,{mode:'auto',size});
  const ox=(w-g.width*g.scale)/2,oy=(h-g.height*g.scale)/2;
  for(const flipped of [true,false])for(let col=0;col<8;col++)for(let row=0;row<8;row++){
   const x=board.left+(col+.5)*120,y=board.top+(row+.5)*120;
   // Browser frame events and bounding rects both use child CSS pixels.
   const clientX=((ox+x*g.scale)-ox)/g.scale,clientY=((oy+y*g.scale)-oy)/g.scale;
   assert.equal(squareAtPoint(clientX,clientY,board,flipped),`${'abcdefgh'[flipped?7-col:col]}${flipped?row+1:8-row}`);
  }
 }
});
