import test from 'node:test';
import assert from 'node:assert/strict';
import { waveTarget, activeArea, findActiveAction } from '../src/activeTargeting';
import { AbilityGame } from '../src/AbilityGame';
const none={passive:'pending',piece:'pending',active:'pending'};
test('wave drag selects the starting row or column and reverses world directions on a flipped board',()=>{
 assert.deepEqual(waveTarget('d4',100,5,false),{square:'a4',direction:0});
 assert.deepEqual(waveTarget('d4',-100,5,false),{square:'a4',direction:1});
 assert.deepEqual(waveTarget('d4',5,-100,false),{square:'d1',direction:2});
 assert.deepEqual(waveTarget('d4',5,100,false),{square:'d1',direction:3});
 assert.deepEqual(waveTarget('d4',100,5,true),{square:'a4',direction:1});
 assert.deepEqual(waveTarget('d4',5,-100,true),{square:'d1',direction:3});
 assert.equal(waveTarget('d4',5,5,false),null);
});
test('area previews stay inside the board and match zone and wave geometry',()=>{
 assert.equal(activeArea('set','d4').length,9);
 assert.equal(activeArea('vesta','a1').length,4);
 assert.deepEqual(activeArea('alesia','c3'),['c3','c4','d3','d4']);
 assert.deepEqual(activeArea('pilum','b8'),['b8']);
 assert.equal(activeArea('poseidon','a4',0).length,8);
 assert.deepEqual(activeArea('poseidon','d1',2),['d1','d2','d3','d4','d5','d6','d7','d8']);
});
test('board selection resolves only legal actions and used actives cannot be selected again',()=>{
 const game=new AbilityGame({w:{...none,active:'pilum'},b:none});
 assert.equal(findActiveAction(game.actions(),'pilum','a3'),undefined);
 const action=findActiveAction(game.actions(),'pilum','b8');assert.ok(action);game.perform(action);
 assert.equal(game.state.activeUsed.w,true);game.move({from:'a7',to:'a6'});
 assert.equal(findActiveAction(game.actions(),'pilum','b8'),undefined);
});
test('drag target connects to the engine wave direction; resurrection chooses the specific grave',()=>{
 const game=new AbilityGame({w:{...none,active:'poseidon'},b:none});
 const target=waveTarget('e7',80,0,false)!;const action=findActiveAction(game.actions(),'poseidon',target.square,undefined,target.direction);assert.ok(action);assert.equal(action.to,'a7');
 const actions=[{kind:'skill' as const,skill:'osiris',from:'e1' as const,to:'a3' as const,id:'w-a2'}];
 assert.equal(findActiveAction(actions,'osiris','a3','w-b2'),undefined);
 assert.equal(findActiveAction(actions,'osiris','a3','w-a2'),actions[0]);
});
