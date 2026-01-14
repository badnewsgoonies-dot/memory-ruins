"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEffectiveDelta = getEffectiveDelta;
exports.advanceObjectTime = advanceObjectTime;
// src/time/objectTime.ts
const constants_1 = require("./constants");
/**
 * Compute the effective delta time applied to an object given its time relation.
 * - NORMAL: receives the full baseDelta
 * - IMMUNE: receives no time progression (0)
 * - DILATED: receives a slowed delta (baseDelta / dilationFactor)
 *
 * No magic numbers are used: DEFAULT_DILATION_FACTOR is exported from constants.
 */
function getEffectiveDelta(relation, baseDelta, dilationFactor = constants_1.DEFAULT_DILATION_FACTOR) {
    if (baseDelta < 0)
        throw new Error('baseDelta must be non-negative');
    switch (relation) {
        case constants_1.TimeRelation.IMMUNE:
            return 0;
        case constants_1.TimeRelation.DILATED:
            // Protect against invalid dilation factors
            if (dilationFactor <= 0)
                throw new Error('dilationFactor must be > 0');
            return baseDelta / dilationFactor;
        case constants_1.TimeRelation.NORMAL:
        default:
            return baseDelta;
    }
}
/**
 * Advance an object's internal time/tick value according to its time relation.
 * Returns the updated timestamp (or tick) after applying the effective delta.
 */
function advanceObjectTime(currentTime, relation, baseDelta, dilationFactor) {
    const effective = getEffectiveDelta(relation, baseDelta, dilationFactor);
    return currentTime + effective;
}
