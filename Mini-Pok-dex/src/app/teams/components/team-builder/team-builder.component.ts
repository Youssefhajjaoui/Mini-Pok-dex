import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { TypeBadgeComponent } from '../../../common/components/type-badge/type-badge.component';
import { Pokemon } from '../../../pokedex/models/pokemon.model';
import { PokemonStore } from '../../../pokedex/state/pokemon.store';
import { MAX_TEAM_SIZE } from '../../models/team.model';
import { TeamStore } from '../../state/team.store';
import { teamMembers } from '../../state/team.selectors';
import { teamSizeValidator, uniqueTeamNameValidator } from '../../validators/team.validators';

const MAX_SUGGESTIONS = 8;

@Component({
  selector: 'app-team-builder',
  imports: [ReactiveFormsModule, TypeBadgeComponent],
  templateUrl: './team-builder.component.html',
  styleUrl: './team-builder.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamBuilderComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly teamStore = inject(TeamStore);
  private readonly pokemonStore = inject(PokemonStore);

  protected readonly maxTeamSize = MAX_TEAM_SIZE;

  private readonly teamNames = toSignal(
    this.teamStore.teams$.pipe(map((teams) => teams.map((t) => t.name))),
    { initialValue: [] },
  );

  protected readonly form = this.fb.group({
    name: this.fb.control('', {
      validators: [Validators.required, Validators.minLength(3), Validators.maxLength(30)],
      asyncValidators: [uniqueTeamNameValidator(() => this.teamNames())],
    }),
    pokemonIds: this.fb.control<number[]>([], { validators: [teamSizeValidator] }),
  });

  protected readonly search = this.fb.control('');

  private readonly allPokemon = toSignal(this.pokemonStore.items$, { initialValue: [] });
  private readonly pokemonById = toSignal(this.pokemonStore.byId$, {
    initialValue: new Map<number, Pokemon>(),
  });
  protected readonly pokemonStatus = toSignal(this.pokemonStore.status$, {
    initialValue: 'idle',
  });

  private readonly selectedIds = toSignal(
    this.form.controls.pokemonIds.valueChanges.pipe(
      startWith(this.form.controls.pokemonIds.value),
    ),
    { initialValue: [] },
  );

  private readonly searchText = toSignal(this.search.valueChanges, { initialValue: '' });

  protected readonly query = toSignal(
    this.search.valueChanges.pipe(
      debounceTime(300),
      map((value) => value.trim().toLowerCase()),
      distinctUntilChanged(),
    ),
    { initialValue: '' },
  );

  protected readonly selectedPokemon = computed(() =>
    teamMembers(this.selectedIds(), this.pokemonById()),
  );

  protected readonly isFull = computed(() => this.selectedIds().length >= MAX_TEAM_SIZE);

  protected readonly dropdownOpen = computed(
    () => !!this.searchText().trim() && !!this.query() && !this.isFull(),
  );

  protected readonly suggestions = computed(() => {
    const query = this.query();
    if (!query) return [];
    const selected = new Set(this.selectedIds());
    return this.allPokemon()
      .filter((p) => !selected.has(p.id) && (p.name.includes(query) || String(p.id) === query))
      .slice(0, MAX_SUGGESTIONS);
  });

  constructor() {
    effect(() => {
      if (this.isFull()) {
        this.search.disable({ emitEvent: false });
      } else {
        this.search.enable({ emitEvent: false });
      }
    });
  }

  protected showErrors(control: 'name' | 'pokemonIds'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  protected addPokemon(pokemon: Pokemon): void {
    const ids = this.form.controls.pokemonIds.value;
    if (ids.includes(pokemon.id) || ids.length >= MAX_TEAM_SIZE) return;
    this.setPokemonIds([...ids, pokemon.id]);
    this.search.setValue('');
  }

  protected removePokemon(id: number): void {
    this.setPokemonIds(this.form.controls.pokemonIds.value.filter((p) => p !== id));
  }

  protected retryPokemon(): void {
    this.pokemonStore.load(true);
  }

  protected submit(): void {
    if (this.form.invalid || this.form.pending) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, pokemonIds } = this.form.getRawValue();
    this.teamStore.create({ name: name.trim(), pokemonIds });
    this.form.reset();
    this.search.reset();
  }

  private setPokemonIds(ids: number[]): void {
    const control = this.form.controls.pokemonIds;
    control.setValue(ids);
    control.markAsDirty();
    control.markAsTouched();
  }
}
