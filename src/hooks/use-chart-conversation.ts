'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  ChartState,
  ChartSeriesState,
  ConversationMessage,
  ConversationResponse,
  ChartModification,
} from '@/lib/ai/conversation-types';
import type { QueryInterpretation } from '@/lib/ai/types';
import type { DatePreset } from '@/lib/chart/types';

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function interpretationToChartState(interp: QueryInterpretation): ChartState {
  return {
    series: interp.series.map((s) => ({
      id: s.id,
      label: s.label,
      type: s.type,
      yAxisId: s.yAxisId,
      units: s.units,
    })),
    dateRange: interp.date_range,
    chartType: interp.chart_type,
    units: 'lin',
    title: interp.title,
    subtitle: interp.subtitle,
  };
}

function applyModification(state: ChartState, mod: ChartModification): ChartState {
  const next = { ...state, series: [...state.series] };

  if (mod.remove_series?.length) {
    next.series = next.series.filter((s) => !mod.remove_series!.includes(s.id));
  }

  if (mod.add_series?.length) {
    for (const add of mod.add_series) {
      if (!next.series.some((s) => s.id === add.id)) {
        next.series.push({
          id: add.id,
          label: add.label,
          type: add.type ?? 'line',
          yAxisId: add.yAxisId,
          units: add.units,
        });
      }
    }
  }

  if (mod.date_range) next.dateRange = mod.date_range as DatePreset;
  if (mod.chart_type) next.chartType = mod.chart_type;
  if (mod.units) next.units = mod.units;
  if (mod.title) next.title = mod.title;
  if (mod.subtitle) next.subtitle = mod.subtitle;

  return next;
}

export function useChartConversation(initialInterpretation: QueryInterpretation) {
  const initialState = interpretationToChartState(initialInterpretation);
  const [chartState, setChartState] = useState<ChartState>(initialState);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Undo/redo stacks
  const undoStack = useRef<ChartState[]>([]);
  const redoStack = useRef<ChartState[]>([]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    setLoading(true);
    setError(null);

    const userMsg: ConversationMessage = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const currentState = chartState;
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chart-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          chartState: currentState,
          history,
        }),
      });

      const data = (await res.json()) as ConversationResponse;

      if (data.error) {
        setError(data.error);
        return;
      }

      if (!data.turn) {
        setError('No response from AI');
        return;
      }

      const { turn } = data;
      let newState = currentState;

      if (turn.modification) {
        undoStack.current.push(currentState);
        redoStack.current = [];
        newState = applyModification(currentState, turn.modification);
        setChartState(newState);
      }

      const assistantMsg: ConversationMessage = {
        id: generateId(),
        role: 'assistant',
        content: turn.message,
        chartStateBefore: turn.modification ? currentState : undefined,
        chartStateAfter: turn.modification ? newState : undefined,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }, [chartState, messages, loading]);

  const undo = useCallback(() => {
    const prev = undoStack.current.pop();
    if (!prev) return;
    redoStack.current.push(chartState);
    setChartState(prev);
  }, [chartState]);

  const redo = useCallback(() => {
    const next = redoStack.current.pop();
    if (!next) return;
    undoStack.current.push(chartState);
    setChartState(next);
  }, [chartState]);

  const reset = useCallback(() => {
    undoStack.current.push(chartState);
    redoStack.current = [];
    setChartState(initialState);
  }, [chartState, initialState]);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  // Convert ChartState to series configs that FredMultiChart expects
  const seriesConfigs = chartState.series.map((s: ChartSeriesState) => ({
    id: s.id,
    label: s.label,
    type: s.type,
    yAxisId: s.yAxisId,
    units: s.units,
  }));

  return {
    chartState,
    seriesConfigs,
    messages,
    loading,
    error,
    sendMessage,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  };
}
