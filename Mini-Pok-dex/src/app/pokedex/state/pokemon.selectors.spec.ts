import { BehaviorSubject, firstValueFrom, of } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';
import {
  SortState,
  availableTypes,
  filterByName,
  filterByType,
  paginate,
  selectFilteredPokemon,
  sortPokemon,
} from './pokemon.selectors';

function pokemon(id: number, name: string, types: string[], attack: number): Pokemon {
  return {
    id,
    name,
    sprite: '',
    types,
    height: 0,
    weight: 0,
    hp: 0,
    attack,
    defense: 0,
    specialAttack: 0,
    specialDefense: 0,
    speed: 0,
    total: attack,
  };
}

const bulbasaur = pokemon(1, 'bulbasaur', ['grass', 'poison'], 49);
const charmander = pokemon(4, 'charmander', ['fire'], 52);
const squirtle = pokemon(7, 'squirtle', ['water'], 48);
const psyduck = pokemon(54, 'psyduck', ['water'], 52);
const ALL = [bulbasaur, charmander, squirtle, psyduck];

const ids = (items: Pokemon[]) => items.map((p) => p.id);

describe('pokemon selectors', () => {
  describe('filterByName', () => {
    it('matches part of a name or an exact Pokédex number', () => {
      expect(ids(filterByName(ALL, 'saur'))).toEqual([1]);
      expect(ids(filterByName(ALL, '7'))).toEqual([7]);
      expect(filterByName(ALL, '')).toBe(ALL);
    });
  });

  describe('filterByType', () => {
    it('keeps only Pokémon with the type, or everything for null', () => {
      expect(ids(filterByType(ALL, 'water'))).toEqual([7, 54]);
      expect(ids(filterByType(ALL, 'poison'))).toEqual([1]);
      expect(filterByType(ALL, null)).toBe(ALL);
    });
  });

  describe('sortPokemon', () => {
    it('sorts by a stat in both directions without mutating the input', () => {
      const input = [...ALL];

      expect(ids(sortPokemon(input, { key: 'attack', direction: 'asc' }))).toEqual([7, 1, 4, 54]);
      expect(ids(sortPokemon(input, { key: 'attack', direction: 'desc' }))).toEqual([4, 54, 1, 7]);
      expect(input).toEqual(ALL);
    });

    it('breaks ties by Pokédex number so the order is stable', () => {
      const tied = sortPokemon([psyduck, charmander], { key: 'attack', direction: 'desc' });
      expect(ids(tied)).toEqual([4, 54]);
    });

    it('sorts names alphabetically', () => {
      expect(ids(sortPokemon(ALL, { key: 'name', direction: 'asc' }))).toEqual([1, 4, 54, 7]);
    });
  });

  it('paginate returns the requested zero-based page', () => {
    expect(paginate([1, 2, 3, 4, 5], 0, 2)).toEqual([1, 2]);
    expect(paginate([1, 2, 3, 4, 5], 2, 2)).toEqual([5]);
    expect(paginate([1, 2, 3], 5, 2)).toEqual([]);
  });

  it('availableTypes lists each type once, alphabetically', () => {
    expect(availableTypes(ALL)).toEqual(['fire', 'grass', 'poison', 'water']);
  });

  describe('selectFilteredPokemon', () => {
    it('combines search, type filter and sort, and re-emits when one of them changes', async () => {
      const search$ = new BehaviorSubject('');
      const type$ = new BehaviorSubject<string | null>('water');
      const sort$ = new BehaviorSubject<SortState>({ key: 'attack', direction: 'desc' });

      const rows$ = selectFilteredPokemon(of(ALL), search$, type$, sort$);
      expect(ids(await firstValueFrom(rows$))).toEqual([54, 7]);

      search$.next('squirt');
      expect(ids(await firstValueFrom(rows$))).toEqual([7]);

      search$.next('');
      type$.next(null);
      sort$.next({ key: 'id', direction: 'asc' });
      expect(ids(await firstValueFrom(rows$))).toEqual([1, 4, 7, 54]);
    });
  });
});
