import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';

import { LoadStatus } from '../../common/models/load-status';
import { Ability } from '../models/pokemon.model';
import { PokemonApiService } from '../services/pokemon-api.service';

export interface AbilitiesEntry {
  status: LoadStatus;
  abilities: Ability[];
  error: string | null;
}

const IDLE_ENTRY: AbilitiesEntry = { status: 'idle', abilities: [], error: null };

@Injectable({ providedIn: 'root' })
export class AbilitiesStore {
  private readonly api = inject(PokemonApiService);
  private readonly state$ = new BehaviorSubject<Record<number, AbilitiesEntry>>({});

  /** Emits the cached abilities entry for one Pokémon. */
  select(pokemonId: number): Observable<AbilitiesEntry> {
    return this.state$.pipe(
      map((state) => state[pokemonId] ?? IDLE_ENTRY),
      distinctUntilChanged(),
    );
  }

  /** Fetches abilities unless they are cached or in flight. Pass `force` to refetch (e.g. Retry). */
  load(pokemonId: number, force = false): void {
    const status = this.state$.value[pokemonId]?.status;
    if (!force && (status === 'loading' || status === 'success')) return;

    this.patch(pokemonId, { status: 'loading', abilities: [], error: null });
    this.api.getAbilities(pokemonId).subscribe({
      next: (abilities) => this.patch(pokemonId, { status: 'success', abilities, error: null }),
      error: (error: Error) =>
        this.patch(pokemonId, { status: 'error', abilities: [], error: error.message }),
    });
  }

  private patch(pokemonId: number, entry: AbilitiesEntry): void {
    this.state$.next({ ...this.state$.value, [pokemonId]: entry });
  }
}
