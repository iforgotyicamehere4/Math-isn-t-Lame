import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';

function mountCaptureDom() {
  document.body.innerHTML = `
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <select id="levelSelect"><option value="easy">easy</option></select>
    <button id="startBtn"></button>
    <button id="pauseBtn"></button>
    <div id="scoreDisplay"></div>
    <div id="streakDisplay"></div>
    <div id="targetFraction"></div>
    <input id="fractionInput" />
    <div id="status"></div>
    <div id="hint"></div>
    <div id="denominatorHelpPopup"></div>
    <div id="denominatorHelpText"></div>
    <button id="denominatorHelpClose"></button>
  `;

  const proto = HTMLCanvasElement.prototype;
  if (!proto.getContext) {
    // fallback for non-canvas test envs
     
    proto.getContext = () => null;
  } else {
    vi.spyOn(proto, 'getContext').mockImplementation(() => null);
  }

  if (!window.matchMedia) {
    window.matchMedia = () => ({
      matches: false,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    });
  }
}

function parseSimpleFraction(text) {
  const m = String(text || '').trim().match(/^(\d+)\/(\d+)$/);
  if (!m) return null;
  return { num: Number(m[1]), den: Number(m[2]) };
}

function normalize(fr, simplify) {
  const s = simplify(fr.num, fr.den);
  return `${s.num}/${s.den}`;
}

let hooks;

beforeAll(() => {
  mountCaptureDom();
  const scriptPath = path.resolve('public/js/capture.js');
  const script = fs.readFileSync(scriptPath, 'utf8');
  window.eval(script);
  hooks = window.__CaptureTestHooks;
});

afterAll(() => {
  if (window.__CaptureCleanup) window.__CaptureCleanup();
  if (HTMLCanvasElement.prototype.getContext?.mockRestore) {
    HTMLCanvasElement.prototype.getContext.mockRestore();
  }
});

describe('Capture level config', () => {
  it('uses the expected trigger and timing for easy25 and medium25', () => {
    const easy25 = hooks.getLevelConfig('easy25');
    const medium25 = hooks.getLevelConfig('medium25');

    expect(easy25.choiceCount).toBe(3);
    expect(easy25.roundTimeMs).toBe(90000);
    expect(easy25.miniTriggerScore).toBe(1300);

    expect(medium25.choiceCount).toBe(4);
    expect(medium25.roundTimeMs).toBe(45000);
    expect(medium25.miniTriggerScore).toBe(1600);
  });
});

describe('Capture generators', () => {
  it('easy25 keeps prompts bounded and emits one correct choice', () => {
    for (let i = 0; i < 80; i += 1) {
      const p = hooks.generateProblemForLevel('easy25', 3);
      const display = parseSimpleFraction(p.display);
      expect(display).not.toBeNull();
      expect(display.num).toBeGreaterThan(display.den);
      expect(display.num).toBeLessThanOrEqual(20);
      expect(display.den).toBeLessThanOrEqual(19);

      const exactMatches = p.choices.filter((c) => hooks.fractionsEqual(c, p.correct));
      expect(exactMatches.length).toBe(1);

      const unique = new Set(p.choices.map((c) => normalize(c, hooks.simplify)));
      expect(unique.size).toBe(p.choices.length);
    }
  });

  it('medium25 emits valid add/subtract problems with one correct choice', () => {
    for (let i = 0; i < 80; i += 1) {
      const p = hooks.generateProblemForLevel('medium25', 4);
      expect(/[+-]/.test(p.display)).toBe(true);
      expect(p.choices.length).toBe(4);

      const exactMatches = p.choices.filter((c) => hooks.fractionsEqual(c, p.correct));
      expect(exactMatches.length).toBe(1);

      const unique = new Set(p.choices.map((c) => normalize(c, hooks.simplify)));
      expect(unique.size).toBe(p.choices.length);
    }
  });
});
