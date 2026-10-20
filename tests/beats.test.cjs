const assert = require('node:assert/strict');
const beats = require('../assets/beats.js');
assert.equal(Object.keys(beats.presets).length, 10);
const events=[];
const param=()=>({value:0,setValueAtTime(value,time){assert(Number.isFinite(value));assert(time>=1);},linearRampToValueAtTime(value,time){assert(Number.isFinite(value));assert(time>=1);},exponentialRampToValueAtTime(value,time){assert(value>0);assert(time>=1);}});
const node=()=>({gain:param(),frequency:param(),Q:param(),connect(dest){return dest;},disconnect(){},start(time){events.push(time);},stop(time){assert(time>1);}});
const ctx={currentTime:1,sampleRate:8000,createBuffer:(channels,length)=>({getChannelData:()=>new Float32Array(length)}),createGain:node,createOscillator:node,createBufferSource:node,createBiquadFilter:node};
const dest=node();
for(const [name,preset] of Object.entries(beats.presets)){
  const kit=beats.kitFor(preset);
  assert.equal(kit.length,16);
  assert(preset.bpm>=55 && preset.bpm<=220);
  assert(preset.tracks[0]?.length && (preset.tracks[1]?.length || preset.tracks[4]?.length),name+' needs kick and backbeat');
  for(const [track,hits] of Object.entries(preset.tracks)){
    assert(+track>=0 && +track<16);
    const used=new Set();
    for(const value of hits){
      const hit=typeof value==='number'?{step:value,velocity:1,semitones:0}:value;
      assert(Number.isInteger(hit.step) && hit.step>=0 && hit.step<32);
      assert(!used.has(hit.step),name+' duplicate step'); used.add(hit.step);
      const velocity=hit.velocity??1;
      assert(velocity>0 && velocity<=1);
      assert(beats.renderSound(ctx,dest,kit[track].sound,1.25,2**((hit.semitones??0)/12),kit[track].gain*velocity),name+' unsupported sound');
    }
  }
  const duration=Array.from({length:32},(_,step)=>beats.stepDuration(preset.bpm,preset.swing,step)).reduce((a,b)=>a+b,0);
  assert(Math.abs(duration-8*60/preset.bpm)<1e-10,name+' swing changes bar duration');
}
assert(events.length>100);
assert(events.every(time=>time>=1.25),'all voices must use the scheduled audio time');
assert.equal(beats.renderSound(ctx,dest,'unsupported',1.25),false);
console.log('PASS: 10 complete kits, valid 32-step patterns, velocities, pitched notes, swing duration and scheduled synthesis.');
