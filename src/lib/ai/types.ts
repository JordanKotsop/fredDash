import type { DatePreset } from '@/lib/chart/types';

export interface QueryInterpretation {
  series: {
    id: string;
    label: string;
    type: 'line' | 'area' | 'bar';
    yAxisId?: 'left' | 'right';
    units?: string;
  }[];
  chart_type: 'line' | 'area' | 'bar' | 'composed';
  date_range: DatePreset;
  title: string;
  subtitle: string;
  explanation: string;
  follow_up_queries: string[];
}

export interface QueryRequest {
  query: string;
}

export interface QueryResponse {
  interpretation: QueryInterpretation | null;
  error: string | null;
  timestamp: string;
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  interpretation: QueryInterpretation;
  timestamp: string;
}
