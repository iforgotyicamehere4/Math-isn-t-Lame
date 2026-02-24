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

const MEDIUM_LEVELS = ['Medium', 'Medium26', 'Medium60', 'Medium100'];

const BENNY_TIERS = [
  { id: 1, name: 'Starter Pup', power: 'Subtraction eyes', points: 0, streak: 0 },
  { id: 2, name: 'Greater Signs', power: 'Greater-than blast', points: 3000, streak: 0, requires: ['Easy25'] },
  { id: 3, name: 'Arrow Blaster', power: 'Arrow keys + space', points: 6000, streak: 5, requires: MEDIUM_LEVELS },
  { id: 4, name: 'Playful Benny', power: 'Benny jumps on target', points: 12000, streak: 6 },
  { id: 5, name: "You're a Wizard, Benny", power: 'Pi wand blast', points: 24000, streak: 8 },
  { id: 6, name: 'Nuclear Gauge', power: 'Gamma / neutron beam', points: 36000, streak: 10 },
  { id: 7, name: 'Nurse Benny', power: 'Crash cart charge', points: 48000, streak: 12 },
  { id: 8, name: 'Dogko RKO', power: 'Dogko finisher', points: 60000, streak: 14 },
  { id: 9, name: 'Mythic Pup', power: 'Mythic finisher', points: 80000, streak: 16 },
  { id: 10, name: 'Mathtality', power: 'All zombies cleared', points: 100000, streak: 18 }
];

function buildDefaultJukeboxState(availableSongs = JUKEBOX_SONGS) {
  return availableSongs.reduce((acc, song) => {
    acc[song.id] = false;
    return acc;
  }, {});
}

function loadJukeboxState(user) {
  const availableSongs = getAvailableJukeboxSongs(user);
  const defaults = buildDefaultJukeboxState(availableSongs);
  if (!user) return defaults;
  const raw = localStorage.getItem(`mathpop_jukebox_${user}`);
  if (!raw) return defaults;
  try {
    const parsed = JSON.parse(raw);
    return availableSongs.reduce((acc, song) => {
      acc[song.id] = Boolean(parsed?.[song.id]);
      return acc;
    }, {});
  } catch {
    return defaults;
  }
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
      tierUnlocks: Array.isArray(parsed.tierUnlocks) ? parsed.tierUnlocks : [],
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

export default function Profile() {
  const [, setRefresh] = useState(0);
  const [dashDeleteMode, setDashDeleteMode] = useState('easy');
  const currentUser = useMemo(() => localStorage.getItem('mathpop_current_user'), []);
  const [jukeboxState, setJukeboxState] = useState(() => loadJukeboxState(currentUser));
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
  const availableJukeboxSongs = getAvailableJukeboxSongs(currentUser);

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
  const tierUnlocks = Array.isArray(stats.tierUnlocks) ? stats.tierUnlocks : [];
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
    const mathEval = window.math?.evaluate;
    const remaining = mathEval ? Number(mathEval(`${totalPoints}-${tier.points}`)) : totalPoints - tier.points;
    const next = {
      ...stats,
      totalPoints: Math.max(0, remaining),
      tierUnlocks: [...tierUnlocks, tier.id]
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

  const selectGame = (key, value) => {
    setMobileSelections((prev) => ({ ...prev, [key]: value }));
  };

  const getGameStats = (gameId) => gameMap[gameId]?.stats || {};
  const getAccuracy = (statsForGame) => {
    const attempted = statsForGame.attempted || 0;
    const correct = statsForGame.correct || 0;
    return attempted ? Math.round((correct / attempted) * 100) : 0;
  };
  const toggleSong = (songId) => {
    if (!currentUser) return;
    setJukeboxState((prev) => {
      const next = {
        ...prev,
        [songId]: !prev[songId]
      };
      localStorage.setItem(`mathpop_jukebox_${currentUser}`, JSON.stringify(next));
      return next;
    });
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
  const renderJukebox = () => (
    <>
      <p className="profile-subtitle">Tap a song to switch it On or Off.</p>
      <div className="jukebox-list">
        {availableJukeboxSongs.map((song) => {
          const enabled = Boolean(jukeboxState[song.id]);
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
      <p className="jukebox-filename">Syntax Queen Theme unlocks after beating Benny Dash.</p>
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
              value={mobileSelections.points}
              onChange={(e) => selectGame('points', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getGameStats(mobileSelections.points).points || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Total Correct</h2>
            <select
              value={mobileSelections.correct}
              onChange={(e) => selectGame('correct', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getGameStats(mobileSelections.correct).correct || 0}</p>
        </div>
        <div className="profile-box benny-colors-box">
          <div className="box-header">
            <h2>Total Attempted</h2>
            <select
              value={mobileSelections.attempted}
              onChange={(e) => selectGame('attempted', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getGameStats(mobileSelections.attempted).attempted || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Accuracy</h2>
            <select
              value={mobileSelections.accuracy}
              onChange={(e) => selectGame('accuracy', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getAccuracy(getGameStats(mobileSelections.accuracy))}%</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Levels Completed</h2>
            <select
              value={mobileSelections.levels}
              onChange={(e) => selectGame('levels', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getGameStats(mobileSelections.levels).levels || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Pup Streak Record</h2>
            <select
              value={mobileSelections.streak}
              onChange={(e) => selectGame('streak', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          <p className="metric">{getGameStats(mobileSelections.streak).streakRecord || 0}</p>
        </div>
        <div className="profile-box">
          <div className="box-header">
            <h2>Benny Colors</h2>
            <select
              value={mobileSelections.colors}
              onChange={(e) => selectGame('colors', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          {mobileSelections.colors === 'mathpup' ? (
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
          ) : (
            <p className="profile-subtitle">Only Math Pup</p>
          )}
        </div>
        <div className="profile-box benny-powers-box">
          <div className="box-header">
            <h2>Benny Powers</h2>
            <select
              value={mobileSelections.tiers}
              onChange={(e) => selectGame('tiers', e.target.value)}
            >
              {gameOptions.map((game) => (
                <option key={game.id} value={game.id}>{game.title}</option>
              ))}
            </select>
          </div>
          {mobileSelections.tiers === 'mathpup' ? (
            <>
              <p className="profile-subtitle">Power shop uses your total points from Math Pup, Capture, Deci-What, and Ma+h5Yn+h3.</p>
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
            </>
          ) : (
            <p className="profile-subtitle">Benny powers are in Math Pup.</p>
          )}
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
