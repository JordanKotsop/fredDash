'use client';

import Link from 'next/link';
import { DASHBOARDS } from '@/lib/dashboards/config';
import { DashboardIcon } from './DashboardIcon';

export function DashboardNav() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {DASHBOARDS.map((dashboard) => (
        <Link
          key={dashboard.id}
          href={`/dashboards/${dashboard.id}`}
          className="group relative rounded-xl p-4 sm:p-5 hover:shadow-md transition-all"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-2.5 sm:gap-3">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${dashboard.color}15` }}
            >
              <span style={{ color: dashboard.color }}>
                <DashboardIcon icon={dashboard.icon} />
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold transition-colors" style={{ color: 'var(--text-primary)' }}>
                <span className="group-hover:hidden">{dashboard.title}</span>
                <span className="hidden group-hover:inline" style={{ color: 'var(--primary)' }}>{dashboard.title}</span>
              </h3>
              <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-tertiary)' }}>
                {dashboard.description}
              </p>
              <p className="text-[10px] mt-2" style={{ color: 'var(--text-placeholder)' }}>
                {dashboard.indicators.length} indicators
              </p>
            </div>
          </div>
          <svg className="absolute top-5 right-4 w-4 h-4 transition-colors" style={{ color: 'var(--border)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </Link>
      ))}
    </div>
  );
}
