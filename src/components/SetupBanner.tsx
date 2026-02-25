'use client';

import Link from 'next/link';
import { useKeyStatus } from '@/hooks/use-key-status';

export function SetupBanner() {
  const { status, loading } = useKeyStatus();

  if (loading || !status || status.allConfigured) return null;

  const missing: string[] = [];
  if (!status.fred) missing.push('FRED');
  if (!status.openai) missing.push('OpenAI');

  return (
    <div style={{ background: 'var(--warning-muted)', borderBottom: '1px solid var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--warning-muted)' }}>
            <svg className="w-4 h-4" style={{ color: 'var(--warning)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--warning)' }}>
              Setup Required — {missing.join(' & ')} API {missing.length === 1 ? 'key' : 'keys'} missing
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              Add your API keys to <code className="px-1 rounded" style={{ background: 'var(--surface-secondary)' }}>.env.local</code> or use the settings page to get started.
            </p>
          </div>
        </div>
        <Link
          href="/settings"
          className="shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Configure Keys
        </Link>
      </div>
    </div>
  );
}
