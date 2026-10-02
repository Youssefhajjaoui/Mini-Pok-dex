import { Injectable, inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  shareReplay,
} from 'rxjs';

import { LoadStatus } from '../../common/models/load-status';
import { ToastService } from '../../common/components/toast/toast.service';
import { Pokemon } from '../models/pokemon.model';
import { PokemonApiService } from '../services/pokemon-api.service';

export interface PokemonState {
  items: Pokemon[];
  /** Pokémon fetched individually by id (e.g. team members outside the Kanto list). */
  extras: Pokemon[];
  status: LoadStatus;
  error: string | null;
}

const initialState: PokemonState = { items: [], extras: [], status: 'idle', error: null };

@Injectable({ providedIn: 'root' })
export class PokemonStore {
  private readonly api = inject(PokemonApiService);
  private readonly toast = inject(ToastService);
  private readonly state$ = new BehaviorSubject<PokemonState>(initialState);
  private readonly requestedIds = new Set<number>();

  readonly items$ = this.select((s) => s.items);
  readonly status$ = this.select((s) => s.status);
  readonly error$ = this.select((s) => s.error);
  readonly byId$ = combineLatest([this.items$, this.select((s) => s.extras)]).pipe(
    map(([items, extras]) => new Map([...items, ...extras].map((p) => [p.id, p]))),
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

  /**
   * Fetches the given Pokémon that are not cached yet and adds them to `byId$`.
   * Ids already cached or in flight are skipped; failures are reported with a toast.
   */
  loadByIds(ids: number[]): void {
    const { items, extras } = this.state$.value;
    const cached = new Set([...items, ...extras].map((p) => p.id));
    const missing = [...new Set(ids)].filter((id) => !cached.has(id) && !this.requestedIds.has(id));
    if (missing.length === 0) return;

    missing.forEach((id) => this.requestedIds.add(id));
    this.api.getPokemonByIds(missing).subscribe({
      next: (fetched) => this.patch({ extras: [...this.state$.value.extras, ...fetched] }),
      error: (error: Error) => {
        missing.forEach((id) => this.requestedIds.delete(id));
        this.toast.error(`Could not load some team Pokémon. ${error.message}`);
      },
    });
  }

  private select<T>(selector: (state: PokemonState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  private patch(partial: Partial<PokemonState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
