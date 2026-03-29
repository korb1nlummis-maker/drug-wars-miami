// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Synthwave Music Engine
// Procedural 80s-style music using Web Audio API
// ============================================================

const MusicEngine = (() => {
  let ctx = null;
  let masterGain = null;
  let currentTrack = null;
  let currentTrackName = '';
  let isPlaying = false;
  let volume = 0.35;
  let scheduledNodes = [];
  let loopTimer = null;
  let sfxGain = null;
  let sfxMuted = false;
  let sfxVolume = 0.5;
  let mutedFlag = false;

  // Musical scales and chords
  const SCALES = {
    minor:     [0, 2, 3, 5, 7, 8, 10],
    dorian:    [0, 2, 3, 5, 7, 9, 10],
    phrygian:  [0, 1, 3, 5, 7, 8, 10],
    harmMinor: [0, 2, 3, 5, 7, 8, 11],
    pentatonic:[0, 3, 5, 7, 10],
  };

  // Note frequencies (A3 = 220Hz base)
  function noteFreq(note, octave = 3) {
    return 220 * Math.pow(2, (note / 12) + (octave - 3));
  }

  // Initialize audio context
  let initDone = false;

  function init() {
    if (ctx) {
      // Resume if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      // Ensure sfxGain exists even if context was created externally
      if (!sfxGain) {
        sfxGain = ctx.createGain();
        sfxGain.gain.value = sfxMuted ? 0 : sfxVolume;
        sfxGain.connect(ctx.destination);
      }
      return;
    }
    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);

      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.5;
      sfxGain.connect(ctx.destination);

      // Auto-resume on user interaction and start deferred track
      const resumeAudio = () => {
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().then(() => {
            // If a track was deferred while suspended, start it now
            if (currentTrackName && !isPlaying) {
              const deferred = currentTrackName;
              currentTrackName = ''; // Reset so playTrack doesn't skip it
              playlistMode = false;
              playTrack(deferred);
            }
          });
        }
      };
      document.addEventListener('click', resumeAudio, { once: false });
      document.addEventListener('keydown', resumeAudio, { once: false });
      initDone = true;
    } catch (e) {
      console.warn('Web Audio not available');
    }
  }

  // Voice polyphony limiter — free oldest voices when over 128
  function enforcePolyphonyLimit() {
    if (scheduledNodes.length > 128) {
      const excess = scheduledNodes.length - 96; // Free down to 96
      for (let i = 0; i < excess; i++) {
        try { scheduledNodes[i].stop(ctx.currentTime); scheduledNodes[i].disconnect(); } catch(e) {}
      }
      scheduledNodes.splice(0, excess);
    }
  }

  // Create a synth voice with envelope
  function createSynth(type, freq, startTime, duration, gainVal = 0.15, detune = 0) {
    if (!ctx) return null;
    enforcePolyphonyLimit();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = type;
    osc.frequency.value = freq;
    osc.detune.value = detune;

    filter.type = 'lowpass';
    filter.frequency.value = 2000 + Math.random() * 1000;
    filter.Q.value = 2;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.02);
    gain.gain.setValueAtTime(gainVal, startTime + duration - 0.05);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);

    scheduledNodes.push(osc);
    return { osc, gain, filter };
  }

  // Pad synth - lush chords with slow attack
  function createPad(freq, startTime, duration, gainVal = 0.08) {
    if (!ctx) return;
    enforcePolyphonyLimit();
    for (let d = -8; d <= 8; d += 8) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      osc.detune.value = d + (Math.random() * 4 - 2);

      filter.type = 'lowpass';
      filter.frequency.value = 1200;
      filter.Q.value = 1;

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.3);
      gain.gain.setValueAtTime(gainVal * 0.8, startTime + duration - 0.4);
      gain.gain.linearRampToValueAtTime(0, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.2);
      scheduledNodes.push(osc);
    }
  }

  // Bass synth with sub
  function createBass(freq, startTime, duration, gainVal = 0.2) {
    if (!ctx) return;
    enforcePolyphonyLimit();
    const osc = ctx.createOscillator();
    const sub = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    sub.type = 'sine';
    sub.frequency.value = freq / 2;

    filter.type = 'lowpass';
    filter.frequency.value = 600;
    filter.Q.value = 5;

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.01);
    gain.gain.setValueAtTime(gainVal * 0.7, startTime + duration * 0.6);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.connect(filter);
    sub.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    sub.start(startTime);
    osc.stop(startTime + duration + 0.1);
    sub.stop(startTime + duration + 0.1);
    scheduledNodes.push(osc, sub);
  }

  // Drum sounds
  function createKick(startTime) {
    if (!ctx) return;
    enforcePolyphonyLimit();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(30, startTime + 0.15);
    gain.gain.setValueAtTime(0.4, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.3);
    scheduledNodes.push(osc);
  }

  function createSnare(startTime) {
    if (!ctx) return;
    enforcePolyphonyLimit();
    // Noise burst
    const bufferSize = ctx.sampleRate * 0.1;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 1000;
    noiseGain.gain.setValueAtTime(0.2, startTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(masterGain);
    noise.start(startTime);
    noise.stop(startTime + 0.15);

    // Tonal component
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = 200;
    oscGain.gain.setValueAtTime(0.15, startTime);
    oscGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);
    osc.connect(oscGain);
    oscGain.connect(masterGain);
    osc.start(startTime);
    osc.stop(startTime + 0.1);
    scheduledNodes.push(osc);
  }

  function createHihat(startTime, open = false) {
    if (!ctx) return;
    enforcePolyphonyLimit();
    const bufferSize = ctx.sampleRate * (open ? 0.15 : 0.05);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 5000;
    gain.gain.setValueAtTime(open ? 0.08 : 0.06, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + (open ? 0.15 : 0.05));
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    noise.start(startTime);
    noise.stop(startTime + (open ? 0.2 : 0.06));
  }

  // Arpeggiator
  function createArp(notes, startTime, stepDuration, octave, gainVal = 0.06) {
    notes.forEach((note, i) => {
      createSynth('square', noteFreq(note, octave), startTime + i * stepDuration, stepDuration * 0.8, gainVal, Math.random() * 6 - 3);
    });
  }

  // ============================================================
  // TRACK DEFINITIONS
  // ============================================================

  // TITLE / MAIN MENU - Atmospheric, cinematic, 32 bars
  function scheduleTitleTrack(startTime) {
    const bpm = 108;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 32;

    // Extended Miami Vice progression with sections
    // A: Dm-Am, B: Bb-Gm, C: F-C, Bridge: Eb-A
    const chordProg = [
      // Section A - Intro (bars 0-7): pads only, building
      [2, 5, 9], [2, 5, 9], [9, 0, 4], [9, 0, 4],
      [2, 5, 9], [2, 5, 9], [9, 0, 4], [9, 0, 4],
      // Section B - Verse (bars 8-15): add bass + light drums
      [10, 2, 5], [10, 2, 5], [7, 10, 2], [7, 10, 2],
      [10, 2, 5], [10, 2, 5], [7, 10, 2], [9, 1, 4],
      // Section C - Chorus (bars 16-23): full arrangement
      [5, 9, 0], [0, 4, 7], [2, 5, 9], [9, 0, 4],
      [5, 9, 0], [0, 4, 7], [10, 2, 5], [7, 10, 2],
      // Section D - Bridge + Outro (bars 24-31): breakdown then resolve
      [3, 7, 10], [3, 7, 10], [9, 1, 4], [9, 1, 4],
      [2, 5, 9], [5, 9, 0], [9, 0, 4], [2, 5, 9],
    ];

    for (let b = 0; b < 32; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const section = b < 8 ? 'A' : b < 16 ? 'B' : b < 24 ? 'C' : 'D';

      // Pads - always present, intensity varies
      const padGain = section === 'A' ? 0.03 : section === 'C' ? 0.05 : 0.04;
      chord.forEach(note => {
        createPad(noteFreq(note, 4), t, bar, padGain);
        if (section === 'C' || section === 'D') {
          createPad(noteFreq(note, 3), t, bar, padGain * 0.4);
        }
      });

      // Bass - absent in intro
      if (section !== 'A' || b >= 4) {
        const bassGain = section === 'A' ? 0.06 : section === 'C' ? 0.14 : 0.10;
        createBass(noteFreq(chord[0], 2), t, beat * 2, bassGain);
        if (section === 'C') {
          createBass(noteFreq(chord[0], 2), t + beat * 2, beat * 2, bassGain * 0.8);
        }
      }

      // Drums - build through sections
      if (section !== 'A' || b >= 6) {
        for (let s = 0; s < 4; s++) {
          const st = t + s * beat;
          if (section === 'A') {
            if (s === 0) createKick(st);
            createHihat(st + beat * 0.5);
          } else if (section === 'B') {
            if (s === 0 || s === 2) createKick(st);
            if (s === 1 || s === 3) createSnare(st);
            createHihat(st, s === 2);
            createHihat(st + beat * 0.5);
          } else if (section === 'C') {
            createKick(st);
            if (s === 1 || s === 3) createSnare(st);
            createHihat(st);
            createHihat(st + beat * 0.25);
            createHihat(st + beat * 0.5, s === 2);
            createHihat(st + beat * 0.75);
          } else {
            // D - breakdown: sparse then build
            if (b < 28) {
              if (s === 0) createKick(st);
              if (s === 2) createHihat(st, true);
            } else {
              if (s === 0 || s === 2) createKick(st);
              if (s === 1 || s === 3) createSnare(st);
              createHihat(st, s === 2);
            }
          }
        }
      }

      // Arps - vary by section
      if (section === 'A' && b % 4 === 2) {
        createArp([chord[0], chord[1], chord[2], chord[1]], t, beat * 0.75, 5, 0.025);
      } else if (section === 'B' && b % 2 === 0) {
        createArp([chord[0], chord[1], chord[2], chord[1]], t, beat * 0.5, 5, 0.04);
      } else if (section === 'C') {
        const arpNotes = [chord[0], chord[1], chord[2], chord[1]];
        createArp(arpNotes, t, beat * 0.5, 5, 0.04);
        if (b % 2 === 1) createArp(arpNotes, t + beat * 2, beat * 0.5, 6, 0.03);
      } else if (section === 'D' && b >= 28) {
        createArp([chord[2], chord[1], chord[0]], t, beat * 0.66, 5, 0.035);
      }

      // Lead melody in chorus
      if (section === 'C' && b % 2 === 0) {
        const melody = [chord[2], chord[1], chord[0], chord[1], chord[2], chord[2], chord[1], chord[0]];
        for (let n = 0; n < melody.length; n++) {
          createSynth('sine', noteFreq(melody[n], 5), t + n * beat * 0.5, beat * 0.4, 0.035, 3);
        }
      }
    }
    return loopLen;
  }

  // MAIN GAME - Driving, confident, 32 bars with build/drop
  function scheduleGameTrack(startTime) {
    const bpm = 124;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 32;

    // Extended power progression
    const chordProg = [
      // A: Intro groove (bars 0-7)
      [4, 7, 11], [4, 7, 11], [0, 4, 7], [0, 4, 7],
      [2, 5, 9], [2, 6, 9], [9, 0, 4], [4, 7, 11],
      // B: Verse - driving (bars 8-15)
      [4, 7, 11], [0, 4, 7], [2, 5, 9], [9, 0, 4],
      [4, 7, 11], [0, 4, 7], [5, 9, 0], [7, 11, 2],
      // C: Chorus - peak energy (bars 16-23)
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [4, 7, 11],
      [0, 4, 7], [5, 9, 0], [2, 6, 9], [9, 0, 4],
      // D: Breakdown + rebuild (bars 24-31)
      [2, 5, 9], [2, 5, 9], [9, 0, 4], [9, 0, 4],
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [4, 7, 11],
    ];

    for (let b = 0; b < 32; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const section = b < 8 ? 'A' : b < 16 ? 'B' : b < 24 ? 'C' : 'D';
      const isBreakdown = section === 'D' && b < 28;

      // Pads
      const padGain = section === 'C' ? 0.035 : isBreakdown ? 0.04 : 0.025;
      chord.forEach(note => createPad(noteFreq(note, 4), t, bar, padGain));

      // Bass - driving 8ths, sparser in breakdown
      if (isBreakdown) {
        createBass(noteFreq(chord[0], 2), t, beat * 2, 0.12);
        createBass(noteFreq(chord[0], 2), t + beat * 3, beat, 0.10);
      } else {
        for (let i = 0; i < 8; i++) {
          const bassNote = i < 6 ? chord[0] : chord[1];
          const bassGain = section === 'C' ? 0.17 : 0.13;
          createBass(noteFreq(bassNote, 2), t + i * beat * 0.5, beat * 0.45, bassGain);
        }
      }

      // Drums
      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        if (isBreakdown) {
          if (s === 0) createKick(st);
          if (s === 2) createHihat(st, true);
          if (b === 27 && s >= 2) createSnare(st); // fill before rebuild
        } else if (section === 'A' && b < 4) {
          createKick(st);
          if (s === 2) createSnare(st);
          createHihat(st + beat * 0.5);
        } else {
          createKick(st);
          if (s === 1 || s === 3) createSnare(st);
          createHihat(st);
          createHihat(st + beat * 0.25);
          createHihat(st + beat * 0.5, s === 1);
          createHihat(st + beat * 0.75);
          if (section === 'C' && s === 0) createKick(st + beat * 0.5); // extra kick
        }
      }

      // Lead riff - varies by section
      if (section === 'A' && b % 2 === 0 && b >= 2) {
        const riff = [chord[2], chord[1], chord[0], chord[1]];
        for (let n = 0; n < riff.length; n++) {
          createSynth('square', noteFreq(riff[n], 5), t + n * beat * 0.5, beat * 0.4, 0.04, 5);
        }
      } else if (section === 'B') {
        if (b % 2 === 0) {
          const riff = [chord[2], chord[1], chord[0], chord[1], chord[2], chord[2], chord[1], chord[0]];
          for (let n = 0; n < riff.length; n++) {
            createSynth('square', noteFreq(riff[n], 5), t + n * beat * 0.5, beat * 0.4, 0.05, 5);
          }
        } else {
          createArp([chord[0], chord[2], chord[1], chord[0]], t, beat * 0.5, 5, 0.04);
        }
      } else if (section === 'C') {
        // Full energy lead + counter
        const riff = [chord[2], chord[1], chord[0], chord[1], chord[2], chord[2], chord[1], chord[0]];
        for (let n = 0; n < riff.length; n++) {
          createSynth('square', noteFreq(riff[n], 5), t + n * beat * 0.5, beat * 0.4, 0.055, 5);
        }
        if (b % 2 === 1) {
          createArp([chord[0], chord[2], chord[1], chord[0]], t + beat * 2, beat * 0.5, 6, 0.03);
        }
      } else if (!isBreakdown) {
        // Rebuild bars
        const riff = [chord[0], chord[1], chord[2], chord[1]];
        for (let n = 0; n < riff.length; n++) {
          createSynth('sawtooth', noteFreq(riff[n], 5), t + n * beat, beat * 0.8, 0.04, 4);
        }
      }
    }
    return loopLen;
  }

  // TRAVEL - Transitional, moving, exciting, 16 bars
  function scheduleTravelTrack(startTime) {
    const bpm = 130;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      // Rising (bars 0-3)
      [5, 9, 0], [7, 10, 2], [3, 7, 10], [5, 8, 0],
      // Cruising (bars 4-7)
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [9, 0, 4],
      // Ascending (bars 8-11)
      [2, 5, 9], [5, 9, 0], [7, 10, 2], [9, 0, 4],
      // Arrival (bars 12-15)
      [0, 4, 7], [2, 6, 9], [5, 9, 0], [7, 10, 2],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const rising = b < 4;
      const cruising = b >= 4 && b < 8;

      // Pads
      chord.forEach(note => createPad(noteFreq(note, 4), t, bar, rising ? 0.03 : 0.04));

      // Moving bass
      for (let i = 0; i < 8; i++) {
        const bassNote = chord[i % 3];
        createBass(noteFreq(bassNote, 2), t + i * beat * 0.5, beat * 0.4, rising ? 0.10 : 0.14);
      }

      // Drums
      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        createKick(st);
        if (s === 1 || s === 3) createSnare(st);
        for (let h = 0; h < 4; h++) {
          createHihat(st + h * beat * 0.25, h === 2);
        }
        if (!rising && s === 0) createKick(st + beat * 0.5); // extra drive
      }

      // Arp - ascending pattern, varies by section
      if (rising) {
        const arpNotes = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2] + 12, chord[0] + 12];
        for (let n = 0; n < arpNotes.length; n++) {
          createSynth('sawtooth', noteFreq(arpNotes[n] % 12, 5 + Math.floor(arpNotes[n] / 12)), t + n * beat * 0.33, beat * 0.28, 0.04);
        }
      } else if (cruising) {
        createArp([chord[0], chord[2], chord[1], chord[0]], t, beat * 0.5, 5, 0.045);
        createArp([chord[1], chord[0], chord[2], chord[1]], t + beat * 2, beat * 0.5, 6, 0.03);
      } else if (b < 12) {
        // Full ascending arps
        const ascend = [chord[0], chord[1], chord[2], chord[1] + 12, chord[2] + 12, chord[0] + 12, chord[1] + 12, chord[2]];
        for (let n = 0; n < ascend.length; n++) {
          createSynth('sawtooth', noteFreq(ascend[n] % 12, 5 + Math.floor(ascend[n] / 12)), t + n * beat * 0.5, beat * 0.4, 0.04);
        }
      } else {
        // Arrival - triumphant chords
        chord.forEach(note => createSynth('square', noteFreq(note, 5), t, beat * 2, 0.035, 3));
        createArp([chord[2], chord[1], chord[0]], t + beat * 2, beat * 0.5, 5, 0.04);
      }
    }
    return loopLen;
  }

  // COMBAT - Intense, aggressive, 16 bars with intensity waves
  function scheduleCombatTrack(startTime) {
    const bpm = 140;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      // Buildup (bars 0-3)
      [4, 7, 10], [3, 7, 10], [1, 4, 7], [0, 3, 7],
      // Full assault (bars 4-7)
      [4, 7, 10], [1, 4, 7], [3, 7, 10], [0, 3, 6],
      // Tension peak (bars 8-11)
      [0, 3, 7], [1, 4, 7], [3, 7, 10], [4, 7, 10],
      // Climax (bars 12-15)
      [0, 3, 6], [1, 4, 8], [3, 7, 10], [4, 7, 11],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const intensity = b < 4 ? 0.7 : b < 8 ? 1.0 : b < 12 ? 0.85 : 1.0;

      // Aggressive stabs - rhythmic pattern varies
      const stabPattern = b < 4 ? [0,1,0,1,0,0,1,0] : b < 12 ? [1,0,1,1,0,1,0,1] : [1,1,0,1,1,0,1,1];
      for (let s = 0; s < 8; s++) {
        if (stabPattern[s]) {
          chord.forEach(note => {
            createSynth('sawtooth', noteFreq(note, 4), t + s * beat * 0.5, beat * 0.15, 0.06 * intensity);
          });
        }
      }

      // Heavy bass
      for (let i = 0; i < 8; i++) {
        createBass(noteFreq(chord[0], 2), t + i * beat * 0.5, beat * 0.35, 0.2 * intensity);
      }

      // Drums - escalating aggression
      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        createKick(st);
        if (b >= 4) createKick(st + beat * 0.25); // double kick after buildup
        if (s === 1 || s === 3) createSnare(st);
        if (b >= 8 && (s === 0 || s === 2)) createSnare(st + beat * 0.75); // ghost snare
        for (let h = 0; h < 4; h++) {
          createHihat(st + h * beat * 0.25, h === 0);
        }
        // Extra percussion in climax
        if (b >= 12 && s === 2) createKick(st + beat * 0.5);
      }

      // Lead - different patterns per section
      if (b < 4 && b % 2 === 0) {
        const stab = [chord[2], chord[1], chord[0]];
        for (let n = 0; n < stab.length; n++) {
          createSynth('square', noteFreq(stab[n], 5), t + n * beat * 0.5, beat * 0.4, 0.045, 10);
        }
      } else if (b >= 4 && b < 12) {
        const stab = [chord[2], chord[1], chord[0], chord[1] - 1, chord[0]];
        for (let n = 0; n < stab.length; n++) {
          createSynth('square', noteFreq(stab[n], 5), t + n * beat * 0.4, beat * 0.3, 0.055, 10);
        }
      } else if (b >= 12) {
        // Climax: rapid fire lead
        const rapid = [chord[2], chord[0], chord[1], chord[2], chord[0], chord[1], chord[2], chord[0]];
        for (let n = 0; n < rapid.length; n++) {
          createSynth('sawtooth', noteFreq(rapid[n], 5), t + n * beat * 0.5, beat * 0.3, 0.05, 12);
        }
      }
    }
    return loopLen;
  }

  // EVENT / ENCOUNTER - Suspenseful, mysterious, 12 bars
  function scheduleEventTrack(startTime) {
    const bpm = 100;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 12;

    const chordProg = [
      // Mystery (bars 0-3)
      [9, 0, 3], [8, 0, 3], [7, 10, 2], [5, 8, 0],
      // Tension (bars 4-7)
      [3, 7, 10], [1, 4, 8], [0, 3, 7], [9, 0, 3],
      // Resolution (bars 8-11)
      [5, 8, 0], [7, 10, 2], [9, 0, 4], [9, 0, 3],
    ];

    for (let b = 0; b < 12; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];

      // Dark pads
      chord.forEach(note => createPad(noteFreq(note, 3), t, bar, 0.04));
      if (b >= 4 && b < 8) chord.forEach(note => createPad(noteFreq(note, 4), t, bar, 0.02));

      // Minimal bass
      createBass(noteFreq(chord[0], 2), t, beat * 2, 0.1);
      if (b >= 4) createBass(noteFreq(chord[0], 2), t + beat * 3, beat, 0.08);

      // Sparse drums
      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        if (s === 0) createKick(st);
        if (s === 2 && b >= 4) createSnare(st);
        if (s % 2 === 1) createHihat(st + beat * 0.5, true);
      }

      // Eerie arp
      if (b % 3 === 0) {
        const eerieNotes = [chord[2] + 12, chord[1] + 12, chord[0], chord[2], chord[1]];
        for (let n = 0; n < eerieNotes.length; n++) {
          createSynth('sine', noteFreq(eerieNotes[n] % 12, 5), t + n * beat * 0.6, beat * 0.5, 0.04);
        }
      } else if (b >= 8) {
        createArp([chord[0], chord[1], chord[2]], t, beat * 0.75, 5, 0.03);
      }
    }
    return loopLen;
  }

  // GAME OVER - Melancholic, final, 8 bars
  function scheduleGameOverTrack(startTime) {
    const bpm = 78;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 8;

    const chordProg = [
      [9, 0, 4], [5, 9, 0], [0, 4, 7], [7, 11, 2],
      [9, 0, 4], [2, 5, 9], [5, 9, 0], [9, 0, 4],
    ];

    for (let b = 0; b < 8; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];

      chord.forEach(note => {
        createPad(noteFreq(note, 3), t, bar, 0.05);
        createPad(noteFreq(note, 4), t, bar, 0.025);
      });

      createBass(noteFreq(chord[0], 2), t, bar, 0.08);

      if (b % 2 === 0) createKick(t);
      if (b % 2 === 1) createSnare(t + beat);
      if (b >= 4) createHihat(t + beat * 2, true);

      const melody = b < 4
        ? [chord[2], chord[1], chord[0], chord[1]]
        : [chord[0], chord[2], chord[1], chord[0]];
      for (let n = 0; n < melody.length; n++) {
        createSynth('sine', noteFreq(melody[n], 5), t + n * beat, beat * 0.9, 0.035);
      }
    }
    return loopLen;
  }

  // AMERICAS - Latin-influenced, 16 bars
  function scheduleAmericasTrack(startTime) {
    const bpm = 135;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [4, 7, 11],
      [0, 4, 7], [5, 9, 0], [2, 6, 9], [4, 7, 11],
      [5, 9, 0], [7, 11, 2], [0, 4, 7], [2, 5, 9],
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [9, 0, 4],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const half2 = b >= 8;

      chord.forEach(n => createPad(noteFreq(n, 4), t, bar, half2 ? 0.03 : 0.025));

      for (let i = 0; i < 8; i++) {
        const accent = i === 0 || i === 3 || i === 5;
        createBass(noteFreq(chord[0], 2), t + i * beat * 0.5, beat * 0.35, accent ? 0.18 : 0.10);
      }

      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        createKick(st);
        if (s === 1 || s === 3) createSnare(st);
        createHihat(st);
        createHihat(st + beat * 0.33);
        createHihat(st + beat * 0.66);
        if (s === 0 || s === 2) createHihat(st + beat * 0.5);
      }

      if (b % 2 === 0) {
        const riff = half2
          ? [chord[0], chord[2], chord[1], chord[0], chord[2], chord[1], chord[2], chord[0]]
          : [chord[2], chord[1], chord[2], chord[0], chord[1], chord[2], chord[1], chord[0]];
        for (let n = 0; n < riff.length; n++) {
          createSynth('sawtooth', noteFreq(riff[n], 5), t + n * beat * 0.5, beat * 0.4, 0.04, 4);
        }
      } else if (half2) {
        createArp([chord[0], chord[1], chord[2], chord[1]], t, beat * 0.5, 6, 0.03);
      }
    }
    return loopLen;
  }

  // EUROPE - Darker, atmospheric synthwave, 16 bars
  function scheduleEuropeTrack(startTime) {
    const bpm = 118;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      [2, 5, 9], [2, 5, 9], [10, 2, 5], [10, 2, 5],
      [7, 10, 2], [7, 10, 2], [9, 1, 4], [9, 1, 4],
      [0, 3, 7], [5, 8, 0], [2, 5, 9], [10, 2, 5],
      [7, 10, 2], [9, 1, 4], [2, 5, 9], [2, 5, 9],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const half2 = b >= 8;

      chord.forEach(n => {
        createPad(noteFreq(n, 3), t, bar, half2 ? 0.045 : 0.04);
        createPad(noteFreq(n, 4), t, bar, half2 ? 0.025 : 0.02);
      });

      for (let i = 0; i < 4; i++) {
        createBass(noteFreq(chord[0], 1), t + i * beat, beat * 0.9, 0.15);
      }

      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        createKick(st);
        if (s === 2) createSnare(st);
        createHihat(st + beat * 0.5);
        if (half2 && s === 0) createHihat(st + beat * 0.25);
      }

      if (b % 2 === 0) {
        createArp(chord, t, beat * 0.5, 5, 0.035);
      } else {
        createArp([...chord].reverse(), t, beat * 0.75, 5, 0.03);
      }

      // Extra lead in second half
      if (half2 && b % 4 === 0) {
        const mel = [chord[2], chord[1], chord[0], chord[1]];
        for (let n = 0; n < mel.length; n++) {
          createSynth('sine', noteFreq(mel[n], 5), t + n * beat, beat * 0.8, 0.03, 4);
        }
      }
    }
    return loopLen;
  }

  // ASIA - Pentatonic, mysterious, 16 bars
  function scheduleAsiaTrack(startTime) {
    const bpm = 110;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      [0, 3, 7], [5, 10, 2], [7, 0, 3], [3, 7, 10],
      [0, 3, 7], [10, 2, 5], [7, 0, 3], [5, 10, 2],
      [3, 7, 10], [0, 3, 7], [5, 10, 2], [7, 0, 3],
      [0, 3, 7], [5, 10, 2], [3, 7, 10], [0, 3, 7],
    ];
    const penta = [0, 3, 5, 7, 10];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const half2 = b >= 8;

      chord.forEach(n => createPad(noteFreq(n, 4), t, bar * 0.9, half2 ? 0.035 : 0.03));

      createBass(noteFreq(chord[0], 2), t, beat * 2, 0.12);
      createBass(noteFreq(chord[1], 2), t + beat * 2, beat * 2, 0.10);

      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        if (s === 0 || s === 2) createKick(st);
        createHihat(st + beat * 0.5, true);
        if (s === 3) createSnare(st);
        if (half2 && s === 1) createHihat(st);
      }

      if (b % 2 === 0) {
        for (let n = 0; n < 4; n++) {
          const note = penta[(b + n) % penta.length];
          createSynth('sine', noteFreq(note, 5), t + n * beat, beat * 0.8, 0.04, 3);
        }
      } else if (half2) {
        // Descending pentatonic response
        for (let n = 0; n < 3; n++) {
          const note = penta[(b - n + penta.length) % penta.length];
          createSynth('sine', noteFreq(note, 5), t + n * beat * 0.75, beat * 0.6, 0.03, 2);
        }
      }
    }
    return loopLen;
  }

  // AFRICA - Rhythmic, warm, percussive, 16 bars
  function scheduleAfricaTrack(startTime) {
    const bpm = 128;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      [7, 11, 2], [0, 4, 7], [9, 0, 4], [5, 9, 0],
      [7, 11, 2], [4, 7, 11], [0, 4, 7], [2, 5, 9],
      [5, 9, 0], [7, 11, 2], [0, 4, 7], [9, 0, 4],
      [2, 5, 9], [5, 9, 0], [7, 11, 2], [0, 4, 7],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const half2 = b >= 8;

      chord.forEach(n => createPad(noteFreq(n, 4), t, bar, half2 ? 0.025 : 0.02));

      for (let i = 0; i < 8; i++) {
        if (i !== 2 && i !== 6) {
          createBass(noteFreq(chord[0], 2), t + i * beat * 0.5, beat * 0.3, 0.14);
        }
      }

      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        createKick(st);
        if (s === 1 || s === 3) createSnare(st);
        createHihat(st);
        createHihat(st + beat * 0.25);
        createHihat(st + beat * 0.5);
        createHihat(st + beat * 0.75);
        if (s === 0 || s === 2) createKick(st + beat * 0.75);
      }

      // Call and response - alternating patterns
      if (b % 2 === 0) {
        const call = [chord[0], chord[1], chord[2], chord[1]];
        for (let n = 0; n < call.length; n++) {
          createSynth('square', noteFreq(call[n], 5), t + n * beat, beat * 0.7, 0.035, 5);
        }
      } else if (half2) {
        // Response melody in second half
        const resp = [chord[2], chord[1], chord[0], chord[2]];
        for (let n = 0; n < resp.length; n++) {
          createSynth('sawtooth', noteFreq(resp[n], 5), t + n * beat * 0.75, beat * 0.6, 0.03, 3);
        }
      }
    }
    return loopLen;
  }

  // COURT - Tense, dramatic, 16 bars
  function scheduleCourtTrack(startTime) {
    const bpm = 88;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    const chordProg = [
      // Anxiety (bars 0-3)
      [2, 5, 9], [1, 5, 8], [0, 4, 7], [11, 2, 5],
      // Deliberation (bars 4-7)
      [2, 5, 9], [8, 0, 3], [7, 11, 2], [9, 1, 4],
      // Tension peak (bars 8-11)
      [0, 3, 7], [1, 4, 8], [2, 5, 9], [3, 7, 10],
      // Verdict (bars 12-15)
      [2, 5, 9], [5, 9, 0], [9, 1, 4], [2, 5, 9],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const tension = b < 4 ? 0.7 : b < 8 ? 0.85 : b < 12 ? 1.0 : 0.9;

      // Deep ominous pads
      chord.forEach(n => createPad(noteFreq(n, 3), t, bar, 0.04 * tension));
      if (b >= 8) chord.forEach(n => createPad(noteFreq(n, 4), t, bar, 0.02 * tension));

      // Menacing bass
      createBass(noteFreq(chord[0], 1), t, bar, 0.12 * tension);
      if (b >= 4 && b < 12) createBass(noteFreq(chord[1], 2), t + beat * 2, beat * 2, 0.08);

      // Percussion - builds with tension
      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        if (s === 0) createKick(st);
        if (b >= 4 && s === 2) createSnare(st);
        if (b >= 8 && s === 3) createKick(st + beat * 0.5);
        if (s === 1 || s === 3) createHihat(st);
        if (b >= 8) createHihat(st + beat * 0.5);
      }

      // Dramatic swells
      if (b % 4 === 0) {
        createSynth('sine', noteFreq(chord[2], 5), t, bar * 2, 0.03 * tension, 2);
      }

      // Tension melody in peak section
      if (b >= 8 && b < 12 && b % 2 === 0) {
        const mel = [chord[2], chord[1], chord[0]];
        for (let n = 0; n < mel.length; n++) {
          createSynth('sine', noteFreq(mel[n], 5), t + n * beat, beat * 0.8, 0.03, 4);
        }
      }
    }
    return loopLen;
  }

  // MANAGEMENT - Chill ambient synthwave for menus/management screens, 16 bars
  function scheduleManagementTrack(startTime) {
    const bpm = 92;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const loopLen = bar * 16;

    // Mellow minor chord progression — smooth, reflective
    const chordProg = [
      // Intro drift (bars 0-3)
      [0, 3, 7], [5, 8, 0], [3, 7, 10], [0, 3, 7],
      // Warm middle (bars 4-7)
      [5, 8, 0], [7, 10, 2], [3, 7, 10], [5, 8, 0],
      // Gentle lift (bars 8-11)
      [0, 3, 7], [2, 5, 8], [3, 7, 10], [5, 8, 0],
      // Resolve (bars 12-15)
      [7, 10, 2], [5, 8, 0], [3, 7, 10], [0, 3, 7],
    ];

    for (let b = 0; b < 16; b++) {
      const t = startTime + b * bar;
      const chord = chordProg[b];
      const warmth = b < 4 ? 0.6 : b < 8 ? 0.75 : b < 12 ? 0.8 : 0.65;

      // Lush warm pads — very gentle, low cutoff
      chord.forEach(n => createPad(noteFreq(n, 3), t, bar * 1.1, 0.035 * warmth));
      // Higher octave shimmer on alternate bars
      if (b % 2 === 0) {
        createPad(noteFreq(chord[2], 5), t, bar * 2, 0.012 * warmth);
      }

      // Gentle sub bass — smooth and round
      createBass(noteFreq(chord[0], 1), t, bar, 0.07 * warmth);

      // Soft arpeggio pattern — gentle triangle wave
      const arpNotes = [chord[0], chord[1], chord[2], chord[1]];
      for (let a = 0; a < 4; a++) {
        if (b >= 2) { // Arps fade in after 2 bars
          const arpVol = 0.025 * warmth * (b >= 4 ? 1 : 0.5);
          createSynth('triangle', noteFreq(arpNotes[a], 4), t + a * beat, beat * 0.6, arpVol, 3);
        }
      }

      // Secondary arp — higher octave, sparser (bars 4+)
      if (b >= 4 && b % 2 === 0) {
        createSynth('sine', noteFreq(chord[2], 5), t + beat * 1.5, beat * 1.5, 0.015 * warmth, 0);
      }

      // Minimal percussion — just light hihat and occasional kick
      for (let s = 0; s < 4; s++) {
        const st = t + s * beat;
        // Very soft hihats on offbeats
        if (b >= 4 && (s === 1 || s === 3)) {
          createHihat(st);
        }
        // Gentle kick on beat 1 only, starting bar 4
        if (b >= 4 && s === 0) {
          createKick(st);
        }
      }

      // Ambient sine swells every 4 bars
      if (b % 4 === 0) {
        createSynth('sine', noteFreq(chord[0], 4), t, bar * 4, 0.02 * warmth, 1);
      }
    }
    return loopLen;
  }

  // ============================================================
  // LONG-FORM BACKGROUND TRACKS (5 min each, title music style)
  // Parametric generator: lush pads, arps, bass, builds, breakdowns
  // ============================================================
  // Chunk timers for long tracks (cleaned up on stopAll)
  let chunkTimers = [];
  let trackGeneration = 0; // Incremented on every new track to invalidate stale chunk callbacks

  function scheduleLongTrack(startTime, config) {
    const bpm = config.bpm;
    const beat = 60 / bpm;
    const bar = beat * 4;
    const totalBars = config.bars || 136;
    const loopLen = bar * totalBars;
    const prog = config.prog;
    const progLen = prog.length;
    const CHUNK_SIZE = 16; // Schedule 16 bars at a time

    function scheduleBarRange(fromBar, toBar) {
      for (let b = fromBar; b < toBar && b < totalBars; b++) {
        const t = startTime + b * bar;
        const chord = prog[b % progLen];
        const phase = b % progLen;
        const cycle = Math.floor(b / progLen);
        const totalCycles = Math.ceil(totalBars / progLen);
        const isIntro = cycle === 0 && phase < Math.floor(progLen / 4);
        const isOutro = cycle >= totalCycles - 1 && phase >= Math.floor(progLen * 3 / 4);
        const isPeak = cycle >= 2 && cycle <= 3 || cycle >= 5;
        const isBuild = cycle === 1 || cycle === 4;
        const isBreakdown = (phase >= Math.floor(progLen / 2) && phase < Math.floor(progLen * 3 / 4)) && (cycle === 2 || cycle === 5);

        let energy = 0.4;
        if (isIntro) energy = 0.15 + (phase / (progLen / 4)) * 0.15;
        else if (isOutro) energy = 0.5 - ((phase - Math.floor(progLen * 3 / 4)) / (progLen / 4)) * 0.3;
        else if (isBreakdown) energy = 0.3;
        else if (isPeak) energy = 0.7 + Math.sin(b * 0.1) * 0.15;
        else if (isBuild) energy = 0.35 + (phase / progLen) * 0.35;

        // --- PADS ---
        const padGain = 0.02 + energy * 0.03;
        chord.forEach(note => {
          createPad(noteFreq(note, 4), t, bar * 1.05, padGain);
          if (energy > 0.4) createPad(noteFreq(note, 3), t, bar, padGain * 0.5);
        });
        if (b % 2 === 0 && energy > 0.3) {
          createPad(noteFreq(chord[2], 5), t, bar * 2, 0.008 + energy * 0.006);
        }

        // --- BASS ---
        if (!isIntro || phase >= 2) {
          const bassGain = 0.06 + energy * 0.08;
          createBass(noteFreq(chord[0], 2), t, beat * 2, bassGain);
          if (energy > 0.5) createBass(noteFreq(chord[0], 2), t + beat * 2, beat * 1.5, bassGain * 0.7);
          if (energy > 0.7) createBass(noteFreq(chord[1], 2), t + beat * 3, beat, bassGain * 0.5);
        }

        // --- DRUMS ---
        if (!isIntro || phase >= 3) {
          for (let s = 0; s < 4; s++) {
            const st = t + s * beat;
            if (isBreakdown) {
              if (s === 0) createKick(st);
              if (s === 2 && energy > 0.3) createHihat(st, true);
            } else if (energy < 0.35) {
              if (s === 0) createKick(st);
              if (s === 1 || s === 3) createHihat(st + beat * 0.5);
            } else if (energy < 0.55) {
              if (s === 0 || s === 2) createKick(st);
              if (s === 1 || s === 3) createSnare(st);
              createHihat(st + beat * 0.5);
            } else {
              createKick(st);
              if (s === 1 || s === 3) createSnare(st);
              createHihat(st);
              createHihat(st + beat * 0.5, s === 2);
              if (energy > 0.7) {
                createHihat(st + beat * 0.25);
                createHihat(st + beat * 0.75);
              }
            }
          }
        }

        // --- ARPS ---
        if (energy > 0.2 && !isBreakdown) {
          const arpNotes = config.arpStyle === 'up'
            ? [chord[0], chord[1], chord[2], chord[1]]
            : config.arpStyle === 'down'
            ? [chord[2], chord[1], chord[0], chord[1]]
            : [chord[0], chord[2], chord[1], chord[0]];
          if (b % 2 === 0 || energy > 0.5) {
            const arpGain = 0.015 + energy * 0.025;
            const arpOct = energy > 0.6 ? 5 : 4;
            for (let a = 0; a < arpNotes.length; a++) {
              createSynth('triangle', noteFreq(arpNotes[a], arpOct), t + a * beat, beat * 0.6, arpGain, 3);
            }
          }
          if (energy > 0.6 && b % 4 === 2) {
            createArp([chord[2], chord[1], chord[0]], t, beat * 0.5, 6, 0.02);
          }
        }

        // --- LEAD MELODY ---
        if (energy > 0.55 && b % 2 === 0 && !isBreakdown) {
          // cascade: descending arpeggio pattern
          const melodyNotes = config.melodyStyle === 'soaring'
            ? [chord[2], chord[1], chord[0], chord[1], chord[2], chord[2], chord[1], chord[0]]
            : config.melodyStyle === 'pulse'
            ? [chord[0], chord[2], chord[0], chord[1], chord[0], chord[2], chord[1], chord[0]]
            : config.melodyStyle === 'cascade'
            ? [chord[2], chord[1], chord[0], chord[2], chord[1], chord[0], chord[1], chord[0]]
            : [chord[2], chord[1], chord[2], chord[0], chord[1], chord[2], chord[1], chord[0]];
          const melType = config.leadType || 'sine';
          const melGain = 0.02 + (energy - 0.55) * 0.08;
          for (let n = 0; n < melodyNotes.length; n++) {
            createSynth(melType, noteFreq(melodyNotes[n], 5), t + n * beat * 0.5, beat * 0.4, melGain, 3);
          }
        }

        // --- AMBIENT SWELLS ---
        if (b % 8 === 0) {
          createSynth('sine', noteFreq(chord[0], 4), t, bar * 8, 0.012 + energy * 0.008, 1);
        }
      }
    }

    // Schedule in chunks: first chunk immediately, rest via setTimeout
    // Capture current generation — if it changes, this track was replaced
    const myGeneration = trackGeneration;
    scheduleBarRange(0, CHUNK_SIZE);
    let nextBar = CHUNK_SIZE;

    function scheduleNextChunk() {
      // Bail if this track's generation is stale (a new track started)
      if (myGeneration !== trackGeneration) return;
      if (!isPlaying || nextBar >= totalBars) return;
      scheduleBarRange(nextBar, Math.min(nextBar + CHUNK_SIZE, totalBars));
      nextBar += CHUNK_SIZE;
      if (nextBar < totalBars) {
        const chunkDuration = CHUNK_SIZE * bar;
        const tid = setTimeout(scheduleNextChunk, (chunkDuration - 1) * 1000);
        chunkTimers.push(tid);
      }
    }

    if (totalBars > CHUNK_SIZE) {
      const chunkDuration = CHUNK_SIZE * bar;
      const tid = setTimeout(scheduleNextChunk, (chunkDuration - 1) * 1000);
      chunkTimers.push(tid);
    }

    return loopLen;
  }

  // Five distinct 5-minute background tracks
  // Track 1: "Neon Horizon" — 100 BPM, D minor, soaring, uplifting (5:00)
  const BG_TRACK_1 = {
    bpm: 100, bars: 125, arpStyle: 'up', melodyStyle: 'soaring', leadType: 'sine',
    prog: [
      [2, 5, 9], [2, 5, 9], [9, 0, 4], [9, 0, 4],
      [10, 2, 5], [10, 2, 5], [7, 10, 2], [7, 10, 2],
      [5, 9, 0], [0, 4, 7], [2, 5, 9], [9, 0, 4],
      [10, 2, 5], [5, 9, 0], [7, 10, 2], [2, 5, 9],
    ]
  };

  // Track 2: "Midnight Drive" — 108 BPM, A minor, pulsing, confident (5:00)
  const BG_TRACK_2 = {
    bpm: 108, bars: 135, arpStyle: 'down', melodyStyle: 'pulse', leadType: 'square',
    prog: [
      [9, 0, 4], [5, 9, 0], [0, 4, 7], [7, 11, 2],
      [9, 0, 4], [2, 5, 9], [5, 9, 0], [9, 0, 4],
      [0, 4, 7], [5, 9, 0], [7, 11, 2], [4, 7, 11],
      [0, 4, 7], [9, 0, 4], [5, 9, 0], [2, 5, 9],
    ]
  };

  // Track 3: "Vice City Lights" — 96 BPM, E minor, lush, atmospheric (5:00)
  const BG_TRACK_3 = {
    bpm: 96, bars: 120, arpStyle: 'alt', melodyStyle: 'soaring', leadType: 'sine',
    prog: [
      [4, 7, 11], [0, 4, 7], [2, 5, 9], [9, 0, 4],
      [4, 7, 11], [7, 11, 2], [5, 9, 0], [0, 4, 7],
      [2, 5, 9], [4, 7, 11], [0, 4, 7], [5, 9, 0],
      [7, 11, 2], [2, 5, 9], [9, 0, 4], [4, 7, 11],
    ]
  };

  // Track 4: "Ocean Boulevard" — 104 BPM, F minor, dreamy, warm (5:00)
  const BG_TRACK_4 = {
    bpm: 104, bars: 130, arpStyle: 'up', melodyStyle: 'cascade', leadType: 'sine',
    prog: [
      [5, 8, 0], [3, 7, 10], [0, 3, 7], [5, 8, 0],
      [10, 2, 5], [8, 0, 3], [3, 7, 10], [0, 3, 7],
      [5, 8, 0], [7, 10, 2], [3, 7, 10], [10, 2, 5],
      [0, 3, 7], [5, 8, 0], [8, 0, 3], [3, 7, 10],
    ]
  };

  // Track 5: "Sunset Strip" — 112 BPM, C minor, driving, cinematic (5:00)
  const BG_TRACK_5 = {
    bpm: 112, bars: 140, arpStyle: 'down', melodyStyle: 'pulse', leadType: 'square',
    prog: [
      [0, 3, 7], [7, 10, 2], [5, 8, 0], [3, 7, 10],
      [0, 3, 7], [10, 2, 5], [8, 0, 3], [5, 8, 0],
      [3, 7, 10], [0, 3, 7], [7, 10, 2], [10, 2, 5],
      [5, 8, 0], [3, 7, 10], [0, 3, 7], [7, 10, 2],
    ]
  };

  function scheduleBgTrack1(st) { return scheduleLongTrack(st, BG_TRACK_1); }
  function scheduleBgTrack2(st) { return scheduleLongTrack(st, BG_TRACK_2); }
  function scheduleBgTrack3(st) { return scheduleLongTrack(st, BG_TRACK_3); }
  function scheduleBgTrack4(st) { return scheduleLongTrack(st, BG_TRACK_4); }
  function scheduleBgTrack5(st) { return scheduleLongTrack(st, BG_TRACK_5); }

  // ============================================================
  // PLAYBACK CONTROL
  // ============================================================

  const TRACKS = {
    title: scheduleTitleTrack,
    game: scheduleGameTrack,
    game_americas: scheduleAmericasTrack,
    game_europe: scheduleEuropeTrack,
    game_asia: scheduleAsiaTrack,
    game_africa: scheduleAfricaTrack,
    travel: scheduleTravelTrack,
    combat: scheduleCombatTrack,
    event: scheduleEventTrack,
    court: scheduleCourtTrack,
    gameover: scheduleGameOverTrack,
    management: scheduleManagementTrack,
    bg_1: scheduleBgTrack1,
    bg_2: scheduleBgTrack2,
    bg_3: scheduleBgTrack3,
    bg_4: scheduleBgTrack4,
    bg_5: scheduleBgTrack5,
  };

  // Background playlist system — cycles through 5 tracks sequentially
  const BG_PLAYLIST = ['bg_1', 'bg_2', 'bg_3', 'bg_4', 'bg_5'];
  let bgPlaylistIndex = 0;
  let playlistMode = false;

  function stopAll() {
    // Increment generation to invalidate any pending chunk callbacks
    trackGeneration++;
    if (loopTimer) {
      clearTimeout(loopTimer);
      loopTimer = null;
    }
    // Clear chunk scheduling timers
    chunkTimers.forEach(tid => clearTimeout(tid));
    chunkTimers = [];
    // Kill all scheduled oscillator nodes
    scheduledNodes.forEach(n => {
      try { n.stop(ctx.currentTime); } catch (e) {}
      try { n.disconnect(); } catch (e) {}
    });
    scheduledNodes = [];
    currentTrackName = '';
    playlistMode = false;
    isPlaying = false;
    // Ramp gain to 0 quickly to avoid audio pop, then restore after brief timeout
    if (masterGain && ctx && ctx.state === 'running') {
      masterGain.gain.cancelScheduledValues(ctx.currentTime);
      masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
      setTimeout(() => {
        if (masterGain && ctx) {
          masterGain.disconnect();
          masterGain.connect(ctx.destination);
          masterGain.gain.cancelScheduledValues(ctx.currentTime);
          masterGain.gain.setValueAtTime(mutedFlag ? 0 : volume, ctx.currentTime);
        }
      }, 80);
    }
  }

  function playTrack(trackName) {
    if (!ctx) init();
    if (!ctx) return;

    // Don't schedule audio if context is suspended — wait for user interaction
    if (ctx.state === 'suspended') {
      // Store desired track so we can start it when context resumes
      currentTrackName = trackName;
      if (trackName === 'background') playlistMode = true;
      return;
    }

    // Handle background playlist request
    if (trackName === 'background') {
      if (playlistMode && isPlaying && currentTrackName === 'background') return; // Already in playlist mode
      stopAll();
      playlistMode = true;
      isPlaying = true;
      currentTrackName = 'background';
      schedulePlaylist();
      return;
    }

    // Don't restart if same track (and not playlist mode switching to named track)
    if (trackName === currentTrackName && isPlaying && !playlistMode) return;

    // Always stop everything before switching tracks to prevent overlap
    stopAll();
    currentTrackName = trackName;
    isPlaying = true;

    const trackFn = TRACKS[trackName];
    if (!trackFn) return;

    function scheduleLoop() {
      if (!isPlaying || currentTrackName !== trackName) return;
      const loopDuration = trackFn(ctx.currentTime + 0.1);
      loopTimer = setTimeout(() => {
        // Increment generation to invalidate any stale chunk callbacks
        trackGeneration++;
        // Clear chunk timers
        chunkTimers.forEach(tid => clearTimeout(tid));
        chunkTimers = [];
        // Clean up old nodes before scheduling next loop
        scheduledNodes.forEach(n => {
          try { n.stop(ctx.currentTime); } catch (e) {}
          try { n.disconnect(); } catch (e) {}
        });
        scheduledNodes = [];
        scheduleLoop();
      }, (loopDuration - 0.5) * 1000);
    }

    scheduleLoop();
  }

  function schedulePlaylist() {
    if (!isPlaying || !playlistMode) return;
    const trackName = BG_PLAYLIST[bgPlaylistIndex];
    const trackFn = TRACKS[trackName];
    if (!trackFn) return;

    const loopDuration = trackFn(ctx.currentTime + 0.1);

    // After this track ends, fade out then advance to next
    loopTimer = setTimeout(() => {
      // Fade out over 0.5s to prevent clicks/pops between songs
      if (masterGain && ctx && ctx.state === 'running') {
        masterGain.gain.cancelScheduledValues(ctx.currentTime);
        masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime);
        masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
      }
      // After fade completes, kill old nodes and start next track
      setTimeout(() => {
        // Increment generation to invalidate chunk callbacks from the finishing track
        trackGeneration++;
        // Clear chunk timers from the finishing track
        chunkTimers.forEach(tid => clearTimeout(tid));
        chunkTimers = [];
        // Clear finished nodes
        scheduledNodes.forEach(n => {
          try { n.stop(ctx.currentTime); } catch (e) {}
          try { n.disconnect(); } catch (e) {}
        });
        scheduledNodes = [];
        // Restore volume for next track
        if (masterGain && ctx && ctx.state === 'running') {
          masterGain.gain.cancelScheduledValues(ctx.currentTime);
          masterGain.gain.setValueAtTime(mutedFlag ? 0 : volume, ctx.currentTime);
        }
        bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
        schedulePlaylist();
      }, 600);
    }, (loopDuration - 1) * 1000);
  }

  function stop() {
    isPlaying = false;
    stopAll();
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    if (masterGain && !mutedFlag) masterGain.gain.value = volume;
  }

  function getVolume() {
    return volume;
  }

  function toggleMute() {
    if (!masterGain) return;
    mutedFlag = !mutedFlag;
    masterGain.gain.value = mutedFlag ? 0 : volume;
    return !mutedFlag;
  }

  function isMuted() {
    return mutedFlag;
  }

  function toggleSfxMute() {
    sfxMuted = !sfxMuted;
    if (sfxGain) sfxGain.gain.value = sfxMuted ? 0 : sfxVolume;
    return !sfxMuted;
  }

  function isSfxMuted() {
    return sfxMuted;
  }

  function getIsPlaying() {
    return isPlaying;
  }

  // ============================================================
  // SOUND EFFECTS (replaces old playSound)
  // ============================================================
  function playSfx(type) {
    if (!ctx) init();
    if (!ctx) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(sfxGain || ctx.destination);

    switch (type) {
      case 'buy':
        osc.type = 'square'; osc.frequency.value = 523;
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t); osc.stop(t + 0.12);
        // Second note (chord)
        const osc2 = ctx.createOscillator();
        const g2 = ctx.createGain();
        osc2.connect(g2); g2.connect(sfxGain || ctx.destination);
        osc2.type = 'square'; osc2.frequency.value = 659;
        g2.gain.setValueAtTime(0.1, t + 0.05);
        g2.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc2.start(t + 0.05); osc2.stop(t + 0.15);
        break;
      case 'sell':
        osc.type = 'square'; osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        osc.start(t); osc.stop(t + 0.1);
        const osc3 = ctx.createOscillator();
        const g3 = ctx.createGain();
        osc3.connect(g3); g3.connect(sfxGain || ctx.destination);
        osc3.type = 'square'; osc3.frequency.value = 1047;
        g3.gain.setValueAtTime(0.1, t + 0.06);
        g3.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc3.start(t + 0.06); osc3.stop(t + 0.15);
        break;
      case 'travel':
        osc.type = 'sawtooth'; osc.frequency.value = 220;
        osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        osc.start(t); osc.stop(t + 0.35); break;
      case 'fight':
        osc.type = 'sawtooth'; osc.frequency.value = 80;
        osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t); osc.stop(t + 0.1); break;
      case 'hurt':
        osc.type = 'sawtooth'; osc.frequency.value = 400;
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.3);
        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.start(t); osc.stop(t + 0.3); break;
      case 'cash':
        osc.type = 'sine'; osc.frequency.value = 880;
        osc.frequency.exponentialRampToValueAtTime(1320, t + 0.1);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.start(t); osc.stop(t + 0.2); break;
      case 'gameover':
        osc.type = 'sawtooth'; osc.frequency.value = 440;
        osc.frequency.exponentialRampToValueAtTime(55, t + 1.5);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
        osc.start(t); osc.stop(t + 1.5); break;
      case 'click':
        osc.type = 'sine'; osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.08, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
        osc.start(t); osc.stop(t + 0.04); break;
      case 'save':
        osc.type = 'sine'; osc.frequency.value = 523;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t); osc.stop(t + 0.1);
        setTimeout(() => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(sfxGain || ctx.destination);
          o.type = 'sine'; o.frequency.value = 784;
          g.gain.setValueAtTime(0.1, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
        }, 100);
        break;
      case 'load':
        osc.type = 'sine'; osc.frequency.value = 784;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        osc.start(t); osc.stop(t + 0.1);
        setTimeout(() => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(sfxGain || ctx.destination);
          o.type = 'sine'; o.frequency.value = 523;
          g.gain.setValueAtTime(0.1, ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
          o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.15);
        }, 100);
        break;
      case 'achievement': {
        // Triumphant arpeggio
        osc.type = 'sine'; osc.frequency.value = 523;
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.15);
        const notes = [659, 784, 1047];
        notes.forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(sfxGain || ctx.destination);
          o.type = 'sine'; o.frequency.value = freq;
          const nt = t + (i + 1) * 0.08;
          g.gain.setValueAtTime(0.10, nt);
          g.gain.exponentialRampToValueAtTime(0.001, nt + 0.2);
          o.start(nt); o.stop(nt + 0.2);
        });
        break;
      }
      case 'levelup': {
        // Epic ascending fanfare
        osc.type = 'square'; osc.frequency.value = 262;
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
        osc.start(t); osc.stop(t + 0.12);
        [330, 392, 523, 659, 784].forEach((freq, i) => {
          const o = ctx.createOscillator(); const g = ctx.createGain();
          o.connect(g); g.connect(sfxGain || ctx.destination);
          o.type = 'square'; o.frequency.value = freq;
          const nt = t + (i + 1) * 0.1;
          g.gain.setValueAtTime(0.08, nt);
          g.gain.exponentialRampToValueAtTime(0.001, nt + 0.15);
          o.start(nt); o.stop(nt + 0.15);
        });
        break;
      }
      case 'territory':
        osc.type = 'sawtooth'; osc.frequency.value = 220;
        osc.frequency.exponentialRampToValueAtTime(440, t + 0.15);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.4);
        break;
      case 'arrest':
        // Wailing siren descending
        osc.type = 'sine'; osc.frequency.value = 800;
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.3);
        osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);
        osc.frequency.exponentialRampToValueAtTime(200, t + 1.0);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
        osc.start(t); osc.stop(t + 1.0);
        break;
      default:
        osc.stop(); return;
    }
  }

  return {
    init, playTrack, stop, setVolume, getVolume, toggleMute, isMuted, toggleSfxMute, isSfxMuted, getIsPlaying, playSfx, stopAll
  };
})();
