"use strict";
// src/time/constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_DILATION_FACTOR = exports.TimeRelation = void 0;
/**
 * TimeRelation defines how objects experience time relative to the global game time.
 * Use string enums to avoid magic numbers and make logs/readouts human-friendly.
 */
var TimeRelation;
(function (TimeRelation) {
    TimeRelation["NORMAL"] = "NORMAL";
    TimeRelation["IMMUNE"] = "IMMUNE";
    TimeRelation["DILATED"] = "DILATED";
})(TimeRelation || (exports.TimeRelation = TimeRelation = {}));
/**
 * Default factor by which time is slowed for DILATED objects.
 * Example: a factor of 2 means the object experiences time at half speed.
 */
exports.DEFAULT_DILATION_FACTOR = 2;
