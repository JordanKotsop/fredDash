'use client';

import { useState, useEffect } from 'react';
import { useExplanation } from '@/hooks/use-explanation';
import type { ExplanationDepth } from '@/lib/ai/explain-client';

interface ExplanationPanelProps {
  seriesName: string;
  seriesId: string;
  dateRange: string;
  autoLoad?: boolean;
}

export function ExplanationPanel({
  seriesName,
  seriesId,
  dateRange,
  autoLoad = false,
}: ExplanationPanelProps) {
  const { explanation, loading, error, depth, fetchExplanation } = useExplanation();
  const [collapsed, setCollapsed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (autoLoad && !loaded) {
      fetchExplanation(seriesName, seriesId, dateRange);
      setLoaded(true);
    }
  }, [autoLoad, loaded, seriesName, seriesId, dateRange, fetchExplanation]);

  const handleDepthChange = (newDepth: ExplanationDepth) => {
    fetchExplanation(seriesName, seriesId, dateRange, newDepth);
  };

  // Not yet loaded — show trigger button
  if (!loaded && !autoLoad) {
    return (
      <button
        onClick={() => {
          fetchExplanation(seriesName, seriesId, dateRange);
          setLoaded(true);
        }}
        className="w-full mt-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors flex items-center justify-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
        </svg>
        Explain this chart
      </button>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4 animate-pulse">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full" />
          <div className="h-4 w-32 bg-blue-200 dark:bg-blue-800 rounded" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full bg-blue-100 dark:bg-blue-900 rounded" />
          <div className="h-3 w-5/6 bg-blue-100 dark:bg-blue-900 rounded" />
          <div className="h-3 w-4/6 bg-blue-100 dark:bg-blue-900 rounded" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 rounded-xl p-4">
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => fetchExplanation(seriesName, seriesId, dateRange)}
          className="mt-2 text-xs text-red-600 dark:text-red-400 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl overflow-hidden">
      {/* Header with collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
            What this means
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-blue-400 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Summary */}
          <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
            {explanation.summary}
          </p>

          {/* Trend context */}
          <div className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
            <span className="font-medium">Current context: </span>
            {explanation.trend_context}
          </div>

          {/* What it means */}
          <div className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
            <span className="font-medium">In plain English: </span>
            {explanation.what_it_means}
          </div>

          {/* Retirement impact */}
          <div className="bg-blue-100 dark:bg-blue-900/40 rounded-lg p-3">
            <p className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wide mb-1">
              For your retirement
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              {explanation.retirement_impact}
            </p>
          </div>

          {/* Follow up */}
          <p className="text-xs text-blue-500 dark:text-blue-500 italic">
            {explanation.follow_up}
          </p>

          {/* Depth controls + disclaimer */}
          <div className="flex items-center justify-between pt-2 border-t border-blue-100 dark:border-blue-800">
            <div className="flex gap-1.5">
              <button
                onClick={() => handleDepthChange('simple')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  depth === 'simple'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800'
                }`}
              >
                Simplify
              </button>
              <button
                onClick={() => handleDepthChange('normal')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  depth === 'normal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800'
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => handleDepthChange('detailed')}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                  depth === 'detailed'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800'
                }`}
              >
                Explain more
              </button>
            </div>
            <p className="text-[10px] text-blue-400 dark:text-blue-600">
              AI-generated. Not financial advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
