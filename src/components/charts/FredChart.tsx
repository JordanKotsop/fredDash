'use client';

import { useState, useMemo, useRef } from 'react';
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
import { ChartAnnotationBar } from './ChartAnnotationBar';
import { ExplanationPanel } from '@/components/explanations';
import { ExportPDFButton } from '@/components/pdf';

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
  height,
  color,
  className,
}: FredChartProps) {
  const [datePreset, setDatePreset] = useState<DatePreset>(defaultPreset);
  const [showRec, setShowRec] = useState(showRecessions);
  const [showAvg, setShowAvg] = useState(showAverage);
  const [showStdDev, setShowStdDev] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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
    <div ref={chartContainerRef} className={`rounded-xl p-3 sm:p-5 ${className ?? ''}`} style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex items-start justify-between">
        <ChartHeader
          title={displayTitle}
          subtitle={displaySubtitle}
          lastUpdated={seriesInfo?.last_updated}
        />
        <ExportPDFButton
          chartRef={chartContainerRef}
          compact
          options={{
            title: displayTitle,
            subtitle: displaySubtitle,
            seriesLabels: [seriesInfo?.title ?? seriesId],
            dateRange: datePreset,
          }}
        />
      </div>
      <DateRangeSelector selected={datePreset} onChange={setDatePreset} />
      <EconChart
        data={chartData}
        series={chartSeries}
        datePreset={datePreset}
        height={height}
        showRecessions={showRec}
        showAverage={showAvg}
        showStdDev={showStdDev}
        showEvents={showEvents}
      />
      <div className="mt-3">
        <ChartAnnotationBar
          showRecessions={showRec}
          showAverage={showAvg}
          showStdDev={showStdDev}
          showEvents={showEvents}
          onToggleRecessions={() => setShowRec((v) => !v)}
          onToggleAverage={() => setShowAvg((v) => !v)}
          onToggleStdDev={() => setShowStdDev((v) => !v)}
          onToggleEvents={() => setShowEvents((v) => !v)}
        />
      </div>
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
