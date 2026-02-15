import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAutoTranslate from '../hooks/useAutoTranslate';

const HOME_QUOTES = [
  {
    id: 'euclid',
    phrase: 'Geometry Has No Shortcuts',
    quote: 'There is no royal road to geometry.',
    author: 'Euclid',
    country: 'Greece',
    translationKey: 'quote.euclid'
  },
  {
    id: 'gauss',
    phrase: 'Math Leads The Sciences',
    quote: 'Mathematics is the queen of the sciences.',
    author: 'Carl Friedrich Gauss',
    country: 'Germany',
    translationKey: 'quote.gauss'
  },
  {
    id: 'poincare',
    phrase: 'Name Patterns Clearly',
    quote: 'Mathematics is the art of giving the same name to different things.',
    author: 'Henri Poincare',
    country: 'France',
    translationKey: 'quote.poincare'
  },
  {
    id: 'russell',
    phrase: 'Math Has Beauty',
    quote: 'Mathematics, rightly viewed, possesses beauty.',
    author: 'Bertrand Russell',
    country: 'United Kingdom',
    translationKey: 'quote.russell'
  },
  {
    id: 'galileo',
    phrase: 'Nature Speaks Math',
    quote: 'Mathematics is the language of nature.',
    author: 'Galileo Galilei',
    country: 'Italy',
    translationKey: 'quote.galileo'
  },
  {
    id: 'mirzakhani',
    phrase: 'Beauty Tests Ideas',
    quote: 'Beauty is the first test of mathematics.',
    author: 'Maryam Mirzakhani',
    country: 'Iran',
    translationKey: 'quote.mirzakhani'
  },
  {
    id: 'ramanujan',
    phrase: 'Equations Need Meaning',
    quote: 'An equation means nothing unless it expresses a thought.',
    author: 'Srinivasa Ramanujan',
    country: 'India',
    translationKey: 'quote.ramanujan'
  },
  {
    id: 'kovalevskaya',
    phrase: 'Think Like A Poet',
    quote: 'It is impossible to be a mathematician without being a poet.',
    author: 'Sofia Kovalevskaya',
    country: 'Russia',
    translationKey: 'quote.kovalevskaya'
  },
  {
    id: 'banach',
    phrase: 'Spirit Builds Math',
    quote: 'Mathematics is the most beautiful creation of the human spirit.',
    author: 'Stefan Banach',
    country: 'Poland',
    translationKey: 'quote.banach'
  },
  {
    id: 'euler',
    phrase: 'Reason Is Everywhere',
    quote: 'Nothing takes place without a mathematical reason.',
    author: 'Leonhard Euler',
    country: 'Switzerland',
    translationKey: 'quote.euler'
  },
  {
    id: 'brouwer',
    phrase: 'Build It In Mind',
    quote: 'Mathematics is mental construction.',
    author: 'L.E.J. Brouwer',
    country: 'Netherlands',
    translationKey: 'quote.brouwer'
  },
  {
    id: 'erdos',
    phrase: 'Open Mind Wins',
    quote: 'My brain is open.',
    author: 'Paul Erdos',
    country: 'Hungary',
    translationKey: 'quote.erdos'
  },
  {
    id: 'fields',
    phrase: 'Connections Matter',
    quote: 'Mathematics reveals hidden connections.',
    author: 'John Charles Fields',
    country: 'Canada',
    translationKey: 'quote.fields'
  },
  {
    id: 'ito',
    phrase: 'Uncertainty Has Shape',
    quote: 'Probability describes uncertainty.',
    author: 'Kiyoshi Ito',
    country: 'Japan',
    translationKey: 'quote.ito'
  },
  {
    id: 'hua',
    phrase: 'Calculation Drives Progress',
    quote: 'Where there is calculation, there is progress.',
    author: 'Hua Luogeng',
    country: 'China',
    translationKey: 'quote.hua'
  },
  {
    id: 'avila',
    phrase: 'Explore The Unknown',
    quote: 'Mathematics is exploration.',
    author: 'Artur Avila',
    country: 'Brazil',
    translationKey: 'quote.avila'
  },
  {
    id: 'tao',
    phrase: 'Practice Clear Thinking',
    quote: 'Mathematics is a way of thinking.',
    author: 'Terence Tao',
    country: 'Australia',
    translationKey: 'quote.tao'
  },
  {
    id: 'adem',
    phrase: 'Build Real Understanding',
    quote: 'Mathematics builds understanding.',
    author: 'Jose Adem',
    country: 'Mexico',
    translationKey: 'quote.adem'
  },
  {
    id: 'hypatia',
    phrase: 'Protect Thought',
    quote: 'Reserve your right to think.',
    author: 'Hypatia',
    country: 'Egypt',
    translationKey: 'quote.hypatia'
  },
  {
    id: 'rey-pastor',
    phrase: 'Science Needs Math',
    quote: 'Mathematics underlies science.',
    author: 'Julio Rey Pastor',
    country: 'Spain',
    translationKey: 'quote.rey_pastor'
  },
  {
    id: 'arf',
    phrase: 'Understand Do Not Memorize',
    quote: 'Understanding is more valuable than memorizing.',
    author: 'Cahit Arf',
    country: 'Turkey',
    translationKey: 'quote.arf'
  },
  {
    id: 'lindenstrauss',
    phrase: 'Patterns Lead Discovery',
    quote: 'Patterns are the heart of mathematics.',
    author: 'Elon Lindenstrauss',
    country: 'Israel',
    translationKey: 'quote.lindenstrauss'
  },
  {
    id: 'katherine-johnson',
    phrase: 'Love The Work',
    quote: 'Like what you do and then you will do your best.',
    author: 'Katherine Johnson',
    country: 'United States',
    translationKey: 'quote.katherine_johnson'
  },
  {
    id: 'mittag-leffler',
    phrase: 'Patterns Spark Wonder',
    quote: 'Beautiful patterns inspire mathematics.',
    author: 'Magnus Gosta Mittag-Leffler',
    country: 'Sweden',
    translationKey: 'quote.mittag_leffler'
  },
  {
    id: 'abdool-karim',
    phrase: 'Numbers Expose Truth',
    quote: 'Numbers help reveal truth.',
    author: 'Quarraisha Abdool Karim',
    country: 'South Africa',
    translationKey: 'quote.abdool_karim'
  },
  {
    id: 'benny',
    phrase: 'BARK BARK',
    quote: 'Nobody actually knows what it means… But legend says it translates to: "Math is Lit." (We asked Benny. He just barked again.)',
    author: 'Benny',
    country: 'Math Pop Dev',
    translationKey: 'quote.benny'
  }
];

const QUOTE_PRONUNCIATIONS = {
  euclid: 'YOO-klid',
  gauss: 'karl FREE-drikh GOWSS',
  poincare: 'ahn-REE pwan-kah-RAY',
  russell: 'BER-trand RUSS-uhl',
  galileo: 'gal-uh-LAY-oh gal-uh-LAY',
  mirzakhani: 'mah-ree-YAHM meer-zah-KHAH-nee',
  ramanujan: 'sree-nee-VAH-sah rah-MAH-noo-juhn',
  kovalevskaya: 'soh-FEE-yah koh-vah-LEHV-skah-yah',
  banach: 'STEH-fahn BAH-nakh',
  euler: 'LAY-on-hart OY-ler',
  brouwer: 'LOW-ee EEE JAY BROW-er',
  erdos: 'POWL AIR-dush',
  fields: 'john CHARLZ FEELDZ',
  ito: 'kee-YOH-shee EE-toh',
  hua: 'hwah LWOH-gung',
  avila: 'ar-TOOR AH-vee-lah',
  tao: 'TEH-rens TOW',
  adem: 'hoh-SEH ah-DEM',
  hypatia: 'hy-PAY-shuh',
  'rey-pastor': 'HOO-lyoh RAY pas-TOR',
  arf: 'jah-HEET ARF',
  lindenstrauss: 'EH-lohn LIN-den-shtrouse',
  'katherine-johnson': 'KATH-er-in JOHN-suhn',
  'mittag-leffler': 'MAG-nus GUS-tah MIT-tahg LEFF-ler',
  'abdool-karim': 'kwah-RY-shah ab-DOOL kah-REEM',
  benny: 'BEN-ee'
};

const LETTER_PATTERNS = {
  A: ['01110', '10001', '11111', '10001', '10001'],
  B: ['11110', '10001', '11110', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '11110', '10000', '11111'],
  F: ['11111', '10000', '11110', '10000', '10000'],
  G: ['01111', '10000', '10111', '10001', '01111'],
  H: ['10001', '10001', '11111', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '11100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001'],
  O: ['01110', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '11110', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10011', '01111'],
  R: ['11110', '10001', '11110', '10010', '10001'],
  S: ['01111', '10000', '01110', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10101', '11011', '10001'],
  X: ['10001', '01010', '00100', '01010', '10001'],
  Y: ['10001', '01010', '00100', '00100', '00100'],
  Z: ['11111', '00010', '00100', '01000', '11111'],
  ' ': ['000', '000', '000', '000', '000']
};

function wrapPhrase(phrase, maxChars) {
  const words = String(phrase || '').toUpperCase().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = '';
  const pushChunk = (chunk) => {
    if (!chunk) return;
    if (!current) {
      current = chunk;
      return;
    }
    const next = `${current} ${chunk}`;
    if (next.length <= maxChars) {
      current = next;
    } else {
      lines.push(current);
      current = chunk;
    }
  };

  words.forEach((word) => {
    if (word.length > maxChars) {
      if (current) {
        lines.push(current);
        current = '';
      }
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      return;
    }
    pushChunk(word);
  });
  if (current) lines.push(current);
  return lines.length ? lines : ['MATH'];
}

function buildPhraseRows(phrase, maxChars) {
  const lines = wrapPhrase(phrase, maxChars);
  const rowsByLine = lines.map((line) => {
    const rows = Array.from({ length: 5 }, () => '');
    line.split('').forEach((rawChar, idx) => {
      const char = /[A-Z ]/.test(rawChar) ? rawChar : ' ';
      const pattern = LETTER_PATTERNS[char] || LETTER_PATTERNS[' '];
      for (let r = 0; r < 5; r += 1) rows[r] += pattern[r];
      if (idx < line.length - 1) {
        for (let r = 0; r < 5; r += 1) rows[r] += '0';
      }
    });
    return rows;
  });

  const maxCols = rowsByLine.reduce((m, rows) => Math.max(m, rows[0]?.length || 0), 0) || 1;
  const padRows = rowsByLine.map((rows) => rows.map((row) => row.padEnd(maxCols, '0')));
  const merged = [];
  padRows.forEach((rows, idx) => {
    merged.push(...rows);
    if (idx < padRows.length - 1) merged.push('0'.repeat(maxCols));
  });
  return merged;
}

function getStartPoint(variant, order, total, target, width, height, cellSize) {
  const left = -2.4 * cellSize;
  const right = width + 2.4 * cellSize;
  const top = -2.4 * cellSize;
  const bottom = height + 2.4 * cellSize;
  const cx = width / 2;
  const cy = height / 2;
  const t = total > 1 ? order / (total - 1) : 0;
  const wave = Math.sin(t * Math.PI * 2.5);
  const angle = t * Math.PI * 2;
  const jitter = (n) => (Math.sin((order + 1) * (n + 1.7)) * 0.5 + 0.5);

  switch (variant) {
    case 0: return { x: jitter(1) * width, y: jitter(2) * height };
    case 1: return { x: target.c * cellSize, y: top - jitter(1) * height * 0.3 };
    case 2: return { x: target.c * cellSize, y: bottom + jitter(2) * height * 0.3 };
    case 3: return { x: left - jitter(1) * width * 0.25, y: target.r * cellSize };
    case 4: return { x: right + jitter(2) * width * 0.25, y: target.r * cellSize };
    case 5: return { x: left, y: top };
    case 6: return { x: right, y: top };
    case 7: return { x: left, y: bottom };
    case 8: return { x: right, y: bottom };
    case 9: return { x: cx + Math.cos(angle) * (width * 0.46), y: cy + Math.sin(angle) * (height * 0.46) };
    case 10: return { x: cx + Math.cos(angle) * (width * 0.58), y: cy + Math.sin(angle) * (height * 0.58) };
    case 11: return { x: cx + Math.cos(-angle) * (width * 0.58), y: cy + Math.sin(-angle) * (height * 0.58) };
    case 12: {
      const spiral = 1.2 - t;
      return { x: cx + Math.cos(angle * 4) * width * 0.5 * spiral, y: cy + Math.sin(angle * 4) * height * 0.5 * spiral };
    }
    case 13: return { x: t * width, y: order % 2 === 0 ? top : bottom };
    case 14: return { x: left, y: cy + wave * height * 0.45 };
    case 15: return { x: right, y: cy + wave * height * 0.45 };
    case 16: return { x: left + t * (right - left), y: top + t * (bottom - top) };
    case 17: return { x: right - t * (right - left), y: top + t * (bottom - top) };
    case 18: return { x: t < 0.5 ? left : right, y: cy + (t - 0.5) * height * 1.8 };
    case 19: return { x: cx + (t - 0.5) * width * 1.8, y: t < 0.5 ? top : bottom };
    case 20: return { x: cx + Math.cos(angle * 1.6) * (Math.max(width, height) * 0.9), y: cy + Math.sin(angle * 1.6) * (Math.max(width, height) * 0.9) };
    case 21: return { x: t < 0.5 ? left + t * width * 2 : right - (t - 0.5) * width * 2, y: cy + Math.sin(angle * 3.4) * height * 0.38 };
    case 22: return { x: (target.r + target.c) % 2 ? left : right, y: (target.r % 2 ? top : bottom) };
    case 23: return { x: t * width, y: top - Math.sin(t * Math.PI) * height * 0.75 };
    default: {
      const r = Math.max(width, height) * (0.9 + jitter(3) * 0.55);
      return { x: cx + Math.cos(angle * 6.2) * r, y: cy + Math.sin(angle * 6.2) * r };
    }
  }
}

/**
 * Home page (React)
 * - Contrast toggle persisted to localStorage
 * - Modal auth that persists profiles to localStorage
 * - Displays current user and high score
 * - Uses main app navigation
 */
export default function Home() {
  const navigate = useNavigate?.() || (() => { window.location.href = '/game'; });
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('highContrast') === 'true');
  const [showModal, setShowModal] = useState(false);
  const [authMode, setAuthMode] = useState('signup');
  const [homeQuoteSelection] = useState(() => {
    const idx = Math.floor(Math.random() * HOME_QUOTES.length);
    return { quote: HOME_QUOTES[idx], quoteIndex: idx };
  });
  const homeQuote = homeQuoteSelection.quote;
  const quotePronunciation = QUOTE_PRONUNCIATIONS[homeQuote.id] || homeQuote.author;
  const [phraseAnimate, setPhraseAnimate] = useState(false);

  // Signup modal state
  const [suUsername, setSuUsername] = useState('');
  const [suEmail, setSuEmail] = useState('');
  const [suPassword, setSuPassword] = useState('');
  const [dataAccept, setDataAccept] = useState(false);

  const [currentUser, setCurrentUserState] = useState(() => localStorage.getItem('mathpop_current_user') || null);
  const [homeHighScore, setHomeHighScore] = useState(0);

  const homeStrings = useMemo(() => ({
    navHowTo: 'How to Play',
    navGames: 'Games',
    navAbout: 'About',
    navProfile: 'Profile',
    heroTagline: "Math isn't lame — it's an adventure!",
    signUp: 'Sign Up',
    signIn: 'Sign In',
    viewProfile: 'View Profile',
    notSignedIn: 'Not signed in',
    highScore: 'High Score',
    modalSignUp: 'Sign Up',
    modalSignIn: 'Sign In',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    createProfile: 'Create Profile',
    disclaimerText: "By signing up you agree that Math isn't Lame.",
    quotePhrase: homeQuote.phrase,
    quoteText: homeQuote.quote,
    quoteByline: `${homeQuote.country} — ${homeQuote.author}`,
    quotePronunciation: `Pronunciation: ${quotePronunciation}`
  }), [homeQuote, quotePronunciation]);
  const { translated: tr } = useAutoTranslate(homeStrings, true);

  // Keep body class in sync with app state
  useEffect(() => {
    document.body.classList.toggle('high-contrast', !!highContrast);
    localStorage.setItem('highContrast', highContrast ? 'true' : 'false');
  }, [highContrast]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setPhraseAnimate(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const hs = parseInt(localStorage.getItem('mathpop_highscore_' + currentUser) || '0', 10);
      setHomeHighScore(Number.isNaN(hs) ? 0 : hs);
    } else {
      setHomeHighScore(0);
    }
  }, [currentUser]);

  // Profile helpers
  function saveProfile(profile) {
    if (!profile || !profile.username) return;
    try {
      localStorage.setItem('mathpop_profile_' + profile.username, JSON.stringify(profile));
      setCurrentUser(profile.username);
      return true;
    } catch {
      alert('Unable to save profile on this device right now.');
      return false;
    }
  }
  function loadProfileFor(username) {
    if (!username) return null;
    const s = localStorage.getItem('mathpop_profile_' + username);
    if (!s) return null;
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }
  function setCurrentUser(username) {
    if (username) {
      localStorage.setItem('mathpop_current_user', username);
      setCurrentUserState(username);
    } else {
      localStorage.removeItem('mathpop_current_user');
      setCurrentUserState(null);
    }
  }
  function saveEmailToList(email) {
    if (!email) return;
    try {
      const key = 'mathpop_emails';
      const arr = JSON.parse(localStorage.getItem(key) || '[]');
      if (!arr.includes(email)) arr.push(email);
      localStorage.setItem(key, JSON.stringify(arr));
      localStorage.setItem('mathpop_email_compilation', arr.join(','));
    } catch { /* ignore */ }
  }

  function navigateToGame() {
    // prefer SPA navigation if useNavigate is available
    try {
      if (typeof navigate === 'function') {
        navigate('/game');
        return;
      }
    } catch { /* fallback */ }
    // fallback to legacy game.html
    window.location.href = '/game';
  }

  // Modal signup
  function handleSignup() {
    if (!suUsername.trim() || !suEmail.trim() || !suPassword) {
      alert('Please fill all fields');
      return;
    }
    if (!dataAccept) {
      alert('You must accept the disclaimer');
      return;
    }
    const created = typeof performance !== 'undefined' && typeof performance.now === 'function'
      ? performance.now()
      : Date.now();
    const profile = {
      username: suUsername.trim(),
      email: suEmail.trim(),
      password: suPassword,
      created
    };
    const saved = saveProfile(profile);
    if (!saved) return;
    localStorage.setItem('mathpop_highscore_' + profile.username, localStorage.getItem('mathpop_highscore_' + profile.username) || '0');
    saveEmailToList(profile.email);
    setShowModal(false);
    alert('Profile created — starting game');
    setTimeout(navigateToGame, 200);
  }

  function handleSignin() {
    if (!suUsername.trim() || !suPassword) {
      alert('Please fill both fields');
      return;
    }
    const stored = loadProfileFor(suUsername.trim());
    const storedPassword = String(stored?.password || '');
    if (!stored || !storedPassword || storedPassword !== suPassword) {
      alert('Invalid username or password');
      return;
    }
    setCurrentUser(suUsername.trim());
    setShowModal(false);
    alert('Signed in — starting game');
    setTimeout(navigateToGame, 200);
  }

  function handleLogout() {
    setCurrentUser(null);
    // quick reload to refresh UI
    window.location.reload();
  }

  const phraseLayout = useMemo(() => {
    const viewport = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const stageWidth = Math.max(260, Math.min(viewport - 30, 980));
    let maxChars = viewport <= 420 ? 9 : viewport <= 720 ? 12 : 18;
    let rows = buildPhraseRows(homeQuote.phrase, maxChars);
    let cols = rows[0]?.length || 1;
    let cellSize = Math.floor(stageWidth / cols);

    while ((cellSize < 5 || rows.length > 18) && maxChars > 6) {
      maxChars -= 1;
      rows = buildPhraseRows(homeQuote.phrase, maxChars);
      cols = rows[0]?.length || 1;
      cellSize = Math.floor(stageWidth / cols);
    }

    cellSize = Math.max(4, Math.min(viewport <= 520 ? 16 : 20, cellSize));
    const width = cols * cellSize;
    const height = rows.length * cellSize;
    const stageHeight = Math.max(viewport <= 520 ? 220 : 250, height + 22);
    const variant = homeQuoteSelection.quoteIndex % 25;
    const duration = 1100 + (variant % 5) * 220;
    const stagger = 6 + (variant % 7) * 4;
    const easePresets = [
      'cubic-bezier(0.2,0.9,0.25,1)',
      'cubic-bezier(0.4,0,0.2,1)',
      'cubic-bezier(0.18,0.84,0.28,1)',
      'cubic-bezier(0.34,1.56,0.64,1)',
      'cubic-bezier(0.07,0.82,0.17,1)'
    ];

    const targets = [];
    rows.forEach((row, r) => {
      row.split('').forEach((cell, c) => {
        if (cell !== '1') return;
        targets.push({ r, c });
      });
    });

    const total = targets.length || 1;
    const mappedTargets = targets.map((target, order) => {
      const start = getStartPoint(variant, order, total, target, stageWidth, stageHeight, cellSize);
      const delay = Math.floor(order * stagger);
      const startRotate = (variant * 19 + order * 7) % 100 - 50;
      const startScale = 0.75 + ((order + variant) % 5) * 0.08;
      return {
        key: `${target.r}-${target.c}`,
        endX: target.c * cellSize,
        endY: target.r * cellSize,
        startX: start.x,
        startY: start.y,
        delay,
        duration,
        ease: easePresets[variant % easePresets.length],
        rotate: `${startRotate}deg`,
        scale: String(startScale)
      };
    });

    return {
      cellSize,
      width,
      height,
      stageHeight,
      variant,
      targets: mappedTargets
    };
  }, [homeQuote.phrase, homeQuoteSelection.quoteIndex]);


  return (
    <div className="background">
      {/* Logo and Navigation */}
      <nav>
        <div className="logo">
          <span className="desk-logo">
            <span className="back" />
            <span className="seat" />
            <span className="leg-left" />
            <span className="leg-right" />
            <span className="desk" />
          </span>
        </div>

        <div id="userArea" className="user-area" style={{ marginLeft: 12 }}>
          <span id="usernameDisplay" style={{ display: currentUser ? 'inline' : 'none' }}>{currentUser}</span>
          <button id="logoutBtn" style={{ display: currentUser ? 'inline-block' : 'none' }} onClick={handleLogout}>Logout</button>
        </div>

        <ul className="nav" style={{ listStyle: 'none', display: 'flex', gap: 8, padding: 0 }}>
          <li><Link to="/howto">{tr.navHowTo || homeStrings.navHowTo}</Link></li>
          <li><Link to="/list">{tr.navGames || homeStrings.navGames}</Link></li>
          <li><Link to="/about">{tr.navAbout || homeStrings.navAbout}</Link></li>
          {currentUser && <li><Link to="/profile">{tr.navProfile || homeStrings.navProfile}</Link></li>}
        </ul>
      </nav>

      {/* Benny mascot with contrast toggle */}
      <button
        className="home-benny"
        type="button"
        aria-pressed={highContrast ? 'true' : 'false'}
        title="Toggle high contrast"
        onClick={() => setHighContrast((v) => !v)}
      >
        <span className="benny-base">
          <span className="benny-shape">
            <span className="back" />
            <span className="leg-left" />
            <span className="leg-right" />
            <span className="head" />
          </span>
        </span>
      </button>

      <header>
        <div className="hero-card">
          <p className="tagline">{tr.heroTagline || homeStrings.heroTagline}</p>
          

          <div className="hero-actions" id="heroActions">
            <button
              className="start-btn"
              id="openSignUp"
              onClick={() => {
                setAuthMode('signup');
                setShowModal(true);
              }}
            >
              {tr.signUp || homeStrings.signUp}
            </button>
            <button
              className="start-btn"
              id="openSignIn"
              style={{ marginLeft: 8 }}
              onClick={() => {
                setAuthMode('signin');
                setShowModal(true);
              }}
            >
              {tr.signIn || homeStrings.signIn}
            </button>
            {currentUser && (
              <Link className="start-btn" style={{ marginLeft: 8, textDecoration: 'none' }} to="/profile">
                {tr.viewProfile || homeStrings.viewProfile}
              </Link>
            )}
            <div id="homeHighScore" style={{ marginTop: 10, color: '#e9e2e2', fontWeight: 700 }}>
              {currentUser
                ? `${currentUser} — ${tr.highScore || homeStrings.highScore}: ${homeHighScore}`
                : (tr.notSignedIn || homeStrings.notSignedIn)}
            </div>
          </div>
        </div>
      </header>

      <section
        className={`quote-stage quote-anim-${homeQuote.id} quote-motion-${phraseLayout.variant}${phraseAnimate ? ' animate' : ''}`}
        data-translation-key={homeQuote.translationKey}
        aria-label="Featured math quote"
      >
        <p className="quote-phrase">{tr.quotePhrase || homeStrings.quotePhrase}</p>
        <div className="phrase-field-wrap" style={{ minHeight: `${phraseLayout.stageHeight}px` }}>
          <div
            className="chair-field quote-chair-field"
            style={{
              '--cell': `${phraseLayout.cellSize}px`,
              width: `${phraseLayout.width}px`,
              height: `${phraseLayout.height}px`
            }}
          >
            {phraseLayout.targets.map((t) => (
              <div
                key={t.key}
                className="chair"
                style={{
                  '--start-x': `${t.startX}px`,
                  '--start-y': `${t.startY}px`,
                  '--end-x': `${t.endX}px`,
                  '--end-y': `${t.endY}px`,
                  '--delay-ms': `${t.delay}ms`,
                  '--travel-ms': `${t.duration}ms`,
                  '--travel-ease': t.ease,
                  '--start-rot': t.rotate,
                  '--start-scale': t.scale
                }}
              >
                <div className="back" />
                <div className="seat" />
                <div className="leg-left" />
                <div className="leg-right" />
                <div className="desk" />
              </div>
            ))}
          </div>
        </div>
        <blockquote className="quote-text">{tr.quoteText || homeStrings.quoteText}</blockquote>
        <p className="quote-byline">{tr.quoteByline || homeStrings.quoteByline}</p>
        <p className="quote-pronunciation">{tr.quotePronunciation || homeStrings.quotePronunciation}</p>
      </section>

      {/* Modal */}
      <div id="authModal" className="modal" aria-hidden={showModal ? 'false' : 'true'} style={{ display: showModal ? 'flex' : 'none' }}>
        <div className="modal-content" role="dialog" aria-modal="true">
          <button className="modal-close" id="authClose" onClick={() => setShowModal(false)}>✕</button>
          <h2 id="modalTitle">{authMode === 'signup' ? (tr.modalSignUp || homeStrings.modalSignUp) : (tr.modalSignIn || homeStrings.modalSignIn)}</h2>

          <form
            className="auth-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (authMode === 'signup') {
                handleSignup();
                return;
              }
              handleSignin();
            }}
          >
            <label>{tr.username || homeStrings.username}<input id="suUsername" required value={suUsername} onChange={(e) => setSuUsername(e.target.value)} /></label>
            {authMode === 'signup' && (
              <label>{tr.email || homeStrings.email}<input id="suEmail" type="email" required value={suEmail} onChange={(e) => setSuEmail(e.target.value)} /></label>
            )}
            {authMode === 'signin' && (
              <label>{tr.password || homeStrings.password}<input id="siPassword" type="password" required value={suPassword} onChange={(e) => setSuPassword(e.target.value)} /></label>
            )}
            {authMode === 'signup' && (
              <>
                <label>{tr.password || homeStrings.password}<input id="suPassword" type="password" required value={suPassword} onChange={(e) => setSuPassword(e.target.value)} /></label>
                <label className="disclaimer"><input id="dataAccept" type="checkbox" checked={dataAccept} onChange={(e) => setDataAccept(e.target.checked)} /> I accept the <strong>disclaimer</strong> below</label>
                <div className="disclaimer-box">
                  {tr.disclaimerText || homeStrings.disclaimerText} <br />
                  ✔ No ads or tracking
<br/>✔ Stored locally on your device
<br/>✔ Clear data anytime
<br/>✔ Email optional
                </div>
              </>
            )}
            <div className="auth-actions">
              <button type="submit" id={authMode === 'signup' ? 'doSignUp' : 'doSignIn'}>
                {authMode === 'signup' ? (tr.createProfile || homeStrings.createProfile) : (tr.signIn || homeStrings.signIn)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
