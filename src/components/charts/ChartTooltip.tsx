'use client';

import { formatDate, formatValue } from '@/lib/chart/constants';
import type { ChartSeries } from '@/lib/chart/types';

interface TooltipPayloadEntry {
  dataKey?: string | number;
  value?: number;
  color?: string;
  name?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string | number;
  series: ChartSeries[];
  isMobile?: boolean;
}

export function ChartTooltip({ active, payload, label, series, isMobile }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      className={`rounded-lg shadow-lg ${isMobile ? 'p-2 max-w-[200px]' : 'p-3 max-w-[280px]'}`}
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <p
        className={`font-medium mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}
        style={{ color: 'var(--text-primary)' }}
      >
        {formatDate(String(label))}
      </p>
      {payload.map((entry) => {
        const seriesConfig = series.find((s) => s.id === String(entry.dataKey));
        return (
          <div key={String(entry.dataKey)} className="flex items-center gap-1.5 py-0.5">
            <span
              className={`rounded-full shrink-0 ${isMobile ? 'w-2 h-2' : 'w-2.5 h-2.5'}`}
              style={{ backgroundColor: entry.color }}
            />
            <span className={`truncate ${isMobile ? 'text-[10px]' : 'text-xs'}`} style={{ color: 'var(--text-tertiary)' }}>
              {seriesConfig?.label ?? entry.dataKey}:
            </span>
            <span className={`font-medium ml-auto ${isMobile ? 'text-[10px]' : 'text-xs'}`} style={{ color: 'var(--text-primary)' }}>
              {formatValue(entry.value ?? null, seriesConfig?.units)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
