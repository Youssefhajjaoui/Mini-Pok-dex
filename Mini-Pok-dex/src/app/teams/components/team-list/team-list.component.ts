import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { LoadStatus } from '../../../common/models/load-status';
import { Pokemon } from '../../../pokedex/models/pokemon.model';
import { Team } from '../../models/team.model';
import { teamMembers } from '../../state/team.selectors';

@Component({
  selector: 'app-team-list',
  imports: [DatePipe],
  templateUrl: './team-list.component.html',
  styleUrl: './team-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamListComponent {
  readonly teams = input.required<Team[]>();
  readonly status = input.required<LoadStatus>();
  readonly error = input<string | null>(null);
  readonly pokemonById = input.required<Map<number, Pokemon>>();
  readonly selectedId = input<string | null>(null);
  readonly deletingIds = input<string[]>([]);

  readonly teamSelected = output<string>();
  readonly teamDeleted = output<string>();
  readonly retried = output<void>();

  protected members(team: Team): Pokemon[] {
    return teamMembers(team.pokemonIds, this.pokemonById());
  }

  protected isDeleting(team: Team): boolean {
    return this.deletingIds().includes(team.id);
  }
}
