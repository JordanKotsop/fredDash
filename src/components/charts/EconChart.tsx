'use client';

import { useMemo, useCallback, useState, useEffect, useRef } from 'react';
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
  ReferenceDot,
} from 'recharts';
import { subMonths } from 'date-fns';

import type { ChartSeries, ChartDataPoint, DatePreset, HistoricalEvent } from '@/lib/chart/types';
import { RECESSION_PERIODS, HISTORICAL_EVENTS, DATE_PRESET_MONTHS, formatValue, formatDateShort } from '@/lib/chart/constants';
import { ChartTooltip } from './ChartTooltip';

// Hook to measure container width and derive responsive chart dimensions
function useResponsiveChart(containerRef: React.RefObject<HTMLDivElement | null>) {
  const [width, setWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    setWidth(el.clientWidth);
    return () => observer.disconnect();
  }, [containerRef]);

  // Derive responsive dimensions from container width
  const isMobile = width < 480;
  const isTablet = width >= 480 && width < 768;

  return {
    width,
    // Dynamic chart height based on container width
    chartHeight: isMobile ? 240 : isTablet ? 300 : 350,
    // Y-axis width: narrower on mobile to give more room to data
    yAxisWidth: isMobile ? 45 : 60,
    // Tick font size
    tickFontSize: isMobile ? 9 : 11,
    // Legend font size
    legendFontSize: isMobile ? 10 : 12,
    // Margins: tighter on mobile
    margins: {
      top: 5,
      right: isMobile ? 5 : 20,
      bottom: 5,
      left: isMobile ? 2 : 10,
    },
    isMobile,
  };
}

interface EconChartProps {
  data: ChartDataPoint[];
  series: ChartSeries[];
  datePreset: DatePreset;
  height?: number;
  showRecessions?: boolean;
  showAverage?: boolean;
  showStdDev?: boolean;
  showEvents?: boolean;
  className?: string;
}

// Custom label for event annotation dots
function EventLabel({ viewBox, event, onClick }: {
  viewBox?: { x?: number; y?: number };
  event: HistoricalEvent;
  onClick: (event: HistoricalEvent) => void;
}) {
  if (!viewBox?.x || !viewBox?.y) return null;
  const colors: Record<string, string> = {
    crisis: '#dc2626',
    policy: '#2563eb',
    milestone: '#16a34a',
  };
  const color = colors[event.category] ?? '#6b7280';

  return (
    <g
      onClick={(e) => { e.stopPropagation(); onClick(event); }}
      style={{ cursor: 'pointer' }}
    >
      <circle cx={viewBox.x} cy={viewBox.y} r={5} fill={color} stroke="#fff" strokeWidth={1.5} />
      <text
        x={viewBox.x}
        y={(viewBox.y ?? 0) - 10}
        textAnchor="middle"
        fontSize={8}
        fontWeight={600}
        fill={color}
      >
        {event.label}
      </text>
    </g>
  );
}

export function EconChart({
  data,
  series,
  datePreset,
  height: heightOverride,
  showRecessions = true,
  showAverage = false,
  showStdDev = false,
  showEvents = false,
  className,
}: EconChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const responsive = useResponsiveChart(containerRef);
  const height = heightOverride ?? responsive.chartHeight;
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
    if (!showAverage && !showStdDev) return {};
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
  }, [filteredData, series, showAverage, showStdDev]);

  // Calculate standard deviations
  const stdDevs = useMemo(() => {
    if (!showStdDev) return {};
    const sds: Record<string, { upper: number; lower: number }> = {};
    for (const s of series) {
      if (!s.visible) continue;
      const avg = averages[s.id];
      if (avg === undefined) continue;
      const values = filteredData
        .map((d) => d[s.id])
        .filter((v): v is number => typeof v === 'number' && v !== null);
      if (values.length < 2) continue;
      const variance = values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
      const sd = Math.sqrt(variance);
      sds[s.id] = { upper: avg + sd, lower: avg - sd };
    }
    return sds;
  }, [filteredData, series, averages, showStdDev]);

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

  // Filter events to visible range
  const visibleEvents = useMemo(() => {
    if (!showEvents || filteredData.length === 0) return [];
    const firstDate = filteredData[0].date;
    const lastDate = filteredData[filteredData.length - 1].date;
    return HISTORICAL_EVENTS.filter(
      (e) => e.date >= firstDate && e.date <= lastDate
    );
  }, [filteredData, showEvents]);

  // Find the closest data value for an event date (for positioning the dot)
  const eventDotValues = useMemo(() => {
    if (visibleEvents.length === 0 || series.length === 0) return [];
    const primarySeries = series.find((s) => s.visible) ?? series[0];
    return visibleEvents.map((event) => {
      // Find closest data point to event date
      let closest = filteredData[0];
      let minDist = Infinity;
      for (const d of filteredData) {
        const dist = Math.abs(new Date(d.date).getTime() - new Date(event.date).getTime());
        if (dist < minDist) {
          minDist = dist;
          closest = d;
        }
      }
      const value = closest?.[primarySeries.id];
      return {
        event,
        date: closest?.date ?? event.date,
        value: typeof value === 'number' ? value : null,
        yAxisId: primarySeries.yAxisId ?? 'left',
      };
    }).filter((e) => e.value !== null);
  }, [visibleEvents, filteredData, series]);

  // Determine if we need dual Y-axes
  const hasRightAxis = series.some((s) => s.yAxisId === 'right' && s.visible);

  // X-axis tick formatter
  const tickFormatter = useCallback((value: string) => formatDateShort(value), []);

  // Compute tick count based on data size AND container width
  const xTickCount = useMemo(() => {
    const len = filteredData.length;
    // Fewer ticks on narrow screens
    const maxTicks = responsive.isMobile ? 5 : responsive.width < 768 ? 6 : 10;
    if (len <= 12) return Math.min(len, maxTicks);
    if (len <= 60) return Math.min(6, maxTicks);
    if (len <= 120) return Math.min(8, maxTicks);
    return maxTicks;
  }, [filteredData.length, responsive.isMobile, responsive.width]);

  const visibleSeries = series.filter((s) => s.visible);

  // Event click handler — dispatches custom event for parent to handle
  const handleEventClick = useCallback((event: HistoricalEvent) => {
    window.dispatchEvent(new CustomEvent('chart-event-click', { detail: event }));
  }, []);

  return (
    <div ref={containerRef} className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart data={filteredData} margin={{
          ...responsive.margins,
          right: hasRightAxis ? (responsive.isMobile ? 5 : 10) : responsive.margins.right,
        }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid, #e5e7eb)" opacity={0.5} />

          <XAxis
            dataKey="date"
            tickFormatter={tickFormatter}
            tick={{ fontSize: responsive.tickFontSize, fill: 'var(--chart-text, #6b7280)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid, #e5e7eb)' }}
            interval={Math.max(0, Math.floor(filteredData.length / xTickCount) - 1)}
          />

          <YAxis
            yAxisId="left"
            tick={{ fontSize: responsive.tickFontSize, fill: 'var(--chart-text, #6b7280)' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              formatValue(v, visibleSeries.find((s) => s.yAxisId !== 'right')?.units)
            }
            width={responsive.yAxisWidth}
          />

          {hasRightAxis && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: responsive.tickFontSize, fill: 'var(--chart-text, #6b7280)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                formatValue(v, visibleSeries.find((s) => s.yAxisId === 'right')?.units)
              }
              width={responsive.yAxisWidth}
            />
          )}

          <Tooltip
            content={<ChartTooltip series={series} isMobile={responsive.isMobile} />}
            cursor={{ stroke: 'var(--chart-cursor, #9ca3af)', strokeDasharray: '4 4' }}
          />

          {visibleSeries.length > 1 && (
            <Legend
              iconType="circle"
              iconSize={responsive.isMobile ? 6 : 8}
              wrapperStyle={{ fontSize: responsive.legendFontSize, paddingTop: 6 }}
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

          {/* Standard deviation bands (+/- 1 SD from mean) */}
          {showStdDev &&
            Object.entries(stdDevs).map(([seriesId, sd]) => {
              const s = series.find((s) => s.id === seriesId);
              if (!s) return null;
              return (
                <ReferenceArea
                  key={`sd-${seriesId}`}
                  yAxisId={s.yAxisId ?? 'left'}
                  y1={sd.lower}
                  y2={sd.upper}
                  fill={s.color}
                  fillOpacity={0.06}
                  stroke={s.color}
                  strokeOpacity={0.15}
                  strokeDasharray="4 4"
                  label={{
                    value: '±1 SD',
                    position: 'insideTopRight',
                    fontSize: 9,
                    fill: s.color,
                    opacity: 0.6,
                  }}
                />
              );
            })}

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

          {/* Historical event annotations */}
          {eventDotValues.map(({ event, date, value, yAxisId }) => (
            <ReferenceDot
              key={`event-${event.date}`}
              x={date}
              y={value as number}
              yAxisId={yAxisId}
              r={0}
              label={<EventLabel event={event} onClick={handleEventClick} />}
            />
          ))}

          {/* Data series */}
          {visibleSeries.map((s) => {
            const commonProps = {
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
                  key={s.id}
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
                  key={s.id}
                  {...commonProps}
                  fill={s.color}
                  fillOpacity={0.7}
                  barSize={filteredData.length > 100 ? 2 : undefined}
                />
              );
            }
            return (
              <Line
                key={s.id}
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
