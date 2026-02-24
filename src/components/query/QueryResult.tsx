'use client';

import type { QueryInterpretation } from '@/lib/ai/types';
import { FredMultiChart } from '@/components/charts';

interface QueryResultProps {
  interpretation: QueryInterpretation;
  onFollowUp: (query: string) => void;
}

export function QueryResult({ interpretation, onFollowUp }: QueryResultProps) {
  const { series, date_range, title, subtitle, explanation, follow_up_queries } = interpretation;

  return (
    <div className="space-y-4">
      {/* Chart */}
      <FredMultiChart
        title={title}
        subtitle={subtitle}
        series={series.map((s) => ({
          id: s.id,
          label: s.label,
          type: s.type,
          yAxisId: s.yAxisId,
          units: s.units,
        }))}
        defaultPreset={date_range}
        showRecessions
        height={400}
      />

      {/* AI Explanation */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-1">
              What this means
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>
      </div>

      {/* Follow-up queries */}
      {follow_up_queries.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            You might also want to see
          </p>
          <div className="flex flex-wrap gap-2">
            {follow_up_queries.map((q) => (
              <button
                key={q}
                onClick={() => onFollowUp(q)}
                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
