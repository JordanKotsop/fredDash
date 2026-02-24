export type ChartType = 'line' | 'area' | 'bar' | 'composed';

export type DatePreset = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | '10Y' | 'MAX';

export interface ChartSeries {
  id: string;
  label: string;
  color: string;
  type: 'line' | 'area' | 'bar';
  visible: boolean;
  yAxisId?: 'left' | 'right';
  units?: string;
}

export interface ChartDataPoint {
  date: string;
  [seriesId: string]: string | number | null;
}

export interface RecessionPeriod {
  start: string;
  end: string;
  label?: string;
}

export interface ChartConfig {
  title: string;
  subtitle?: string;
  series: ChartSeries[];
  datePreset: DatePreset;
  showRecessions: boolean;
  showAverage: boolean;
  source?: string;
  lastUpdated?: string;
}
