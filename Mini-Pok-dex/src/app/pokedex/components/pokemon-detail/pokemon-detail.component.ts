import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';

import { TypeBadgeComponent } from '../../../common/type-badge/type-badge.component';
import { AbilitiesEntry, AbilitiesStore } from '../../state/abilities.store';
import { PokemonStore } from '../../state/pokemon.store';
import { StatsRadarComponent } from '../stats-radar/stats-radar.component';

const LOADING_ABILITIES: AbilitiesEntry = { status: 'loading', abilities: [], error: null };

@Component({
  selector: 'app-pokemon-detail',
  imports: [DecimalPipe, StatsRadarComponent, TypeBadgeComponent],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'dialog',
    'aria-labelledby': 'pokemon-detail-title',
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class PokemonDetailComponent {
  private readonly pokemonStore = inject(PokemonStore);
  private readonly abilitiesStore = inject(AbilitiesStore);

  readonly pokemonId = input.required<number>();
  readonly closed = output<void>();

  private readonly closeButton = viewChild<ElementRef<HTMLButtonElement>>('closeButton');

  protected readonly status = toSignal(this.pokemonStore.status$, { initialValue: 'idle' });
  protected readonly error = toSignal(this.pokemonStore.error$, { initialValue: null });
  private readonly byId = toSignal(this.pokemonStore.byId$, { initialValue: new Map() });

  protected readonly pokemon = computed(() => this.byId().get(this.pokemonId()) ?? null);

  protected readonly abilities = toSignal(
    toObservable(this.pokemonId).pipe(
      tap((id) => this.abilitiesStore.load(id)),
      switchMap((id) => this.abilitiesStore.select(id)),
    ),
    { initialValue: LOADING_ABILITIES },
  );

  protected readonly stats = computed(() => {
    const p = this.pokemon();
    if (!p) return [];
    return [
      { label: 'HP', value: p.hp },
      { label: 'Attack', value: p.attack },
      { label: 'Defense', value: p.defense },
      { label: 'Sp. Atk', value: p.specialAttack },
      { label: 'Sp. Def', value: p.specialDefense },
      { label: 'Speed', value: p.speed },
    ];
  });

  constructor() {
    afterNextRender(() => this.closeButton()?.nativeElement.focus());
  }

  protected retryPokemon(): void {
    this.pokemonStore.load(true);
  }

  protected retryAbilities(): void {
    this.abilitiesStore.load(this.pokemonId(), true);
  }
}
