import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const mathPath = path.resolve(process.cwd(), 'public/js/math.js');

function loadMathJs() {
  const code = fs.readFileSync(mathPath, 'utf8');
   
  const runner = new Function(code);
  runner.call(window);
  return window.math;
}

describe('Algebra Game (future) — math.js algebra + edge cases', () => {
  beforeEach(() => {
    delete window.math;
  });

  it('evaluates expressions with variables via scope', () => {
    const math = loadMathJs();
    expect(math.evaluate('x + 3', { x: 4 })).toBe(7);
    expect(math.evaluate('2*(x+3)', { x: 5 })).toBe(16);
  });

  it('handles negative numbers and decimals', () => {
    const math = loadMathJs();
    expect(math.evaluate('-5 + 2')).toBe(-3);
    expect(math.evaluate('6 * -3')).toBe(-18);
    expect(math.evaluate('1.5 * 4')).toBe(6);
  });

  it('respects parentheses and operator precedence', () => {
    const math = loadMathJs();
    expect(math.evaluate('2 + 3 * 4')).toBe(14);
    expect(math.evaluate('(2 + 3) * 4')).toBe(20);
  });

  it('handles floating precision safely', () => {
    const math = loadMathJs();
    const result = math.evaluate('0.1 + 0.2');
    expect(result).toBeCloseTo(0.3, 10);
  });

  it('handles large numbers and division edge cases', () => {
    const math = loadMathJs();
    expect(math.evaluate('99999 * 888')).toBe(88799112);
    const divZero = math.evaluate('1/0');
    expect(Number.isFinite(divZero)).toBe(false);
  });
});
