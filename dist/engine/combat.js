"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombatSystem = exports.DEFAULT_DEFENDER_HP = exports.DEFAULT_ATTACK_DAMAGE = exports.DEFAULT_ATTACK_COOLDOWN = exports.TOPIC_COMBAT_ATTACK = exports.COMPONENT_ATTACK = exports.COMPONENT_HEALTH = void 0;
exports.runCombatMechanicScenario = runCombatMechanicScenario;
const ecs_1 = require("./ecs");
const events_1 = require("./events");
// Component name constants
exports.COMPONENT_HEALTH = 'health';
exports.COMPONENT_ATTACK = 'attack';
// Event topic constants
exports.TOPIC_COMBAT_ATTACK = 'combat:attack';
// Gameplay constants (no magic numbers)
exports.DEFAULT_ATTACK_COOLDOWN = 1.0; // seconds
exports.DEFAULT_ATTACK_DAMAGE = 3; // HP (reduced for smoother progression)
exports.DEFAULT_DEFENDER_HP = 15; // HP (increased to absorb small attacks)
// CombatSystem listens for TOPIC_COMBAT_ATTACK and applies damage to the requested target
class CombatSystem {
    constructor(world, bus = events_1.defaultEventBus) {
        this.world = world;
        this.bus = bus;
        // subscribe synchronously; handler mutates world directly
        this.bus.subscribe(exports.TOPIC_COMBAT_ATTACK, (evt) => this.onAttack(evt.payload));
    }
    // event payload: { attacker: EntityId, target: EntityId }
    onAttack(payload) {
        const { attacker, target } = payload;
        const attack = this.world.getComponent(attacker, exports.COMPONENT_ATTACK);
        const health = this.world.getComponent(target, exports.COMPONENT_HEALTH);
        if (!attack)
            return; // attacker cannot attack
        if (!health)
            return; // nothing to damage
        // Apply damage
        health.hp -= attack.damage;
        // Reset attack timer using named cooldown
        attack.timer = attack.cooldown ?? exports.DEFAULT_ATTACK_COOLDOWN;
        // Log (minimal)
        // In a real project, route to logger instead of console
        console.log(`CombatSystem: ${attacker} -> ${target} for ${attack.damage} (hp=${health.hp})`);
        // Handle death
        if (health.hp <= 0) {
            this.world.removeEntity(target);
            console.log(`CombatSystem: ${target} died`);
        }
    }
    // System update is a no-op for this event-driven system, but kept to satisfy System interface
    update(_dt, _world) {
        // intentionally empty
    }
}
exports.CombatSystem = CombatSystem;
// Demo scenario builder that exercises the CombatSystem via events
function runCombatMechanicScenario() {
    const messages = [];
    const world = (0, ecs_1.createDefaultWorld)();
    // Build entities
    const attacker = world.createEntity();
    const defender = world.createEntity();
    // Attach components using named constants
    world.addComponent(attacker, exports.COMPONENT_ATTACK, { damage: exports.DEFAULT_ATTACK_DAMAGE, cooldown: exports.DEFAULT_ATTACK_COOLDOWN });
    world.addComponent(defender, exports.COMPONENT_HEALTH, { hp: exports.DEFAULT_DEFENDER_HP, maxHp: exports.DEFAULT_DEFENDER_HP });
    // Register system (it subscribes to the bus and will mutate the world when events are published)
    const system = new CombatSystem(world, events_1.defaultEventBus);
    world.registerSystem(system);
    // Publish an attack event (synchronous)
    events_1.defaultEventBus.publish(exports.TOPIC_COMBAT_ATTACK, { attacker, target: defender });
    // Check results: defender should be removed (hp <= 0) or damaged
    const remainingHealth = world.getComponent(defender, exports.COMPONENT_HEALTH);
    if (!remainingHealth) {
        messages.push('PASS: defender died and was removed from world');
    }
    else {
        messages.push(`INFO: defender survived with hp=${remainingHealth.hp}`);
    }
    const passed = !remainingHealth || remainingHealth.hp < exports.DEFAULT_DEFENDER_HP;
    return { passed, messages };
}
