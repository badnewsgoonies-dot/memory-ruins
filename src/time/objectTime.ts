// src/time/objectTime.ts
import { TimeRelation, DEFAULT_DILATION_FACTOR } from './constants';

/**
 * Compute the effective delta time applied to an object given its time relation.
 * - NORMAL: receives the full baseDelta
 * - IMMUNE: receives no time progression (0)
 * - DILATED: receives a slowed delta (baseDelta / dilationFactor)
 *
 * No magic numbers are used: DEFAULT_DILATION_FACTOR is exported from constants.
 */
export function getEffectiveDelta(
  relation: TimeRelation,
  baseDelta: number,
  dilationFactor: number = DEFAULT_DILATION_FACTOR,
): number {
  if (baseDelta < 0) throw new Error('baseDelta must be non-negative');
  switch (relation) {
    case TimeRelation.IMMUNE:
      return 0;
    case TimeRelation.DILATED:
      // Protect against invalid dilation factors
      if (dilationFactor <= 0) throw new Error('dilationFactor must be > 0');
      return baseDelta / dilationFactor;
    case TimeRelation.NORMAL:
    default:
      return baseDelta;
  }
}

/**
 * Advance an object's internal time/tick value according to its time relation.
 * Returns the updated timestamp (or tick) after applying the effective delta.
 */
export function advanceObjectTime(
  currentTime: number,
  relation: TimeRelation,
  baseDelta: number,
  dilationFactor?: number,
): number {
  const effective = getEffectiveDelta(relation, baseDelta, dilationFactor);
  return currentTime + effective;
}
