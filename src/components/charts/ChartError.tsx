'use client';

interface ChartErrorProps {
  message: string;
  onRetry?: () => void;
}

export function ChartError({ message, onRetry }: ChartErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-[300px] rounded-lg"
      style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}
    >
      <div className="mb-3" style={{ color: 'var(--text-placeholder)' }}>
        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
      </div>
      <p className="text-sm mb-3 text-center max-w-xs" style={{ color: 'var(--text-secondary)' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          Try again
        </button>
      )}
    </div>
  );
}
