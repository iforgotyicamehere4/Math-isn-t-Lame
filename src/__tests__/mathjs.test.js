import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const mathPath = path.resolve(process.cwd(), 'public/js/math.js');

function loadMathJs() {
  const code = fs.readFileSync(mathPath, 'utf8');
  // Execute the UMD bundle with window as `this` so it attaches to window.math.
   
  const runner = new Function(code);
  runner.call(window);
  return window.math;
}

describe('math.js bundle (public/js/math.js)', () => {
  beforeEach(() => {
    delete window.math;
  });

  it('loads and exposes math.evaluate', () => {
    const math = loadMathJs();
    expect(math).toBeTruthy();
    expect(typeof math.evaluate).toBe('function');
  });

  it('evaluates basic operations correctly', () => {
    const math = loadMathJs();
    expect(math.evaluate('2+3')).toBe(5);
    expect(math.evaluate('9-4')).toBe(5);
    expect(math.evaluate('6*7')).toBe(42);
    expect(math.evaluate('20/5')).toBe(4);
  });

  it('respects order of operations and decimals', () => {
    const math = loadMathJs();
    expect(math.evaluate('2+3*4')).toBe(14);
    expect(math.evaluate('(2+3)*4')).toBe(20);
    expect(math.evaluate('7.5+2.25')).toBe(9.75);
  });

  it('handles mixed expressions safely', () => {
    const math = loadMathJs();
    expect(math.evaluate('12/4+3')).toBe(6);
    expect(math.evaluate('18-5*2')).toBe(8);
  });
});
