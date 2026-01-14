import * as fs from 'fs';
import * as path from 'path';

// Named constants to avoid magic numbers
export const XP_PER_LEVEL_BASE = 100;
export const XP_LEVEL_GROWTH = 1.2; // multiplier per level

export function computeLevelFromXp(xp: number) {
  let level = 1;
  let threshold = XP_PER_LEVEL_BASE;
  let remaining = xp;
  while (remaining >= threshold) {
    remaining -= threshold;
    level += 1;
    threshold = Math.floor(threshold * XP_LEVEL_GROWTH);
  }
  return { level, xpIntoLevel: remaining, nextLevelXp: threshold };
}

export type QuestObjective = {
  id: string;
  type: string; // e.g. 'collect', 'visit', 'defeat'
  target: string;
  amount: number;
};

export type QuestData = {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  objectives: QuestObjective[];
};

export class Quest {
  public accepted = false;
  public completed = false;
  // track progress per objective id
  public progress: Record<string, number> = {};

  constructor(public data: QuestData) {
    for (const o of data.objectives) this.progress[o.id] = 0;
  }
}

export class QuestManager {
  private quests: Map<string, Quest> = new Map();
  private completed: Set<string> = new Set();
  public playerXp = 0;

  loadFromFile(relPath: string) {
    const p = path.resolve(process.cwd(), relPath);
    const raw = fs.readFileSync(p, 'utf8');
    const arr = JSON.parse(raw) as QuestData[];
    for (const q of arr) this.quests.set(q.id, new Quest(q));
  }

  listAvailable() {
    return Array.from(this.quests.values()).filter(q => !q.accepted && !q.completed);
  }

  listAccepted() {
    return Array.from(this.quests.values()).filter(q => q.accepted && !q.completed);
  }

  acceptQuest(id: string) {
    const q = this.quests.get(id);
    if (!q) throw new Error(`Quest not found: ${id}`);
    q.accepted = true;
    return q;
  }

  reportObjectiveProgress(questId: string, objectiveId: string, delta = 1) {
    const q = this.quests.get(questId);
    if (!q || q.completed) return false;
    if (!(objectiveId in q.progress)) return false;
    q.progress[objectiveId] = Math.min(q.progress[objectiveId] + delta, q.data.objectives.find(o => o.id === objectiveId)!.amount);
    // auto-complete check
    if (this.isQuestComplete(q)) {
      this.completeQuest(q.data.id);
    }
    return true;
  }

  private isQuestComplete(q: Quest) {
    return q.data.objectives.every(o => q.progress[o.id] >= o.amount);
  }

  completeQuest(id: string) {
    const q = this.quests.get(id);
    if (!q || q.completed) return false;
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

  getQuest(id: string) {
    return this.quests.get(id) || null;
  }
}

