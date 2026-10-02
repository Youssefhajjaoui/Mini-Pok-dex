import { Injectable, inject } from '@angular/core';
import { Observable, map, retry } from 'rxjs';

import { GraphqlClientService } from '../../core/graphql/graphql-client.service';
import {
  AbilitiesResponse,
  Ability,
  Pokemon,
  PokemonListResponse,
} from '../models/pokemon.model';

export const POKEAPI_URL = 'https://beta.pokeapi.co/graphql/v1beta';
export const KANTO_LIMIT = 151;

const POKEMON_FIELDS = `
  id
  name
  height
  weight
  pokemon_v2_pokemontypes { pokemon_v2_type { name } }
  pokemon_v2_pokemonstats { base_stat pokemon_v2_stat { name } }
  pokemon_v2_pokemonsprites { sprites }
`;

const GET_POKEMON_LIST = `
  query GetPokemonList($limit: Int!, $offset: Int!) {
    pokemon_v2_pokemon(limit: $limit, offset: $offset, order_by: { id: asc }) { ${POKEMON_FIELDS} }
  }
`;

const GET_POKEMON_BY_IDS = `
  query GetPokemonByIds($ids: [Int!]!) {
    pokemon_v2_pokemon(where: { id: { _in: $ids } }, order_by: { id: asc }) { ${POKEMON_FIELDS} }
  }
`;

const GET_ABILITIES = `
  query GetAbilities($pokemonId: Int!) {
    pokemon_v2_pokemonability(where: { pokemon_id: { _eq: $pokemonId } }, order_by: { slot: asc }) {
      is_hidden
      pokemon_v2_ability {
        name
        pokemon_v2_abilityeffecttexts(where: { language_id: { _eq: 9 } }, limit: 1) { short_effect }
      }
    }
  }
`;

@Injectable({ providedIn: 'root' })
export class PokemonApiService {
  private readonly graphql = inject(GraphqlClientService);

  /** Fetches a page of Pokémon from PokéAPI, retrying twice on failure. */
  getPokemonList(limit = KANTO_LIMIT, offset = 0): Observable<Pokemon[]> {
    return this.graphql
      .request<PokemonListResponse>(POKEAPI_URL, GET_POKEMON_LIST, { limit, offset })
      .pipe(
        retry({ count: 2, delay: 1000 }),
        map((data) => data.pokemon_v2_pokemon.map(toPokemon)),
      );
  }

  /** Fetches specific Pokémon by id (e.g. team members outside Kanto), retrying twice on failure. */
  getPokemonByIds(ids: number[]): Observable<Pokemon[]> {
    return this.graphql
      .request<PokemonListResponse>(POKEAPI_URL, GET_POKEMON_BY_IDS, { ids })
      .pipe(
        retry({ count: 2, delay: 1000 }),
        map((data) => data.pokemon_v2_pokemon.map(toPokemon)),
      );
  }

  /** Fetches the English abilities of one Pokémon, retrying twice on failure. */
  getAbilities(pokemonId: number): Observable<Ability[]> {
    return this.graphql
      .request<AbilitiesResponse>(POKEAPI_URL, GET_ABILITIES, { pokemonId })
      .pipe(
        retry({ count: 2, delay: 1000 }),
        map((data) =>
          data.pokemon_v2_pokemonability
            .filter((row) => row.pokemon_v2_ability)
            .map((row) => ({
              name: row.pokemon_v2_ability!.name,
              effect: row.pokemon_v2_ability!.pokemon_v2_abilityeffecttexts[0]?.short_effect ?? null,
              hidden: row.is_hidden,
            })),
        ),
      );
  }
}

function toPokemon(raw: PokemonListResponse['pokemon_v2_pokemon'][number]): Pokemon {
  const stat = (name: string) =>
    raw.pokemon_v2_pokemonstats.find((s) => s.pokemon_v2_stat.name === name)?.base_stat ?? 0;

  const hp = stat('hp');
  const attack = stat('attack');
  const defense = stat('defense');
  const specialAttack = stat('special-attack');
  const specialDefense = stat('special-defense');
  const speed = stat('speed');

  return {
    id: raw.id,
    name: raw.name,
    sprite: readSprite(raw),
    types: raw.pokemon_v2_pokemontypes.map((t) => t.pokemon_v2_type.name),
    height: raw.height,
    weight: raw.weight,
    hp,
    attack,
    defense,
    specialAttack,
    specialDefense,
    speed,
    total: hp + attack + defense + specialAttack + specialDefense + speed,
  };
}

function readSprite(raw: PokemonListResponse['pokemon_v2_pokemon'][number]): string {
  const fallback = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${raw.id}.png`;
  const blob = raw.pokemon_v2_pokemonsprites[0]?.sprites;
  if (!blob) return fallback;
  try {
    const sprites = typeof blob === 'string' ? JSON.parse(blob) : blob;
    return sprites.front_default ?? fallback;
  } catch {
    return fallback;
  }
}
