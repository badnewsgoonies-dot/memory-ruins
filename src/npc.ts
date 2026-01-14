import { DialogueManager, NPCData } from './dialogue';

export class NPC {
  constructor(public data: NPCData) {}

  // Return the dialogue node by id (defaults to 'greet')
  speak(nodeId = 'greet') {
    return this.data.dialogue.find(n => n.id === nodeId) || null;
  }

  interact() {
    return this.speak();
  }
}

export async function loadNPC(id: string, manager: DialogueManager) {
  const npcData = manager.getNPC(id);
  if (!npcData) throw new Error(`NPC ${id} not found`);
  return new NPC(npcData);
}
