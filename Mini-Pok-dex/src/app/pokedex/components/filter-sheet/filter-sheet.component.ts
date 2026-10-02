import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  input,
  output,
  viewChild,
} from '@angular/core';

import { PageSize } from '../../state/pokemon.selectors';
import { PageSizeToggleComponent } from '../page-size-toggle/page-size-toggle.component';
import { TypeFilterComponent } from '../type-filter/type-filter.component';

/** Bottom sheet holding the filters on phones. Changes apply immediately; the sheet only closes. */
@Component({
  selector: 'app-filter-sheet',
  imports: [PageSizeToggleComponent, TypeFilterComponent],
  templateUrl: './filter-sheet.component.html',
  styleUrl: './filter-sheet.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class FilterSheetComponent {
  readonly types = input.required<string[]>();
  readonly selectedType = input<string | null>(null);
  readonly pageSize = input.required<PageSize>();
  readonly resultCount = input(0);
  readonly loading = input(false);

  readonly typeChange = output<string | null>();
  readonly pageSizeChange = output<PageSize>();
  readonly cleared = output<void>();
  readonly closed = output<void>();

  private readonly doneButton = viewChild<ElementRef<HTMLButtonElement>>('doneButton');

  constructor() {
    afterNextRender(() => this.doneButton()?.nativeElement.focus());
  }
}
