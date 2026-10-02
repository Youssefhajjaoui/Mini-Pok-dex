import { NgTemplateOutlet, TitleCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map, startWith, tap } from 'rxjs';

import { TypeBadgeComponent } from '../../../common/type-badge/type-badge.component';
import { TeamsPanelComponent } from '../../../teams/components/teams-panel/teams-panel.component';
import { PokemonDetailComponent } from '../../components/pokemon-detail/pokemon-detail.component';
import {
  PAGE_SIZES,
  PageSize,
  SortKey,
  SortState,
  availableTypes,
  paginate,
  selectFilteredPokemon,
} from '../../state/pokemon.selectors';
import { PokemonStore } from '../../state/pokemon.store';

interface Column {
  key: SortKey;
  label: string;
  numeric: boolean;
}

const COLUMNS: Column[] = [
  { key: 'id', label: '#', numeric: false },
  { key: 'name', label: 'Name', numeric: false },
  { key: 'hp', label: 'HP', numeric: true },
  { key: 'attack', label: 'Attack', numeric: true },
  { key: 'defense', label: 'Defense', numeric: true },
  { key: 'specialAttack', label: 'Sp. Atk', numeric: true },
  { key: 'specialDefense', label: 'Sp. Def', numeric: true },
  { key: 'speed', label: 'Speed', numeric: true },
  { key: 'total', label: 'Total', numeric: true },
];

const DEFAULT_SORT: SortState = { key: 'id', direction: 'asc' };

@Component({
  selector: 'app-pokedex-page',
  imports: [
    NgTemplateOutlet,
    PokemonDetailComponent,
    ReactiveFormsModule,
    TeamsPanelComponent,
    TitleCasePipe,
    TypeBadgeComponent,
  ],
  templateUrl: './pokedex-page.component.html',
  styleUrl: './pokedex-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PokedexPageComponent implements OnInit {
  private readonly store = inject(PokemonStore);

  protected readonly idColumn = COLUMNS[0];
  protected readonly nameColumn = COLUMNS[1];
  protected readonly statColumns = COLUMNS.slice(2);
  protected readonly pageSizes = PAGE_SIZES;

  protected readonly pokemon = toSignal(this.store.items$, { initialValue: [] });
  protected readonly status = toSignal(this.store.status$, { initialValue: 'idle' });
  protected readonly error = toSignal(this.store.error$, { initialValue: null });

  protected readonly searchControl = new FormControl('', { nonNullable: true });
  protected readonly selectedType = signal<string | null>(null);
  protected readonly sort = signal<SortState>(DEFAULT_SORT);
  protected readonly pageSize = signal<PageSize>(25);
  protected readonly selectedId = signal<number | null>(null);
  private readonly pageIndex = signal(0);

  private readonly searchText = toSignal(this.searchControl.valueChanges, { initialValue: '' });

  private readonly search$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    map((value) => value.trim().toLowerCase()),
    startWith(''),
    distinctUntilChanged(),
    tap(() => this.pageIndex.set(0)),
  );

  protected readonly filtered = toSignal(
    selectFilteredPokemon(
      this.store.items$,
      this.search$,
      toObservable(this.selectedType),
      toObservable(this.sort),
    ),
    { initialValue: [] },
  );

  protected readonly types = computed(() => availableTypes(this.pokemon()));
  protected readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.filtered().length / this.pageSize())),
  );
  protected readonly currentPage = computed(() =>
    Math.min(this.pageIndex(), this.totalPages() - 1),
  );
  protected readonly visible = computed(() =>
    paginate(this.filtered(), this.currentPage(), this.pageSize()),
  );
  protected readonly rangeStart = computed(() =>
    this.filtered().length ? this.currentPage() * this.pageSize() + 1 : 0,
  );
  protected readonly rangeEnd = computed(() =>
    Math.min((this.currentPage() + 1) * this.pageSize(), this.filtered().length),
  );
  protected readonly hasFilters = computed(
    () => !!this.selectedType() || this.searchText().trim() !== '',
  );
  protected readonly skeletonRows = computed(() =>
    Array.from({ length: Math.min(this.pageSize(), 10) }, (_, i) => i),
  );

  ngOnInit(): void {
    this.store.load();
  }

  protected retry(): void {
    this.store.load(true);
  }

  protected onTypeChange(value: string): void {
    this.selectedType.set(value || null);
    this.pageIndex.set(0);
  }

  protected onPageSizeChange(value: string): void {
    this.pageSize.set(Number(value) as PageSize);
    this.pageIndex.set(0);
  }

  /** Clicking the active column flips direction; a new column starts high-to-low for stats. */
  protected sortBy(column: Column): void {
    this.sort.update((current) =>
      current.key === column.key
        ? { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key: column.key, direction: column.numeric ? 'desc' : 'asc' },
    );
    this.pageIndex.set(0);
  }

  protected ariaSort(column: Column): 'ascending' | 'descending' | 'none' {
    const { key, direction } = this.sort();
    if (key !== column.key) return 'none';
    return direction === 'asc' ? 'ascending' : 'descending';
  }

  protected selectPokemon(id: number): void {
    this.selectedId.set(id);
  }

  protected closeDetail(): void {
    this.selectedId.set(null);
  }

  protected goToPage(index: number): void {
    this.pageIndex.set(Math.max(0, Math.min(index, this.totalPages() - 1)));
  }

  protected clearFilters(): void {
    this.searchControl.setValue('');
    this.selectedType.set(null);
    this.pageIndex.set(0);
  }
}
