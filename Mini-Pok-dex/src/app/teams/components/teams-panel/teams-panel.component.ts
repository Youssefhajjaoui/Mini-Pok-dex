import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TypeBadgeComponent } from '../../../common/type-badge/type-badge.component';
import { Pokemon } from '../../../pokedex/models/pokemon.model';
import { PokemonStore } from '../../../pokedex/state/pokemon.store';
import { TeamStore } from '../../state/team.store';
import { teamMembers, teamTotalBaseStats, teamTypeDistribution } from '../../state/team.selectors';
import { TeamBuilderComponent } from '../team-builder/team-builder.component';
import { TeamListComponent } from '../team-list/team-list.component';

const SELECTED_TEAM_KEY = 'mini-pokedex:selected-team-id';

@Component({
  selector: 'app-teams-panel',
  imports: [TeamBuilderComponent, TeamListComponent, TypeBadgeComponent],
  templateUrl: './teams-panel.component.html',
  styleUrl: './teams-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsPanelComponent implements OnInit {
  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);

  protected readonly teams = toSignal(this.teamStore.teams$, { initialValue: [] });
  protected readonly status = toSignal(this.teamStore.status$, { initialValue: 'idle' });
  protected readonly error = toSignal(this.teamStore.error$, { initialValue: null });
  protected readonly deletingIds = toSignal(this.teamStore.deletingIds$, { initialValue: [] });
  protected readonly pokemonById = toSignal(this.pokemonStore.byId$, {
    initialValue: new Map<number, Pokemon>(),
  });

  protected readonly selectedTeamId = signal<string | null>(localStorage.getItem(SELECTED_TEAM_KEY));

  protected readonly selectedTeam = computed(
    () => this.teams().find((t) => t.id === this.selectedTeamId()) ?? null,
  );
  private readonly selectedMembers = computed(() => {
    const team = this.selectedTeam();
    return team ? teamMembers(team.pokemonIds, this.pokemonById()) : [];
  });
  protected readonly typeDistribution = computed(() =>
    teamTypeDistribution(this.selectedMembers()),
  );
  protected readonly totalBaseStats = computed(() => teamTotalBaseStats(this.selectedMembers()));

  constructor() {
    effect(() => {
      const id = this.selectedTeamId();
      if (id) {
        localStorage.setItem(SELECTED_TEAM_KEY, id);
      } else {
        localStorage.removeItem(SELECTED_TEAM_KEY);
      }
    });
  }

  ngOnInit(): void {
    this.teamStore.load();
  }

  protected selectTeam(id: string): void {
    this.selectedTeamId.update((current) => (current === id ? null : id));
  }

  protected deleteTeam(id: string): void {
    if (this.selectedTeamId() === id) this.selectedTeamId.set(null);
    this.teamStore.delete(id);
  }

  protected retry(): void {
    this.teamStore.load(true);
  }
}
