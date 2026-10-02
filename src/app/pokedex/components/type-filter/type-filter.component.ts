import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Type dropdown. Emits the chosen type, or `null` for "All types". */
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

  protected onSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedChange.emit(value || null);
  }
}
