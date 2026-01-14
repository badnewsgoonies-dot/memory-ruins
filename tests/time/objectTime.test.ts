// tests/time/objectTime.test.ts
import { TimeRelation, DEFAULT_DILATION_FACTOR } from '../../src/time/constants';
import { getEffectiveDelta, advanceObjectTime } from '../../src/time/objectTime';

describe('object time relations', () => {
  it('defines relations without magic numbers', () => {
    expect(TimeRelation.NORMAL).toBe('NORMAL');
    expect(TimeRelation.IMMUNE).toBe('IMMUNE');
    expect(TimeRelation.DILATED).toBe('DILATED');
  });

  it('NORMAL relation receives full delta', () => {
    expect(getEffectiveDelta(TimeRelation.NORMAL, 16)).toBe(16);
  });

  it('IMMUNE relation receives zero delta', () => {
    expect(getEffectiveDelta(TimeRelation.IMMUNE, 16)).toBe(0);
  });

  it('DILATED relation applies default dilation factor', () => {
    expect(getEffectiveDelta(TimeRelation.DILATED, 20)).toBe(20 / DEFAULT_DILATION_FACTOR);
  });

  it('DILATED relation respects custom dilation factor', () => {
    expect(getEffectiveDelta(TimeRelation.DILATED, 20, 4)).toBe(5);
  });

  it('advanceObjectTime updates timestamps correctly', () => {
    expect(advanceObjectTime(100, TimeRelation.NORMAL, 1)).toBe(101);
    expect(advanceObjectTime(100, TimeRelation.IMMUNE, 1)).toBe(100);
    expect(advanceObjectTime(100, TimeRelation.DILATED, 2, 2)).toBe(101);
  });
});
