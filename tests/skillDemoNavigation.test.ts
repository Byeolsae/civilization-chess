import test from 'node:test';
import assert from 'node:assert/strict';
import {createSkillScenario,skillScenarioAtStep} from '../src/skillScenarios';

for(const id of ['trojan','anubis','mummy','pyramid','twelve-tables','olympics']) {
  test(`demo rewind restores earlier chapters: ${id}`,()=>{
    const original=createSkillScenario(id)!;
    const frames=[{fen:original.game.fen(),units:structuredClone(original.game.units()),owner:original.game.placementOwner()}];
    for(const scene of original.steps){scene.run(original.game);frames.push({fen:original.game.fen(),units:structuredClone(original.game.units()),owner:original.game.placementOwner()});}
    for(let i=frames.length-1;i>=0;i--){
      const rewind=skillScenarioAtStep(id,i)!;
      assert.equal(rewind.game.fen(),frames[i].fen);
      assert.equal(rewind.game.placementOwner(),frames[i].owner);
      assert.deepEqual(rewind.game.units(),frames[i].units);
    }
  });
}
