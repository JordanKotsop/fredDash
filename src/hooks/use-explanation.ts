'use client';

import { useState, useCallback } from 'react';
import type { ExplanationResult, ExplanationDepth } from '@/lib/ai/explain-client';

interface ExplainResponse {
  explanation: ExplanationResult | null;
  error: string | null;
  timestamp: string;
}

export function useExplanation() {
  const [explanation, setExplanation] = useState<ExplanationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depth, setDepth] = useState<ExplanationDepth>('normal');

  const fetchExplanation = useCallback(
    async (seriesName: string, seriesId: string, dateRange: string, newDepth?: ExplanationDepth) => {
      const targetDepth = newDepth ?? depth;
      setLoading(true);
      setError(null);
      if (newDepth) setDepth(newDepth);

      try {
        const response = await fetch('/api/explain', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seriesName, seriesId, dateRange, depth: targetDepth }),
        });

        const result = (await response.json()) as ExplainResponse;
        if (result.error) {
          setError(result.error);
        } else {
          setExplanation(result.explanation);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load explanation');
      } finally {
        setLoading(false);
      }
    },
    [depth]
  );

  return { explanation, loading, error, depth, fetchExplanation };
}
