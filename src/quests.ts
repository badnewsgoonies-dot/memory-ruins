// Minimal quest and progression system
// Named constants used to avoid magic numbers
export const MAX_ACTIVE_QUESTS = 5;
export const DEFAULT_REWARD_GOLD = 50;

export type Objective = {
  id: string;
  description: string;
  completed: boolean;
};

export type Quest = {
  id: string;
  title: string;
  description: string;
  objectives: Objective[];
  rewardGold: number;
  repeatable?: boolean;
};

export enum QuestStatus {
  AVAILABLE = "AVAILABLE",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
}

export type QuestState = {
  questId: string;
  status: QuestStatus;
  objectivesCompleted: number;
};

export class QuestManager {
  private allQuests: Map<string, Quest> = new Map();
  private states: Map<string, QuestState> = new Map();

  constructor() {}

  loadQuests(quests: Quest[]) {
    for (const q of quests) this.allQuests.set(q.id, q);
  }

  listAvailable(): Quest[] {
    return Array.from(this.allQuests.values()).filter(q => {
      const s = this.states.get(q.id);
      return !s || s.status === QuestStatus.AVAILABLE;
    });
  }

  acceptQuest(id: string): boolean {
    if (!this.allQuests.has(id)) return false;
    const activeCount = Array.from(this.states.values()).filter(s => s.status === QuestStatus.ACTIVE).length;
    if (activeCount >= MAX_ACTIVE_QUESTS) return false;
    const quest = this.allQuests.get(id)!;
    this.states.set(id, { questId: id, status: QuestStatus.ACTIVE, objectivesCompleted: 0 });
    // initialize objective flags
    for (const obj of quest.objectives) obj.completed = false;
    return true;
  }

  completeObjective(questId: string, objectiveId: string): boolean {
    const quest = this.allQuests.get(questId);
    const state = this.states.get(questId);
    if (!quest || !state || state.status !== QuestStatus.ACTIVE) return false;
    const obj = quest.objectives.find(o => o.id === objectiveId);
    if (!obj || obj.completed) return false;
    obj.completed = true;
    state.objectivesCompleted += 1;
    if (state.objectivesCompleted >= quest.objectives.length) {
      state.status = QuestStatus.COMPLETED;
    }
    return true;
  }

  getQuestState(questId: string): QuestState | undefined {
    return this.states.get(questId);
  }

  getActiveQuests(): Quest[] {
    return Array.from(this.states.entries())
      .filter(([, s]) => s.status === QuestStatus.ACTIVE)
      .map(([id]) => this.allQuests.get(id)!)
      .filter(Boolean);
  }

  claimReward(questId: string): { gold: number } | null {
    const state = this.states.get(questId);
    const quest = this.allQuests.get(questId);
    if (!state || !quest || state.status !== QuestStatus.COMPLETED) return null;
    // mark non-repeatable quests as no longer available
    if (!quest.repeatable) this.states.set(questId, { ...state, status: QuestStatus.COMPLETED });
    // return reward summary
    return { gold: quest.rewardGold ?? DEFAULT_REWARD_GOLD };
  }

  // Utility: load from JSON object structure (e.g., assets)
  static fromJSON(spec: any): QuestManager {
    const qm = new QuestManager();
    if (Array.isArray(spec)) {
      qm.loadQuests(spec as Quest[]);
    }
    return qm;
  }
}
