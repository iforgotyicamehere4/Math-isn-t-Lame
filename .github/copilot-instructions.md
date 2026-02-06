# MathPop: AI Coding Instructions

## Project Overview

**MathPop** is a React + Vite educational math game suite with a hybrid architecture: React pages wrap vanilla JavaScript game engines. The app includes 5 math games (Math Pup, Decimal, Capture, BennyWorld, MathSynth) and relies entirely on localStorage for user profiles, statistics, and preferences—no backend.

## Architecture: React Shell + Vanilla Game Engines

### Data Flow Pattern

- **React pages** (e.g., [Game.jsx](src/pages/Game.jsx), [Decimal.jsx](src/pages/Decimal.jsx)) initialize vanilla JS game files from `/public/js/`
- Games execute in global scope; React unmounts cleans up via `window.__[GameName]Cleanup` callbacks
- User state: `localStorage.getItem('mathpop_current_user')` returns current username or `null` (guest)
- Profile stats: `localStorage.getItem('mathpop_profile_stats_' + username)` contains JSON with `{totalPoints, totalCorrect, totalAttempted, games: {}, levelsCompleted, pupStreakRecord}`

### Key Integration Pattern

Each game page uses a custom hook to load scripts and cleanup:

```jsx
useScriptOnce("/js/game.js", "mathpup"); // Game.jsx loads /public/js/game.js
useEffect(
  () => () => {
    if (window.__MathPupCleanup) window.__MathPupCleanup();
  },
  [],
);
```

## Project Structure

```
src/
  pages/          # React page components (Game, Decimal, Capture, etc.)
  decimal/        # Decimal game logic (initDecimal() export)
  hooks/          # useScriptOnce for loading vanilla JS
  styles/         # CSS per page (game.css, decimal.css, etc.)
  __tests__/      # Vitest unit tests
src/App.jsx       # Router, navigation logic based on pathname
src/index.jsx     # React entry with BrowserRouter

public/js/        # Vanilla game engines (game.js, decimal.js, mathsynth.js, etc.)
public/css/       # Legacy CSS (may overlap with src/styles/)
```

## Critical Developer Workflows

### Development

```bash
npm run dev        # Vite dev server (port 5173, HMR configured to 192.168.1.71)
```

### Testing

```bash
npm run test            # Vitest run-once (jsdom environment)
npm run test:watch     # Watch mode
npm run test:e2e       # Playwright tests in /tests/e2e/
npm run test:e2e:ui    # Playwright UI
```

Tests use MemoryRouter for React Router isolation. See [app.smoke.test.jsx](src/__tests__/app.smoke.test.jsx).

### Build & Lint

```bash
npm run build     # Vite production build (outputs to dist/)
npm run lint      # ESLint src/**/*.{js,jsx}
npm run preview   # Vite local preview
```

## Project-Specific Conventions

### localStorage Keys (Persistent State)

- `mathpop_current_user` → logged-in username or `null`
- `mathpop_profile_<username>` → user profile JSON
- `mathpop_profile_stats_<username>` → game stats (all games shared in one object)
- `mathpop_highscore_<username>` → Math Pup best score
- `mathsynth-best` → MathSynth best attempt JSON
- `mathsynth-unlocked` → unlock count for color schemes
- `mathsynth-color` → selected color palette index
- `highContrast` → accessibility toggle (synced to `document.body.classList`)

### Game Stats Structure

Every game's stats live in one `games: {gameId: {points, correct, attempted, bestScore, streakRecord, gamesPlayed}}` object.

### Cleanup Pattern

All vanilla games must expose a cleanup function as `window.__[GameName]Cleanup = () => { ... }` to unbind event listeners and cancel timers before page unmount. **Failure to do this causes memory leaks and event duplication on re-entry.**

### ESLint Rules

React rules assume JSX; `react/react-in-jsx-scope` disabled (React 17+). React hooks (`useEffect` deps) enforced. No console warnings allowed in production code.

## Common Modification Patterns

### Adding a New Game Page

1. Create [src/pages/MyGame.jsx](src/pages/MyGame.jsx) with `useScriptOnce('/js/mygame.js', 'mygame')`
2. Add game shell HTML structure (header, game area, controls)
3. Create [public/js/mygame.js](public/js/mygame.js) with IIFE and `window.__MyGameCleanup`
4. Update [src/App.jsx](src/App.jsx) routing and nav logic
5. Add CSS to [src/styles/mygame.css](src/styles/mygame.css) or legacy [public/css/mygame.css](public/css/mygame.css)

### Recording Game Results

In vanilla game, call:

```js
const stats = loadProfileStats();
const gameStats = ensureGameStats(stats, "gameid");
gameStats.points += earned;
gameStats.correct++;
saveProfileStats(stats);
```

See [decimal.js#L156](src/decimal/decimal.js#L156) for example.

### Adjusting Game Difficulty

Most games read levels from a `levelSelect` dropdown. Decimal uses `COLS`, `ROWS`, `baseCellSize` parameters stored in DOM inputs. MathSynth uses `EQUATION_BANK` with difficulty tiers. Update enum values or JSON structures directly.

## Testing Guidelines

- **Unit tests**: Use React Testing Library + MemoryRouter for page components
- **E2E tests**: Playwright in [tests/e2e/](tests/e2e/) — smoke tests verify navigation and routing
- **Vanilla game tests**: Mock DOM, test game logic exports (e.g., `decimal.logic.js` functions)

## No Backend / External Services

- **No API calls** — all data persisted locally
- **Clerk dependency** listed but not actively used — safe to remove if unused
- **mathjs** library imported for math problem validation

## Accessibility & Styling

- High-contrast mode toggled via button, stored and synced to `body.high-contrast` class
- Color palettes (ACRYLICS) in decimal.js and mathsynth.js with gradients
- Game state announced via `aria-live="polite"` regions

## Common Pitfalls

1. **Forgetting cleanup**: Games with dangling event listeners cause re-entry bugs
2. **localStorage JSON**: Always wrap in try-catch when parsing; default to empty structures
3. **Timer/interval leaks**: Cancel all timers in cleanup (mathsynth has `stopTimer()`, `stopOthersSpawner()`)
4. **React vs vanilla state mismatch**: Vanilla games cannot access React state; use `localStorage` as bridge
5. **HMR on public/js**: Changes to `/public/js/` won't hot-reload; restart dev server or hard-refresh browser
