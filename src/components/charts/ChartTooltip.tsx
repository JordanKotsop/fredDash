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
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg text-sm ${
      isMobile ? 'p-2 max-w-[200px]' : 'p-3 max-w-[280px]'
    }`}>
      <p className={`font-medium text-gray-900 dark:text-gray-100 mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
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
            <span className={`text-gray-600 dark:text-gray-400 truncate ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {seriesConfig?.label ?? entry.dataKey}:
            </span>
            <span className={`font-medium text-gray-900 dark:text-gray-100 ml-auto ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
              {formatValue(entry.value ?? null, seriesConfig?.units)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
