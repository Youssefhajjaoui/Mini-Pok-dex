import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { typeColor } from '../models/type-colors';

@Component({
  selector: 'app-type-badge',
  template: `
    <span
      class="type-badge"
      [style.background]="color().background"
      [style.color]="color().text"
    >
      {{ type() }}
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
    }
    .type-badge {
      display: inline-flex;
      align-items: center;
      height: 20px;
      padding: 0 var(--space-2);
      border-radius: 999px;
      font-size: 0.6875rem;
      font-weight: 600;
      line-height: 1;
      text-transform: capitalize;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeBadgeComponent {
  readonly type = input.required<string>();

  protected readonly color = computed(() => typeColor(this.type()));
}
