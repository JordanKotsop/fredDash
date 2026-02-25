'use client';

interface ChartFooterProps {
  source?: string;
  cached?: boolean;
}

export function ChartFooter({ source, cached }: ChartFooterProps) {
  return (
    <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
      <p className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>
        Source: {source ?? 'Federal Reserve Economic Data (FRED)'}
      </p>
      {cached && (
        <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--text-placeholder)', background: 'var(--surface-secondary)' }}>
          cached
        </span>
      )}
    </div>
  );
}
