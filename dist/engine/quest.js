"use strict";
// Quest system: definitions, state tracking, and progression manager
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuestManager = exports.QUESTS_DIR = exports.QuestStatus = void 0;
var QuestStatus;
(function (QuestStatus) {
    QuestStatus["LOCKED"] = "LOCKED";
    QuestStatus["AVAILABLE"] = "AVAILABLE";
    QuestStatus["ACTIVE"] = "ACTIVE";
    QuestStatus["COMPLETED"] = "COMPLETED";
    QuestStatus["FAILED"] = "FAILED";
})(QuestStatus || (exports.QuestStatus = QuestStatus = {}));
exports.QUESTS_DIR = 'assets/quests';
class QuestManager {
    constructor() {
        this.definitions = new Map();
        this.states = new Map();
        this.callbacks = [];
    }
    load(defs) {
        defs.forEach((d) => {
            this.definitions.set(d.id, d);
            if (!this.states.has(d.id)) {
                const initialStatus = d.prerequisites && d.prerequisites.length ? QuestStatus.LOCKED : QuestStatus.AVAILABLE;
                this.states.set(d.id, { questId: d.id, status: initialStatus, progress: {} });
            }
        });
    }
    registerCallback(cb) {
        this.callbacks.push(cb);
    }
    emit(state) {
        this.callbacks.forEach((cb) => cb(state));
    }
    getDefinition(id) {
        return this.definitions.get(id) || null;
    }
    getState(id) {
        return this.states.get(id) || null;
    }
    listAvailable() {
        return Array.from(this.definitions.values()).filter((d) => {
            const s = this.states.get(d.id);
            return s && s.status === QuestStatus.AVAILABLE;
        });
    }
    startQuest(id) {
        const s = this.states.get(id);
        if (!s || s.status !== QuestStatus.AVAILABLE)
            return false;
        s.status = QuestStatus.ACTIVE;
        this.emit(s);
        return true;
    }
    progressObjective(questId, objectiveId, amount = 1) {
        const s = this.states.get(questId);
        if (!s || s.status !== QuestStatus.ACTIVE)
            return false;
        s.progress[objectiveId] = (s.progress[objectiveId] || 0) + amount;
        const def = this.definitions.get(questId);
        if (!def)
            return false;
        const allComplete = def.objectives.every((o) => {
            const have = s.progress[o.id] || 0;
            const need = o.requiredCount || 1;
            return have >= need;
        });
        if (allComplete) {
            s.status = QuestStatus.COMPLETED;
        }
        this.emit(s);
        return true;
    }
    tryUnlock(changedQuestId) {
        // Unlock quests whose prerequisites are satisfied
        this.definitions.forEach((d) => {
            const s = this.states.get(d.id);
            if (!s)
                return;
            if (s.status !== QuestStatus.LOCKED)
                return;
            const prereq = d.prerequisites || [];
            const satisfied = prereq.every((p) => {
                const ps = this.states.get(p);
                return ps && ps.status === QuestStatus.COMPLETED;
            });
            if (satisfied) {
                s.status = QuestStatus.AVAILABLE;
                this.emit(s);
            }
        });
    }
    resetQuest(id) {
        const def = this.definitions.get(id);
        if (!def)
            return false;
        this.states.set(id, { questId: id, status: def.prerequisites && def.prerequisites.length ? QuestStatus.LOCKED : QuestStatus.AVAILABLE, progress: {} });
        const s = this.states.get(id);
        this.emit(s);
        return true;
    }
}
exports.QuestManager = QuestManager;
