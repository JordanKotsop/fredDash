'use client';

import { useMemo } from 'react';
import { useFredObservations, useFredSeries } from '@/hooks/use-fred';
import { parseObservationValue } from '@/lib/fred/types';
import { formatValue as formatChartValue } from '@/lib/chart/constants';
import type { DashboardIndicator } from '@/lib/dashboards/config';
import { Sparkline } from './Sparkline';

interface IndicatorCardProps {
  indicator: DashboardIndicator;
  color: string;
  onClick: () => void;
}

function formatByType(value: number, format: DashboardIndicator['format']): string {
  switch (format) {
    case 'percent':
    case 'rate':
      return `${value.toFixed(2)}%`;
    case 'dollars':
      if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}T`;
      if (Math.abs(value) >= 1_000) return `$${(value / 1_000).toFixed(1)}B`;
      if (Math.abs(value) >= 1) return `$${value.toFixed(2)}`;
      return `$${value.toFixed(2)}`;
    case 'thousands':
      if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}M`;
      return `${value.toFixed(0)}K`;
    case 'index':
      return formatChartValue(value);
    case 'number':
    default:
      return formatChartValue(value);
  }
}

function TrendArrow({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  const pctChange = previous !== 0 ? (diff / Math.abs(previous)) * 100 : 0;

  if (Math.abs(pctChange) < 0.01) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-gray-500 dark:text-gray-400">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
        {pctChange.toFixed(1)}%
      </span>
    );
  }

  const isUp = diff > 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${
        isUp
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-red-600 dark:text-red-400'
      }`}
    >
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        {isUp ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
        )}
      </svg>
      {isUp ? '+' : ''}{pctChange.toFixed(1)}%
    </span>
  );
}

export function IndicatorCard({ indicator, color, onClick }: IndicatorCardProps) {
  const { data: obsData, loading, error } = useFredObservations({ seriesId: indicator.seriesId });
  const { data: seriesData } = useFredSeries(indicator.seriesId);
  const seriesInfo = seriesData?.seriess?.[0];

  const parsed = useMemo(() => {
    if (!obsData?.observations) return { sparkData: [], currentValue: null, prevValue: null };

    const values = obsData.observations
      .map((o) => ({ date: o.date, value: parseObservationValue(o.value) }))
      .filter((d): d is { date: string; value: number } => d.value !== null);

    // Last 60 data points for sparkline
    const recent = values.slice(-60);
    const currentValue = values.length > 0 ? values[values.length - 1].value : null;
    const prevValue = values.length > 1 ? values[values.length - 2].value : null;

    return {
      sparkData: recent.map((d) => ({ value: d.value })),
      currentValue,
      prevValue,
    };
  }, [obsData]);

  const lastUpdated = seriesInfo?.last_updated
    ? new Date(seriesInfo.last_updated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded mb-3" />
        <div className="h-[40px] bg-gray-100 dark:bg-gray-800 rounded mb-3" />
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={onClick}
        className="text-left w-full bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4 opacity-60"
      >
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{indicator.displayName}</p>
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">Data unavailable</p>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="text-left w-full bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {indicator.displayName}
        </p>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 italic">
        {indicator.userQuestion}
      </p>

      <Sparkline data={parsed.sparkData} color={color} />

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {parsed.currentValue !== null ? formatByType(parsed.currentValue, indicator.format) : '—'}
          </p>
          {parsed.currentValue !== null && parsed.prevValue !== null && (
            <TrendArrow current={parsed.currentValue} previous={parsed.prevValue} />
          )}
        </div>
        {lastUpdated && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500">
            {lastUpdated}
          </p>
        )}
      </div>
    </button>
  );
}
