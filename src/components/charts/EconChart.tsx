'use client';

import { useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  ReferenceLine,
  Legend,
} from 'recharts';
import { subMonths } from 'date-fns';

import type { ChartSeries, ChartDataPoint, DatePreset } from '@/lib/chart/types';
import { RECESSION_PERIODS, DATE_PRESET_MONTHS, formatValue, formatDateShort } from '@/lib/chart/constants';
import { ChartTooltip } from './ChartTooltip';

interface EconChartProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  datePreset: DatePreset;
  height?: number;
  showRecessions?: boolean;
  showAverage?: boolean;
  className?: string;
}

export function EconChart({
  data,
  series,
  datePreset,
  height = 350,
  showRecessions = true,
  showAverage = false,
  className,
}: EconChartProps) {
  // Filter data by date preset
  const filteredData = useMemo(() => {
    const months = DATE_PRESET_MONTHS[datePreset];
    if (!months || data.length === 0) return data;

    const cutoff = subMonths(new Date(), months);
    const cutoffStr = cutoff.toISOString().split('T')[0];
    return data.filter((d) => d.date >= cutoffStr);
  }, [data, datePreset]);

  // Calculate averages for reference lines
  const averages = useMemo(() => {
    if (!showAverage) return {};
    const avgs: Record<string, number> = {};
    for (const s of series) {
      if (!s.visible) continue;
      const values = filteredData
        .map((d) => d[s.id])
        .filter((v): v is number => typeof v === 'number' && v !== null);
      if (values.length > 0) {
        avgs[s.id] = values.reduce((a, b) => a + b, 0) / values.length;
      }
    }
    return avgs;
  }, [filteredData, series, showAverage]);

  // Filter recessions to visible range
  const visibleRecessions = useMemo(() => {
    if (!showRecessions || filteredData.length === 0) return [];
    const firstDate = filteredData[0].date;
    const lastDate = filteredData[filteredData.length - 1].date;
    return RECESSION_PERIODS.filter(
      (r) => r.end >= firstDate && r.start <= lastDate
    ).map((r) => ({
      ...r,
      start: r.start < firstDate ? firstDate : r.start,
      end: r.end > lastDate ? lastDate : r.end,
    }));
  }, [filteredData, showRecessions]);

  // Determine if we need dual Y-axes
  const hasRightAxis = series.some((s) => s.yAxisId === 'right' && s.visible);

  // X-axis tick formatter
  const tickFormatter = useCallback((value: string) => formatDateShort(value), []);

  // Compute tick count based on data size
  const xTickCount = useMemo(() => {
    const len = filteredData.length;
    if (len <= 12) return len;
    if (len <= 60) return 6;
    if (len <= 120) return 8;
    return 10;
  }, [filteredData.length]);

  const visibleSeries = series.filter((s) => s.visible);

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={filteredData} margin={{ top: 5, right: hasRightAxis ? 10 : 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" opacity={0.5} />

          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 11, fill: 'var(--chart-text, #6b7280)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid, #e5e7eb)' }}
            interval={Math.max(0, Math.floor(filteredData.length / xTickCount) - 1)}
          />

          <YAxis
            yAxisId="left"
            tick={{ fontSize: 11, fill: 'var(--chart-text, #6b7280)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              formatValue(v, visibleSeries.find((s) => s.yAxisId !== 'right')?.units)
            }
            width={60}
          />

          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 11, fill: 'var(--chart-text, #6b7280)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                formatValue(v, visibleSeries.find((s) => s.yAxisId === 'right')?.units)
              }
              width={60}
            />
          )}

          <Tooltip
            content={<ChartTooltip series={series} />}
            cursor={{ stroke: 'var(--chart-cursor, #9ca3af)', strokeDasharray: '4 4' }}
          />

          {visibleSeries.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
            />
          )}

          {/* Recession shading */}
          {visibleRecessions.map((r, i) => (
            <ReferenceArea
              key={`recession-${i}`}
              yAxisId="left"
              x1={r.start}
              x2={r.end}
              fill="var(--chart-recession, #fee2e2)"
              fillOpacity={0.4}
              strokeOpacity={0}
              label={
                r.label
                  ? { value: r.label, position: 'insideTop', fontSize: 9, fill: '#dc2626', opacity: 0.7 }
                  : undefined
              }
            />
          ))}

          {/* Average reference lines */}
          {showAverage &&
            Object.entries(averages).map(([seriesId, avg]) => {
              const s = series.find((s) => s.id === seriesId);
              if (!s) return null;
              return (
                <ReferenceLine
                  key={`avg-${seriesId}`}
                  yAxisId={s.yAxisId ?? 'left'}
                  y={avg}
                  stroke={s.color}
                  strokeDasharray="6 4"
                  strokeOpacity={0.5}
                  label={{
                    value: `Avg: ${formatValue(avg, s.units)}`,
                    position: 'right',
                    fontSize: 10,
                    fill: s.color,
                  }}
                />
              );
            })}

          {/* Data series */}
          {visibleSeries.map((s) => {
            const commonProps = {
              key: s.id,
              dataKey: s.id,
              name: s.label,
              yAxisId: s.yAxisId ?? 'left',
              stroke: s.color,
              dot: false,
              animationDuration: 500,
              connectNulls: true,
            };

            if (s.type === 'area') {
              return (
                <Area
                  {...commonProps}
                  fill={s.color}
                  fillOpacity={0.15}
                  strokeWidth={2}
                  type="monotone"
                />
              );
            }
            if (s.type === 'bar') {
              return (
                <Bar
                  {...commonProps}
                  fill={s.color}
                  fillOpacity={0.7}
                  barSize={filteredData.length > 100 ? 2 : undefined}
                />
              );
            }
            return (
              <Line
                {...commonProps}
                strokeWidth={2}
                type="monotone"
              />
            );
          })}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
