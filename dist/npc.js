"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NPC = void 0;
exports.loadNPC = loadNPC;
class NPC {
    constructor(data) {
        this.data = data;
    }
    // Return the dialogue node by id (defaults to 'greet')
    speak(nodeId = 'greet') {
        return this.data.dialogue.find(n => n.id === nodeId) || null;
    }
    interact() {
        return this.speak();
    }
}
exports.NPC = NPC;
async function loadNPC(id, manager) {
    const npcData = manager.getNPC(id);
    if (!npcData)
        throw new Error(`NPC ${id} not found`);
    return new NPC(npcData);
}
