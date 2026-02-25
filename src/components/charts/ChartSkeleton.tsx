'use client';

export function ChartSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-5 w-48 rounded mb-2" style={{ background: 'var(--surface-secondary)' }} />
      <div className="h-3 w-32 rounded mb-4" style={{ background: 'var(--surface-secondary)' }} />
      <div className="flex flex-wrap gap-1 mb-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-7 w-10 rounded" style={{ background: 'var(--surface-secondary)' }} />
        ))}
      </div>
      <div className="h-[240px] sm:h-[300px] md:h-[350px] rounded-lg flex items-end justify-between px-4 sm:px-8 pb-6 sm:pb-8 gap-0.5 sm:gap-1" style={{ background: 'var(--surface-hover)' }}>
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="rounded-t w-full"
            style={{ height: `${30 + Math.random() * 60}%`, background: 'var(--surface-secondary)' }}
          />
        ))}
      </div>
      <div className="h-3 w-48 sm:w-64 rounded mt-3" style={{ background: 'var(--surface-secondary)' }} />
    </div>
  );
}
