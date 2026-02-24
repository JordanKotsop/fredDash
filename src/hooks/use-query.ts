'use client';

import { useState, useCallback, useRef } from 'react';
import type { QueryInterpretation, QueryResponse, QueryHistoryItem } from '@/lib/ai/types';

export function useNLQuery() {
  const [interpretation, setInterpretation] = useState<QueryInterpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const submitQuery = useCallback(async (query: string) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      const result = (await response.json()) as QueryResponse;

      if (result.error) {
        setError(result.error);
        setInterpretation(null);
      } else if (result.interpretation) {
        setInterpretation(result.interpretation);
        setError(null);

        // Add to history (max 10)
        setHistory((prev) => {
          const item: QueryHistoryItem = {
            id: crypto.randomUUID(),
            query,
            interpretation: result.interpretation!,
            timestamp: result.timestamp,
          };
          return [item, ...prev].slice(0, 10);
        });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Failed to process query');
      setInterpretation(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setInterpretation(null);
    setError(null);
  }, []);

  const selectFromHistory = useCallback((item: QueryHistoryItem) => {
    setInterpretation(item.interpretation);
    setError(null);
  }, []);

  return {
    interpretation,
    loading,
    error,
    history,
    submitQuery,
    clearResult,
    selectFromHistory,
  };
}
