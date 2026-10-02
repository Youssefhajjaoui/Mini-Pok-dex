import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { PAGE_SIZES, PageSize } from '../../state/pokemon.selectors';

@Component({
  selector: 'app-page-size-toggle',
  template: `
    <div class="page-size" role="group" aria-label="Pokémon per page">
      <span class="page-size__label" aria-hidden="true">Show</span>
      @for (size of sizes; track size) {
        <button
          type="button"
          class="page-size__option"
          [class.page-size__option--active]="size === value()"
          [attr.aria-pressed]="size === value()"
          (click)="valueChange.emit(size)"
        >
          {{ size }}
        </button>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .page-size {
      display: inline-flex;
      align-items: center;
      gap: var(--space-1);
      height: 48px;
      padding: var(--space-1);
      border: 2px solid var(--color-border);
      border-radius: 999px;
      background: var(--color-background);
    }
    .page-size__label {
      padding: 0 var(--space-2) 0 var(--space-3);
      font-size: var(--font-size-xs);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-text-muted);
    }
    .page-size__option {
      min-width: 40px;
      height: 36px;
      padding: 0 var(--space-3);
      border: none;
      border-radius: 999px;
      background: none;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: background-color 0.15s, color 0.15s;
    }
    .page-size__option:hover {
      color: var(--color-text);
    }
    .page-size__option--active,
    .page-size__option--active:hover {
      background: linear-gradient(180deg, var(--color-primary), var(--color-primary-strong));
      color: var(--color-on-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSizeToggleComponent {
  readonly value = input.required<PageSize>();
  readonly valueChange = output<PageSize>();

  protected readonly sizes = PAGE_SIZES;
}
