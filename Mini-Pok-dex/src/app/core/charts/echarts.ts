import { RadarChart } from 'echarts/charts';
import { RadarComponent } from 'echarts/components';
import * as echarts from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([RadarChart, RadarComponent, CanvasRenderer]);

export * from 'echarts/core';
