'use client';

interface ChartFooterProps {
  source?: string;
  cached?: boolean;
}

export function ChartFooter({ source, cached }: ChartFooterProps) {
  return (
    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
      <p className="text-[10px] text-gray-400 dark:text-gray-500">
        Source: {source ?? 'Federal Reserve Economic Data (FRED)'}
      </p>
      {cached && (
        <span className="text-[10px] text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded">
          cached
        </span>
      )}
    </div>
  );
}
