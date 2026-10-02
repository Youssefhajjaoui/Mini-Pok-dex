import { Pokemon } from '../../pokedex/models/pokemon.model';

export interface TypeCount {
  type: string;
  count: number;
}

/** Resolves team member ids against the Pokémon cache, skipping unknown ids. */
export function teamMembers(pokemonIds: number[], byId: Map<number, Pokemon>): Pokemon[] {
  return pokemonIds.map((id) => byId.get(id)).filter((p): p is Pokemon => !!p);
}

/** Counts how many members have each type, most common first. */
export function teamTypeDistribution(members: Pokemon[]): TypeCount[] {
  const counts = new Map<string, number>();
  for (const member of members) {
    for (const type of member.types) {
      counts.set(type, (counts.get(type) ?? 0) + 1);
    }
  }
  return [...counts]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type));
}

/** Sums the base stat total of every member. */
export function teamTotalBaseStats(members: Pokemon[]): number {
  return members.reduce((sum, member) => sum + member.total, 0);
}
