import {test} from 'node:test';
import assert from 'node:assert/strict';
import {displayGeometry,parseResolution,resolutions} from '../src/displayPreferences';
import {squareAtPoint} from '../src/boardPointer';
const viewports=[[390,844],[844,390],[1024,768],[1280,720],[1366,768],[1920,1080],[2560,1440],[3440,1440],[3840,2160]];
test('every device fits the full layout without scrolling',()=>{
 for(const [w,h] of viewports){
  const g=displayGeometry(w,h);
  assert.ok(g.scale>0);assert.ok(g.width*g.scale<=w+.001);assert.ok(g.height*g.scale<=h+.001);
  assert.ok(Math.abs(g.width*g.scale-w)<.001||Math.abs(g.height*g.scale-h)<.001);
 }
});
test('HD FHD QHD and 4K preserve relative card position, size, text and gaps',()=>{
 const layout={x:256,y:144,width:512,height:720,font:24,gap:32};
 for(const [w,h] of [[1280,720],[1920,1080],[2560,1440],[3840,2160]]){
  const g=displayGeometry(w,h);
  assert.equal(layout.x*g.scale/w,.1);assert.equal(layout.y*g.scale/h,.1);
  assert.equal(layout.width*g.scale/w,.2);assert.equal(layout.height*g.scale/h,.5);
  assert.equal(layout.font*g.scale/w,24/2560);assert.equal(layout.gap*g.scale/w,32/2560);
 }
});
test('letterboxed coordinate mapping preserves every square and drag endpoint',()=>{
 const board={left:300,top:240,width:960,height:960};
 for(const [w,h] of viewports){
  const g=displayGeometry(w,h),ox=(w-g.width*g.scale)/2,oy=(h-g.height*g.scale)/2;
  for(const flipped of [true,false])for(let col=0;col<8;col++)for(let row=0;row<8;row++){
   const x=board.left+(col+.5)*120,y=board.top+(row+.5)*120;
   const clientX=((ox+x*g.scale)-ox)/g.scale,clientY=((oy+y*g.scale)-oy)/g.scale;
   assert.equal(squareAtPoint(clientX,clientY,board,flipped),`${'abcdefgh'[flipped?7-col:col]}${flipped?row+1:8-row}`);
  }
 }
});

test('manual presets cap display size while preserving fit and proportions',()=>{
 for(const [resolution,width] of Object.entries(resolutions)){
  const preset=resolution as keyof typeof resolutions;
  assert.equal(displayGeometry(3840,2160,preset).scale,width/2560);
  for(const [w,h] of viewports){
   const g=displayGeometry(w,h,preset);
   assert.ok(g.width*g.scale<=w+.001);assert.ok(g.height*g.scale<=h+.001);
   assert.equal(g.width/g.height,16/9);
  }
 }
 assert.equal(parseResolution('fhd'),'fhd');
 for(const value of [null,'auto','bogus','toString','__proto__'])assert.equal(parseResolution(value),'auto');
});
