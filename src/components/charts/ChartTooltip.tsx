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
}

export function ChartTooltip({ active, payload, label, series }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-medium text-gray-900 dark:text-gray-100 mb-1.5">
        {formatDate(String(label))}
      </p>
      {payload.map((entry) => {
        const seriesConfig = series.find((s) => s.id === String(entry.dataKey));
        return (
          <div key={String(entry.dataKey)} className="flex items-center gap-2 py-0.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 dark:text-gray-400 truncate">
              {seriesConfig?.label ?? entry.dataKey}:
            </span>
            <span className="font-medium text-gray-900 dark:text-gray-100 ml-auto">
              {formatValue(entry.value ?? null, seriesConfig?.units)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
