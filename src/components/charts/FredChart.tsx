'use client';

import { useState, useMemo } from 'react';
import { useFredObservations, useFredSeries } from '@/hooks/use-fred';
import { parseObservationValue } from '@/lib/fred/types';
import type { DatePreset, ChartSeries, ChartDataPoint } from '@/lib/chart/types';
import { CHART_COLORS } from '@/lib/chart/constants';
import { ChartHeader } from './ChartHeader';
import { DateRangeSelector } from './DateRangeSelector';
import { EconChart } from './EconChart';
import { ChartFooter } from './ChartFooter';
import { ChartSkeleton } from './ChartSkeleton';
import { ChartError } from './ChartError';
import { ExplanationPanel } from '@/components/explanations';

interface FredChartProps {
  seriesId: string;
  type?: 'line' | 'area' | 'bar';
  title?: string;
  subtitle?: string;
  defaultPreset?: DatePreset;
  showRecessions?: boolean;
  showAverage?: boolean;
  showExplanation?: boolean;
  height?: number;
  color?: string;
  className?: string;
}

export function FredChart({
  seriesId,
  type = 'line',
  title,
  subtitle,
  defaultPreset = '5Y',
  showRecessions = true,
  showAverage = false,
  showExplanation = true,
  height = 350,
  color,
  className,
}: FredChartProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>(defaultPreset);

  const { data: obsData, error: obsError, loading: obsLoading, cached } = useFredObservations({
    seriesId,
  });

  const { data: seriesData } = useFredSeries(seriesId);

  const seriesInfo = seriesData?.seriess?.[0];
  const displayTitle = title ?? seriesInfo?.title ?? seriesId;
  const displaySubtitle = subtitle ?? (seriesInfo ? `${seriesInfo.frequency} | ${seriesInfo.units} | ${seriesInfo.seasonal_adjustment}` : undefined);

  const chartSeries: ChartSeries[] = useMemo(
    () => [
      {
        id: seriesId,
        label: seriesInfo?.title ?? seriesId,
        color: color ?? CHART_COLORS[0],
        type,
        visible: true,
        units: seriesInfo?.units,
      },
    ],
    [seriesId, seriesInfo, color, type]
  );

  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!obsData?.observations) return [];
    return obsData.observations
      .map((obs) => ({
        date: obs.date,
        [seriesId]: parseObservationValue(obs.value),
      }))
      .filter((d) => d[seriesId] !== null);
  }, [obsData, seriesId]);

  if (obsLoading) return <ChartSkeleton />;
  if (obsError) return <ChartError message={obsError} />;
  if (chartData.length === 0) return <ChartError message="No data available for this series." />;

  return (
    <div className={`bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-5 ${className ?? ''}`}>
      <ChartHeader
        title={displayTitle}
        subtitle={displaySubtitle}
        lastUpdated={seriesInfo?.last_updated}
      />
      <DateRangeSelector selected={datePreset} onChange={setDatePreset} />
      <EconChart
        data={chartData}
        series={chartSeries}
        datePreset={datePreset}
        height={height}
        showRecessions={showRecessions}
        showAverage={showAverage}
      />
      <ChartFooter source="Federal Reserve Economic Data (FRED)" cached={cached} />
      {showExplanation && (
        <ExplanationPanel
          seriesName={displayTitle}
          seriesId={seriesId}
          dateRange={datePreset}
        />
      )}
    </div>
  );
}
