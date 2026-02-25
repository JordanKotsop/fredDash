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
        className="w-full mt-3 py-2.5 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
        style={{ color: 'var(--primary)', background: 'var(--primary-muted)', border: '1px solid var(--border)' }}
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
      <div className="mt-3 rounded-xl p-4 animate-pulse" style={{ background: 'var(--primary-muted)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full" style={{ background: 'var(--surface-secondary)' }} />
          <div className="h-4 w-32 rounded" style={{ background: 'var(--surface-secondary)' }} />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full rounded" style={{ background: 'var(--surface-secondary)' }} />
          <div className="h-3 w-5/6 rounded" style={{ background: 'var(--surface-secondary)' }} />
          <div className="h-3 w-4/6 rounded" style={{ background: 'var(--surface-secondary)' }} />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mt-3 rounded-xl p-4" style={{ background: 'var(--error-muted)', border: '1px solid var(--border)' }}>
        <p className="text-sm" style={{ color: 'var(--error)' }}>{error}</p>
        <button
          onClick={() => fetchExplanation(seriesName, seriesId, dateRange)}
          className="mt-2 text-xs underline"
          style={{ color: 'var(--error)' }}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!explanation) return null;

  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ background: 'var(--primary-muted)', border: '1px solid var(--border)' }}>
      {/* Header with collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 text-left"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <svg className="w-3 h-3" style={{ color: 'var(--primary-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            What this means
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${collapsed ? '' : 'rotate-180'}`}
          style={{ color: 'var(--text-placeholder)' }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-3">
          {/* Summary */}
          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {explanation.summary}
          </p>

          {/* Trend context */}
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium">Current context: </span>
            {explanation.trend_context}
          </div>

          {/* What it means */}
          <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            <span className="font-medium">In plain English: </span>
            {explanation.what_it_means}
          </div>

          {/* Retirement impact */}
          <div className="rounded-lg p-3" style={{ background: 'var(--surface-secondary)' }}>
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--primary)' }}>
              For your retirement
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {explanation.retirement_impact}
            </p>
          </div>

          {/* Follow up */}
          <p className="text-xs italic" style={{ color: 'var(--text-placeholder)' }}>
            {explanation.follow_up}
          </p>

          {/* Depth controls + disclaimer */}
          <div className="flex items-center justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="flex gap-1.5">
              <button
                onClick={() => handleDepthChange('simple')}
                className="px-2.5 py-1 text-xs rounded-md transition-colors"
                style={depth === 'simple'
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { background: 'var(--surface-secondary)', color: 'var(--primary)' }
                }
              >
                Simplify
              </button>
              <button
                onClick={() => handleDepthChange('normal')}
                className="px-2.5 py-1 text-xs rounded-md transition-colors"
                style={depth === 'normal'
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { background: 'var(--surface-secondary)', color: 'var(--primary)' }
                }
              >
                Normal
              </button>
              <button
                onClick={() => handleDepthChange('detailed')}
                className="px-2.5 py-1 text-xs rounded-md transition-colors"
                style={depth === 'detailed'
                  ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
                  : { background: 'var(--surface-secondary)', color: 'var(--primary)' }
                }
              >
                Explain more
              </button>
            </div>
            <p className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
              AI-generated. Not financial advice.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
