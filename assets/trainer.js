(() => {
const $ = id => document.getElementById(id);
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const HOME_BASE = 48;
const COUNT = 32;
const MIN_SHIFT = -2;
const MAX_SHIFT = 2;
const BLACK = new Set([1, 3, 6, 8, 10]);
const LESSONS = [
  {id: 'c3-five', name: 'C3-D3-E3-F3-G3', bpm: 68, notes: [48, 50, 52, 53, 55, 53, 52, 50, 48]},
  {id: 'c-major', name: 'Skala C-dur C4-C5', bpm: 78, notes: [60, 62, 64, 65, 67, 69, 71, 72, 71, 69, 67, 65, 64, 62, 60]},
  {id: 'ode', name: 'Oda do radosci', bpm: 84, notes: [64, 64, 65, 67, 67, 65, 64, 62, 60, 60, 62, 64, 64, 62, 62]},
  {id: 'black-keys', name: 'Czarne klawisze: C# D# F# G# A#', bpm: 66, notes: [49, 51, 54, 56, 58, 56, 54, 51, 49]},
  {id: 'left-hand', name: 'Bas: C3 G3 A3 F3', bpm: 70, notes: [48, 55, 57, 53, 48, 55, 57, 53, 52, 55, 57, 53]},
  {id: 'full-range', name: 'Przejazd C3-G5', bpm: 96, notes: Array.from({length: 32}, (_, i) => HOME_BASE + i)}
];

let ctx;
let master;
let midiAccess;
let octaveShift = 0;
let sustainOn = false;
let noteLayout = new Map();
const deviceTimers = new Map();
const state = {
  mode: 'idle',
  events: [],
  raf: null,
  timers: [],
  start: 0,
  lead: 2600,
  window: 390,
  score: 0,
  combo: 0,
  hits: 0,
  misses: 0
};

function status(msg) {
  $('status').textContent = msg;
}

function pitchClass(note) {
  return ((note % 12) + 12) % 12;
}

function noteName(note) {
  return NOTE_NAMES[pitchClass(note)] + (Math.floor(note / 12) - 1);
}

function rangeStart() {
  return HOME_BASE + octaveShift * 12;
}

function rangeEnd() {
  return rangeStart() + COUNT - 1;
}

function rangeText() {
  return noteName(rangeStart()) + '-' + noteName(rangeEnd());
}

function transpose(note) {
  return note + octaveShift * 12;
}

function laneOf(note) {
  return note - rangeStart();
}

function inRange(note) {
  return note >= rangeStart() && note <= rangeEnd();
}

function isBlack(note) {
  return BLACK.has(pitchClass(note));
}

function tempo() {
  return +$('tempoInput').value || selectedLesson().bpm;
}

function buildPhysicalLayout(base) {
  const notes = Array.from({length: COUNT}, (_, i) => base + i);
  const whites = notes.filter(note => !isBlack(note));
  const whiteIndex = new Map(whites.map((note, index) => [note, index]));
  const whiteW = 100 / whites.length;
  const blackW = whiteW * .58;
  const layout = new Map();

  notes.forEach(note => {
    if (!isBlack(note)) {
      const index = whiteIndex.get(note);
      layout.set(note, {left: index * whiteW, width: whiteW});
      return;
    }

    let previous = note - 1;
    while (previous >= base && isBlack(previous)) previous--;
    const previousIndex = whiteIndex.get(previous) ?? 0;
    const left = Math.max(0, Math.min(100 - blackW, (previousIndex + 1) * whiteW - blackW / 2));
    layout.set(note, {left, width: blackW});
  });

  return layout;
}

function layoutFor(note) {
  return noteLayout.get(note) || {
    left: Math.max(0, Math.min(100 - 100 / COUNT, laneOf(note) * 100 / COUNT)),
    width: 100 / COUNT
  };
}

function splitNoteLabel(note) {
  return noteName(note).replace(/([A-G]#?)(-?\d)/, '$1<br>$2');
}

function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain();
  master.gain.value = .75;
  master.connect(ctx.destination);
  status('audio gotowe');
}

function playTone(note, vel = 1, dur = .62) {
  initAudio();
  const finalDur = sustainOn ? Math.max(dur, 1.18) : dur;
  const t = ctx.currentTime;
  const f = 440 * Math.pow(2, (note - 69) / 12);
  const v = Math.max(.08, vel) * .25;
  const out = ctx.createGain();

  out.gain.setValueAtTime(v, t);
  out.gain.exponentialRampToValueAtTime(.001, t + finalDur);
  [1, 2.01, 3.01].forEach((m, i) => {
    const o = ctx.createOscillator();
    o.type = i ? 'sine' : 'triangle';
    o.frequency.value = f * m;
    o.connect(out);
    o.start(t);
    o.stop(t + finalDur);
  });
  out.connect(master);
}

function renderLessons() {
  const select = $('lessonSelect');
  LESSONS.forEach(lesson => {
    const option = document.createElement('option');
    option.value = lesson.id;
    option.textContent = lesson.name;
    select.appendChild(option);
  });
  select.value = LESSONS[0].id;
  $('tempoInput').value = LESSONS[0].bpm;
  updateHud();
}

function selectedLesson() {
  return LESSONS.find(lesson => lesson.id === $('lessonSelect').value) || LESSONS[0];
}

function renderBoard() {
  const lanes = $('laneLayer');
  const keys = $('keyboard');
  const notes = $('noteLayer');
  const base = rangeStart();

  noteLayout = buildPhysicalLayout(base);
  lanes.innerHTML = '';
  keys.innerHTML = '';
  notes.innerHTML = '';
  $('rangeLabel').textContent = rangeText();
  $('rangeTitle').textContent = rangeText();
  $('railRange').textContent = rangeText();

  for (let i = 0; i < COUNT; i++) {
    const note = base + i;
    const layout = layoutFor(note);
    const lane = document.createElement('div');
    lane.className = 'lane ' + (isBlack(note) ? 'black-lane ' : '') + (pitchClass(note) === 0 ? 'c-lane' : '');
    lane.style.left = layout.left + '%';
    lane.style.width = layout.width + '%';
    lane.innerHTML = '<span class="lane-label">' + noteName(note) + '</span>';
    lanes.appendChild(lane);

    const key = document.createElement('button');
    key.type = 'button';
    key.className = 'key ' + (isBlack(note) ? 'black' : 'white');
    key.dataset.note = note;
    key.style.left = layout.left + '%';
    key.style.width = layout.width + '%';
    key.innerHTML =
      '<span class="key-body">' +
        (pitchClass(note) === 0 ? '<i class="octave-mark">' + noteName(note) + '</i>' : '') +
        '<span class="note-name">' + splitNoteLabel(note) + '</span>' +
        '<span class="note-midi">' + note + '</span>' +
      '</span>';
    key.onpointerdown = () => handleNoteOn(note, 1);
    key.onpointerup = () => handleNoteOff(note);
    key.onpointerleave = () => handleNoteOff(note);
    keys.appendChild(key);
  }
}

function buildEvents() {
  const beat = 60000 / tempo();
  let cursor = state.lead + 600;
  return selectedLesson().notes.map((note, index) => {
    const ev = {note: transpose(note), index, time: cursor, status: 'pending', el: null};
    cursor += beat;
    return ev;
  });
}

function setupNotes() {
  state.events = buildEvents();
  $('noteLayer').innerHTML = '';
  state.events.forEach(ev => {
    const n = document.createElement('div');
    n.className = 'fall-note ' + (isBlack(ev.note) ? 'black-note' : '');
    n.textContent = noteName(ev.note);
    $('noteLayer').appendChild(n);
    ev.el = n;
  });
  updateHud();
}

function resetStats() {
  state.score = 0;
  state.combo = 0;
  state.hits = 0;
  state.misses = 0;
}

function updateHud() {
  const next = state.events.find(e => e.status === 'pending');
  $('tempoLabel').textContent = tempo() + ' BPM';
  $('nextNote').textContent = next ? noteName(next.note) : '--';
  $('score').textContent = state.score;
  $('combo').textContent = state.combo;
  $('hits').textContent = state.hits + ' / ' + state.misses;
  document.querySelectorAll('.key.target').forEach(key => key.classList.remove('target'));
  if (next) {
    const key = document.querySelector(`.key[data-note="${next.note}"]`);
    if (key) key.classList.add('target');
  }
}

function stop(show = true) {
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = null;
  state.timers.forEach(clearTimeout);
  state.timers = [];
  const was = state.mode !== 'idle';
  state.mode = 'idle';
  if (show && was) status('stop');
}

function pulseDevice(id, ms = 210) {
  const el = $(id);
  if (!el) return;
  el.classList.add('is-pressed');
  clearTimeout(deviceTimers.get(id));
  deviceTimers.set(id, setTimeout(() => el.classList.remove('is-pressed'), ms));
}

function toggleSustain() {
  sustainOn = !sustainOn;
  const el = $('deviceSust');
  if (el) {
    el.classList.toggle('is-locked', sustainOn);
    el.setAttribute('aria-pressed', sustainOn ? 'true' : 'false');
  }
  pulseDevice('deviceSust', 170);
  status(sustainOn ? 'sustain wlaczony' : 'sustain wylaczony');
}

function shiftOctave(delta) {
  pulseDevice(delta < 0 ? 'deviceOctDown' : 'deviceOctUp');
  const next = Math.max(MIN_SHIFT, Math.min(MAX_SHIFT, octaveShift + delta));
  if (next === octaveShift) {
    status('zakres: ' + rangeText());
    return;
  }
  stop(false);
  octaveShift = next;
  renderBoard();
  setupNotes();
  status('zakres: ' + rangeText());
}

function start() {
  initAudio();
  stop(false);
  resetStats();
  setupNotes();
  state.mode = 'lesson';
  state.start = performance.now();
  status('start');
  loop();
}

function preview() {
  initAudio();
  pulseDevice('deviceEdit');
  stop(false);
  resetStats();
  setupNotes();
  state.mode = 'preview';
  state.start = performance.now();
  state.timers = state.events.map(ev => setTimeout(() => {
    playTone(ev.note, .9, .45);
    flashKey(ev.note, 'down', 180);
    ev.el?.classList.add('preview');
    setTimeout(() => ev.el?.classList.remove('preview'), 160);
  }, ev.time));
  status('odsłuch');
  loop();
}

function flashKey(note, cls = 'down', ms = 180) {
  const key = document.querySelector(`.key[data-note="${note}"]`);
  if (!key) return;
  key.classList.add(cls);
  setTimeout(() => key.classList.remove(cls), ms);
}

function handleNoteOn(note, vel = 1) {
  initAudio();
  playTone(note, vel);
  if (!inRange(note)) {
    status('poza zakresem: ' + noteName(note));
    return;
  }
  flashKey(note, 'down', 170);
  judge(note);
}

function handleNoteOff(note) {
  const key = document.querySelector(`.key[data-note="${note}"]`);
  if (key) key.classList.remove('down');
}

function judge(note) {
  if (state.mode !== 'lesson') return;
  const elapsed = performance.now() - state.start;
  const hit = state.events
    .filter(e => e.status === 'pending')
    .map(e => ({e, d: Math.abs(elapsed - e.time)}))
    .filter(x => x.d <= state.window)
    .sort((a, b) => a.d - b.d)[0];

  if (!hit) return;
  if (hit.e.note === note) {
    hit.e.status = 'hit';
    hit.e.el?.classList.add('hit');
    state.hits++;
    state.combo++;
    state.score += 100 + Math.min(state.combo, 20) * 10;
    status('trafiono ' + noteName(note));
  } else {
    state.misses++;
    state.combo = 0;
    flashKey(note, 'wrong', 260);
    status('cel: ' + noteName(hit.e.note));
  }
  updateHud();
}

function loop() {
  if (state.mode === 'idle') return;
  const stage = $('stage');
  const elapsed = performance.now() - state.start;
  const hitY = stage.clientHeight - 45;
  let changed = false;

  state.events.forEach(ev => {
    const layout = layoutFor(ev.note);
    const inset = layout.width < 3.4 ? 1 : 3;
    const y = (1 - (ev.time - elapsed) / state.lead) * hitY;
    if (ev.el) {
      ev.el.style.left = 'calc(' + layout.left + '% + ' + inset + 'px)';
      ev.el.style.width = 'calc(' + layout.width + '% - ' + inset * 2 + 'px)';
      ev.el.style.top = y + 'px';
      ev.el.style.opacity = (y < -60 || y > stage.clientHeight + 42) ? '0' : '1';
    }
    if (state.mode === 'lesson' && ev.status === 'pending' && elapsed - ev.time > state.window) {
      ev.status = 'miss';
      ev.el?.classList.add('miss');
      state.misses++;
      state.combo = 0;
      changed = true;
    }
  });

  if (changed) updateHud();
  const last = state.events[state.events.length - 1];
  if (last && elapsed > last.time + state.window + 900) {
    const finished = state.mode;
    state.mode = 'idle';
    state.raf = null;
    state.timers.forEach(clearTimeout);
    state.timers = [];
    status(finished === 'lesson' ? 'koniec: ' + state.score + ' pkt' : 'odsłuch zakończony');
    updateHud();
    return;
  }
  state.raf = requestAnimationFrame(loop);
}

async function connectMidi() {
  initAudio();
  if (!navigator.requestMIDIAccess) {
    $('midiStatus').textContent = 'MIDI: brak Web MIDI';
    return;
  }
  midiAccess = await navigator.requestMIDIAccess();
  const names = [];
  for (const input of midiAccess.inputs.values()) {
    names.push(input.name);
    input.onmidimessage = e => {
      const [cmd, note, vel] = e.data;
      const type = cmd & 240;
      if (type === 144 && vel > 0) handleNoteOn(note, vel / 127);
      else if (type === 128 || (type === 144 && vel === 0)) handleNoteOff(note);
    };
  }
  $('midiStatus').textContent = 'MIDI: ' + (names.join(', ') || 'brak wejść');
}

function bindHoldPads() {
  document.querySelectorAll('[data-hold-pad]').forEach(pad => {
    pad.addEventListener('pointerdown', () => pad.classList.add('is-pressed'));
    pad.addEventListener('pointerup', () => pad.classList.remove('is-pressed'));
    pad.addEventListener('pointerleave', () => pad.classList.remove('is-pressed'));
  });
}

function bind() {
  $('audioBtn').onclick = initAudio;
  $('midiBtn').onclick = connectMidi;
  $('startBtn').onclick = start;
  $('stopBtn').onclick = () => stop();
  $('previewBtn').onclick = preview;
  $('octaveDown').onclick = () => shiftOctave(-1);
  $('octaveUp').onclick = () => shiftOctave(1);
  $('deviceOctDown').onclick = () => shiftOctave(-1);
  $('deviceOctUp').onclick = () => shiftOctave(1);
  $('deviceSust').onclick = toggleSustain;
  $('deviceEdit').onclick = preview;
  $('lessonSelect').onchange = () => {
    stop(false);
    $('tempoInput').value = selectedLesson().bpm;
    setupNotes();
    status(selectedLesson().name);
  };
  $('tempoInput').oninput = () => {
    if (state.mode !== 'idle') stop(false);
    setupNotes();
  };
  document.addEventListener('keydown', e => {
    if (e.repeat) return;
    const key = [...document.querySelectorAll('.key')].find(k => k.dataset.hotkey === e.key.toLowerCase());
    if (key) handleNoteOn(+key.dataset.note, 1);
  });
  document.addEventListener('keyup', e => {
    const key = [...document.querySelectorAll('.key')].find(k => k.dataset.hotkey === e.key.toLowerCase());
    if (key) handleNoteOff(+key.dataset.note);
  });
  bindHoldPads();
}

renderLessons();
renderBoard();
setupNotes();
bind();
})();
