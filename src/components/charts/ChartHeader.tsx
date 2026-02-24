'use client';

interface ChartHeaderProps {
  title: string;
  subtitle?: string;
  lastUpdated?: string;
}

export function ChartHeader({ title, subtitle, lastUpdated }: ChartHeaderProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {subtitle && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          {subtitle}
        </p>
      )}
      {lastUpdated && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Last updated: {lastUpdated}
        </p>
      )}
    </div>
  );
}
