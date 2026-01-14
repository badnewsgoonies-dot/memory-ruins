// Quest system: definitions, state tracking, and progression manager

export enum QuestStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export type ObjectiveType = 'collect' | 'visit' | 'kill' | 'reach';

export interface QuestObjective {
  id: string;
  type: ObjectiveType;
  description: string;
  targetId?: string;
  requiredCount?: number; // default 1 when omitted
}

export interface QuestDefinition {
  id: string;
  title: string;
  description: string;
  objectives: QuestObjective[];
  reward?: Record<string, any>;
  prerequisites?: string[];
}

export interface QuestState {
  questId: string;
  status: QuestStatus;
  progress: Record<string, number>; // objectiveId -> count
}

export const QUESTS_DIR = 'assets/quests';

export type QuestChangeCallback = (state: QuestState) => void;

export class QuestManager {
  private definitions = new Map<string, QuestDefinition>();
  private states = new Map<string, QuestState>();
  private callbacks: QuestChangeCallback[] = [];

  constructor() {}

  load(defs: QuestDefinition[]) {
    defs.forEach((d) => {
      this.definitions.set(d.id, d);
      if (!this.states.has(d.id)) {
        const initialStatus = d.prerequisites && d.prerequisites.length ? QuestStatus.LOCKED : QuestStatus.AVAILABLE;
        this.states.set(d.id, { questId: d.id, status: initialStatus, progress: {} });
      }
    });
  }

  registerCallback(cb: QuestChangeCallback) {
    this.callbacks.push(cb);
  }

  private emit(state: QuestState) {
    this.callbacks.forEach((cb) => cb(state));
  }

  getDefinition(id: string) {
    return this.definitions.get(id) || null;
  }

  getState(id: string) {
    return this.states.get(id) || null;
  }

  listAvailable() {
    return Array.from(this.definitions.values()).filter((d) => {
      const s = this.states.get(d.id);
      return s && s.status === QuestStatus.AVAILABLE;
    });
  }

  startQuest(id: string) {
    const s = this.states.get(id);
    if (!s || s.status !== QuestStatus.AVAILABLE) return false;
    s.status = QuestStatus.ACTIVE;
    this.emit(s);
    return true;
  }

  progressObjective(questId: string, objectiveId: string, amount = 1) {
    const s = this.states.get(questId);
    if (!s || s.status !== QuestStatus.ACTIVE) return false;
    s.progress[objectiveId] = (s.progress[objectiveId] || 0) + amount;

    const def = this.definitions.get(questId);
    if (!def) return false;

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

  tryUnlock(changedQuestId?: string) {
    // Unlock quests whose prerequisites are satisfied
    this.definitions.forEach((d) => {
      const s = this.states.get(d.id);
      if (!s) return;
      if (s.status !== QuestStatus.LOCKED) return;
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

  resetQuest(id: string) {
    const def = this.definitions.get(id);
    if (!def) return false;
    this.states.set(id, { questId: id, status: def.prerequisites && def.prerequisites.length ? QuestStatus.LOCKED : QuestStatus.AVAILABLE, progress: {} });
    const s = this.states.get(id)!;
    this.emit(s);
    return true;
  }
}
