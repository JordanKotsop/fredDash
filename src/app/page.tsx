'use client';

import { useNLQuery } from '@/hooks/use-query';
import { QuerySearchBar, QueryResult, QuerySkeleton } from '@/components/query';
import { FredChart, FredMultiChart } from '@/components/charts';

export default function Home() {
  const { interpretation, loading, error, history, submitQuery, selectFromHistory } = useNLQuery();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            FredDash
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            AI-Powered Economic Data Dashboard
          </p>
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
