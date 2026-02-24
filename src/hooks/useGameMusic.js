import { useEffect } from 'react';
import { getAvailableJukeboxSongs } from '../data/jukeboxSongs';

export default function useGameMusic({
  toggleId,
  popupId,
  statusId,
  playOnIds = [],
  pauseOnIds = [],
  togglePauseIds = [],
  interactionSelectors = [],
  startChecked = false,
  enableHeadsetControls = true,
  sequenceWindowMs = 5000
}) {
  const playOnIdsKey = playOnIds.join('|');
  const pauseOnIdsKey = pauseOnIds.join('|');
  const togglePauseIdsKey = togglePauseIds.join('|');
  const interactionSelectorsKey = interactionSelectors.join('|');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return undefined;
    const playIds = playOnIdsKey ? playOnIdsKey.split('|') : [];
    const pauseIds = pauseOnIdsKey ? pauseOnIdsKey.split('|') : [];
    const toggleIds = togglePauseIdsKey ? togglePauseIdsKey.split('|') : [];
    const interactionIds = interactionSelectorsKey ? interactionSelectorsKey.split('|') : [];

    const baseRaw = import.meta.env.BASE_URL || '/';
    const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`;

    const popupEl = popupId ? document.getElementById(popupId) : null;
    const toggleEl = toggleId ? document.getElementById(toggleId) : null;
    const statusEl = statusId ? document.getElementById(statusId) : null;

    let popupTimer = null;
    let musicEnabled = Boolean(startChecked);
    let enabledSongs = [];
    let queue = [];
    let currentSong = null;
    let triedFallbackForSong = false;
    let previousSongs = [];
    let externalTrackLock = false;
    let externalTrackStopOnEnd = false;
    let tapCount = 0;
    let lastTapAt = 0;
    let tapResetTimer = null;
    const tapDecisionMs = 320;

    const shuffle = (arr) => {
      const copy = arr.slice();
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };

    const loadEnabledSongs = () => {
      const user = localStorage.getItem('mathpop_current_user');
      if (!user) return [];
      const raw = localStorage.getItem(`mathpop_jukebox_${user}`);
      if (!raw) return [];
      try {
        const state = JSON.parse(raw);
        return getAvailableJukeboxSongs(user)
          .filter((song) => Boolean(state?.[song.id]))
          .map((song) => ({ title: song.label, filename: song.filename }));
      } catch {
        return [];
      }
    };

    const syncSongsFromProfile = () => {
      enabledSongs = loadEnabledSongs();
      queue = [];
      currentSong = null;
      triedFallbackForSong = false;
      previousSongs = [];
      if (!enabledSongs.length && statusEl) {
        statusEl.textContent = 'No songs enabled. Turn songs On in Profile > Benny Jukebox.';
      }
    };

    const audio = new Audio();
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0.85;

    const showNowPlaying = (title) => {
      if (!popupEl) return;
      popupEl.textContent = `Now Playing: ${title}`;
      popupEl.classList.add('show');
      if (popupTimer) clearTimeout(popupTimer);
      popupTimer = setTimeout(() => popupEl.classList.remove('show'), 2200);
    };

    const pullNextSong = () => {
      if (!enabledSongs.length) return null;
      if (!queue.length) queue = shuffle(enabledSongs);
      return queue.shift() || null;
    };

    const setSongSource = (song, useFallback = false) => {
      if (!song) return false;
      currentSong = song;
      triedFallbackForSong = useFallback;
      const filename = song.filename.replace(/^\//, '');
      audio.src = useFallback
        ? `/audio/jukebox/${filename}`
        : `${base}audio/jukebox/${filename}`;
      audio.load();
      return true;
    };

    const onAudioError = () => {
      if (!currentSong) return;
      if (!triedFallbackForSong) {
        setSongSource(currentSong, true);
        return;
      }
      if (externalTrackLock) {
        externalTrackLock = false;
        externalTrackStopOnEnd = false;
        if (statusEl) statusEl.textContent = 'Forced track unavailable.';
        return;
      }
      skipToNextSong();
    };

    const onAudioEnded = () => {
      if (externalTrackLock) {
        externalTrackLock = false;
        if (externalTrackStopOnEnd) {
          externalTrackStopOnEnd = false;
          return;
        }
      }
      skipToNextSong();
    };
    audio.loop = false;
    audio.addEventListener('error', onAudioError);
    audio.addEventListener('ended', onAudioEnded);

    syncSongsFromProfile();

    const playMusic = () => {
      if (!musicEnabled) return;
      if (!enabledSongs.length) {
        syncSongsFromProfile();
        if (!enabledSongs.length) return;
      }
      if (!currentSong) {
        const next = pullNextSong();
        if (!next || !setSongSource(next, false)) return;
      }
      const wasPaused = audio.paused;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.then(() => {
          if (wasPaused && currentSong) showNowPlaying(currentSong.title);
        }).catch(() => {
          if (statusEl) statusEl.textContent = 'Music blocked by browser. Tap Music once.';
        });
        return;
      }
      if (wasPaused && currentSong) showNowPlaying(currentSong.title);
    };

    const pauseMusic = () => {
      audio.pause();
    };

    const resetTapSequence = () => {
      tapCount = 0;
      lastTapAt = 0;
      if (tapResetTimer) {
        clearTimeout(tapResetTimer);
        tapResetTimer = null;
      }
    };

    const scheduleTapReset = () => {
      if (tapResetTimer) clearTimeout(tapResetTimer);
      tapResetTimer = setTimeout(() => {
        const count = tapCount;
        resetTapSequence();
        if (count >= 3) {
          goToPreviousSong();
          return;
        }
        if (count === 2) {
          skipToNextSong();
          return;
        }
        if (count === 1) {
          if (audio.paused) {
            playMusic();
          } else {
            pauseMusic();
          }
        }
      }, tapDecisionMs);
    };

    const skipToNextSong = () => {
      if (externalTrackLock) return;
      if (!enabledSongs.length) {
        syncSongsFromProfile();
        if (!enabledSongs.length) return;
      }
      if (currentSong) previousSongs.push(currentSong);
      const next = pullNextSong();
      if (!next || !setSongSource(next, false)) return;
      playMusic();
    };

    const goToPreviousSong = () => {
      if (externalTrackLock) return;
      if (!previousSongs.length) return;
      const previous = previousSongs.pop();
      if (currentSong) queue.unshift(currentSong);
      if (!setSongSource(previous, false)) return;
      playMusic();
    };

    const onHeadsetTap = () => {
      if (externalTrackLock) return;
      const now = Date.now();
      if (now - lastTapAt > sequenceWindowMs) tapCount = 0;
      tapCount += 1;
      lastTapAt = now;
      scheduleTapReset();
    };

    const playExternalTrack = ({ title, filename, lock = true, stopOnEnd = false }) => {
      if (!filename) return;
      externalTrackLock = Boolean(lock);
      externalTrackStopOnEnd = Boolean(stopOnEnd);
      const forcedSong = {
        title: title || String(filename).replace(/\.[a-z0-9]+$/i, ''),
        filename
      };
      if (!setSongSource(forcedSong, false)) return;
      const p = audio.play();
      if (p && typeof p.catch === 'function') {
        p.then(() => showNowPlaying(forcedSong.title)).catch(() => {
          if (statusEl) statusEl.textContent = 'Music blocked by browser. Tap Music once.';
        });
        return;
      }
      showNowPlaying(forcedSong.title);
    };

    const onMusicControl = (event) => {
      const detail = event?.detail || {};
      const action = String(detail.action || '').toLowerCase();
      if (!action) return;
      if (action === 'play-track') {
        playExternalTrack(detail);
        return;
      }
      if (action === 'pause') {
        pauseMusic();
        return;
      }
      if (action === 'resume') {
        if (audio.paused) {
          if (currentSong) {
            const p = audio.play();
            if (p && typeof p.catch === 'function') {
              p.catch(() => {
                if (statusEl) statusEl.textContent = 'Music blocked by browser. Tap Music once.';
              });
            }
          } else {
            playMusic();
          }
        }
        return;
      }
      if (action === 'unlock') {
        externalTrackLock = false;
        externalTrackStopOnEnd = false;
      }
    };
    window.addEventListener('mathpop:music-control', onMusicControl);

    const onToggleChange = () => {
      musicEnabled = Boolean(toggleEl?.checked);
      if (!musicEnabled) {
        pauseMusic();
        resetTapSequence();
      } else {
        syncSongsFromProfile();
        playMusic();
      }
    };

    let onToggleClick = null;
    if (toggleEl) {
      toggleEl.checked = musicEnabled;
      toggleEl.addEventListener('change', onToggleChange);
      if (enableHeadsetControls) {
        onToggleClick = (e) => {
          if (!musicEnabled) return;
          e.preventDefault();
          onHeadsetTap();
        };
        toggleEl.addEventListener('click', onToggleClick);
      }
    }

    const playHandlers = [];
    playIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => playMusic();
      el.addEventListener('click', handler);
      playHandlers.push([el, handler]);
    });

    const pauseHandlers = [];
    pauseIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => pauseMusic();
      el.addEventListener('click', handler);
      pauseHandlers.push([el, handler]);
    });

    const togglePauseHandlers = [];
    toggleIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => {
        window.setTimeout(() => {
          const text = (el.textContent || '').toLowerCase();
          if (text.includes('resume')) {
            pauseMusic();
          } else {
            playMusic();
          }
        }, 0);
      };
      el.addEventListener('click', handler);
      togglePauseHandlers.push([el, handler]);
    });

    const interactionHandlers = [];
    interactionIds.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el) return;
      const handler = () => playMusic();
      el.addEventListener('pointerdown', handler);
      interactionHandlers.push([el, handler, 'pointerdown']);
    });

    return () => {
      pauseMusic();
      audio.removeEventListener('error', onAudioError);
      if (toggleEl) toggleEl.removeEventListener('change', onToggleChange);
      if (toggleEl && onToggleClick) toggleEl.removeEventListener('click', onToggleClick);
      playHandlers.forEach(([el, handler]) => el.removeEventListener('click', handler));
      pauseHandlers.forEach(([el, handler]) => el.removeEventListener('click', handler));
      togglePauseHandlers.forEach(([el, handler]) => el.removeEventListener('click', handler));
      interactionHandlers.forEach(([el, handler, event]) => el.removeEventListener(event, handler));
      window.removeEventListener('mathpop:music-control', onMusicControl);
      if (popupTimer) clearTimeout(popupTimer);
      if (tapResetTimer) clearTimeout(tapResetTimer);
      if (popupEl) popupEl.classList.remove('show');
      audio.removeEventListener('ended', onAudioEnded);
      audio.removeEventListener('error', onAudioError);
    };
  }, [
    toggleId,
    popupId,
    statusId,
    playOnIdsKey,
    pauseOnIdsKey,
    togglePauseIdsKey,
    interactionSelectorsKey,
    startChecked,
    enableHeadsetControls,
    sequenceWindowMs
  ]);
}
