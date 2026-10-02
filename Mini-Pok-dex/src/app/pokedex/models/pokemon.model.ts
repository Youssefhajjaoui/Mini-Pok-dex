export interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
  height: number;
  weight: number;
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
  total: number;
}

export interface PokemonListResponse {
  pokemon_v2_pokemon: {
    id: number;
    name: string;
    height: number;
    weight: number;
    pokemon_v2_pokemontypes: { pokemon_v2_type: { name: string } }[];
    pokemon_v2_pokemonstats: { base_stat: number; pokemon_v2_stat: { name: string } }[];
    pokemon_v2_pokemonsprites: { sprites: { front_default?: string | null } | string }[];
  }[];
}
