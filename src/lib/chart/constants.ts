import type { RecessionPeriod } from './types';

// Accessible, colorblind-friendly palette (Wong palette + extras)
export const CHART_COLORS = [
  '#2563eb', // blue
  '#dc2626', // red
  '#16a34a', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
] as const;

// NBER recession dates (US)
export const RECESSION_PERIODS: RecessionPeriod[] = [
  { start: '1969-12-01', end: '1970-11-01' },
  { start: '1973-11-01', end: '1975-03-01' },
  { start: '1980-01-01', end: '1980-07-01' },
  { start: '1981-07-01', end: '1982-11-01' },
  { start: '1990-07-01', end: '1991-03-01' },
  { start: '2001-03-01', end: '2001-11-01' },
  { start: '2007-12-01', end: '2009-06-01', label: 'Great Recession' },
  { start: '2020-02-01', end: '2020-04-01', label: 'COVID-19' },
];

export const DATE_PRESET_MONTHS: Record<string, number | null> = {
  '1M': 1,
  '3M': 3,
  '6M': 6,
  '1Y': 12,
  '2Y': 24,
  '5Y': 60,
  '10Y': 120,
  MAX: null,
};

// Format value based on units
export function formatValue(value: number | null, units?: string): string {
  if (value === null) return '—';

  const absValue = Math.abs(value);

  if (units?.includes('%') || units?.includes('Percent')) {
    return `${value.toFixed(1)}%`;
  }
  if (units?.includes('$') || units?.includes('Dollar') || units?.includes('Billion')) {
    if (absValue >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}T`;
    if (absValue >= 1_000) return `$${(value / 1_000).toFixed(1)}B`;
    return `$${value.toFixed(1)}B`;
  }
  if (units?.includes('Basis') || units?.includes('basis')) {
    return `${value.toFixed(0)} bps`;
  }
  if (units?.includes('Index') || units?.includes('index')) {
    return value.toFixed(1);
  }
  if (units?.includes('Thousands')) {
    return `${value.toFixed(0)}K`;
  }

  // Default: smart formatting
  if (absValue >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`;
  if (absValue >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  if (absValue < 0.01) return value.toExponential(2);
  if (absValue < 10) return value.toFixed(2);
  return value.toFixed(1);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    year: '2-digit',
  });
}
