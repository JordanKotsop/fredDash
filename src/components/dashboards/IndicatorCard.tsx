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
      <span className="inline-flex items-center gap-0.5 text-xs" style={{ color: 'var(--text-tertiary)' }}>
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
      className="inline-flex items-center gap-0.5 text-xs font-medium"
      style={{ color: isUp ? 'var(--success)' : 'var(--error)' }}
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
      <div className="animate-pulse rounded-xl p-3 sm:p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="h-4 w-32 rounded mb-2" style={{ background: 'var(--surface-secondary)' }} />
        <div className="h-3 w-48 rounded mb-3" style={{ background: 'var(--surface-hover)' }} />
        <div className="h-[40px] rounded mb-3" style={{ background: 'var(--surface-hover)' }} />
        <div className="h-6 w-20 rounded" style={{ background: 'var(--surface-secondary)' }} />
      </div>
    );
  }

  if (error) {
    return (
      <button
        onClick={onClick}
        className="text-left w-full rounded-xl p-4 opacity-60"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{indicator.displayName}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--error)' }}>Data unavailable</p>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="text-left w-full rounded-xl p-3 sm:p-4 hover:shadow-sm transition-all group"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="flex items-start justify-between mb-1">
        <p className="text-sm font-medium transition-colors" style={{ color: 'var(--text-primary)' }}>
          {indicator.displayName}
        </p>
        <svg className="w-4 h-4 transition-colors shrink-0 mt-0.5" style={{ color: 'var(--border)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </div>

      <p className="text-xs mb-3 italic" style={{ color: 'var(--text-tertiary)' }}>
        {indicator.userQuestion}
      </p>

      <Sparkline data={parsed.sparkData} color={color} />

      <div className="mt-3 flex items-end justify-between">
        <div>
          <p className="text-base sm:text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {parsed.currentValue !== null ? formatByType(parsed.currentValue, indicator.format) : '—'}
          </p>
          {parsed.currentValue !== null && parsed.prevValue !== null && (
            <TrendArrow current={parsed.currentValue} previous={parsed.prevValue} />
          )}
        </div>
        {lastUpdated && (
          <p className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
            {lastUpdated}
          </p>
        )}
      </div>
    </button>
  );
}
