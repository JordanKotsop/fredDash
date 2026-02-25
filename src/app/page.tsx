'use client';

import Link from 'next/link';
import { useNLQuery } from '@/hooks/use-query';
import { QuerySearchBar, QueryResult, QuerySkeleton } from '@/components/query';
import { FredChart, FredMultiChart } from '@/components/charts';

export default function Home() {
  const { interpretation, loading, error, history, submitQuery, selectFromHistory } = useNLQuery();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              FredDash
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              AI-Powered Economic Data Dashboard
            </p>
          </div>
          <Link
            href="/settings"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-8">
          {/* Natural Language Query Interface */}
          <section>
            <QuerySearchBar
              onSubmit={submitQuery}
              loading={loading}
              history={history}
              onSelectHistory={selectFromHistory}
            />

            {/* Error */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="mt-6">
                <QuerySkeleton />
              </div>
            )}

            {/* Query Result */}
            {interpretation && !loading && (
              <div className="mt-6">
                <QueryResult
                  interpretation={interpretation}
                  onFollowUp={submitQuery}
                />
              </div>
            )}
          </section>

          {/* Default dashboard charts (shown when no query result) */}
          {!interpretation && !loading && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Market Overview
              </h2>
              <div className="grid gap-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <FredChart
                    seriesId="CPIAUCSL"
                    type="area"
                    defaultPreset="10Y"
                    showRecessions
                    showAverage
                  />
                  <FredChart
                    seriesId="UNRATE"
                    defaultPreset="10Y"
                    showRecessions
                    color="#dc2626"
                  />
                </div>

                <FredMultiChart
                  title="Interest Rates Overview"
                  subtitle="Federal Funds Rate vs Treasury Yields"
                  series={[
                    { id: 'DFF', label: 'Fed Funds Rate', units: 'Percent' },
                    { id: 'DGS2', label: '2-Year Treasury', color: '#f59e0b', units: 'Percent' },
                    { id: 'DGS10', label: '10-Year Treasury', color: '#16a34a', units: 'Percent' },
                    { id: 'DGS30', label: '30-Year Treasury', color: '#8b5cf6', units: 'Percent' },
                  ]}
                  defaultPreset="5Y"
                  showRecessions
                  height={400}
                />

                <div className="grid gap-6 lg:grid-cols-2">
                  <FredChart
                    seriesId="GDP"
                    type="bar"
                    defaultPreset="10Y"
                    showRecessions
                    color="#16a34a"
                  />
                  <FredMultiChart
                    title="Yield Curve Spread"
                    subtitle="10-Year minus 2-Year Treasury — negative signals potential recession"
                    series={[
                      { id: 'T10Y2Y', label: '10Y-2Y Spread', type: 'area', units: 'Percent' },
                    ]}
                    defaultPreset="10Y"
                    showRecessions
                    showAverage
                  />
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
