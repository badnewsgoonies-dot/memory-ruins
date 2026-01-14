import { System, World, EntityId, createDefaultWorld } from './ecs';
import { defaultEventBus, EventTopic } from './events';

// Component name constants
export const COMPONENT_HEALTH = 'health';
export const COMPONENT_ATTACK = 'attack';

// Event topic constants
export const TOPIC_COMBAT_ATTACK: EventTopic = 'combat:attack';

// Gameplay constants (no magic numbers)
export const DEFAULT_ATTACK_COOLDOWN = 1.0; // seconds
export const DEFAULT_ATTACK_DAMAGE = 3; // HP (reduced for smoother progression)
export const DEFAULT_DEFENDER_HP = 15; // HP (increased to absorb small attacks)

// Component shapes
export type HealthComponent = { hp: number; maxHp?: number };
export type AttackComponent = { damage: number; cooldown: number; timer?: number };

// CombatSystem listens for TOPIC_COMBAT_ATTACK and applies damage to the requested target
export class CombatSystem implements System {
  private bus: typeof defaultEventBus;
  private world: World;

  constructor(world: World, bus = defaultEventBus) {
    this.world = world;
    this.bus = bus;
    // subscribe synchronously; handler mutates world directly
    this.bus.subscribe(TOPIC_COMBAT_ATTACK, (evt) => this.onAttack(evt.payload));
  }

  // event payload: { attacker: EntityId, target: EntityId }
  private onAttack(payload: { attacker: EntityId; target: EntityId }): void {
    const { attacker, target } = payload;
    const attack = this.world.getComponent<AttackComponent>(attacker, COMPONENT_ATTACK);
    const health = this.world.getComponent<HealthComponent>(target, COMPONENT_HEALTH);
    if (!attack) return; // attacker cannot attack
    if (!health) return; // nothing to damage

    // Apply damage
    health.hp -= attack.damage;

    // Reset attack timer using named cooldown
    attack.timer = attack.cooldown ?? DEFAULT_ATTACK_COOLDOWN;

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
  update(_dt: number, _world: World): void {
    // intentionally empty
  }
}

// Demo scenario builder that exercises the CombatSystem via events
export function runCombatMechanicScenario(): { passed: boolean; messages: string[] } {
  const messages: string[] = [];
  const world = createDefaultWorld();

  // Build entities
  const attacker = world.createEntity();
  const defender = world.createEntity();

  // Attach components using named constants
  world.addComponent(attacker, COMPONENT_ATTACK, { damage: DEFAULT_ATTACK_DAMAGE, cooldown: DEFAULT_ATTACK_COOLDOWN });
  world.addComponent(defender, COMPONENT_HEALTH, { hp: DEFAULT_DEFENDER_HP, maxHp: DEFAULT_DEFENDER_HP });

  // Register system (it subscribes to the bus and will mutate the world when events are published)
  const system = new CombatSystem(world, defaultEventBus);
  world.registerSystem(system);

  // Publish an attack event (synchronous)
  defaultEventBus.publish(TOPIC_COMBAT_ATTACK, { attacker, target: defender });

  // Check results: defender should be removed (hp <= 0) or damaged
  const remainingHealth = world.getComponent<HealthComponent>(defender, COMPONENT_HEALTH);
  if (!remainingHealth) {
    messages.push('PASS: defender died and was removed from world');
  } else {
    messages.push(`INFO: defender survived with hp=${remainingHealth.hp}`);
  }

  const passed = !remainingHealth || remainingHealth.hp < DEFAULT_DEFENDER_HP;
  return { passed, messages };
}
