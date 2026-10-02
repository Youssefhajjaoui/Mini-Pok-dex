import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, distinctUntilChanged, map } from 'rxjs';

import { LoadStatus } from '../../common/models/load-status';
import { ToastService } from '../../common/toast/toast.service';
import { Team, TeamDraft } from '../models/team.model';
import { DEFAULT_TRAINER_ID, TeamApiService } from '../services/team-api.service';

export interface TeamState {
  teams: Team[];
  status: LoadStatus;
  error: string | null;
  deletingIds: string[];
}

const initialState: TeamState = { teams: [], status: 'idle', error: null, deletingIds: [] };

@Injectable({ providedIn: 'root' })
export class TeamStore {
  private readonly api = inject(TeamApiService);
  private readonly toast = inject(ToastService);
  private readonly state$ = new BehaviorSubject<TeamState>(initialState);
  private lastTempId = 0;

  readonly teams$ = this.select((s) => s.teams);
  readonly status$ = this.select((s) => s.status);
  readonly error$ = this.select((s) => s.error);
  readonly deletingIds$ = this.select((s) => s.deletingIds);

  /** Loads teams unless they are already loaded. Pass `force` to refetch (e.g. Retry). */
  load(force = false): void {
    const { status } = this.state$.value;
    if (!force && (status === 'loading' || status === 'success')) return;

    this.patch({ status: 'loading', error: null });
    this.api.getTeams().subscribe({
      next: (teams) => this.patch({ teams, status: 'success' }),
      error: (error: Error) => this.patch({ status: 'error', error: error.message }),
    });
  }

  /**
   * Optimistic create: the team appears immediately with a negative temporary id.
   * On success the temporary row is replaced by the server row; on failure the list
   * is rolled back and an error toast is shown.
   */
  create(draft: TeamDraft): void {
    const snapshot = this.state$.value.teams;
    const createdAt = new Date().toISOString();
    const tempTeam: Team = {
      id: String(--this.lastTempId),
      name: draft.name,
      trainerId: DEFAULT_TRAINER_ID,
      pokemonIds: draft.pokemonIds,
      createdAt,
      pending: true,
    };

    this.patch({ teams: [tempTeam, ...snapshot] });

    this.api.createTeam(draft, createdAt).subscribe({
      next: (saved) => {
        this.patch({ teams: this.teams.map((t) => (t.id === tempTeam.id ? saved : t)) });
        this.toast.success(`Team "${saved.name}" created.`);
      },
      error: (error: Error) => {
        // Drop only the temporary row so teams changed meanwhile are kept.
        this.patch({ teams: this.teams.filter((t) => t.id !== tempTeam.id) });
        this.toast.error(`Could not create "${draft.name}". ${error.message}`);
      },
    });
  }

  /** Deletes a saved team. Its row shows a deleting state until the server answers. */
  delete(id: string): void {
    const team = this.teams.find((t) => t.id === id);
    if (!team || team.pending || this.state$.value.deletingIds.includes(id)) return;

    this.patch({ deletingIds: [...this.state$.value.deletingIds, id] });

    this.api.deleteTeam(id).subscribe({
      next: () => {
        this.patch({ teams: this.teams.filter((t) => t.id !== id) });
        this.clearDeleting(id);
        this.toast.success(`Team "${team.name}" deleted.`);
      },
      error: (error: Error) => {
        this.clearDeleting(id);
        this.toast.error(`Could not delete "${team.name}". ${error.message}`);
      },
    });
  }

  private get teams(): Team[] {
    return this.state$.value.teams;
  }

  private clearDeleting(id: string): void {
    this.patch({ deletingIds: this.state$.value.deletingIds.filter((d) => d !== id) });
  }

  private select<T>(selector: (state: TeamState) => T): Observable<T> {
    return this.state$.pipe(map(selector), distinctUntilChanged());
  }

  private patch(partial: Partial<TeamState>): void {
    this.state$.next({ ...this.state$.value, ...partial });
  }
}
