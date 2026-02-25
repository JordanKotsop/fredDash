'use client';

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
}

export function ChartHeader({ title, subtitle, lastUpdated }: ChartHeaderProps) {
  return (
    <div className="mb-3 sm:mb-4">
      <h3 className="text-heading-3 sm:text-heading-2" style={{ color: 'var(--text-primary)' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="text-caption mt-0.5 break-words" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </p>
      )}
      {lastUpdated && (
        <p className="text-label mt-1" style={{ color: 'var(--text-tertiary)' }}>
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}
