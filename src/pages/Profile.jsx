import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/profile.css';
import { JUKEBOX_SONGS, getAvailableJukeboxSongs } from '../data/jukeboxSongs';

const BENNY_COLORS = [
  { id: 'solid-01', name: 'Sky', type: 'solid', primary: '#7dd3fc' },
  { id: 'tone-01', name: 'Mint/Lime', type: 'tone', primary: '#6ee7b7', secondary: '#a3e635' },
  { id: 'solid-02', name: 'Lavender', type: 'solid', primary: '#c4b5fd' },
  { id: 'tone-02', name: 'Ocean/Blue', type: 'tone', primary: '#38bdf8', secondary: '#2563eb' },
  { id: 'solid-03', name: 'Sunshine', type: 'solid', primary: '#fde047' },
  { id: 'tone-03', name: 'Blush/Coral', type: 'tone', primary: '#f9a8d4', secondary: '#fb7185' },
  { id: 'solid-04', name: 'Mint', type: 'solid', primary: '#5eead4' },
  { id: 'tone-04', name: 'Berry/Plum', type: 'tone', primary: '#f472b6', secondary: '#a855f7' },
  { id: 'solid-05', name: 'Lime', type: 'solid', primary: '#a3e635' },
  { id: 'tone-05', name: 'Teal/Blue', type: 'tone', primary: '#22d3ee', secondary: '#0ea5e9' },
  { id: 'solid-06', name: 'Rose', type: 'solid', primary: '#fb7185' },
  { id: 'tone-06', name: 'Berry/Sun', type: 'tone', primary: '#f472b6', secondary: '#facc15' },
  { id: 'solid-07', name: 'Blue', type: 'solid', primary: '#60a5fa' },
  { id: 'tone-07', name: 'Grape/Indigo', type: 'tone', primary: '#818cf8', secondary: '#4f46e5' },
  { id: 'solid-08', name: 'Spring', type: 'solid', primary: '#86efac' },
  { id: 'tone-08', name: 'Ice/Lavender', type: 'tone', primary: '#a5b4fc', secondary: '#e0f2fe' },
  { id: 'solid-09', name: 'Bubblegum', type: 'solid', primary: '#f9a8d4' },
  { id: 'tone-09', name: 'Lemon/Lime', type: 'tone', primary: '#fde047', secondary: '#bef264' },
  { id: 'solid-10', name: 'Soft Gray', type: 'solid', primary: '#cbd5f5' },
  { id: 'tone-10', name: 'Cloud/Blue', type: 'tone', primary: '#e2e8f0', secondary: '#93c5fd' },
  { id: 'solid-11', name: 'Minty Blue', type: 'solid', primary: '#7dd3fc' },
  { id: 'tone-11', name: 'Aqua/Mint', type: 'tone', primary: '#2dd4bf', secondary: '#99f6e4' },
  { id: 'solid-12', name: 'Grape', type: 'solid', primary: '#c084fc' },
  { id: 'tone-12', name: 'Lilac/Rose', type: 'tone', primary: '#d8b4fe', secondary: '#fda4af' },
  { id: 'solid-13', name: 'Coral', type: 'solid', primary: '#fb7185' },
  { id: 'tone-13', name: 'Kiwi/Green', type: 'tone', primary: '#bef264', secondary: '#4ade80' },
  { id: 'solid-14', name: 'Ice Blue', type: 'solid', primary: '#bae6fd' },
  { id: 'tone-14', name: 'Sky/Indigo', type: 'tone', primary: '#60a5fa', secondary: '#6366f1' },
  { id: 'solid-15', name: 'Periwinkle', type: 'solid', primary: '#a5b4fc' },
  { id: 'tone-15', name: 'Mint/Teal', type: 'tone', primary: '#5eead4', secondary: '#14b8a6' },
  { id: 'solid-16', name: 'Sunbeam', type: 'solid', primary: '#fde68a' },
  { id: 'tone-16', name: 'Pink/Coral', type: 'tone', primary: '#fda4af', secondary: '#fb7185' },
  { id: 'solid-17', name: 'Cool Blue', type: 'solid', primary: '#93c5fd' },
  { id: 'tone-17', name: 'Lime/Teal', type: 'tone', primary: '#a3e635', secondary: '#2dd4bf' },
  { id: 'solid-18', name: 'Soft Plum', type: 'solid', primary: '#d8b4fe' },
  { id: 'tone-18', name: 'Sky/Mint', type: 'tone', primary: '#7dd3fc', secondary: '#6ee7b7' },
  { id: 'solid-19', name: 'Seafoam', type: 'solid', primary: '#99f6e4' },
  { id: 'tone-19', name: 'Berry/Sky', type: 'tone', primary: '#f472b6', secondary: '#60a5fa' },
  { id: 'solid-20', name: 'Sunny', type: 'solid', primary: '#facc15' },
  { id: 'tone-20', name: 'Cool Mint', type: 'tone', primary: '#5eead4', secondary: '#38bdf8' },
  { id: 'solid-21', name: 'Twilight', type: 'solid', primary: '#a78bfa' },
  { id: 'tone-21', name: 'Blue/Teal', type: 'tone', primary: '#3b82f6', secondary: '#14b8a6' },
  { id: 'solid-22', name: 'Spring Leaf', type: 'solid', primary: '#4ade80' },
  { id: 'tone-22', name: 'Lilac/Ice', type: 'tone', primary: '#c4b5fd', secondary: '#bae6fd' },
  { id: 'solid-23', name: 'Blush', type: 'solid', primary: '#fda4af' },
  { id: 'tone-23', name: 'Mint/Sky', type: 'tone', primary: '#5eead4', secondary: '#38bdf8' },
  { id: 'solid-24', name: 'Cool Mint', type: 'solid', primary: '#2dd4bf' },
  { id: 'tone-24', name: 'Sun/Lav', type: 'tone', primary: '#fde047', secondary: '#c4b5fd' },
  { id: 'solid-25', name: 'Powder', type: 'solid', primary: '#e2e8f0' },
  { id: 'tone-25', name: 'Rose/Mint', type: 'tone', primary: '#fb7185', secondary: '#6ee7b7' }
];

const DECIMAL_ACRYLICS = [
  { id: 'dp-01', primary: '#0c0b18', secondary: '#3b0f58' },
  { id: 'dp-02', primary: '#0b1026', secondary: '#0f6b6d' },
  { id: 'dp-03', primary: '#160a2a', secondary: '#5b1e57' },
  { id: 'dp-04', primary: '#071a24', secondary: '#164c70' },
  { id: 'dp-05', primary: '#140b1f', secondary: '#6b2a3f' },
  { id: 'dp-06', primary: '#09131c', secondary: '#246b4f' },
  { id: 'dp-07', primary: '#0e0f1e', secondary: '#4a2f8a' },
  { id: 'dp-08', primary: '#0a1a1f', secondary: '#1e5a7a' },
  { id: 'dp-09', primary: '#131126', secondary: '#3f2d78' },
  { id: 'dp-10', primary: '#0d1a2d', secondary: '#1b5ea5' },
  { id: 'dp-11', primary: '#150b24', secondary: '#6d1f5f' },
  { id: 'dp-12', primary: '#111629', secondary: '#3c5bdc' },
  { id: 'dp-13', primary: '#0f0e1d', secondary: '#7a2bff' },
  { id: 'dp-14', primary: '#0b1426', secondary: '#2f8bff' },
  { id: 'dp-15', primary: '#120d1a', secondary: '#ff2f92' },
  { id: 'dp-16', primary: '#0f1216', secondary: '#27f2ff' },
  { id: 'dp-17', primary: '#170f25', secondary: '#8a4bff' },
  { id: 'dp-18', primary: '#0f1a24', secondary: '#22d3ee' },
  { id: 'dp-19', primary: '#120a1c', secondary: '#ff5e5e' },
  { id: 'dp-20', primary: '#10121d', secondary: '#c97bff' },
  { id: 'dp-21', primary: '#0b0f18', secondary: '#19b5a5' },
  { id: 'dp-22', primary: '#0f1422', secondary: '#ff8a3d' },
  { id: 'dp-23', primary: '#0c1520', secondary: '#3dd6ff' },
  { id: 'dp-24', primary: '#140c1c', secondary: '#ff42c7' },
  { id: 'dp-25', primary: '#0d1420', secondary: '#40ff8a' },
  { id: 'dp-26', primary: '#0b1222', secondary: '#7c7cff' },
  { id: 'dp-27', primary: '#0f0b18', secondary: '#ff6a00' },
  { id: 'dp-28', primary: '#0d1a2b', secondary: '#00d1ff' },
  { id: 'dp-29', primary: '#0f0f1b', secondary: '#ff4f7b' },
  { id: 'dp-30', primary: '#101821', secondary: '#23c3ff' },
  { id: 'dp-31', primary: '#120b1e', secondary: '#a855f7' },
  { id: 'dp-32', primary: '#0a1622', secondary: '#00f5a0' },
  { id: 'dp-33', primary: '#0c101f', secondary: '#4ade80' },
  { id: 'dp-34', primary: '#0f1428', secondary: '#60a5fa' },
  { id: 'dp-35', primary: '#150c20', secondary: '#f472b6' },
  { id: 'dp-36', primary: '#0d1821', secondary: '#14b8a6' },
  { id: 'dp-37', primary: '#140c24', secondary: '#e879f9' },
  { id: 'dp-38', primary: '#0b151f', secondary: '#22d3ee' },
  { id: 'dp-39', primary: '#0f0c1f', secondary: '#a3e635' },
  { id: 'dp-40', primary: '#0e1420', secondary: '#38bdf8' },
  { id: 'dp-41', primary: '#130d22', secondary: '#f97316' },
  { id: 'dp-42', primary: '#0c1723', secondary: '#06b6d4' },
  { id: 'dp-43', primary: '#120c1a', secondary: '#fb7185' },
  { id: 'dp-44', primary: '#0d1524', secondary: '#3b82f6' },
  { id: 'dp-45', primary: '#130c1f', secondary: '#d946ef' },
  { id: 'dp-46', primary: '#0b1620', secondary: '#10b981' },
  { id: 'dp-47', primary: '#0f0d18', secondary: '#facc15' },
  { id: 'dp-48', primary: '#0c1326', secondary: '#6366f1' },
  { id: 'dp-49', primary: '#100b1d', secondary: '#f43f5e' },
  { id: 'dp-50', primary: '#0c1726', secondary: '#0ea5e9' }
];

const MEDIUM_LEVELS = ['Medium', 'Medium26', 'Medium60', 'Medium100'];
const JUKEBOX_FREE_SONG_COUNT = 5;
const JUKEBOX_SONG_COST = 300;

const BENNY_TIERS = [
  { id: 1, name: 'Starter Pup', power: 'Subtraction eyes', points: 0, streak: 0 },
  { id: 2, name: 'Greater Signs', power: 'Greater-than blast', points: 3000, streak: 0, requires: ['Easy25'] },
  { id: 3, name: 'Arrow Blaster', power: 'Arrow keys + space', points: 6000, streak: 5, requires: MEDIUM_LEVELS },
  { id: 4, name: 'Playful Benny', power: 'Benny jumps on target', points: 12000, streak: 6 },
  { id: 5, name: 'Your a Math Wiz Benny', power: 'Pi wand blast', points: 24000, streak: 8 },
  { id: 6, name: 'Nuclear Gauge', power: 'Gamma / neutron beam', points: 36000, streak: 10 },
  { id: 7, name: 'Nurse Benny', power: 'Crash cart charge', points: 48000, streak: 12 },
  { id: 8, name: 'Your a Plumber Benny', power: 'Utility Pump', points: 60000, streak: 14 },
  { id: 9, name: 'Your a Electrician Benny', power: 'Short Circuit', points: 80000, streak: 16 },
  { id: 10, name: 'Your a Math Teacher Benny', power: 'Concept Clarity Beam', points: 100000, streak: 18 }
];

function normalizeTierUnlocks(unlocks) {
  if (!Array.isArray(unlocks)) return [];
  return [...new Set(
    unlocks
      .map((id) => Number(id))
      .filter((id) => Number.isFinite(id) && id >= 1)
      .map((id) => Math.floor(id))
  )];
}

function buildDefaultJukeboxState(availableSongs = JUKEBOX_SONGS) {
  return availableSongs.reduce((acc, song) => {
    acc[song.id] = false;
    return acc;
  }, {});
}

function buildDefaultJukeboxOwnedState(availableSongs = JUKEBOX_SONGS) {
  return availableSongs.reduce((acc, song, index) => {
    acc[song.id] = index < JUKEBOX_FREE_SONG_COUNT;
    return acc;
  }, {});
}

function loadJukeboxState(user, availableSongs = JUKEBOX_SONGS) {
  const defaults = buildDefaultJukeboxState(availableSongs);
  if (!user) return defaults;
  const raw = localStorage.getItem(`mathpop_jukebox_${user}`);
  if (!raw) {
    const starterState = availableSongs.reduce((acc, song, index) => {
      acc[song.id] = index < JUKEBOX_FREE_SONG_COUNT;
      return acc;
    }, {});
    localStorage.setItem(`mathpop_jukebox_${user}`, JSON.stringify(starterState));
    return starterState;
  }
  try {
    const parsed = JSON.parse(raw);
    const normalized = availableSongs.reduce((acc, song) => {
      acc[song.id] = Boolean(parsed?.[song.id]);
      return acc;
    }, {});
    localStorage.setItem(`mathpop_jukebox_${user}`, JSON.stringify(normalized));
    return normalized;
  } catch {
    return defaults;
  }
}

function loadJukeboxOwnedState(user, availableSongs = JUKEBOX_SONGS) {
  const defaults = buildDefaultJukeboxOwnedState(availableSongs);
  if (!user) return defaults;
  const rawOwned = localStorage.getItem(`mathpop_jukebox_owned_${user}`);
  const rawEnabled = localStorage.getItem(`mathpop_jukebox_${user}`);
  let parsedOwned = {};
  let parsedEnabled = {};
  let saveOwned = false;
  if (rawOwned) {
    try {
      parsedOwned = JSON.parse(rawOwned) || {};
    } catch {
      parsedOwned = {};
      saveOwned = true;
    }
  } else {
    saveOwned = true;
  }
  if (rawEnabled) {
    try {
      parsedEnabled = JSON.parse(rawEnabled) || {};
    } catch {
      parsedEnabled = {};
    }
  }
  const normalized = availableSongs.reduce((acc, song, index) => {
    const isStarterSong = index < JUKEBOX_FREE_SONG_COUNT;
    const enabledAlready = Boolean(parsedEnabled?.[song.id]);
    acc[song.id] = Boolean(parsedOwned?.[song.id]) || isStarterSong || enabledAlready;
    return acc;
  }, {});
  if (saveOwned) {
    localStorage.setItem(`mathpop_jukebox_owned_${user}`, JSON.stringify(normalized));
  }
  return normalized;
}

function loadJukeboxSpent(user) {
  if (!user) return 0;
  const raw = localStorage.getItem(`mathpop_jukebox_spent_${user}`);
  if (!raw) return 0;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.floor(parsed);
}

function loadProfileStats(user) {
  if (!user) return null;
  const raw = localStorage.getItem(`mathpop_profile_stats_${user}`);
  if (!raw) {
    return {
      totalPoints: 0,
      totalCorrect: 0,
      totalAttempted: 0,
      pupStreakRecord: 0,
      levelsCompleted: [],
      tierUnlocks: [],
      activeTier: 1,
      games: {}
    };
  }
  try {
    const parsed = JSON.parse(raw);
    return {
      totalPoints: Number(parsed.totalPoints) || 0,
      totalCorrect: Number(parsed.totalCorrect) || 0,
      totalAttempted: Number(parsed.totalAttempted) || 0,
      pupStreakRecord: Number(parsed.pupStreakRecord) || 0,
      levelsCompleted: Array.isArray(parsed.levelsCompleted) ? parsed.levelsCompleted : [],
      tierUnlocks: normalizeTierUnlocks(parsed.tierUnlocks),
      activeTier: Number(parsed.activeTier) || 1,
      games: parsed.games && typeof parsed.games === 'object' ? parsed.games : {}
    };
  } catch {
    return {
      totalPoints: 0,
      totalCorrect: 0,
      totalAttempted: 0,
      pupStreakRecord: 0,
      levelsCompleted: [],
      tierUnlocks: [],
      activeTier: 1,
      games: {}
    };
  }
}

function readMathPupBest(user) {
  if (!user) return 0;
  const prefix = `mathpop_highscore_${user}_`;
  let best = 0;
  Object.keys(localStorage).forEach((key) => {
    if (!key.startsWith(prefix)) return;
    const val = parseInt(localStorage.getItem(key) || '0', 10);
    if (val > best) best = val;
  });
  return best;
}

function getColorFill(color) {
  if (color.type === 'tone') {
    return `linear-gradient(135deg, ${color.primary} 0%, ${color.primary} 50%, ${color.secondary} 50%, ${color.secondary} 100%)`;
  }
  return color.primary;
}

function buildMathSynthSchemes(count) {
  const list = [];
  for (let i = 0; i < count; i += 1) {
    const hue = Math.round((i / count) * 360);
    const primary = `hsl(${hue}, 95%, 60%)`;
    const secondary = `hsl(${(hue + 30) % 360}, 95%, 52%)`;
    list.push({ id: `ms-${i + 1}`, primary, secondary });
  }
  return list;
}

export default function Profile() {
  const [, setRefresh] = useState(0);
  const [dashDeleteMode, setDashDeleteMode] = useState('easy');
  const currentUser = useMemo(() => localStorage.getItem('mathpop_current_user'), []);
  const availableJukeboxSongs = useMemo(() => getAvailableJukeboxSongs(currentUser), [currentUser]);
  const [jukeboxOwned, setJukeboxOwned] = useState(() => loadJukeboxOwnedState(currentUser, availableJukeboxSongs));
  const [jukeboxState, setJukeboxState] = useState(() => loadJukeboxState(currentUser, availableJukeboxSongs));
  const [jukeboxSpent, setJukeboxSpent] = useState(() => loadJukeboxSpent(currentUser));
  const [mobileSelections, setMobileSelections] = useState({
    points: 'mathpup',
    correct: 'mathpup',
    attempted: 'mathpup',
    accuracy: 'mathpup',
    levels: 'mathpup',
    streak: 'mathpup',
    colors: 'mathpup',
    tiers: 'mathpup'
  });
  const profile = (() => {
    if (!currentUser) return null;
    const raw = localStorage.getItem(`mathpop_profile_${currentUser}`);
    return raw ? JSON.parse(raw) : null;
  })();
  const stats = loadProfileStats(currentUser);

  if (!currentUser || !profile || !stats) {
    return (
      <main className="profile-page">
        <header className="profile-header">
          <h1>Profile</h1>
          <p className="profile-subtitle">Sign in to view your progress.</p>
        </header>
        <div className="profile-card">
          <p>No profile found. Head back to the home page to sign in.</p>
          <Link to="/" className="profile-link">Back to Home</Link>
        </div>
      </main>
    );
  }

  const totalAttempted = stats.totalAttempted || 0;
  const totalCorrect = stats.totalCorrect || 0;
  const accuracy = totalAttempted ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
  const totalPoints = stats.totalPoints || 0;
  const availablePoints = Math.max(0, totalPoints);
  const levelsCompleted = stats.levelsCompleted || [];
  const pupStreakRecord = stats.pupStreakRecord || 0;
  const tierUnlocks = normalizeTierUnlocks(stats.tierUnlocks);
  const activeTier = Number(stats.activeTier) || 1;

  const bestMathPup = readMathPupBest(currentUser);
  const mathSynthBest = (() => {
    const raw = localStorage.getItem('mathsynth-best');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();

  const mathPupPoints = stats.games?.mathpup?.points || 0;
  const unlockedColorCount = Math.min(Math.floor(mathPupPoints / 2500), BENNY_COLORS.length);
  const currentColorId = localStorage.getItem(`mathpup_benny_color_${currentUser}`) || BENNY_COLORS[0].id;
  const currentColor = BENNY_COLORS.find((c) => c.id === currentColorId) || BENNY_COLORS[0];
  const mobileGame = mobileSelections.points;
  const mathSynthSchemes = buildMathSynthSchemes(50);
  const mathSynthUnlockedCount = Math.min(
    Math.max(parseInt(localStorage.getItem('mathsynth-unlocked') || '3', 10) || 1, 1),
    mathSynthSchemes.length
  );
  const mathSynthSelectedIndex = Math.min(
    Math.max(parseInt(localStorage.getItem('mathsynth-color') || '0', 10) || 0, 0),
    mathSynthSchemes.length - 1
  );

  // Check if tier requirements are met (e.g., Tier 2 requires EASY_LEVELS)
  const tierRequirementsMet = (tier) => {
    if (!tier.requires || tier.requires.length === 0) return true;
    return tier.requires.every((levelId) => levelsCompleted.includes(levelId));
  };

  const tierUnlocked = (tier) => {
    if (tier.id === 1) return true;
    return tierUnlocks.includes(tier.id);
  };
  const currentTier = [...BENNY_TIERS].reverse().find(tierUnlocked) || BENNY_TIERS[0];

  const renderTierPower = (tier) => {
    if (tier.id === 3) {
      return (
        <p className="tier-power tier-power-arrow">
          <span className="tier-power-label">{tier.power}</span>
          <span className="arrow-glyph" aria-label="Arrow blaster">=:~&gt;</span>
        </p>
      );
    }
    return <p className="tier-power">{tier.power}</p>;
  };
  
  const canPurchaseTier = (tier) => {
    if (tierUnlocked(tier)) return false;
    if (!tierRequirementsMet(tier)) return false;
    if (availablePoints < tier.points) return false;
    return true;
  };
  
  const canActivateTier = (tier) => tierUnlocked(tier);
  
  const purchaseTier = (tier) => {
    if (!currentUser || !stats) return;
    if (!canPurchaseTier(tier)) return;
    if (tierUnlocks.includes(tier.id)) return;
    const mathEval = window.math?.evaluate;
    const remaining = mathEval ? Number(mathEval(`${totalPoints}-${tier.points}`)) : totalPoints - tier.points;
    const next = {
      ...stats,
      totalPoints: Math.max(0, remaining),
      tierUnlocks: [...new Set([...tierUnlocks, tier.id])]
    };
    const msg = 'Congratulations, Mr. or Ms. Big Spender';
    if (typeof window !== 'undefined' && typeof window.showUnifyMessage === 'function') {
      window.showUnifyMessage({ text: msg, topic: 'tiers' });
    } else {
      window.alert(msg);
    }
    if (typeof window !== 'undefined' && typeof window.showUnifyConfirm === 'function') {
      window.showUnifyConfirm({
        text: `Use ${tier.name} power now?`,
        topic: 'tiers',
        yesLabel: 'Use it',
        noLabel: 'Later',
        onYes: () => {
          const fresh = loadProfileStats(currentUser);
          const updated = {
            ...fresh,
            activeTier: tier.id
          };
          localStorage.setItem(`mathpop_profile_stats_${currentUser}`, JSON.stringify(updated));
          setRefresh((v) => v + 1);
        }
      });
    } else {
      const useNow = window.confirm(`Use ${tier.name} power now?`);
      if (useNow) {
        next.activeTier = tier.id;
      }
    }
    localStorage.setItem(`mathpop_profile_stats_${currentUser}`, JSON.stringify(next));
    setRefresh((v) => v + 1);
  };
  const activateTier = (tier) => {
    if (!currentUser || !stats) return;
    if (!canActivateTier(tier)) return;
    const next = {
      ...stats,
      activeTier: tier.id
    };
    localStorage.setItem(`mathpop_profile_stats_${currentUser}`, JSON.stringify(next));
    setRefresh((v) => v + 1);
  };

  const games = [
    {
      id: 'mathpup',
      title: 'Math Pup',
      stats: {
        points: stats.games?.mathpup?.points || 0,
        correct: stats.games?.mathpup?.correct || 0,
        attempted: stats.games?.mathpup?.attempted || 0,
        bestScore: bestMathPup,
        streakRecord: stats.games?.mathpup?.streakRecord || 0,
        levels: stats.games?.mathpup?.levelsCompleted?.length || 0
      }
    },
    {
      id: 'capture',
      title: 'Capture The Fraction',
      stats: {
        points: stats.games?.capture?.points || 0,
        correct: stats.games?.capture?.correct || 0,
        attempted: stats.games?.capture?.attempted || 0,
        bestScore: stats.games?.capture?.bestScore || 0,
        streakRecord: stats.games?.capture?.streakRecord || 0
      }
    },
    {
      id: 'decimal',
      title: 'Deci-What?',
      stats: {
        points: stats.games?.decimal?.points || 0,
        correct: stats.games?.decimal?.correct || 0,
        attempted: stats.games?.decimal?.attempted || 0,
        bestScore: stats.games?.decimal?.bestScore || 0,
        streakRecord: stats.games?.decimal?.streakRecord || 0
      }
    },
    {
      id: 'mathsynth',
      title: 'Ma+h5Yn+h3',
      stats: {
        points: stats.games?.mathsynth?.points || 0,
        correct: stats.games?.mathsynth?.correct || 0,
        attempted: stats.games?.mathsynth?.attempted || 0,
        bestScore: mathSynthBest ? mathSynthBest.score : '--',
        timeLeft: mathSynthBest ? mathSynthBest.timeLeft : '--'
      }
    }
  ];

  const gameMap = (() => {
    const map = {};
    games.forEach((game) => {
      map[game.id] = game;
    });
    return map;
  })();

  const gameOptions = games.map((game) => ({ id: game.id, title: game.title }));
  const selectedGameTitle = gameMap[mobileGame]?.title || 'Math Pup';
  const earnedJukeboxPoints = games.reduce((sum, game) => sum + (Number(game.stats?.points) || 0), 0);
  const remainingJukeboxPoints = Math.max(0, earnedJukeboxPoints - jukeboxSpent);

  const selectGame = (value) => {
    setMobileSelections((prev) => {
      const next = {};
      Object.keys(prev).forEach((key) => {
        next[key] = value;
      });
      return next;
    });
  };

  const getGameStats = (gameId) => gameMap[gameId]?.stats || {};
  const getAccuracy = (statsForGame) => {
    const attempted = statsForGame.attempted || 0;
    const correct = statsForGame.correct || 0;
    return attempted ? Math.round((correct / attempted) * 100) : 0;
  };
  const toggleSong = (songId) => {
    if (!currentUser) return;
    if (!jukeboxOwned[songId]) return;
    setJukeboxState((prev) => {
      const next = {
        ...prev,
        [songId]: !prev[songId]
      };
      localStorage.setItem(`mathpop_jukebox_${currentUser}`, JSON.stringify(next));
      return next;
    });
  };
  const buySong = (songId) => {
    if (!currentUser || !songId) return;
    if (jukeboxOwned[songId]) return;
    if (remainingJukeboxPoints < JUKEBOX_SONG_COST) {
      const msg = `You need ${JUKEBOX_SONG_COST} points from Math Pup, Capture, Deci-What, or Ma+h5Yn+h3 to buy this song.`;
      if (typeof window !== 'undefined' && typeof window.showUnifyMessage === 'function') {
        window.showUnifyMessage({ text: msg, topic: 'profile' });
      } else {
        window.alert(msg);
      }
      return;
    }
    const nextOwned = {
      ...jukeboxOwned,
      [songId]: true
    };
    const nextState = {
      ...jukeboxState,
      [songId]: true
    };
    const nextSpent = jukeboxSpent + JUKEBOX_SONG_COST;
    localStorage.setItem(`mathpop_jukebox_owned_${currentUser}`, JSON.stringify(nextOwned));
    localStorage.setItem(`mathpop_jukebox_${currentUser}`, JSON.stringify(nextState));
    localStorage.setItem(`mathpop_jukebox_spent_${currentUser}`, String(nextSpent));
    setJukeboxOwned(nextOwned);
    setJukeboxState(nextState);
    setJukeboxSpent(nextSpent);
  };
  const deleteBennyDashProgress = () => {
    if (!currentUser) return;
    const mode = ['easy', 'medium', 'mathanomical'].includes(dashDeleteMode) ? dashDeleteMode : 'easy';
    const scopedKey = `mathpop_benny_dash_progress_${currentUser}_${mode}`;
    localStorage.removeItem(scopedKey);
    // Cleanup old legacy key if user clears easy (legacy had no difficulty suffix).
    if (mode === 'easy') {
      localStorage.removeItem(`mathpop_benny_dash_progress_${currentUser}`);
    }
    if (typeof window !== 'undefined' && typeof window.showUnifyMessage === 'function') {
      window.showUnifyMessage({ text: `Deleted Benny Dash ${mode} progress.`, topic: 'profile' });
    } else {
      window.alert(`Deleted Benny Dash ${mode} progress.`);
    }
    setRefresh((v) => v + 1);
  };
  const deleteProfileAndAppData = () => {
    const runDelete = () => {
      try {
        localStorage.clear();
      } catch {
        // Ignore storage clear failures.
      }
      try {
        sessionStorage.clear();
      } catch {
        // Ignore storage clear failures.
      }
      window.location.href = '/';
    };
    if (typeof window !== 'undefined' && typeof window.showUnifyConfirm === 'function') {
      window.showUnifyConfirm({
        text: 'Delete profile and clear all app data on this device?',
        topic: 'profile',
        yesLabel: 'Delete all',
        noLabel: 'Cancel',
        onYes: runDelete
      });
      return;
    }
    const confirmed = window.confirm('Delete profile and clear all app data on this device?');
    if (!confirmed) return;
    runDelete();
  };
  const renderJukebox = () => (
    <>
      <p className="profile-subtitle">
        First {JUKEBOX_FREE_SONG_COUNT} songs are free. All other songs cost {JUKEBOX_SONG_COST} points each.
      </p>
      <p className="profile-subtitle">
        Jukebox points (non-Benny Dash): {remainingJukeboxPoints}
      </p>
      <div className="jukebox-list">
        {availableJukeboxSongs.map((song) => {
          const owned = Boolean(jukeboxOwned[song.id]);
          const enabled = Boolean(jukeboxState[song.id]);
          if (!owned) {
            return (
              <div
                key={song.id}
                className="jukebox-song jukebox-song--locked"
                title={`${song.label} (${song.originalFilename})`}
              >
                <span>{song.label}</span>
                <button
                  type="button"
                  className="jukebox-buy"
                  onClick={() => buySong(song.id)}
                  disabled={remainingJukeboxPoints < JUKEBOX_SONG_COST}
                >
                  Buy {JUKEBOX_SONG_COST}
                </button>
              </div>
            );
          }
          return (
            <button
              key={song.id}
              type="button"
              className={`jukebox-song${enabled ? ' on' : ''}`}
              onClick={() => toggleSong(song.id)}
              aria-pressed={enabled}
              title={`${song.label} (${song.originalFilename})`}
            >
              <span>{song.label}</span>
              <span className="jukebox-status">{enabled ? 'On' : 'Off'}</span>
            </button>
          );
        })}
      </div>
      <p className="jukebox-filename">Any song unlocked by gameplay is saved in your Benny Jukebox.</p>
    </>
  );

  return (
    <main className="profile-page">
      <header className="profile-header">
        <div>
          <h1>{profile.username}</h1>
          <p className="profile-subtitle">Profile dashboard</p>
        </div>
        <div className="profile-actions">
          <Link to="/" className="profile-link">Home</Link>
          <Link to="/list" className="profile-link">Games</Link>
        </div>
      </header>

      <section className="profile-mobile-grid" aria-label="Mobile game stats">
        <div className="profile-box">
          <div className="box-header">
            <h2>Total Points</h2>
            <select
              value={mobileGame}
              onChange={(e) => selectGame(e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getGameStats(mobileGame).points || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Total Correct</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          <p className="metric">{getGameStats(mobileGame).correct || 0}</p>
        </div>
        <div className="profile-box benny-colors-box">
          <div className="box-header">
            <h2>Total Attempted</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          <p className="metric">{getGameStats(mobileGame).attempted || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Accuracy</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          <p className="metric">{getAccuracy(getGameStats(mobileGame))}%</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Levels Completed</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          <p className="metric">{getGameStats(mobileGame).levels || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Pup Streak Record</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          <p className="metric">{getGameStats(mobileGame).streakRecord || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Benny Colors</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          {mobileGame === 'mathpup' ? (
            <>
              <p className="profile-subtitle">
                Unlocked colors: {unlockedColorCount}/{BENNY_COLORS.length}
              </p>
              <div className="benny-colors">
                {BENNY_COLORS.map((color, idx) => {
                  const unlocked = idx < unlockedColorCount;
                  return (
                    <span
                      key={color.id}
                      className={`benny-color ${unlocked ? 'unlocked' : 'locked'}`}
                      title={color.name}
                      style={{ background: getColorFill(color) }}
                    />
                  );
                })}
              </div>
            </>
          ) : mobileGame === 'decimal' ? (
            <>
              <p className="profile-subtitle">Deci-What palette: {DECIMAL_ACRYLICS.length} acrylic colors.</p>
              <div className="benny-colors">
                {DECIMAL_ACRYLICS.map((swatch) => (
                  <span
                    key={swatch.id}
                    className="benny-color unlocked"
                    title={swatch.id}
                    style={{ background: `linear-gradient(135deg, ${swatch.primary} 0%, ${swatch.secondary} 100%)` }}
                  />
                ))}
              </div>
            </>
          ) : mobileGame === 'mathsynth' ? (
            <>
              <p className="profile-subtitle">Ma+h5Yn+h3 colors unlocked: {mathSynthUnlockedCount}/{mathSynthSchemes.length}</p>
              <div className="benny-colors">
                {mathSynthSchemes.map((swatch, idx) => (
                  <span
                    key={swatch.id}
                    className={`benny-color ${idx < mathSynthUnlockedCount ? 'unlocked' : 'locked'}`}
                    title={swatch.id}
                    style={{
                      background: `linear-gradient(135deg, ${swatch.primary} 0%, ${swatch.secondary} 100%)`,
                      outline: idx === mathSynthSelectedIndex ? '2px solid rgba(255, 255, 255, 0.85)' : 'none'
                    }}
                  />
                ))}
              </div>
            </>
          ) : (
            <p className="profile-subtitle">Capture the Fraction does not have a color palette.</p>
          )}
        </div>
        <div className="profile-box benny-powers-box">
          <div className="box-header">
            <h2>Benny Powers</h2>
            <p className="profile-subtitle">{selectedGameTitle}</p>
          </div>
          <p className="profile-subtitle">Benny powers are available across all games.</p>
          <div className="tier-track">
            {BENNY_TIERS.map((tier) => {
              const unlocked = tierUnlocked(tier);
              const reqsMet = tierRequirementsMet(tier);
              const canBuy = canPurchaseTier(tier);
              return (
                <div
                  key={tier.id}
                  className={`tier-card ${unlocked ? 'unlocked' : 'locked'}${activeTier === tier.id ? ' active' : ''}`}
                  role={unlocked ? 'button' : undefined}
                  tabIndex={unlocked ? 0 : -1}
                  onClick={() => activateTier(tier)}
                  onKeyDown={(e) => {
                    if (unlocked && (e.key === 'Enter' || e.key === ' ')) activateTier(tier);
                  }}
                >
                  <h3>Tier {tier.id}</h3>
                  <p className="tier-name">{tier.name}</p>
                  {renderTierPower(tier)}
                  <p className="tier-req">Points: {tier.points}</p>
                  {tier.streak > 0 && <p className="tier-req">Pup streak: {tier.streak}</p>}
                  {tier.requires && tier.requires.length > 0 && (
                    <p className="tier-req tier-requires" aria-label="Level requirements">
                      Requires: {tier.requires.join(', ')}
                    </p>
                  )}
                  {!unlocked && !reqsMet && tier.requires && (
                    <p className="tier-locked-reason">Complete required levels first</p>
                  )}
                  {!unlocked && reqsMet && <span className="tier-ticket">Ticket price: {tier.points} pts</span>}
                  {!unlocked && !canBuy && (
                    <p className="tier-locked-badge">Locked</p>
                  )}
                  {!unlocked && canBuy && (
                    <button type="button" className="tier-buy" onClick={() => purchaseTier(tier)}>
                      Buy
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <div className="profile-box jukebox-box">
          <div className="box-header">
            <h2>Benny Jukebox</h2>
          </div>
          {renderJukebox()}
        </div>
        <div className="profile-box benny-delete-box">
          <div className="box-header">
            <h2>Delete Dash Save</h2>
          </div>
          <p className="profile-subtitle">Choose a difficulty save to delete.</p>
          <select value={dashDeleteMode} onChange={(e) => setDashDeleteMode(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="mathanomical">Mathanomical</option>
          </select>
          <button type="button" className="tier-buy" onClick={deleteBennyDashProgress}>
            Delete Benny Saved Progress
          </button>
        </div>
        <div className="profile-box profile-delete-box">
          <div className="box-header">
            <h2>Delete Profile</h2>
          </div>
          <p className="profile-subtitle">Delete profile and clear all app data on this device.</p>
          <button type="button" className="tier-buy tier-buy--danger" onClick={deleteProfileAndAppData}>
            Delete Profile + App Data
          </button>
        </div>
      </section>

      <section className="profile-metrics">
        <div className="profile-card">
          <h2>Total Points</h2>
          <p className="metric">{totalPoints}</p>
        </div>
        <div className="profile-card">
          <h2>Total Correct</h2>
          <p className="metric">{totalCorrect}</p>
        </div>
        <div className="profile-card">
          <h2>Total Attempted</h2>
          <p className="metric">{totalAttempted}</p>
        </div>
        <div className="profile-card">
          <h2>Accuracy</h2>
          <p className="metric">{accuracy}%</p>
        </div>
        <div className="profile-card">
          <h2>Levels Completed</h2>
          <p className="metric">{levelsCompleted.length}</p>
        </div>
        <div className="profile-card">
          <h2>Pup Streak Record</h2>
          <p className="metric">{pupStreakRecord}</p>
        </div>
      </section>

      <section className="profile-lower">
        <div className="profile-benny">
          <div className="profile-card benny-card">
            <div className="benny-card-header">
              <div>
                <h2>Benny Sum</h2>
                <p className="profile-subtitle">Current tier: {currentTier.name}</p>
              </div>
              <div className="benny-color-preview" style={{ background: getColorFill(currentColor) }} aria-label="Benny color" />
            </div>
          <p className="benny-meta">Unlocked colors: {unlockedColorCount}/{BENNY_COLORS.length} (2500 pts each)</p>
            <div className="benny-colors">
              {BENNY_COLORS.map((color, idx) => {
                const unlocked = idx < unlockedColorCount;
                return (
                  <span
                    key={color.id}
                    className={`benny-color ${unlocked ? 'unlocked' : 'locked'}`}
                    title={color.name}
                    style={{ background: getColorFill(color) }}
                  />
                );
              })}
            </div>
          </div>

          <div className="profile-card benny-tiers">
            <h2>Benny Tiers</h2>
            <p className="profile-subtitle">Power purchases use your total points from Math Pup, Capture, Deci-What, and Ma+h5Yn+h3.</p>
            <div className="tier-track">
              {BENNY_TIERS.map((tier) => {
                const unlocked = tierUnlocked(tier);
                const reqsMet = tierRequirementsMet(tier);
              return (
                <div
                  key={tier.id}
                  className={`tier-card ${unlocked ? 'unlocked' : 'locked'}${activeTier === tier.id ? ' active' : ''}`}
                  role="button"
                  tabIndex={unlocked ? 0 : -1}
                  onClick={() => activateTier(tier)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') activateTier(tier);
                  }}
                >
                  <h3>Tier {tier.id}</h3>
                  <p className="tier-name">{tier.name}</p>
                  {renderTierPower(tier)}
                  <p className="tier-req">Points: {tier.points}</p>
                  {tier.streak > 0 && <p className="tier-req">Pup streak: {tier.streak}</p>}
                  {tier.requires && tier.requires.length > 0 && (
                    <p className="tier-req tier-requires" aria-label="Level requirements">
                      Requires: {tier.requires.join(', ')}
                    </p>
                  )}
                  {!unlocked && !reqsMet && tier.requires && (
                    <p className="tier-locked-reason">Complete required levels first</p>
                  )}
                  {!unlocked && reqsMet && <span className="tier-ticket">Ticket price: {tier.points} pts</span>}
                  {tier.id === 8 && unlocked && (
                    <div className="tier-freeze-frame" aria-label="Benny Dog KO freeze frame">
                      <span className="ff-benny" />
                      <span className="ff-zombie" />
                      <span className="ff-impact" />
                    </div>
                  )}
                  {!unlocked && canPurchaseTier(tier) && (
                    <button type="button" className="tier-buy" onClick={() => purchaseTier(tier)}>
                      Unlock {tier.name}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          </div>

          <div className="profile-card jukebox-card">
            <h2>Benny Jukebox</h2>
            {renderJukebox()}
          </div>

          <div className="profile-card benny-progress-card">
            <h2>Delete Benny Dash Save</h2>
            <p className="profile-subtitle">Choose difficulty progress to remove.</p>
            <select value={dashDeleteMode} onChange={(e) => setDashDeleteMode(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="mathanomical">Mathanomical</option>
            </select>
            <button type="button" className="tier-buy" onClick={deleteBennyDashProgress}>
              Delete Benny Saved Progress
            </button>
          </div>
        </div>

        <section className="profile-card profile-games">
          <h2>Game Stats</h2>
          <div className="game-card-track">
            {games.map((game) => {
              const attempted = game.stats.attempted || 0;
              const correct = game.stats.correct || 0;
              const percent = attempted ? Math.round((correct / attempted) * 100) : 0;
              return (
                <div key={game.id} className="profile-card game-card">
                  <h3>{game.title}</h3>
                  <div className="game-stat-row"><span>Points</span><span>{game.stats.points}</span></div>
                  <div className="game-stat-row"><span>Correct</span><span>{correct}</span></div>
                  <div className="game-stat-row"><span>Attempted</span><span>{attempted}</span></div>
                  <div className="game-stat-row"><span>Accuracy</span><span>{percent}%</span></div>
                  {'levels' in game.stats && (
                    <div className="game-stat-row"><span>Levels Completed</span><span>{game.stats.levels}</span></div>
                  )}
                  {'streakRecord' in game.stats && (
                    <div className="game-stat-row"><span>Streak Record</span><span>{game.stats.streakRecord}</span></div>
                  )}
                  <div className="game-stat-row"><span>Best</span><span>{game.stats.bestScore}</span></div>
                  {'timeLeft' in game.stats && (
                    <div className="game-stat-row"><span>Best Time</span><span>{game.stats.timeLeft}s</span></div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </main>
  );
}
