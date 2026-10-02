import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map, shareReplay } from 'rxjs';

import { LoadStatus } from '../../common/models/load-status';
import { Pokemon } from '../models/pokemon.model';
import { PokemonApiService } from '../services/pokemon-api.service';

export interface PokemonState {
  items: Pokemon[];
  status: LoadStatus;
  error: string | null;
}

const initialState: PokemonState = { items: [], status: 'idle', error: null };

@Injectable({ providedIn: 'root' })
export class PokemonStore {
  private readonly api = inject(PokemonApiService);
  private readonly state$ = new BehaviorSubject<PokemonState>(initialState);

  readonly items$ = this.select((s) => s.items);
  readonly status$ = this.select((s) => s.status);
  readonly error$ = this.select((s) => s.error);
  readonly byId$ = this.items$.pipe(
    map((items) => new Map(items.map((p) => [p.id, p]))),
    shareReplay({ bufferSize: 1, refCount: true }),
  );

  /** Loads the Pokémon list unless it is already cached. Pass `force` to refetch (e.g. Retry). */
  load(force = false): void {
    const { status } = this.state$.value;
    if (!force && (status === 'loading' || status === 'success')) return;

    this.patch({ status: 'loading', error: null });
    this.api.getPokemonList().subscribe({
      next: (items) => this.patch({ items, status: 'success' }),
      error: (error: Error) => this.patch({ status: 'error', error: error.message }),
    });
  }

  private select<T>(selector: (state: PokemonState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  private patch(partial: Partial<PokemonState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
