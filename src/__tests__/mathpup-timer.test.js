import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  configureTimer,
  startRound,
  handleAnswer,
  getProblemTimeRemaining,
  stopTimer
} from '../../public/js/mathpup-timer.js';

const PROBLEM_TIME_MS = 10000;

describe('MathPup Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    configureTimer({
      durationMs: PROBLEM_TIME_MS,
      onTick: () => {},
      onTimeout: vi.fn()
    });
  });

  afterEach(() => {
    stopTimer();
    vi.useRealTimers();
  });

  it('resets after correct/incorrect answer and clears old timer', () => {
    startRound();
    vi.advanceTimersByTime(3000);
    const t1 = getProblemTimeRemaining();
    expect(t1).toBeLessThan(PROBLEM_TIME_MS);

    handleAnswer();
    const t2 = getProblemTimeRemaining();
    expect(t2).toBe(PROBLEM_TIME_MS);

    vi.advanceTimersByTime(2000);
    const t3 = getProblemTimeRemaining();
    expect(t3).toBe(PROBLEM_TIME_MS);

    startRound();
    vi.advanceTimersByTime(1000);
    const t4 = getProblemTimeRemaining();
    expect(t4).toBeLessThan(PROBLEM_TIME_MS);
  });
});
