"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestManager = exports.QuestStatus = exports.DEFAULT_REWARD_GOLD = exports.MAX_ACTIVE_QUESTS = void 0;
// Minimal quest and progression system
// Named constants used to avoid magic numbers
exports.MAX_ACTIVE_QUESTS = 5;
exports.DEFAULT_REWARD_GOLD = 50;
var QuestStatus;
(function (QuestStatus) {
    QuestStatus["AVAILABLE"] = "AVAILABLE";
    QuestStatus["ACTIVE"] = "ACTIVE";
    QuestStatus["COMPLETED"] = "COMPLETED";
})(QuestStatus || (exports.QuestStatus = QuestStatus = {}));
class QuestManager {
    constructor() {
        this.allQuests = new Map();
        this.states = new Map();
    }
    loadQuests(quests) {
        for (const q of quests)
            this.allQuests.set(q.id, q);
    }
    listAvailable() {
        return Array.from(this.allQuests.values()).filter(q => {
            const s = this.states.get(q.id);
            return !s || s.status === QuestStatus.AVAILABLE;
        });
    }
    acceptQuest(id) {
        if (!this.allQuests.has(id))
            return false;
        const activeCount = Array.from(this.states.values()).filter(s => s.status === QuestStatus.ACTIVE).length;
        if (activeCount >= exports.MAX_ACTIVE_QUESTS)
            return false;
        const quest = this.allQuests.get(id);
        this.states.set(id, { questId: id, status: QuestStatus.ACTIVE, objectivesCompleted: 0 });
        // initialize objective flags
        for (const obj of quest.objectives)
            obj.completed = false;
        return true;
    }
    completeObjective(questId, objectiveId) {
        const quest = this.allQuests.get(questId);
        const state = this.states.get(questId);
        if (!quest || !state || state.status !== QuestStatus.ACTIVE)
            return false;
        const obj = quest.objectives.find(o => o.id === objectiveId);
        if (!obj || obj.completed)
            return false;
        obj.completed = true;
        state.objectivesCompleted += 1;
        if (state.objectivesCompleted >= quest.objectives.length) {
            state.status = QuestStatus.COMPLETED;
        }
        return true;
    }
    getQuestState(questId) {
        return this.states.get(questId);
    }
    getActiveQuests() {
        return Array.from(this.states.entries())
            .filter(([, s]) => s.status === QuestStatus.ACTIVE)
            .map(([id]) => this.allQuests.get(id))
            .filter(Boolean);
    }
    claimReward(questId) {
        const state = this.states.get(questId);
        const quest = this.allQuests.get(questId);
        if (!state || !quest || state.status !== QuestStatus.COMPLETED)
            return null;
        // mark non-repeatable quests as no longer available
        if (!quest.repeatable)
            this.states.set(questId, { ...state, status: QuestStatus.COMPLETED });
        // return reward summary
        return { gold: quest.rewardGold ?? exports.DEFAULT_REWARD_GOLD };
    }
    // Utility: load from JSON object structure (e.g., assets)
    static fromJSON(spec) {
        const qm = new QuestManager();
        if (Array.isArray(spec)) {
            qm.loadQuests(spec);
        }
        return qm;
    }
}
exports.QuestManager = QuestManager;
