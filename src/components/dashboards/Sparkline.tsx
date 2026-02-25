'use client';

import { ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SparklineProps {
  data: { value: number }[];
  color: string;
  height?: number;
}

export function Sparkline({ data, color, height = 40 }: SparklineProps) {
  if (data.length < 2) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
        <defs>
          <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#spark-${color.replace('#', '')})`}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
