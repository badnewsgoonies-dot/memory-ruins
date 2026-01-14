from dataclasses import dataclass
from typing import Tuple

# Named constants (no magic numbers)
BASE_HEALTH = 100
BASE_ATTACK = 12
MIN_DAMAGE = 1

@dataclass
class Entity:
    """A simple combat entity with deterministic stats."""
    name: str
    max_health: int = BASE_HEALTH
    attack: int = BASE_ATTACK
    health: int = None

    def __post_init__(self):
        if self.health is None:
            self.health = self.max_health


def attack(attacker: Entity, defender: Entity) -> int:
    """Apply damage from attacker to defender and return damage dealt.

    Deterministic rule: damage = max(MIN_DAMAGE, attacker.attack)
    """
    damage = max(MIN_DAMAGE, attacker.attack)
    defender.health = max(0, defender.health - damage)
    return damage


def simulate_battle(a: Entity, b: Entity) -> Tuple[str, int]:
    """Run a deterministic, alternating-turn battle where `a` starts.

    Returns (winner_name, rounds_elapsed).
    """
    attacker, defender = a, b
    rounds = 0
    while a.health > 0 and b.health > 0:
        rounds += 1
        attack(attacker, defender)
        if defender.health <= 0:
            return attacker.name, rounds
        attacker, defender = defender, attacker
    # Fallback (shouldn't be reached)
    winner = a.name if a.health > b.health else b.name
    return winner, rounds


# Demo removed for test-runner environments to avoid noisy output
if __name__ == "__main__":
    pass
