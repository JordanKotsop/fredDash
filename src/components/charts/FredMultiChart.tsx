'use client';

import { useState, useMemo } from 'react';
import { useFredMultiSeries } from '@/hooks/use-fred';
import { parseObservationValue } from '@/lib/fred/types';
import type { DatePreset, ChartSeries, ChartDataPoint } from '@/lib/chart/types';
import { CHART_COLORS } from '@/lib/chart/constants';
import { ChartHeader } from './ChartHeader';
import { DateRangeSelector } from './DateRangeSelector';
import { EconChart } from './EconChart';
import { ChartFooter } from './ChartFooter';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartError } from './ChartError';

interface SeriesConfig {
  id: string;
  label: string;
  type?: 'line' | 'area' | 'bar';
  color?: string;
  yAxisId?: 'left' | 'right';
  units?: string;
}

interface FredMultiChartProps {
  series: SeriesConfig[];
  title: string;
  subtitle?: string;
  defaultPreset?: DatePreset;
  showRecessions?: boolean;
  showAverage?: boolean;
  height?: number;
  className?: string;
}

export function FredMultiChart({
  series: seriesConfigs,
  title,
  subtitle,
  defaultPreset = '5Y',
  showRecessions = true,
  showAverage = false,
  height = 350,
  className,
}: FredMultiChartProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>(defaultPreset);
  const [visibility, setVisibility] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(seriesConfigs.map((s) => [s.id, true]))
  );

  const { data, error, loading, refetch } = useFredMultiSeries({
    seriesIds: seriesConfigs.map((s) => s.id),
  });

  const chartSeries: ChartSeries[] = useMemo(
    () =>
      seriesConfigs.map((s, i) => ({
        id: s.id,
        label: s.label,
        color: s.color ?? CHART_COLORS[i % CHART_COLORS.length],
        type: s.type ?? 'line',
        visible: visibility[s.id] ?? true,
        yAxisId: s.yAxisId,
        units: s.units,
      })),
    [seriesConfigs, visibility]
  );

  // Merge all series data into a single array keyed by date
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data?.results) return [];

    const dateMap = new Map<string, ChartDataPoint>();

    for (const result of data.results) {
      if (result.error) continue;
      for (const obs of result.observations) {
        const val = parseObservationValue(obs.value);
        if (val === null) continue;

        const existing = dateMap.get(obs.date);
        if (existing) {
          existing[result.series_id] = val;
        } else {
          dateMap.set(obs.date, { date: obs.date, [result.series_id]: val });
        }
      }
    }

    return Array.from(dateMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date)
    );
  }, [data]);

  const toggleSeries = (id: string) => {
    setVisibility((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <ChartSkeleton />;
  if (error) return <ChartError message={error} onRetry={refetch} />;
  if (chartData.length === 0) return <ChartError message="No data available." />;

  // Check for per-series errors
  const seriesErrors = data?.results.filter((r) => r.error) ?? [];

  return (
    <div className={`bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-5 ${className ?? ''}`}>
      <ChartHeader title={title} subtitle={subtitle} />

      <DateRangeSelector selected={datePreset} onChange={setDatePreset} />

      {/* Series toggles */}
      <div className="flex flex-wrap gap-2 mb-3">
        {chartSeries.map((s) => (
          <button
            key={s.id}
            onClick={() => toggleSeries(s.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full border transition-all ${
              s.visible
                ? 'border-transparent text-white'
                : 'border-gray-200 dark:border-gray-700 text-gray-400 bg-transparent'
            }`}
            style={s.visible ? { backgroundColor: s.color } : undefined}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: s.visible ? 'white' : s.color }}
            />
            {s.label}
          </button>
        ))}
      </div>

      {seriesErrors.length > 0 && (
        <div className="text-xs text-amber-600 dark:text-amber-400 mb-2">
          {seriesErrors.map((e) => (
            <p key={e.series_id}>Failed to load {e.series_id}: {e.error}</p>
          ))}
        </div>
      )}

      <EconChart
        data={chartData}
        series={chartSeries}
        datePreset={datePreset}
        height={height}
        showRecessions={showRecessions}
        showAverage={showAverage}
      />

      <ChartFooter source="Federal Reserve Economic Data (FRED)" />
    </div>
  );
}
