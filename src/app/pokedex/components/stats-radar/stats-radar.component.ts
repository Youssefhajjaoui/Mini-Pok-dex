import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { EChartsCoreOption } from 'echarts/core';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';

import { Pokemon } from '../../models/pokemon.model';

/**
 * Shared scale for every chart. Almost all Kanto stats sit below it; outliers such as
 * Chansey's 250 HP are drawn at the edge, and the exact numbers are listed under the chart.
 */
const CHART_MAX = 180;

const INDICATORS = ['HP', 'Attack', 'Defense', 'Sp. Atk', 'Sp. Def', 'Speed'].map((name) => ({
  name,
  max: CHART_MAX,
}));

// ECharts draws on a canvas, so it cannot read the CSS variables; these mirror styles.scss.
const COLOR_PRIMARY = '#ffcb05';
const COLOR_ACCENT = '#ff7a1a';
const COLOR_BORDER = '#26457f';
const COLOR_TEXT_MUTED = '#a8b7dc';

@Component({
  selector: 'app-stats-radar',
  imports: [NgxEchartsDirective],
  providers: [provideEchartsCore({ echarts: () => import('../../../core/charts/echarts') })],
  template: `
    <div
      class="stats-radar"
      echarts
      [options]="options"
      [merge]="merge()"
      role="img"
      [attr.aria-label]="label()"
    ></div>
  `,
  styles: `
    :host {
      display: block;
    }
    .stats-radar {
      width: 100%;
      height: 260px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsRadarComponent {
  readonly pokemon = input.required<Pokemon>();

  private readonly values = computed(() => {
    const p = this.pokemon();
    return [p.hp, p.attack, p.defense, p.specialAttack, p.specialDefense, p.speed];
  });

  protected readonly label = computed(() => {
    const [hp, atk, def, spa, spd, spe] = this.values();
    return `Base stats of ${this.pokemon().name}: HP ${hp}, Attack ${atk}, Defense ${def}, Special Attack ${spa}, Special Defense ${spd}, Speed ${spe}`;
  });

  /** Static layout, set once; changing it would make ngx-echarts rebuild the chart. */
  protected readonly options: EChartsCoreOption = {
    animationDurationUpdate: 600,
    animationEasingUpdate: 'cubicOut',
    radar: {
      indicator: INDICATORS,
      radius: '68%',
      splitNumber: 4,
      axisName: { color: COLOR_TEXT_MUTED, fontSize: 11 },
      axisLine: { lineStyle: { color: COLOR_BORDER } },
      splitLine: { lineStyle: { color: COLOR_BORDER } },
      splitArea: { show: false },
    },
    series: [
      {
        type: 'radar',
        symbolSize: 4,
        lineStyle: { color: COLOR_PRIMARY, width: 2 },
        itemStyle: { color: COLOR_PRIMARY },
        areaStyle: { color: COLOR_ACCENT, opacity: 0.35 },
        data: [],
      },
    ],
  };

  /** Only the series data changes between Pokémon, so ECharts morphs the shape instead of redrawing. */
  protected readonly merge = computed<EChartsCoreOption>(() => ({
    series: [
      {
        data: [
          { name: this.pokemon().name, value: this.values().map((v) => Math.min(v, CHART_MAX)) },
        ],
      },
    ],
  }));
}
