import { createDefaultWorld } from './ecs';
import { CombatSystem } from './combat';

// Small headless demo that runs the combat system for a few ticks
export function runCombatDemo(): void {
  const world = createDefaultWorld();
  const combat = new CombatSystem(world);
  world.registerSystem(combat);

  // Create two entities: attacker and target
  const attacker = world.createEntity();
  const target = world.createEntity();

  // Add components: health and attack
  world.addComponent(attacker, 'health', { hp: 20, maxHp: 20 });
  world.addComponent(attacker, 'attack', { damage: 6, cooldown: 1.0, timer: 0 });

  world.addComponent(target, 'health', { hp: 15, maxHp: 15 });

  console.log('Combat demo start: attacker=' + attacker + ' target=' + target);

  // Simulate up to 10 ticks (1s per tick)
  for (let tick = 0; tick < 10; tick++) {
    console.log(`-- tick ${tick}`);
    world.update(1.0);

    // Check if target still exists by querying health components
    const remaining = world.query(['health']).map(r => r.entity);
    console.log('Entities with health:', remaining);

    if (!remaining.includes(target)) {
      console.log('Combat demo: target eliminated, ending demo');
      break;
    }
  }
}

// If executed directly, run the demo
if (require.main === module) {
  runCombatDemo();
}
