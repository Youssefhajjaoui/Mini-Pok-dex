import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { typeColor } from '../../../common/models/type-colors';

/** Row of type chips. Emits the clicked type, or `null` for "All types". */
@Component({
  selector: 'app-type-filter',
  templateUrl: './type-filter.component.html',
  styleUrl: './type-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeFilterComponent {
  readonly types = input.required<string[]>();
  readonly selected = input<string | null>(null);
  readonly loading = input(false);

  readonly selectedChange = output<string | null>();

  protected readonly chips = computed(() =>
    this.types().map((name) => ({ name, color: typeColor(name) })),
  );

  protected readonly skeletons = [1, 2, 3, 4, 5, 6];
}
