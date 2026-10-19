// Local regression checks. MIDI is simulated; this does not test USB hardware.
const {readFileSync} = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
class Element {
  constructor() {
    this.children = []; this.style = {setProperty() {}}; this.dataset = {};
    this.value = ''; this.textContent = ''; this.open = false; this.attributes = {};
    this.classes = new Set();
    this.classList = {
      add: (...names) => names.forEach(name => this.classes.add(name)),
      remove: (...names) => names.forEach(name => this.classes.delete(name)),
      toggle: (name, active) => active ? this.classes.add(name) : this.classes.delete(name),
      contains: name => this.classes.has(name)
    };
  }
  set className(value) { this.classes = new Set(value.split(' ')); }
  set innerHTML(value) { this.children = []; }
  get options() { return this.children; }
  appendChild(child) { this.children.push(child); }
  setAttribute(key, value) { this.attributes[key] = value; }
  addEventListener() {}
  showModal() { this.open = true; }
  close() { this.open = false; }
  getBoundingClientRect() { return {left: 0, width: 1000}; }
}
const elements = new Map();
const get = id => { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); };
get('lessonSelect').value = 'c3-five'; get('tempoInput').value = '68';
const storage = new Map();
const sandbox = {
  document: {
    addEventListener() {},
    getElementById: get, createElement: () => new Element(),
    querySelectorAll: () => [], querySelector: () => new Element()
  },
  localStorage: {getItem: key => storage.get(key), setItem: (key,value) => storage.set(key,value)},
  setTimeout: () => 1, clearTimeout() {}, cancelAnimationFrame() {},
  performance: {now: () => 1000}, navigator: {},
};
vm.createContext(sandbox);
let source = readFileSync(require('node:path').join(__dirname, '../assets/trainer.js'), 'utf8');
const entry = source.lastIndexOf('\nrenderLessons();');
assert(entry > 0);
source = source.slice(0, entry) + `
initAudio = () => {}; playTone = () => {};
globalThis.test = {receiveMidi, shiftOctave, renderBoard, setupNotes, bind, connectMidi,
  getShift: () => octaveShift, isRecording: () => recording,
  getRecorded: () => [...recorded], getMappings: () => mappings,
  getSustain: () => sustainOn};
})();`;
vm.runInContext(source, sandbox);
const api = sandbox.test;
api.bind(); api.renderBoard(); api.setupNotes();
const send = (...data) => api.receiveMidi(data, 'test-input');
function learn(action, cc) {
  get('midiAction').value = action;
  get('learnMidi').onclick();
  send(0xB0, cc, 127); // Learn must not execute the action.
  send(0xB0, cc, 0);
}
function press(cc) { send(0xB0, cc, 127); send(0xB0, cc, 0); }
assert.equal(get('deviceOctUp').onclick, undefined);
assert.equal(get('deviceEdit').onclick, undefined);
assert.equal(get('deviceRecord').onclick, undefined);
learn('octaveUp', 20);
assert.equal(api.getShift(), 0);
send(0xB0,20,127); send(0xB0,20,127);
assert.equal(api.getShift(),1, 'held CC must change octave only once');
assert(get('deviceOctUp').classList.contains('is-locked'));
assert.equal(get('deviceOctUp').attributes['aria-pressed'],'true');
api.receiveMidi([0xB0,20,127], 'other-input');
assert.equal(api.getShift(),1, 'mapping belongs to its MIDI input');
learn('octaveDown',21); press(21);
assert.equal(api.getShift(),0);
assert(!get('deviceOctUp').classList.contains('is-locked'));
press(21);
assert(get('deviceOctDown').classList.contains('is-locked'));
get('calibrateMidi').onclick(); send(0x90,48,100);
assert.equal(api.getShift(),0);
get('calibrateMidi').onclick(); send(0x90,49,100);
assert.equal(api.getShift(),0, 'invalid calibration must not move the range');
send(0x90,60,100); assert.equal(api.getShift(),1);
send(0xB0,64,127); assert.equal(api.getSustain(),true);
send(0xB0,64,0); assert.equal(api.getSustain(),false);
learn('record',22); press(22);
assert(api.isRecording());
send(0x90,60,100); send(0x90,62,100); send(0x90,62,0);
assert.deepEqual(Array.from(api.getRecorded()),[60,62]);
press(22); assert(!api.isRecording());
assert.equal(get('lessonSelect').value,'recorded');
assert.equal(storage.get('trainer-recorded-notes'),'[60,62]');
learn('edit',23); press(23);
assert(get('editDialog').open);
get('recordedNotes').value = 'bad'; press(23);
assert(get('editDialog').open, 'invalid notes must not close editor');
get('recordedNotes').value = '60 64 67'; press(23);
assert(!get('editDialog').open);
assert.deepEqual(Array.from(api.getRecorded()),[60,64,67]);
send(0xB0,1,100); assert(get('deviceMod').classList.contains('is-locked'));
send(0xB0,1,0); assert(!get('deviceMod').classList.contains('is-locked'));
send(0xE0,0,0); assert(get('devicePitchDown').classList.contains('is-locked'));
send(0xE0,0,64); assert(!get('devicePitchDown').classList.contains('is-locked'));
sandbox.navigator.requestMIDIAccess = async () => { throw Error('denied'); };
api.connectMidi().then(() => {
  assert(get('midiStatus').textContent.includes('brak dostępu'));
  console.log('PASS: MIDI mapping, edge detection, input isolation, octave indicators, calibration, sustain, recording, editing, PB/MOD and access errors.');
});
