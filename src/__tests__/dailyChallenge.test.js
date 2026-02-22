import { beforeEach, describe, expect, test } from 'vitest';
import { getDailyChallengeStatus } from '../utils/dailyChallenge';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('daily challenge rollover', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('advances to the next day even when previous days were not completed', () => {
    const user = 'rollover-user';
    const anchorMs = new Date('2026-02-18T10:00:00').getTime();
    localStorage.setItem(`mathpop_daily_anchor_${user}`, String(anchorMs));

    const dayOne = getDailyChallengeStatus(user, new Date(anchorMs + 1000));
    expect(dayOne.challenge.dayIndex).toBe(1);
    expect(dayOne.claimed).toBe(false);

    const dayThree = getDailyChallengeStatus(user, new Date(anchorMs + (2 * DAY_MS) + 1000));
    expect(dayThree.challenge.dayIndex).toBe(3);
    expect(dayThree.claimed).toBe(false);
  });
});
