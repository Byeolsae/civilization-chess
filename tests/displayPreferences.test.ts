import {test} from 'node:test';
import assert from 'node:assert/strict';
import {displayGeometry,parseDisplay,defaultDisplay} from '../src/displayPreferences';
import {squareAtPoint} from '../src/boardPointer';
test('explicit QHD preserves canvas and letterboxes every aspect ratio',()=>{
 for(const [w,h] of [[2560,1440],[1920,1080],[1366,768],[3440,1440],[1280,1024]]){
 const g=displayGeometry(w,h,{mode:'qhd',size:0});assert.equal(g.width,2560);assert.equal(g.height,1440);assert.ok(g.width*g.scale<=w+.001);assert.ok(g.height*g.scale<=h+.001);
 }
});
test('mobile auto and explicit overrides use intended viewport',()=>{
 assert.equal(displayGeometry(390,844,defaultDisplay).mode,'responsive');
 assert.equal(displayGeometry(1024,768,defaultDisplay).mode,'responsive');
 assert.equal(displayGeometry(390,844,{mode:'qhd',size:0}).width,2560);
 assert.equal(displayGeometry(1920,1080,{mode:'responsive',size:0}).width,1920);
 assert.ok(Math.abs(displayGeometry(1920,1080,{mode:'qhd',size:120}).scale-.9)<1e-9);
});
test('corrupt storage restores automatic defaults',()=>{
 assert.deepEqual(parseDisplay('bad'),defaultDisplay);assert.deepEqual(parseDisplay('{"mode":"bad","size":999}'),defaultDisplay);
 assert.deepEqual(parseDisplay('{"mode":"qhd","size":90}'),{mode:'qhd',size:90});
});
test('letterboxed frame coordinate conversion preserves all board squares and drag endpoints',()=>{
 const board={left:300,top:240,width:960,height:960};
 for(const [w,h] of [[1366,768],[1920,1080],[3440,1440]])for(const size of [0,80,120]){
 const g=displayGeometry(w,h,{mode:'qhd',size});const ox=Math.max(0,(w-g.width*g.scale)/2),oy=Math.max(0,(h-g.height*g.scale)/2);
 for(const flipped of [true,false])for(let col=0;col<8;col++)for(let row=0;row<8;row++){
 const x=board.left+(col+.5)*120,y=board.top+(row+.5)*120;
 // Native frame events and bounding rects are both measured in child CSS pixels.
 const clientX=((ox+x*g.scale)-ox)/g.scale,clientY=((oy+y*g.scale)-oy)/g.scale;
 assert.equal(squareAtPoint(clientX,clientY,board,flipped),`${'abcdefgh'[flipped?7-col:col]}${flipped?row+1:8-row}`);
 }
 }
});

test('automatic defaults fit every device viewport',()=>{
 for(const [width,height] of [[390,844],[1024,768],[1366,768],[1920,1080],[2560,1440],[3440,1440]]){
 assert.deepEqual(displayGeometry(width,height,parseDisplay(null)),{mode:'responsive',scale:1,width,height});
 assert.deepEqual(displayGeometry(width,height,parseDisplay('{"mode":"auto","size":0}')),{mode:'responsive',scale:1,width,height});
 }
});
