import test from 'node:test';
import assert from 'node:assert/strict';
import { civilizationReadiness,chooseAiDraftPick } from '../src/civilizationReadiness';
import { civilizations,type Civilization } from '../src/civilizations';
import { confirmPick,completeDraft } from '../src/draft';
test('readiness comes from implemented skills rather than shared piece palettes',()=>{
 assert.equal(civilizationReadiness('greece'),'ready');assert.equal(civilizationReadiness('egypt'),'ready');assert.equal(civilizationReadiness('rome'),'progress');
 assert.equal(civilizationReadiness('korea'),'progress');assert.equal(civilizationReadiness('aztec'),'progress');assert.equal(civilizationReadiness('goryeo'),'pending');
 assert.equal(civilizations.filter(c=>civilizationReadiness(c.id)==='ready').length,2);
});
test('90 percent of the civilization probability mass is assigned to playable factions',()=>{
 let implemented=0;for(let i=0;i<1000;i++){const pick=chooseAiDraftPick([],()=> (i+.5)/1000) as Civilization;if(civilizationReadiness(pick)==='ready')implemented++;}assert.equal(implemented,900);
});
test('AI avoids pending skills and can complete a full valid draft',()=>{
 assert.notEqual(chooseAiDraftPick(['rome','rome'],()=>.9999),'twelve-tables');
 let picks:string[]=[];while(!completeDraft(picks)){const pick=chooseAiDraftPick(picks,()=>.2);assert.ok(pick);picks=confirmPick(picks,pick);}assert.ok(completeDraft(picks));assert.equal(chooseAiDraftPick(picks),undefined);
});
