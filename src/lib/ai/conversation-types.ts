import type { DatePreset } from '@/lib/chart/types';

export interface ChartSeriesState {
  id: string;
  label: string;
  type: 'line' | 'area' | 'bar';
  yAxisId?: 'left' | 'right';
  units?: string;
}

export interface ChartState {
  series: ChartSeriesState[];
  dateRange: DatePreset;
  chartType: 'line' | 'area' | 'bar' | 'composed';
  units: 'lin' | 'chg' | 'ch1' | 'pch' | 'pc1' | 'pca' | 'cch' | 'log';
  title: string;
  subtitle: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  chartStateBefore?: ChartState;
  chartStateAfter?: ChartState;
  timestamp: string;
}

export interface ChartModification {
  add_series?: { id: string; label: string; type?: 'line' | 'area' | 'bar'; yAxisId?: 'left' | 'right'; units?: string }[];
  remove_series?: string[];
  date_range?: DatePreset;
  chart_type?: 'line' | 'area' | 'bar' | 'composed';
  units?: 'lin' | 'chg' | 'ch1' | 'pch' | 'pc1' | 'pca' | 'cch' | 'log';
  title?: string;
  subtitle?: string;
}

export interface ChartExplanation {
  explanation: string;
  highlight_date?: string;
}

export interface ConversationTurn {
  modification?: ChartModification;
  explanation?: ChartExplanation;
  message: string;
  follow_up_suggestions?: string[];
}

export interface ConversationRequest {
  message: string;
  chartState: ChartState;
  history: { role: 'user' | 'assistant'; content: string }[];
}

export interface ConversationResponse {
  turn: ConversationTurn | null;
  error: string | null;
  timestamp: string;
}
