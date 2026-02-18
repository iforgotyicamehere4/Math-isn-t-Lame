export const JUKEBOX_SONGS = [
  {
    "id": "song-01",
    "label": "Math isn’t lame",
    "filename": "01-math-isnt-lame.mp3",
    "originalFilename": " Math isn’t lame.mp3"
  },
  {
    "id": "song-02",
    "label": "5ever is a long time",
    "filename": "02-5ever-is-a-long-time.mp3",
    "originalFilename": "5ever is a long time.mp3"
  },
  {
    "id": "song-03",
    "label": "Al-Khwarizmi Father of Algebra",
    "filename": "03-al-khwarizmi-father-of-algebra.mp3",
    "originalFilename": "Al-Khwarizmi Father of Algebra.mp3"
  },
  {
    "id": "song-04",
    "label": "Avila Dynamics",
    "filename": "04-avila-dynamics.mp3",
    "originalFilename": "Avila Dynamics.mp3"
  },
  {
    "id": "song-05",
    "label": "Cloudy numbers with a chance of math",
    "filename": "05-cloudy-numbers-with-a-chance-of-math.mp3",
    "originalFilename": "Cloudy numbers with a chance of math.mp3"
  },
  {
    "id": "song-06",
    "label": "Common denominator",
    "filename": "06-common-denominator.mp3",
    "originalFilename": "Common denominator.mp3"
  },
  {
    "id": "song-07",
    "label": "Decimal situation",
    "filename": "07-decimal-situation.mp3",
    "originalFilename": "Decimal situation.mp3"
  },
  {
    "id": "song-08",
    "label": "Dedicated to Ahmed Baba al-Timbukti",
    "filename": "08-dedicated-to-ahmed-baba-al-timbukti.mp3",
    "originalFilename": "Dedicated to Ahmed Baba al-Timbukti.mp3"
  },
  {
    "id": "song-09",
    "label": "Dedicated to Einstein",
    "filename": "09-dedicated-to-einstein.mp3",
    "originalFilename": "Dedicated to Einstein.mp3"
  },
  {
    "id": "song-10",
    "label": "Dedicated to Jose Adem",
    "filename": "10-dedicated-to-jose-adem.mp3",
    "originalFilename": "Dedicated to Jose Adem.mp3"
  },
  {
    "id": "song-11",
    "label": "Dedicated to Sofia Kovalevskaya",
    "filename": "11-dedicated-to-sofia-kovalevskaya.mp3",
    "originalFilename": "Dedicated to Sofia Kovalevskaya.mp3"
  },
  {
    "id": "song-12",
    "label": "Dedicated to Srinivasa Ramanujan",
    "filename": "12-dedicated-to-srinivasa-ramanujan.mp3",
    "originalFilename": "Dedicated to Srinivasa Ramanujan.mp3"
  },
  {
    "id": "song-13",
    "label": "Dedicated to Thomas Fuller",
    "filename": "13-dedicated-to-thomas-fuller.mp3",
    "originalFilename": "Dedicated to Thomas Fuller.mp3"
  },
  {
    "id": "song-14",
    "label": "Do you even geometrize_",
    "filename": "14-do-you-even-geometrize.mp3",
    "originalFilename": "Do you even geometrize_.mp3"
  },
  {
    "id": "song-15",
    "label": "Falling Numbers",
    "filename": "15-falling-numbers.mp3",
    "originalFilename": "Falling Numbers.mp3"
  },
  {
    "id": "song-16",
    "label": "Fraction funk",
    "filename": "16-fraction-funk.mp3",
    "originalFilename": "Fraction funk.mp3"
  },
  {
    "id": "song-17",
    "label": "Goofy Numbers",
    "filename": "17-goofy-numbers.mp3",
    "originalFilename": "Goofy Numbers.mp3"
  },
  {
    "id": "song-18",
    "label": "Jump!",
    "filename": "18-jump.mp3",
    "originalFilename": "Jump!.mp3"
  },
  {
    "id": "song-19",
    "label": "Katherine Johnson mission mathematics",
    "filename": "19-katherine-johnson-mission-mathematics.mp3",
    "originalFilename": "Katherine Johnson mission mathematics .mp3"
  },
  {
    "id": "song-20",
    "label": "Kiyoshi’s Probability",
    "filename": "20-kiyoshis-probability.mp3",
    "originalFilename": "Kiyoshi’s Probability.mp3"
  },
  {
    "id": "song-21",
    "label": "Logarithm",
    "filename": "21-logarithm.mp3",
    "originalFilename": "Logarithm.mp3"
  },
  {
    "id": "song-22",
    "label": "The Ballad of Miguel de Guzmán",
    "filename": "22-the-ballad-of-miguel-de-guzman.mp3",
    "originalFilename": "The Ballad of Miguel de Guzmán.mp3"
  },
  {
    "id": "song-23",
    "label": "The Lovelace Loop",
    "filename": "23-the-lovelace-loop.mp3",
    "originalFilename": "The Lovelace Loop.mp3"
  },
  {
    "id": "song-24",
    "label": "The Mirzakhani Method",
    "filename": "24-the-mirzakhani-method.mp3",
    "originalFilename": "The Mirzakhani Method.mp3"
  },
  {
    "id": "song-25",
    "label": "What if 7never89",
    "filename": "25-what-if-7never89.mp3",
    "originalFilename": "What if 7never89.mp3"
  },
  {
    "id": "song-26",
    "label": "Syntax Queen Theme song",
    "filename": "Syntax Queen Theme song.mp3",
    "originalFilename": "Syntax Queen Theme song.mp3"
  },
  {
    "id": "song-27",
    "label": "For the Dev",
    "filename": "For the Dev.mp3",
    "originalFilename": "For the Dev.mp3"
  }
];

const BENNY_DASH_DIFFICULTIES = ['easy', 'medium', 'mathanomical'];
const BOSS_UNLOCK_SONG_IDS = new Set(['song-26', 'song-27']);

function readStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

function parseProgress(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function hasBennyDashCompletion(user, storage) {
  if (!user) return false;
  const store = readStorage(storage);
  if (!store) return false;

  const scopedComplete = BENNY_DASH_DIFFICULTIES.some((mode) => {
    const key = `mathpop_benny_dash_progress_${user}_${mode}`;
    const data = parseProgress(store.getItem(key));
    return Boolean(data?.bossWonThisLevel);
  });
  if (scopedComplete) return true;

  const legacy = parseProgress(store.getItem(`mathpop_benny_dash_progress_${user}`));
  return Boolean(legacy?.bossWonThisLevel);
}

export function getAvailableJukeboxSongs(user, storage) {
  const unlocked = hasBennyDashCompletion(user, storage);
  return JUKEBOX_SONGS.filter((song) => {
    if (!BOSS_UNLOCK_SONG_IDS.has(song.id)) return true;
    return unlocked;
  });
}
