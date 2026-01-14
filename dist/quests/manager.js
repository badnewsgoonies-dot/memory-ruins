"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestManager = exports.Quest = exports.XP_LEVEL_GROWTH = exports.XP_PER_LEVEL_BASE = void 0;
exports.computeLevelFromXp = computeLevelFromXp;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Named constants to avoid magic numbers
exports.XP_PER_LEVEL_BASE = 100;
exports.XP_LEVEL_GROWTH = 1.2; // multiplier per level
function computeLevelFromXp(xp) {
    let level = 1;
    let threshold = exports.XP_PER_LEVEL_BASE;
    let remaining = xp;
    while (remaining >= threshold) {
        remaining -= threshold;
        level += 1;
        threshold = Math.floor(threshold * exports.XP_LEVEL_GROWTH);
    }
    return { level, xpIntoLevel: remaining, nextLevelXp: threshold };
}
class Quest {
    constructor(data) {
        this.data = data;
        this.accepted = false;
        this.completed = false;
        // track progress per objective id
        this.progress = {};
        for (const o of data.objectives)
            this.progress[o.id] = 0;
    }
}
exports.Quest = Quest;
class QuestManager {
    constructor() {
        this.quests = new Map();
        this.completed = new Set();
        this.playerXp = 0;
    }
    loadFromFile(relPath) {
        const p = path.resolve(process.cwd(), relPath);
        const raw = fs.readFileSync(p, 'utf8');
        const arr = JSON.parse(raw);
        for (const q of arr)
            this.quests.set(q.id, new Quest(q));
    }
    listAvailable() {
        return Array.from(this.quests.values()).filter(q => !q.accepted && !q.completed);
    }
    listAccepted() {
        return Array.from(this.quests.values()).filter(q => q.accepted && !q.completed);
    }
    acceptQuest(id) {
        const q = this.quests.get(id);
        if (!q)
            throw new Error(`Quest not found: ${id}`);
        q.accepted = true;
        return q;
    }
    reportObjectiveProgress(questId, objectiveId, delta = 1) {
        const q = this.quests.get(questId);
        if (!q || q.completed)
            return false;
        if (!(objectiveId in q.progress))
            return false;
        q.progress[objectiveId] = Math.min(q.progress[objectiveId] + delta, q.data.objectives.find(o => o.id === objectiveId).amount);
        // auto-complete check
        if (this.isQuestComplete(q)) {
            this.completeQuest(q.data.id);
        }
        return true;
    }
    isQuestComplete(q) {
        return q.data.objectives.every(o => q.progress[o.id] >= o.amount);
    }
    completeQuest(id) {
        const q = this.quests.get(id);
        if (!q || q.completed)
            return false;
        q.completed = true;
        this.completed.add(id);
        this.playerXp += q.data.xpReward;
        return true;
    }
    getPlayerProgress() {
        return {
            xp: this.playerXp,
            levelInfo: computeLevelFromXp(this.playerXp),
            completedQuests: Array.from(this.completed),
        };
    }
    getQuest(id) {
        return this.quests.get(id) || null;
    }
}
exports.QuestManager = QuestManager;
