'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { DashboardConfig } from '@/lib/dashboards/config';
import { DashboardIcon } from './DashboardIcon';
import { IndicatorCard } from './IndicatorCard';
import { FredChart } from '@/components/charts';

interface DashboardDetailProps {
  dashboard: DashboardConfig;
}

export function DashboardDetail({ dashboard }: DashboardDetailProps) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
        <Link
          href="/"
          className="p-1.5 transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </Link>
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${dashboard.color}15` }}
        >
          <span style={{ color: dashboard.color }}>
            <DashboardIcon icon={dashboard.icon} />
          </span>
        </div>
        <div>
          <h1 className="text-lg sm:text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
            {dashboard.title}
          </h1>
          <p className="text-xs sm:text-sm" style={{ color: 'var(--text-tertiary)' }}>
            {dashboard.description}
          </p>
        </div>
      </div>

      {/* Expanded chart */}
      {expandedSeries && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              {dashboard.indicators.find((i) => i.seriesId === expandedSeries)?.displayName}
            </p>
            <button
              onClick={() => setExpandedSeries(null)}
              className="text-xs transition-colors flex items-center gap-1"
              style={{ color: 'var(--text-tertiary)' }}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
              Close chart
            </button>
          </div>
          <FredChart
            seriesId={expandedSeries}
            defaultPreset="5Y"
            showRecessions
            showAverage
            showExplanation
            color={dashboard.color}
          />
        </div>
      )}

      {/* Indicator grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {dashboard.indicators.map((indicator) => (
          <IndicatorCard
            key={indicator.seriesId}
            indicator={indicator}
            color={dashboard.color}
            onClick={() =>
              setExpandedSeries(
                expandedSeries === indicator.seriesId ? null : indicator.seriesId
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
