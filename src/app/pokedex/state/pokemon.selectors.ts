import { Observable, combineLatest, map, shareReplay, switchMap } from 'rxjs';

import { Pokemon } from '../models/pokemon.model';

export type SortKey =
  | 'id'
  | 'name'
  | 'hp'
  | 'attack'
  | 'defense'
  | 'specialAttack'
  | 'specialDefense'
  | 'speed'
  | 'total';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  key: SortKey;
  direction: SortDirection;
}

export const PAGE_SIZES = [10, 25, 50] as const;
export type PageSize = (typeof PAGE_SIZES)[number];

/** Keeps Pokémon whose name contains `search` (already trimmed and lowercased) or whose number equals it. */
export function filterByName(items: Pokemon[], search: string): Pokemon[] {
  if (!search) return items;
  return items.filter((p) => p.name.includes(search) || String(p.id) === search);
}

/** Keeps Pokémon that have `type`; `null` keeps everything. */
export function filterByType(items: Pokemon[], type: string | null): Pokemon[] {
  if (!type) return items;
  return items.filter((p) => p.types.includes(type));
}

/** Returns a sorted copy. Ties fall back to the Pokédex number so the order is stable. */
export function sortPokemon(items: Pokemon[], { key, direction }: SortState): Pokemon[] {
  const sign = direction === 'asc' ? 1 : -1;
  return [...items].sort((a, b) => {
    const diff = key === 'name' ? a.name.localeCompare(b.name) : a[key] - b[key];
    return diff === 0 ? a.id - b.id : diff * sign;
  });
}

/** Returns one page of items. `pageIndex` is zero-based. */
export function paginate<T>(items: T[], pageIndex: number, pageSize: number): T[] {
  const start = pageIndex * pageSize;
  return items.slice(start, start + pageSize);
}

/** All types present in the list, alphabetically. */
export function availableTypes(items: Pokemon[]): string[] {
  return [...new Set(items.flatMap((p) => p.types))].sort();
}

/**
 * Combines the cached list with the search, type filter and sort into the rows to display.
 * `switchMap` drops the previous search as soon as a newer one arrives.
 */
export function selectFilteredPokemon(
  items$: Observable<Pokemon[]>,
  search$: Observable<string>,
  type$: Observable<string | null>,
  sort$: Observable<SortState>,
): Observable<Pokemon[]> {
  const searched$ = search$.pipe(
    switchMap((search) => items$.pipe(map((items) => filterByName(items, search)))),
  );

  return combineLatest([searched$, type$, sort$]).pipe(
    map(([items, type, sort]) => sortPokemon(filterByType(items, type), sort)),
    shareReplay({ bufferSize: 1, refCount: true }),
  );
}
