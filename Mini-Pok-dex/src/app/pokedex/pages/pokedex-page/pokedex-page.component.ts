import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { TypeBadgeComponent } from '../../../common/type-badge/type-badge.component';
import { TeamsPanelComponent } from '../../../teams/components/teams-panel/teams-panel.component';
import { PokemonStore } from '../../state/pokemon.store';

@Component({
  selector: 'app-pokedex-page',
  imports: [NgTemplateOutlet, TeamsPanelComponent, TypeBadgeComponent],
  templateUrl: './pokedex-page.component.html',
  styleUrl: './pokedex-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPageComponent implements OnInit {
  private readonly store = inject(PokemonStore);

  protected readonly pokemon = toSignal(this.store.items$, { initialValue: [] });
  protected readonly status = toSignal(this.store.status$, { initialValue: 'idle' });
  protected readonly error = toSignal(this.store.error$, { initialValue: null });
  protected readonly skeletonRows = Array.from({ length: 10 }, (_, i) => i);

  ngOnInit(): void {
    this.store.load();
  }

  protected retry(): void {
    this.store.load(true);
  }
}
