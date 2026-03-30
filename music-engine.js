// ============================================================
// DRUG WARS: MIAMI VICE EDITION - Synthwave Music Engine
// Real synthwave music tracks with procedural SFX
// Music by Nihilore (nihilore.com) - Creative Commons
// ============================================================

const MusicEngine = (() => {
  // --- Audio context for procedural SFX ---
  let ctx = null;
  let sfxGain = null;
  let sfxMuted = false;
  let sfxVolume = 0.5;

  // --- Music state ---
  let volume = 0.35;
  let mutedFlag = false;
  let isPlaying = false;
  let currentTrackName = '';
  let currentAudio = null;       // Currently playing HTML5 Audio element
  let nextAudio = null;          // Used during crossfade
  let crossfadeTimer = null;
  let crossfadeInterval = null;

  // --- Background playlist ---
  const BG_PLAYLIST = ['bg_1', 'bg_2', 'bg_3', 'bg_4', 'bg_5'];
  let bgPlaylistIndex = 0;
  let playlistMode = false;

  // --- Loading state ---
  let loadingTrack = '';  // Name of track currently loading (empty = not loading)

  // --- Track URL definitions ---
  const TRACK_URLS = {
    title:         'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/606d59d50726d2518e6c8725/1617779204095/Dream+Sunlight.mp3',
    game:          'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/5ab591b7562fa77d176c3f72/1752395731556/Motion+Blur.mp3',
    combat:        'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/58e70c0c414fb5b577812fb7/1752395731615/Absolute+Terror.mp3',
    event:         'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/6083808efe6a362c59544dd5/1752395731606/Noctivagant.mp3',
    court:         'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/5bc11dd5f4e1fc4d3a301c52/1752395731584/Terminant.mp3',
    travel:        'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/59602780197aea49afbd910f/1752395731587/Sparkwood+%26+21.mp3',
    gameover:      'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/58e71079725e255284d6164a/1752395731623/Laconic.mp3',
    management:    'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/63ef114b350e132d0b4a44c9/1752395731571/Threads+of+Rain.mp3',
    game_americas: 'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/6783749090d6065053320533/1736668389178/A+Dangerous+Gravity.mp3',
    game_europe:   'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/5c847848e4966b5f3f3c2b90/1752395731582/Disconnected.mp3',
    game_asia:     'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/58e70eb43e00be081c806529/1752395731618/Samsara.mp3',
    game_africa:   'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/5926b3649f7456fb49efb792/1752395731559/Bush+Week.mp3',
    bg_1:          'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/5b9332214d7a9cece566be20/1747560367041/Glimmer.mp3',
    bg_2:          'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/6323fd85ebe8f81bc36cd975/1752395731551/Eternal+Light.mp3',
    bg_3:          'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/61b6ed50fd4bcd3542f2aac5/1752395731564/The+Bright+Lights+of+Summer.mp3',
    bg_4:          'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/647057561c555d5b87458e2f/1752395731574/Magenta.mp3',
    bg_5:          'https://static1.squarespace.com/static/57e83f709de4bbd550a2fdba/58e6e631579fb3bb25ed2822/61ea2ee4a3badb4c8b3dc2f3/1752395731589/A+Sense+of+Purpose.mp3',
  };

  // Tracks that should NOT loop (play once and stop)
  const NO_LOOP_TRACKS = new Set(['gameover']);

  // --- Lazy audio element cache ---
  // Each entry: { audio: HTMLAudioElement, loaded: bool, error: bool }
  const audioCache = {};

  /**
   * Get or create an Audio element for a track. Lazy-loads on first request.
   * Returns the Audio element (may not be fully loaded yet).
   */
  function getAudio(trackName) {
    if (audioCache[trackName]) {
      return audioCache[trackName].audio;
    }

    const url = TRACK_URLS[trackName];
    if (!url) return null;

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.preload = 'auto';

    const entry = { audio, loaded: false, error: false };
    audioCache[trackName] = entry;

    audio.addEventListener('canplaythrough', () => {
      entry.loaded = true;
      // Clear loading indicator if this was the track we were waiting for
      if (loadingTrack === trackName) loadingTrack = '';
    }, { once: true });

    audio.addEventListener('error', (e) => {
      entry.error = true;
      entry.loaded = false;
      if (loadingTrack === trackName) loadingTrack = '';
      console.error(`[MusicEngine] Failed to load track "${trackName}":`, e);
    });

    audio.src = url;
    audio.load();

    return audio;
  }

  /**
   * Check if a track is ready to play.
   */
  function isTrackReady(trackName) {
    const entry = audioCache[trackName];
    return entry && entry.loaded && !entry.error;
  }

  /**
   * Check if a track had a loading error.
   */
  function isTrackError(trackName) {
    const entry = audioCache[trackName];
    return entry && entry.error;
  }

  // ============================================================
  // CROSSFADE LOGIC
  // ============================================================

  const CROSSFADE_DURATION = 1000; // 1 second crossfade
  const CROSSFADE_STEPS = 20;     // Number of volume steps during crossfade

  /**
   * Stop any in-progress crossfade immediately.
   */
  function cancelCrossfade() {
    if (crossfadeInterval) {
      clearInterval(crossfadeInterval);
      crossfadeInterval = null;
    }
    if (crossfadeTimer) {
      clearTimeout(crossfadeTimer);
      crossfadeTimer = null;
    }
    // If there is a "next" audio being faded in that never became current, stop it
    if (nextAudio && nextAudio !== currentAudio) {
      try { nextAudio.pause(); } catch (e) {}
      nextAudio.currentTime = 0;
    }
    nextAudio = null;
  }

  /**
   * Fade out the old audio and fade in the new audio over CROSSFADE_DURATION ms.
   * When complete, the old audio is paused/reset and newAudio becomes currentAudio.
   * Calls onComplete() when done.
   */
  function crossfade(oldAudio, newAudio, onComplete) {
    cancelCrossfade();

    const targetVolume = mutedFlag ? 0 : volume;
    const stepTime = CROSSFADE_DURATION / CROSSFADE_STEPS;
    let step = 0;

    // Start new audio at volume 0
    newAudio.volume = 0;
    nextAudio = newAudio;

    // Start playing new audio
    const playPromise = newAudio.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(e => {
        // Autoplay blocked or other error - will be handled by user interaction resume
        console.warn('[MusicEngine] Autoplay blocked during crossfade:', e.message);
      });
    }

    crossfadeInterval = setInterval(() => {
      step++;
      const progress = step / CROSSFADE_STEPS;

      // Fade out old
      if (oldAudio) {
        oldAudio.volume = Math.max(0, targetVolume * (1 - progress));
      }
      // Fade in new
      newAudio.volume = Math.min(targetVolume, targetVolume * progress);

      if (step >= CROSSFADE_STEPS) {
        clearInterval(crossfadeInterval);
        crossfadeInterval = null;

        // Finalize
        if (oldAudio) {
          oldAudio.pause();
          oldAudio.currentTime = 0;
          oldAudio.volume = targetVolume; // Reset for next use
        }
        newAudio.volume = targetVolume;
        currentAudio = newAudio;
        nextAudio = null;

        if (onComplete) onComplete();
      }
    }, stepTime);
  }

  // ============================================================
  // INIT
  // ============================================================

  function init() {
    // Create or resume AudioContext for SFX
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      if (!sfxGain) {
        sfxGain = ctx.createGain();
        sfxGain.gain.value = sfxMuted ? 0 : sfxVolume;
        sfxGain.connect(ctx.destination);
      }
      return;
    }

    try {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      sfxGain = ctx.createGain();
      sfxGain.gain.value = sfxMuted ? 0 : sfxVolume;
      sfxGain.connect(ctx.destination);

      // Handle autoplay restrictions: resume AudioContext + resume music on first user interaction
      const resumeAudio = () => {
        if (ctx && ctx.state === 'suspended') {
          ctx.resume().then(() => {
            // If a music track was deferred, start it now
            if (currentTrackName && !isPlaying) {
              const deferred = currentTrackName;
              currentTrackName = '';
              playlistMode = false;
              playTrack(deferred);
            }
          });
        }
        // Also try to resume any paused audio element (autoplay policy)
        if (currentAudio && currentAudio.paused && isPlaying) {
          const p = currentAudio.play();
          if (p && p.catch) p.catch(() => {});
        }
      };

      document.addEventListener('click', resumeAudio, { once: false });
      document.addEventListener('keydown', resumeAudio, { once: false });
    } catch (e) {
      console.warn('[MusicEngine] Web Audio not available for SFX');
    }
  }

  // ============================================================
  // PLAYBACK CONTROL
  // ============================================================

  /**
   * Start playing a named track with crossfade from current.
   * Special name 'background' activates playlist mode cycling bg_1..bg_5.
   */
  function playTrack(trackName) {
    init();

    // Handle background playlist request
    if (trackName === 'background') {
      if (playlistMode && isPlaying && currentTrackName === 'background') return;
      playlistMode = true;
      currentTrackName = 'background';
      isPlaying = true;
      startPlaylistTrack();
      return;
    }

    // Don't restart if same track already playing (unless switching from playlist)
    if (trackName === currentTrackName && isPlaying && !playlistMode) return;

    playlistMode = false;
    currentTrackName = trackName;
    isPlaying = true;

    startNamedTrack(trackName);
  }

  /**
   * Internal: start a specific named track, with crossfade from current.
   */
  function startNamedTrack(trackName) {
    const url = TRACK_URLS[trackName];
    if (!url) {
      console.warn(`[MusicEngine] Unknown track: "${trackName}"`);
      return;
    }

    // Trigger lazy load if not already cached
    const audio = getAudio(trackName);
    if (!audio) return;

    // Configure looping
    audio.loop = !NO_LOOP_TRACKS.has(trackName);
    audio.currentTime = 0;

    // Set up 'ended' handler for non-looping tracks
    audio.onended = null;
    if (NO_LOOP_TRACKS.has(trackName)) {
      audio.onended = () => {
        isPlaying = false;
        currentTrackName = '';
      };
    }

    // If track is ready, start with crossfade
    if (isTrackReady(trackName)) {
      loadingTrack = '';
      if (currentAudio && currentAudio !== audio) {
        crossfade(currentAudio, audio, null);
      } else {
        // No current track playing - just start directly with fade-in
        cancelCrossfade();
        audio.volume = 0;
        currentAudio = audio;
        const targetVol = mutedFlag ? 0 : volume;
        const p = audio.play();
        if (p && p.catch) p.catch(e => console.warn('[MusicEngine] Autoplay blocked:', e.message));
        // Quick fade in
        let step = 0;
        const fadeSteps = 10;
        const fadeInterval = setInterval(() => {
          step++;
          audio.volume = Math.min(targetVol, targetVol * (step / fadeSteps));
          if (step >= fadeSteps) {
            clearInterval(fadeInterval);
            audio.volume = targetVol;
          }
        }, 50);
      }
    } else if (isTrackError(trackName)) {
      console.warn(`[MusicEngine] Track "${trackName}" failed to load, skipping.`);
      // If in playlist mode, skip to next
      if (playlistMode) {
        bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
        startPlaylistTrack();
      }
    } else {
      // Track still loading - set loading state and wait
      loadingTrack = trackName;

      // Stop current audio with fade out while we wait
      if (currentAudio) {
        const oldAudio = currentAudio;
        const targetVol = mutedFlag ? 0 : volume;
        let step = 0;
        const fadeSteps = 10;
        const fadeInterval = setInterval(() => {
          step++;
          oldAudio.volume = Math.max(0, targetVol * (1 - step / fadeSteps));
          if (step >= fadeSteps) {
            clearInterval(fadeInterval);
            oldAudio.pause();
            oldAudio.currentTime = 0;
            oldAudio.volume = targetVol;
          }
        }, 50);
        currentAudio = null;
      }

      // Wait for load to complete, then start
      const waitForLoad = () => {
        // If track name changed while we were waiting, bail
        if (!playlistMode && currentTrackName !== trackName) return;
        if (playlistMode && currentTrackName !== 'background') return;

        if (isTrackReady(trackName)) {
          loadingTrack = '';
          audio.loop = !NO_LOOP_TRACKS.has(trackName);
          audio.currentTime = 0;
          audio.volume = 0;
          currentAudio = audio;
          const targetVol = mutedFlag ? 0 : volume;
          const p = audio.play();
          if (p && p.catch) p.catch(e => console.warn('[MusicEngine] Autoplay blocked:', e.message));
          // Fade in
          let step = 0;
          const fadeSteps = 10;
          const fadeInterval = setInterval(() => {
            step++;
            audio.volume = Math.min(targetVol, targetVol * (step / fadeSteps));
            if (step >= fadeSteps) {
              clearInterval(fadeInterval);
              audio.volume = targetVol;
            }
          }, 50);
        } else if (isTrackError(trackName)) {
          loadingTrack = '';
          console.warn(`[MusicEngine] Track "${trackName}" failed to load.`);
          if (playlistMode) {
            bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
            startPlaylistTrack();
          }
        } else {
          // Still loading, check again
          setTimeout(waitForLoad, 200);
        }
      };
      setTimeout(waitForLoad, 200);
    }
  }

  /**
   * Start the current playlist track and set up the 'ended' handler to advance.
   */
  function startPlaylistTrack() {
    const trackName = BG_PLAYLIST[bgPlaylistIndex];

    // Pre-fetch the next track in the playlist so it's ready when needed
    const nextIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
    getAudio(BG_PLAYLIST[nextIndex]);

    const url = TRACK_URLS[trackName];
    if (!url) return;

    const audio = getAudio(trackName);
    if (!audio) return;

    // Playlist tracks should NOT loop - they play once then advance
    audio.loop = false;
    audio.currentTime = 0;

    // When this track ends, crossfade to the next one
    audio.onended = () => {
      if (!playlistMode || currentTrackName !== 'background') return;
      bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
      startPlaylistTrack();
    };

    if (isTrackReady(trackName)) {
      loadingTrack = '';
      if (currentAudio && currentAudio !== audio) {
        crossfade(currentAudio, audio, null);
      } else {
        cancelCrossfade();
        audio.volume = 0;
        currentAudio = audio;
        const targetVol = mutedFlag ? 0 : volume;
        const p = audio.play();
        if (p && p.catch) p.catch(e => console.warn('[MusicEngine] Autoplay blocked:', e.message));
        let step = 0;
        const fadeSteps = 10;
        const fadeInterval = setInterval(() => {
          step++;
          audio.volume = Math.min(targetVol, targetVol * (step / fadeSteps));
          if (step >= fadeSteps) {
            clearInterval(fadeInterval);
            audio.volume = targetVol;
          }
        }, 50);
      }
    } else if (isTrackError(trackName)) {
      console.warn(`[MusicEngine] Playlist track "${trackName}" failed to load, skipping.`);
      bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
      // Avoid infinite loop if all tracks fail
      let attempts = 0;
      const tryNext = () => {
        attempts++;
        if (attempts >= BG_PLAYLIST.length) {
          console.error('[MusicEngine] All playlist tracks failed to load.');
          isPlaying = false;
          return;
        }
        if (isTrackError(BG_PLAYLIST[bgPlaylistIndex])) {
          bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
          tryNext();
        } else {
          startPlaylistTrack();
        }
      };
      tryNext();
    } else {
      // Still loading
      loadingTrack = trackName;
      const waitForLoad = () => {
        if (!playlistMode || currentTrackName !== 'background') return;
        if (isTrackReady(trackName)) {
          loadingTrack = '';
          // Re-trigger start now that it's ready
          startPlaylistTrack();
        } else if (isTrackError(trackName)) {
          loadingTrack = '';
          bgPlaylistIndex = (bgPlaylistIndex + 1) % BG_PLAYLIST.length;
          startPlaylistTrack();
        } else {
          setTimeout(waitForLoad, 200);
        }
      };
      setTimeout(waitForLoad, 200);
    }
  }

  /**
   * Stop all music playback.
   */
  function stop() {
    isPlaying = false;
    playlistMode = false;
    currentTrackName = '';
    loadingTrack = '';
    cancelCrossfade();

    if (currentAudio) {
      // Quick fade out to avoid pop
      const audio = currentAudio;
      const startVol = audio.volume;
      let step = 0;
      const fadeSteps = 10;
      const fadeInterval = setInterval(() => {
        step++;
        audio.volume = Math.max(0, startVol * (1 - step / fadeSteps));
        if (step >= fadeSteps) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.currentTime = 0;
          audio.volume = mutedFlag ? 0 : volume; // Reset for next use
        }
      }, 20);
      currentAudio = null;
    }
  }

  /**
   * Stop all music and SFX.
   */
  function stopAll() {
    stop();
  }

  function setVolume(v) {
    volume = Math.max(0, Math.min(1, v));
    const effectiveVolume = mutedFlag ? 0 : volume;
    if (currentAudio) currentAudio.volume = effectiveVolume;
    if (nextAudio) nextAudio.volume = effectiveVolume;
  }

  function getVolume() {
    return volume;
  }

  function toggleMute() {
    mutedFlag = !mutedFlag;
    const effectiveVolume = mutedFlag ? 0 : volume;
    if (currentAudio) currentAudio.volume = effectiveVolume;
    if (nextAudio) nextAudio.volume = effectiveVolume;
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

  /**
   * Returns the name of the track currently loading, or '' if not loading.
   * UI can check this to show a "Loading music..." indicator.
   */
  function getLoadingTrack() {
    return loadingTrack;
  }

  // ============================================================
  // SOUND EFFECTS (procedural Web Audio API - preserved from original)
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

  // ============================================================
  // PUBLIC API
  // ============================================================

  return {
    init,
    playTrack,
    stop,
    setVolume,
    getVolume,
    toggleMute,
    isMuted,
    toggleSfxMute,
    isSfxMuted,
    getIsPlaying,
    playSfx,
    stopAll,
    // Bonus: loading state for UI
    getLoadingTrack,
  };
})();
