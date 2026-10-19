# MIDI Trainer, Loop Station & Drum Pads

A browser-based MIDI learning and music-making workstation built with the **Web MIDI API**, **Web Audio API**, vanilla JavaScript, and optional PHP persistence.

The project originally started as a loop station and pad sequencer. Its current main focus is the **MIDI Trainer**: an interactive full-screen practice mode with falling notes, real-time keyboard feedback, lessons, scoring, and support for USB MIDI controllers.

<p align="center">
  <img src="https://github.com/user-attachments/assets/568732e8-70a3-4f05-ad5b-b372bb71d87b" alt="MIDI Trainer interface" width="100%">
</p>

## Main modules

### MIDI Trainer


 <a href="https://code-d.j.pl/looper/trainer.html">Link MIDI Trainer --></a> 

The trainer is the primary learning experience in the project.

- Full-screen practice interface inspired by rhythm games
- Falling notes aligned with a visual piano keyboard
- Real-time note recognition from a connected USB MIDI controller
- Score, combo, hit, and miss tracking
- Adjustable tempo from 50 to 150 BPM
- Lesson preview mode before starting an exercise
- Transposable 32-key range with octave controls
- Visual recreation of the M-Audio Keystation Mini 32 layout
- On-screen keyboard interaction with mouse or touch
- Built-in lessons covering scales, melodies, black keys, bass patterns, and the full keyboard range
- Pitch-class-based exercises designed to work well with compact MIDI keyboards

Open `trainer.html` to launch the dedicated trainer interface.

<img width="1919" height="913" alt="Zrzut ekranu 2026-10-20 000821" src="https://github.com/user-attachments/assets/2e31dc57-5412-41a8-bf9c-5f7e1e756cda" />


### Live MIDI Keyboard

The main workstation includes a playable 32-key virtual piano that mirrors notes received from a physical MIDI controller.

- Live highlighting of active MIDI notes
- Multiple synthesized instruments
- Octave shifting
- Adjustable MIDI volume
- MIDI preset save, load, import, and export
- Computer keyboard input as an alternative to a MIDI device
- Instrument mode, pad-trigger mode, and chromatic pad mode

### Drum Pads and Sound Bank

- 16 configurable performance pads
- More than 60 synthesized sounds
- Drums, percussion, basses, pianos, chords, pads, leads, effects, and vocal sounds
- Custom computer-key mappings
- Random kit generation
- Kit save and load through `localStorage`
- JSON kit import and export

### Step Sequencer

- 16- or 32-step sequencing
- Per-pad pattern programming
- BPM and swing controls
- Built-in rhythm presets
- Animated playhead

### Sampler and Audio Editor

- Microphone recording through the browser
- Waveform preview
- Start and end trimming
- Crop, reverse, normalize, pitch, and gain controls
- Assign recordings directly to pads
- Automatic eight-slice sample chopping across pads 9–16
- Optional upload through the PHP backend

### Loop Station

- Record and layer microphone loops
- Independent loop gain and playback-rate controls
- Mute and remove individual layers
- Export the mix as a WAV file

### Effects

The audio chain includes:

- Low-pass, high-pass, band-pass, and notch filters
- Delay with time, feedback, and wet-mix controls
- Algorithmic reverb
- Drive distortion
- Bitcrusher

## Screenshots

### MIDI Trainer

<p align="center">
  <img src="https://github.com/user-attachments/assets/568732e8-70a3-4f05-ad5b-b372bb71d87b" alt="Falling-note MIDI Trainer" width="100%">
</p>

### Music Workstation

<p align="center">
  <img src="https://github.com/user-attachments/assets/95c068fc-3031-46d6-8cf3-75cfcda7278f" alt="Loop station, drum pads, sequencer, and MIDI keyboard" width="75%">
</p>

## Technology

- HTML5
- CSS3
- Vanilla JavaScript
- Web MIDI API
- Web Audio API
- MediaDevices and MediaRecorder APIs
- Canvas API
- `localStorage`
- Optional PHP endpoints for project persistence and audio uploads

No frontend framework or external audio library is required.

## Getting started

### Static version

The static application can be served with any local HTTP server or deployed through GitHub Pages.

```bash
git clone https://github.com/DamJanJot/looper.git
cd looper
python -m http.server 8080
```

Then open:

```text
http://localhost:8080/trainer.html
```

Use `index.html` to open the full music workstation.

### PHP version

To enable PHP-based project saving and sample uploads, place the repository in a PHP-capable web server and open:

```text
index.php
```

## Connecting a MIDI controller

Web MIDI works best in Chromium-based browsers such as Chrome or Edge.

1. Connect the USB MIDI keyboard to the computer.
2. Serve the application through `localhost` or HTTPS.
3. Open `trainer.html` or the main workstation.
4. Click **MIDI** or **Connect MIDI**.
5. Allow the browser to access the MIDI device.
6. Select a lesson and start playing.

The interface was designed around the 32-key range of the **M-Audio Keystation Mini 32**, but other class-compliant MIDI controllers should also work.

## Trainer hardware controls

- Falling-note lanes track the actual piano position and width, including responsive layouts. The lower edge of a note reaches the play line at its scheduled hit time.
- The side panel only displays received MIDI state. Clicking its octave, REC, Edit, sustain, PB or MOD indicators does nothing. The separate on-screen octave buttons have been removed.
- Sustain (CC64) and volume (CC7) are supported. Modulation (CC1) and pitch bend update their indicators; they do not yet alter the trainer synthesizer sound.
- Open **Ustawienia MIDI** to learn a physical CC or Program Change button for octave down/up, recording or editing. CC buttons activate at values of 64 or greater and re-arm below 64. Assignments are stored locally per MIDI input and channel; reconnecting with a different input identifier may require learning again. A learned action replaces the default trainer function of that message.
- REC captures up to 2048 MIDI notes within the current range as a custom lesson at the selected tempo. It stores note order in localStorage, without audio, note durations or original timing. Starting REC again begins a new recording.
- A learned physical Edit button opens the recorded-note editor. Press it again to save valid note numbers within the current range; Escape cancels.
- **Keystation Mini 32 limitation:** default Octave and Edit buttons operate internally and do not send a separate click or LED-state message. Their state cannot reliably be inferred from arbitrary played notes. After changing the hardware octave, select **Kalibruj** and play the leftmost C (C1 through C5 supported). The page adjusts its range and keeps the corresponding octave indicator green. It does not send LED commands to the device. Learning requires a control that actually sends CC or Program Change; the internal Edit button cannot be learned this way.
- Incoming MIDI notes are never transposed a second time. Learned octave controls change the displayed and lesson range.

Hardware reference: [M-Audio Keystation Mini 32 MK3 User Guide](https://cdn.inmusicbrands.com/m-audio/maudio_documentation/KeystationMini32MK3-UserGuide-v1.0.pdf).

Local regression checks: run `node tests/trainer-midi.test.cjs`. These simulate MIDI and do not verify a connected USB controller.

## Project structure

```text
.
├── index.html          # Static music workstation
├── index.php           # PHP-enabled workstation
├── trainer.html        # Dedicated MIDI Trainer
├── assets/
│   ├── app.js          # Workstation, pads, sequencer, sampler, and MIDI logic
│   ├── style.css       # Main workstation styles
│   ├── trainer.js      # Trainer lessons, scoring, MIDI, and note animation
│   └── trainer.css     # Trainer interface styles
├── save_project.php    # Optional server-side project persistence
└── upload.php          # Optional recorded-audio upload endpoint
```

## Browser requirements

For the complete feature set, use a recent version of Chrome or Edge.

The application requires a secure context for some browser APIs:

- `https://`
- or `http://localhost`

Opening files directly through `file://` may prevent MIDI, microphone, or server requests from working correctly.

## Data and storage notes

Projects, kits, and MIDI presets can be stored in the browser through `localStorage`.

Recorded samples embedded in exported kits are encoded into JSON. Long recordings can therefore generate very large files, so short samples are recommended for pad kits.

## Current direction

The next stage of development is centered on turning the trainer into a more complete learning platform, while retaining the workstation as a creative practice environment.

Planned areas include:

- More songs, scales, chords, and structured lessons
- Difficulty levels and progressive exercises
- Timing accuracy and performance summaries
- Custom lesson creation
- Persistent progress and personal best scores
- Improved support for different MIDI keyboard sizes
- Better mobile and tablet interaction
- Deeper integration between the trainer, pads, sequencer, and looper

## Status

This is an experimental project under active development. Features, UI structure, and data formats may change.

## License

No license has been added yet. Until a license is provided, the source code remains under the default copyright rules.
