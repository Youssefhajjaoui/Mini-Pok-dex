import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

export type Section = 'pokedex' | 'teams';

/** Menu button and slide-out menu for switching sections on screens too narrow to show both. */
@Component({
  selector: 'app-section-nav',
  templateUrl: './section-nav.component.html',
  styleUrl: './section-nav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'open.set(false)',
  },
})
export class SectionNavComponent {
  readonly active = input.required<Section>();
  readonly teamCount = input(0);

  readonly sectionSelected = output<Section>();

  protected readonly open = signal(false);

  protected select(section: Section): void {
    this.sectionSelected.emit(section);
    this.open.set(false);
  }
}
