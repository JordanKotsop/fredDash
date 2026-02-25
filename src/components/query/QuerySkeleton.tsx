'use client';

export function QuerySkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Chart skeleton */}
      <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="h-5 w-56 rounded mb-2" style={{ background: 'var(--surface-secondary)' }} />
        <div className="h-3 w-40 rounded mb-4" style={{ background: 'var(--surface-secondary)' }} />
        <div className="h-[350px] rounded-lg" style={{ background: 'var(--surface-hover)' }} />
      </div>

      {/* Explanation skeleton */}
      <div className="rounded-xl p-4" style={{ background: 'var(--primary-muted)', border: '1px solid var(--border)' }}>
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'var(--surface-secondary)' }} />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded" style={{ background: 'var(--surface-secondary)' }} />
            <div className="h-3 w-full rounded" style={{ background: 'var(--surface-secondary)' }} />
            <div className="h-3 w-3/4 rounded" style={{ background: 'var(--surface-secondary)' }} />
          </div>
        </div>
      </div>

      {/* Follow-up skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-48 rounded-full" style={{ background: 'var(--surface-secondary)' }} />
        <div className="h-8 w-40 rounded-full" style={{ background: 'var(--surface-secondary)' }} />
        <div className="h-8 w-52 rounded-full" style={{ background: 'var(--surface-secondary)' }} />
      </div>
    </div>
  );
}
