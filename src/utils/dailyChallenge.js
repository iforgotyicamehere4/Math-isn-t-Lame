const DAILY_CHALLENGE_COUNT = 365;
const DAILY_CHALLENGE_POINTS = 8000;
const DAY_MS = 24 * 60 * 60 * 1000;

function pad2(value) {
  return String(value).padStart(2, '0');
}

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = pad2(date.getMonth() + 1);
  const d = pad2(date.getDate());
  return `${y}-${m}-${d}`;
}

function normalizeChallengeDay(dayIndexZeroBased) {
  return ((Math.max(0, dayIndexZeroBased) % DAILY_CHALLENGE_COUNT) + 1);
}

function xmur3(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i += 1) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

function mulberry32(seed) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pickWeighted(rng, weightedValues) {
  const total = weightedValues.reduce((sum, item) => sum + item.weight, 0);
  let cursor = rng() * total;
  for (let i = 0; i < weightedValues.length; i += 1) {
    cursor -= weightedValues[i].weight;
    if (cursor <= 0) return weightedValues[i].value;
  }
  return weightedValues[weightedValues.length - 1].value;
}

function gameRoute(gameId) {
  if (gameId === 'capture') return '/capture';
  if (gameId === 'decimal') return '/decimal';
  if (gameId === 'mathsynth') return '/mathsynth';
  return '/game';
}

function gameLabel(gameId) {
  if (gameId === 'capture') return 'Capture The Fraction';
  if (gameId === 'decimal') return 'Deci-What?';
  if (gameId === 'mathsynth') return 'Ma+h5Yn+h3';
  return 'Math Pup';
}

function getChallengeTier(dayIndex) {
  if (dayIndex <= 75) {
    return {
      name: 'Warmup',
      games: [
        {
          gameId: 'mathpup',
          weight: 4,
          levels: [{ value: 'Easy', weight: 6 }, { value: 'Easy25', weight: 4 }],
          targetMin: 9,
          targetMax: 11
        },
        {
          gameId: 'capture',
          weight: 4,
          levels: [{ value: 'easy', weight: 6 }, { value: 'easy25', weight: 4 }],
          targetMin: 8,
          targetMax: 10
        },
        {
          gameId: 'decimal',
          weight: 4,
          levels: [{ value: 'easy20', weight: 5 }, { value: 'easy25', weight: 3 }, { value: 'easy30', weight: 2 }],
          targetMin: 8,
          targetMax: 10
        },
        {
          gameId: 'mathsynth',
          weight: 3,
          levels: [{ value: 'easy', weight: 1 }],
          targetMin: 7,
          targetMax: 9
        }
      ]
    };
  }
  if (dayIndex <= 150) {
    return {
      name: 'Builder',
      games: [
        {
          gameId: 'mathpup',
          weight: 4,
          levels: [{ value: 'Easy25', weight: 4 }, { value: 'Easy50', weight: 3 }, { value: 'Easy75', weight: 2 }, { value: 'Medium', weight: 1 }],
          targetMin: 10,
          targetMax: 12
        },
        {
          gameId: 'capture',
          weight: 4,
          levels: [{ value: 'easy25', weight: 3 }, { value: 'medium', weight: 4 }, { value: 'medium25', weight: 3 }],
          targetMin: 9,
          targetMax: 11
        },
        {
          gameId: 'decimal',
          weight: 4,
          levels: [{ value: 'easy25', weight: 3 }, { value: 'easy30', weight: 3 }, { value: 'medium', weight: 4 }],
          targetMin: 9,
          targetMax: 11
        },
        {
          gameId: 'mathsynth',
          weight: 3,
          levels: [{ value: 'easy', weight: 3 }, { value: 'medium', weight: 2 }],
          targetMin: 8,
          targetMax: 10
        }
      ]
    };
  }
  if (dayIndex <= 230) {
    return {
      name: 'Mix-Up',
      games: [
        {
          gameId: 'mathpup',
          weight: 4,
          levels: [{ value: 'Easy50', weight: 2 }, { value: 'Easy75', weight: 3 }, { value: 'Medium', weight: 3 }, { value: 'Medium26', weight: 2 }],
          targetMin: 10,
          targetMax: 13
        },
        {
          gameId: 'capture',
          weight: 4,
          levels: [{ value: 'medium', weight: 4 }, { value: 'medium25', weight: 4 }, { value: 'mathanomical', weight: 2 }],
          targetMin: 10,
          targetMax: 12
        },
        {
          gameId: 'decimal',
          weight: 4,
          levels: [{ value: 'easy30', weight: 2 }, { value: 'medium', weight: 4 }, { value: 'mathamatical', weight: 4 }],
          targetMin: 10,
          targetMax: 12
        },
        {
          gameId: 'mathsynth',
          weight: 3,
          levels: [{ value: 'easy', weight: 2 }, { value: 'medium', weight: 4 }, { value: 'mathanomical', weight: 2 }],
          targetMin: 8,
          targetMax: 11
        }
      ]
    };
  }
  if (dayIndex <= 300) {
    return {
      name: 'Champion',
      games: [
        {
          gameId: 'mathpup',
          weight: 4,
          levels: [{ value: 'Easy75', weight: 2 }, { value: 'Medium', weight: 3 }, { value: 'Medium26', weight: 3 }, { value: 'Medium60', weight: 2 }],
          targetMin: 10,
          targetMax: 13
        },
        {
          gameId: 'capture',
          weight: 4,
          levels: [{ value: 'medium', weight: 3 }, { value: 'medium25', weight: 4 }, { value: 'mathanomical', weight: 3 }],
          targetMin: 10,
          targetMax: 12
        },
        {
          gameId: 'decimal',
          weight: 4,
          levels: [{ value: 'medium', weight: 4 }, { value: 'mathamatical', weight: 6 }],
          targetMin: 10,
          targetMax: 12
        },
        {
          gameId: 'mathsynth',
          weight: 3,
          levels: [{ value: 'medium', weight: 5 }, { value: 'mathanomical', weight: 3 }],
          targetMin: 9,
          targetMax: 11
        }
      ]
    };
  }
  return {
    name: 'All-Star',
    games: [
      {
        gameId: 'mathpup',
        weight: 4,
        levels: [{ value: 'Medium', weight: 3 }, { value: 'Medium26', weight: 3 }, { value: 'Medium60', weight: 3 }, { value: 'Medium100', weight: 2 }],
        targetMin: 9,
        targetMax: 12
      },
      {
        gameId: 'capture',
        weight: 4,
        levels: [{ value: 'medium25', weight: 5 }, { value: 'mathanomical', weight: 5 }],
        targetMin: 10,
        targetMax: 12
      },
      {
        gameId: 'decimal',
        weight: 4,
        levels: [{ value: 'medium', weight: 4 }, { value: 'mathamatical', weight: 6 }],
        targetMin: 10,
        targetMax: 12
      },
      {
        gameId: 'mathsynth',
        weight: 3,
        levels: [{ value: 'medium', weight: 4 }, { value: 'mathanomical', weight: 6 }],
        targetMin: 9,
        targetMax: 11
      }
    ]
  };
}

function buildChallenge(seedTag, year, dayIndex, dateKey) {
  const seedFactory = xmur3(seedTag);
  const rng = mulberry32(seedFactory());
  const tier = getChallengeTier(dayIndex);
  const gameConfig = pickWeighted(rng, tier.games.map((item) => ({ value: item, weight: item.weight })));
  const level = pickWeighted(rng, gameConfig.levels);
  const requiredCorrect = randInt(rng, gameConfig.targetMin, gameConfig.targetMax);
  const estMinutes = Math.max(6, Math.min(16, requiredCorrect + randInt(rng, -2, 3)));

  return {
    id: `daily-${year}-${dayIndex}`,
    dateKey,
    dayIndex,
    totalDays: DAILY_CHALLENGE_COUNT,
    gameId: gameConfig.gameId,
    gameLabel: gameLabel(gameConfig.gameId),
    route: gameRoute(gameConfig.gameId),
    level,
    requiredCorrect,
    points: DAILY_CHALLENGE_POINTS,
    tier: tier.name,
    estimatedMinutes: estMinutes,
    title: `${tier.name} Daily #${dayIndex}`,
    description: `Play ${gameLabel(gameConfig.gameId)} on ${level} and get ${requiredCorrect} correct answers.`
  };
}

function challengeDateFromDay(year, dayIndex) {
  const d = new Date(year, 0, 1);
  d.setDate(d.getDate() + dayIndex - 1);
  return d;
}

function getProfileCreatedAt(user) {
  if (!user || typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(`mathpop_profile_${user}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const created = Number(parsed?.created);
    if (!Number.isFinite(created)) return null;
    return created;
  } catch {
    return null;
  }
}

function getUserAnchorKey(user) {
  return `mathpop_daily_anchor_${user || 'guest'}`;
}

function getUserAnchorMs(user, nowMs = Date.now()) {
  if (!user || typeof window === 'undefined' || !window.localStorage) return nowMs;
  const anchorKey = getUserAnchorKey(user);
  const savedAnchor = Number(window.localStorage.getItem(anchorKey));
  if (Number.isFinite(savedAnchor) && savedAnchor > 0) return savedAnchor;

  const profileCreated = getProfileCreatedAt(user);
  const createdLooksEpoch = Number.isFinite(profileCreated) && profileCreated > 946684800000;
  const anchor = createdLooksEpoch ? profileCreated : nowMs;
  window.localStorage.setItem(anchorKey, String(anchor));
  return anchor;
}

export function getDailyChallengeForUser(user, date = new Date()) {
  const nowMs = date.getTime();
  const anchorMs = getUserAnchorMs(user, nowMs);
  const elapsed = Math.max(0, nowMs - anchorMs);
  const windowIndex = Math.floor(elapsed / DAY_MS);
  const dayIndex = normalizeChallengeDay(windowIndex);
  const windowStartMs = anchorMs + (windowIndex * DAY_MS);
  const windowStartDate = new Date(windowStartMs);
  const dateKey = formatDateKey(windowStartDate);
  const year = windowStartDate.getFullYear();
  const seedTag = `${year}-all-games-daily-${dayIndex}`;
  return buildChallenge(seedTag, year, dayIndex, dateKey);
}

function getChallengeForWindowIndex(user, windowIndex, nowMs = Date.now()) {
  const anchorMs = getUserAnchorMs(user, nowMs);
  const safeIndex = Math.max(0, Math.floor(windowIndex));
  const windowStartMs = anchorMs + (safeIndex * DAY_MS);
  const windowStartDate = new Date(windowStartMs);
  const dayIndex = normalizeChallengeDay(safeIndex);
  const dateKey = formatDateKey(windowStartDate);
  const year = windowStartDate.getFullYear();
  const seedTag = `${year}-all-games-daily-${dayIndex}`;
  return buildChallenge(seedTag, year, dayIndex, dateKey);
}

export function getDailyChallengeForDate(date = new Date()) {
  const year = date.getFullYear();
  const dayOfYear = (() => {
    const utc = Date.UTC(year, date.getMonth(), date.getDate());
    const yearStart = Date.UTC(year, 0, 0);
    return Math.floor((utc - yearStart) / DAY_MS);
  })();
  const dayIndex = normalizeChallengeDay(dayOfYear - 1);
  const dateKey = formatDateKey(date);
  const seedTag = `${year}-all-games-daily-${dayIndex}`;
  return buildChallenge(seedTag, year, dayIndex, dateKey);
}

export function getYearDailyChallenges(year = new Date().getFullYear()) {
  const list = [];
  for (let i = 1; i <= DAILY_CHALLENGE_COUNT; i += 1) {
    const challengeDate = challengeDateFromDay(year, i);
    const dateKey = formatDateKey(challengeDate);
    const seedTag = `${year}-all-games-daily-${i}`;
    list.push(buildChallenge(seedTag, year, i, dateKey));
  }
  return list;
}

export function getDailyChallengeStorageKey(user) {
  return `mathpop_daily_challenge_state_${user || 'guest'}`;
}

function defaultState() {
  return {
    claims: {},
    progress: {},
    streak: 0,
    lastClaimDate: null,
    totalCompleted: 0
  };
}

export function loadDailyChallengeState(user) {
  if (!user) return defaultState();
  try {
    const raw = window.localStorage.getItem(getDailyChallengeStorageKey(user));
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return {
      claims: parsed?.claims && typeof parsed.claims === 'object' ? parsed.claims : {},
      progress: parsed?.progress && typeof parsed.progress === 'object' ? parsed.progress : {},
      streak: Number(parsed?.streak) || 0,
      lastClaimDate: parsed?.lastClaimDate || null,
      totalCompleted: Number(parsed?.totalCompleted) || 0
    };
  } catch {
    return defaultState();
  }
}

export function getDailyChallengeStatus(user, date = new Date()) {
  if (!user || typeof window === 'undefined' || !window.localStorage) {
    const challenge = getDailyChallengeForDate(date);
    const dateKey = challenge.dateKey;
    return {
      challenge,
      dateKey,
      claimed: false,
      progress: null,
      streak: 0,
      totalCompleted: 0,
      unlockedCount: 1,
      pendingCount: 1
    };
  }

  const nowMs = date.getTime();
  const anchorMs = getUserAnchorMs(user, nowMs);
  const elapsed = Math.max(0, nowMs - anchorMs);
  const unlockedCount = Math.max(1, Math.floor(elapsed / DAY_MS) + 1);
  const state = loadDailyChallengeState(user);
  const completedCount = Object.keys(state.claims || {}).length;
  const activeWindowIndex = Math.max(0, unlockedCount - 1);
  const challenge = getChallengeForWindowIndex(user, activeWindowIndex, nowMs);
  const dateKey = challenge.dateKey;
  const claim = state.claims?.[dateKey];
  const progress = state.progress?.[dateKey] || null;
  const claimed = Boolean(claim && claim.challengeId === challenge.id);
  const pendingCount = Math.max(0, unlockedCount - completedCount);
  return {
    challenge,
    dateKey,
    claimed,
    progress,
    streak: Number(state.streak) || 0,
    totalCompleted: Number(state.totalCompleted) || 0,
    unlockedCount,
    pendingCount
  };
}

export { DAILY_CHALLENGE_COUNT, DAILY_CHALLENGE_POINTS };
