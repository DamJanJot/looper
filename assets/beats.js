(function (root, factory) {
  const beats = factory();
  if (typeof module === 'object' && module.exports) module.exports = beats;
  else root.LooperBeats = beats;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  // Shared track order: kick, snare, closed/open hat, clap, shaker, rim,
  // low/high tom, ride, bass, electric piano, minor chord, pluck, crash, conga.
  const sounds = ['kick-deep','snare-tight','hat-closed','hat-open','clap-short','shaker','rim','tom-low','tom-high','ride','bass-sub','epiano','chord-minor','pluck-soft','crash','perc-conga'];
  const levels = [.78,.52,.32,.28,.38,.25,.35,.42,.32,.2,.42,.25,.22,.24,.18,.3];
  const hit = (step, velocity = 1, semitones = 0) => ({step, velocity, semitones});
  const every = (start, interval, velocity = .7) => Array.from({length: Math.ceil((32-start)/interval)}, (_, i) => hit(start+i*interval, i%2 ? velocity*.75 : velocity));
  const repeat = values => [...values, ...values.map(value => typeof value === 'number' ? value+16 : {...value,step:value.step+16})];
  const presets = {
    'Neon House': {genre:'House', bpm:124, swing:0, description:'Równa stopa, klask na dwa i cztery, lekki bas C-moll.',
      tracks:{0:every(0,4,1),4:every(4,8,.85),2:every(2,4,.65),3:[6,14,22,30],5:every(1,2,.4),10:[hit(0,.8),hit(6,.65,7),hit(10,.75),hit(16,.8),hit(22,.65,3),hit(26,.75,7)],12:[hit(2,.7),hit(10,.5),hit(18,.7),hit(26,.5)]}},
    'Lo-Fi Sunday': {genre:'Lo-fi', bpm:78, swing:.18, description:'Miękka stopa, ciepłe klawisze i spokojnie kołyszący rytm.', kit:{0:'kick-lofi',1:'snare-fat'},
      tracks:{0:[0,hit(7,.65),10,16,22,hit(27,.7)],1:[4,12,20,28],2:every(0,2,.48),6:[hit(11,.35),hit(26,.3)],10:[hit(0,.8),hit(14,.55,7),hit(16,.75,3),hit(30,.55,7)],11:[hit(0,.7),hit(8,.4,7),hit(16,.7,3),hit(24,.4,10)]}},
    'Boom Bap 90': {genre:'Hip-hop', bpm:90, swing:.14, description:'Cięższy werbel, synkopowana stopa i oszczędny subbas.', kit:{0:'kick-punch',1:'snare-fat'},
      tracks:{0:[0,hit(6,.85),10,16,hit(19,.7),23,26],1:[4,12,20,28,hit(31,.3)],2:every(0,2,.58),3:[14,30],10:[hit(0,.85),hit(10,.65),hit(16,.85,-2),hit(26,.7,3)]}},
    'Trap 808': {genre:'Trap', bpm:140, swing:0, description:'Werbel w półtempie, krótkie rolki hi-hatu i bas 808.', kit:{0:'kick-click',1:'snare-crack',10:'bass-808'},
      tracks:{0:[0,6,hit(11,.65),16,19,hit(27,.7),30],1:[8,24],2:[...every(0,2,.5),hit(13,.35),hit(15,.5),hit(27,.35),hit(29,.45),hit(31,.55)],4:[hit(8,.5),hit(24,.5)],10:[hit(0,.8),hit(6,.6),hit(16,.8,-2),hit(27,.65,3)],13:[hit(2,.5,12),hit(14,.35,7),hit(18,.5,10),hit(30,.35,7)]}},
    'Pocket Funk': {genre:'Funk', bpm:108, swing:.09, description:'Żywy groove ze stopą, ghost notes i krótkim basem.', kit:{0:'kick-punch',10:'bass-pluck'},
      tracks:{0:repeat([0,hit(3,.7),7,10,hit(14,.75)]),1:repeat([4,hit(9,.25),12,hit(15,.3)]),2:every(0,2,.6),3:[7,23],6:[hit(6,.4),hit(22,.4)],10:[hit(0,.8),hit(3,.6,12),hit(7,.7,7),hit(10,.8,10),hit(16,.8),hit(19,.6,7),hit(23,.7,3),hit(26,.8,7)]}},
    'Warehouse Techno': {genre:'Techno', bpm:132, swing:0, description:'Sucha, mocna stopa, offbeat i metaliczna perkusja.', kit:{0:'kick-tech'},
      tracks:{0:every(0,4,1),4:every(4,8,.65),2:every(2,4,.65),3:[6,14,22,30],9:[0,8,16,24],6:[hit(3,.45),hit(11,.35),hit(19,.45),hit(27,.35)],10:every(2,4,.55)}},
    'Liquid DnB': {genre:'Drum & bass', bpm:172, swing:0, description:'Szybki łamany rytm z miękkim basem i akordem C-moll.', kit:{0:'kick-punch',1:'snare-crack'},
      tracks:{0:[0,10,16,hit(22,.7),26],1:[4,12,20,28,hit(31,.25)],2:every(0,2,.5),3:[6,14,22,30],10:[hit(0,.8),hit(10,.6,7),hit(16,.8,3),hit(26,.6,10)],12:[hit(0,.6),hit(16,.6,3)]}},
    'UK Garage': {genre:'Garage', bpm:130, swing:.22, description:'Dwukrokowy rytm, przesunięte hi-haty i ciepły bas.',
      tracks:{0:[0,7,10,16,23,26],1:[4,12,20,28],2:[hit(2,.6),hit(5,.35),hit(8,.5),hit(11,.4),hit(14,.6),hit(18,.6),hit(21,.35),hit(24,.5),hit(27,.4),hit(30,.6)],3:[6,22],10:[hit(0,.8),hit(7,.65,7),hit(16,.8,3),hit(23,.65,10)],11:[hit(2,.6),hit(14,.45,7),hit(18,.6,3),hit(30,.45,10)]}},
    'Sunset Afro': {genre:'Afro house', bpm:118, swing:.05, description:'Stopa house, przeplatające się conga, shaker i rim.',
      tracks:{0:every(0,4,.9),4:every(4,8,.65),5:every(0,2,.55),6:[3,10,19,26],15:[hit(2,.65),hit(7,.8),hit(11,.5),hit(14,.7),hit(18,.65),hit(23,.8),hit(27,.5),hit(30,.7)],10:[hit(0,.75),hit(10,.6,7),hit(16,.75,3),hit(26,.6,7)]}},
    'Disco Night': {genre:'Disco', bpm:116, swing:.03, description:'Taneczna stopa, klask, otwarty hi-hat i sprężysty bas.', kit:{0:'kick-punch',10:'bass-pluck'},
      tracks:{0:every(0,4,.95),1:every(4,8,.75),4:every(4,8,.4),2:every(0,2,.45),3:every(2,4,.6),10:[hit(0,.75),hit(3,.55,12),hit(6,.65,7),hit(10,.7,10),hit(14,.55,7),hit(16,.75,3),hit(19,.55,15),hit(22,.65,10),hit(26,.7,7),hit(30,.55,10)]}}
  };

  function kitFor(preset) { return sounds.map((sound, i) => ({sound:preset.kit?.[i] || sound, gain:levels[i]*.8})); }
  function stepDuration(bpm, swing, step) { return 60 / bpm / 4 * (1 + (step % 2 ? -swing : swing)); }
  const noiseBuffers = new WeakMap();
  function noiseBuffer(ctx) {
    if (!noiseBuffers.has(ctx)) {
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      let seed = 1937;
      const data = buffer.getChannelData(0);
      for (let i=0;i<data.length;i++) { seed=(seed*1664525+1013904223)>>>0; data[i]=seed/2147483648-1; }
      noiseBuffers.set(ctx, buffer);
    }
    return noiseBuffers.get(ctx);
  }
  function renderSound(ctx, dest, id, time, rate=1, gain=1) {
    const t = Math.max(time, ctx.currentTime);
    function envelope(duration, level, attack=.002) {
      const node = ctx.createGain();
      node.gain.value = 0;
      node.gain.setValueAtTime(0,t);
      node.gain.linearRampToValueAtTime(level,t+attack);
      node.gain.exponentialRampToValueAtTime(.0001,t+duration);
      node.connect(dest);
      return node;
    }
    function tone(type, frequency, duration, level, endFrequency, attack=.002) {
      const osc = ctx.createOscillator(), env = envelope(duration,level,attack);
      osc.type=type;
      osc.frequency.setValueAtTime(frequency*rate,t);
      if (endFrequency) osc.frequency.exponentialRampToValueAtTime(endFrequency*rate,t+duration*.65);
      osc.connect(env); osc.start(t); osc.stop(t+duration+.01);
      osc.onended=()=>{osc.disconnect();env.disconnect();};
    }
    function hiss(duration, level, frequency, type='highpass', offset=0) {
      const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter(), env=ctx.createGain();
      env.gain.value = 0;
      source.buffer=noiseBuffer(ctx); filter.type=type; filter.frequency.value=frequency; filter.Q.value=.65;
      env.gain.setValueAtTime(0,t+offset);
      env.gain.linearRampToValueAtTime(level,t+offset+.001);
      env.gain.exponentialRampToValueAtTime(.0001,t+offset+duration);
      source.connect(filter).connect(env).connect(dest);
      source.start(t+offset); source.stop(t+offset+duration+.01);
      source.onended=()=>{source.disconnect();filter.disconnect();env.disconnect();};
    }
    if (id.startsWith('kick-')) {
      const settings = {'kick-deep':[145,48,.36],'kick-punch':[175,52,.23],'kick-click':[180,50,.18],'kick-boom':[120,36,.5],'kick-tech':[155,46,.28],'kick-lofi':[105,53,.25]}[id];
      if (!settings) return false;
      tone('sine',settings[0],settings[2],gain*.68,settings[1]);
      hiss(.012,gain*(id==='kick-lofi'?.025:.065),2800);
    } else if (id.startsWith('snare-')) {
      const fat=id==='snare-fat', tight=id==='snare-tight';
      hiss(tight?.11:fat?.22:.17,gain*.38,1600,'highpass');
      tone('triangle',fat?175:205,.085,gain*.18,125);
      tone('sine',fat?330:365,.05,gain*.07);
    } else if (id.startsWith('hat-') || id==='shaker') {
      const open=id==='hat-open';
      hiss(open?.22:id==='shaker'?.055:.035,gain*.24,open?6500:8500);
    } else if (id.startsWith('clap-')) {
      [0,.012,.025].forEach(offset=>hiss(.025,gain*.22,1100,'bandpass',offset));
      hiss(id==='clap-wide'?.2:.1,gain*.19,1350,'bandpass',.038);
    } else if (id==='rim') {
      tone('triangle',820,.026,gain*.25); tone('sine',1720,.018,gain*.12);
    } else if (id.startsWith('tom-') || id==='perc-conga') {
      const f={'tom-low':140,'tom-mid':210,'tom-high':290,'perc-conga':240}[id];
      if (!f) return false;
      tone('sine',f,.18,gain*.45,f*.6); hiss(.012,gain*.045,1600);
    } else if (id==='ride' || id==='crash') {
      hiss(id==='crash'?.65:.35,gain*.18,5500);
      [3200,4320,6100].forEach(f=>tone('sine',f,.3,gain*.018));
    } else if (['bass-sub','bass-808','bass-pluck'].includes(id)) {
      // C2 root; all melodic preset tracks share a C-minor palette.
      tone('sine',id==='bass-808'?90:65.406,id==='bass-808'?.45:.24,gain*.58,id==='bass-808'?65.406:undefined,.006);
      tone('triangle',65.406,id==='bass-pluck'?.13:.2,gain*.1,undefined,.004);
    } else if (id==='epiano' || id==='chord-minor') {
      [0,3,7,10].forEach(semitone=>{
        const f=130.813*2**(semitone/12);
        tone('sine',f,.72,gain*.15,undefined,.008);
        tone('sine',f*2,.2,gain*.035,undefined,.006);
      });
    } else if (id==='pluck-soft') {
      tone('triangle',523.251,.2,gain*.25,undefined,.004);
    } else return false;
    return true;
  }
  return {presets, kitFor, stepDuration, renderSound};
});
