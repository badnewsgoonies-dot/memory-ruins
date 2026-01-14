// Minimal DialogueManager for NPCs
// Uses a JSON dialogue file stored in assets/dialogue/dialogue.json

const DIALOGUE_FILE = '../assets/dialogue/dialogue.json';

class DialogueManager {
  constructor(dialogueData) {
    // Map NPC id -> npc object for fast lookup
    this.NPCS = {};
    (dialogueData.npcs || []).forEach(npc => {
      this.NPCS[npc.id] = {
        ...npc,
        linesById: (npc.lines || []).reduce((acc, l) => { acc[l.id] = l; return acc; }, {})
      };
    });
  }

  // Load from disk (synchronous, small data)
  static loadFromDisk() {
    // eslint-disable-next-line global-require
    const data = require(DIALOGUE_FILE);
    return new DialogueManager(data);
  }

  // Get NPC object by id
  getNPC(npcId) {
    return this.NPCS[npcId] || null;
  }

  // Get the start line id for an NPC
  getStartLine(npcId) {
    const npc = this.getNPC(npcId);
    return npc ? npc.start : null;
  }

  // Get a line object for an NPC by lineId
  getLine(npcId, lineId) {
    const npc = this.getNPC(npcId);
    if (!npc) return null;
    return npc.linesById[lineId] || null;
  }

  // Choose a choice index on the current line and return the next line id (or 'end')
  chooseChoice(npcId, lineId, choiceIndex = 0) {
    const line = this.getLine(npcId, lineId);
    if (!line) return null;
    const choices = line.choices || [];
    if (choiceIndex < 0 || choiceIndex >= choices.length) return null;
    return choices[choiceIndex].next || null;
  }

  // Utility: advance from a line by following the first choice if present
  advanceFirst(npcId, lineId) {
    const next = this.chooseChoice(npcId, lineId, 0);
    return next;
  }

  // Reset is a no-op for this simple manager but included for API completeness
  reset(npcId) {
    // For stateful implementations, clear conversation state here
    return true;
  }
}

module.exports = DialogueManager;
