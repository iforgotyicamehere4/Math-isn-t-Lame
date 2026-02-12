import { useEffect } from 'react';
import { JUKEBOX_SONGS } from '../data/jukeboxSongs';

export default function useGameMusic({
  toggleId,
  popupId,
  statusId,
  playOnIds = [],
  pauseOnIds = [],
  togglePauseIds = [],
  interactionSelectors = []
}) {
  useEffect(() => {
    if (typeof window === 'undefined' || typeof Audio === 'undefined') return undefined;

    const baseRaw = import.meta.env.BASE_URL || '/';
    const base = baseRaw.endsWith('/') ? baseRaw : `${baseRaw}/`;

    const popupEl = popupId ? document.getElementById(popupId) : null;
    const toggleEl = toggleId ? document.getElementById(toggleId) : null;
    const statusEl = statusId ? document.getElementById(statusId) : null;

    let popupTimer = null;
    let musicEnabled = true;
    let enabledSongs = [];
    let queue = [];
    let currentSong = null;
    let triedFallbackForSong = false;

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
        return JUKEBOX_SONGS
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
      const next = pullNextSong();
      if (!next || !setSongSource(next, false)) return;
      if (musicEnabled) playMusic();
    };

    const onAudioEnded = () => {
      const next = pullNextSong();
      if (!next || !setSongSource(next, false)) return;
      playMusic();
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

    const onToggleChange = () => {
      musicEnabled = Boolean(toggleEl?.checked);
      if (!musicEnabled) {
        pauseMusic();
      } else {
        syncSongsFromProfile();
        playMusic();
      }
    };

    if (toggleEl) {
      toggleEl.checked = true;
      toggleEl.addEventListener('change', onToggleChange);
    }

    const playHandlers = [];
    playOnIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => playMusic();
      el.addEventListener('click', handler);
      playHandlers.push([el, handler]);
    });

    const pauseHandlers = [];
    pauseOnIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const handler = () => pauseMusic();
      el.addEventListener('click', handler);
      pauseHandlers.push([el, handler]);
    });

    const togglePauseHandlers = [];
    togglePauseIds.forEach((id) => {
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
    interactionSelectors.forEach((selector) => {
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
      playHandlers.forEach(([el, handler]) => el.removeEventListener('click', handler));
      pauseHandlers.forEach(([el, handler]) => el.removeEventListener('click', handler));
      togglePauseHandlers.forEach(([el, handler]) => el.removeEventListener('click', handler));
      interactionHandlers.forEach(([el, handler, event]) => el.removeEventListener(event, handler));
      if (popupTimer) clearTimeout(popupTimer);
      if (popupEl) popupEl.classList.remove('show');
      audio.removeEventListener('ended', onAudioEnded);
      audio.removeEventListener('error', onAudioError);
    };
  }, [
    toggleId,
    popupId,
    statusId,
    playOnIds.join('|'),
    pauseOnIds.join('|'),
    togglePauseIds.join('|'),
    interactionSelectors.join('|')
  ]);
}
