import { describe, it, expect } from 'vitest';
import {
  buildEasyMixedPhrase,
  buildMixedWholePart,
  buildHundredthsPhrase,
  buildThousandthsPhrase,
  parseEasyRowPhrase
} from '../decimal/decimal.logic.js';

describe('Deci-What Easy25 formats', () => {
  it('parses word.decimal format', () => {
    const phrase = buildEasyMixedPhrase(25, 38);
    expect(parseEasyRowPhrase(phrase)).toBeCloseTo(25.38, 6);
  });

  it('parses & hundredths format with mixed word+digit', () => {
    const whole = buildMixedWholePart(27);
    const frac = buildHundredthsPhrase(23, true);
    const phrase = `${whole}&${frac}`;
    expect(parseEasyRowPhrase(phrase)).toBeCloseTo(27.23, 6);
  });

  it('parses & hundredths with word-only parts', () => {
    const phrase = 'twentyfive&threehundredths';
    expect(parseEasyRowPhrase(phrase)).toBeCloseTo(25.03, 6);
  });

  it('parses & thousandths with mixed digits/words', () => {
    const phrase = `6two&${buildThousandthsPhrase(527, 'word-digit-word')}`;
    expect(parseEasyRowPhrase(phrase)).toBeCloseTo(62.527, 6);
  });
});
