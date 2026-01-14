// Dialogue system: minimal, engine-agnostic manager
export const DIALOGUE_DIR = 'assets/dialogue';

export type Choice = { text: string; next: string | null };
export type DialogueNode = { id: string; text: string; choices?: Choice[] };
export type NPCData = { id: string; name: string; dialogue: DialogueNode[] };

export class DialogueManager {
  data: Record<string, NPCData> | null = null;

  // Load a JSON file at runtime. Implementation is resilient across environments.
  async loadFromFile(path = `${DIALOGUE_DIR}/npcs.json`): Promise<Record<string, NPCData> | null> {
    try {
      // Node.js friendly require (may be compiled away in browser builds)
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore
      const raw = require(`../../${path}`);
      this._ingest(raw);
      return this.data;
    } catch (e) {
      try {
        // Dynamic import fallback
        // @ts-ignore
        const raw = await import(`../../${path}`);
        this._ingest(raw.default || raw);
        return this.data;
      } catch (_err) {
        // Silent failure per guidelines
        return null;
      }
    }
  }

  private _ingest(raw: unknown): void {
    this.data = {};
    const candidate = raw as { npcs?: unknown };
    if (candidate && Array.isArray(candidate.npcs)) {
      for (const n of candidate.npcs) {
        const node = n as Partial<DialogueNode & { id?: string }>;
        if (node && typeof node.id === 'string') {
          this.data[node.id] = node as NPCData;
        }
      }
    }
  }

  getNPC(id: string): NPCData | undefined {
    return this.data ? this.data[id] : undefined;
  }
}
