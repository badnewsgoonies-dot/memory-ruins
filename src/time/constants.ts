// src/time/constants.ts

/**
 * TimeRelation defines how objects experience time relative to the global game time.
 * Use string enums to avoid magic numbers and make logs/readouts human-friendly.
 */
export enum TimeRelation {
  NORMAL = 'NORMAL',
  IMMUNE = 'IMMUNE',
  DILATED = 'DILATED',
}

/**
 * Default factor by which time is slowed for DILATED objects.
 * Example: a factor of 2 means the object experiences time at half speed.
 */
export const DEFAULT_DILATION_FACTOR = 2;
