'use client';

import Link from 'next/link';
import { DASHBOARDS } from '@/lib/dashboards/config';
import { DashboardIcon } from './DashboardIcon';

export function DashboardNav() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {DASHBOARDS.map((dashboard) => (
        <Link
          key={dashboard.id}
          href={`/dashboards/${dashboard.id}`}
          className="group relative bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-5 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-md transition-all"
        >
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${dashboard.color}15` }}
            >
              <span style={{ color: dashboard.color }}>
                <DashboardIcon icon={dashboard.icon} />
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {dashboard.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {dashboard.description}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                {dashboard.indicators.length} indicators
              </p>
            </div>
          </div>
          <svg className="absolute top-5 right-4 w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
