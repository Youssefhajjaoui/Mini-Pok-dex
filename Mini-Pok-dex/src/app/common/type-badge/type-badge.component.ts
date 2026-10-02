import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-type-badge',
  template: `<span class="type-badge" [class]="'type-badge--' + type()">{{ type() }}</span>`,
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
      color: #fff;
      background: #68a090;
    }
    .type-badge--normal { background: #a8a878; }
    .type-badge--fire { background: #f08030; }
    .type-badge--water { background: #6890f0; }
    .type-badge--grass { background: #78c850; }
    .type-badge--electric { background: #f8d030; color: #222; }
    .type-badge--ice { background: #98d8d8; color: #222; }
    .type-badge--fighting { background: #c03028; }
    .type-badge--poison { background: #a040a0; }
    .type-badge--ground { background: #e0c068; color: #222; }
    .type-badge--flying { background: #a890f0; }
    .type-badge--psychic { background: #f85888; }
    .type-badge--bug { background: #a8b820; }
    .type-badge--rock { background: #b8a038; }
    .type-badge--ghost { background: #705898; }
    .type-badge--dragon { background: #7038f8; }
    .type-badge--dark { background: #705848; }
    .type-badge--steel { background: #b8b8d0; color: #222; }
    .type-badge--fairy { background: #ee99ac; color: #222; }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypeBadgeComponent {
  readonly type = input.required<string>();
}
