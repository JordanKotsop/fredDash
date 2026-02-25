'use client';

export function QuerySkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {/* Chart skeleton */}
      <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="h-5 w-56 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
        <div className="h-[350px] bg-gray-100 dark:bg-gray-800 rounded-lg" />
      </div>

      {/* Explanation skeleton */}
      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-200 dark:bg-blue-800 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 bg-blue-200 dark:bg-blue-800 rounded" />
            <div className="h-3 w-full bg-blue-100 dark:bg-blue-900 rounded" />
            <div className="h-3 w-3/4 bg-blue-100 dark:bg-blue-900 rounded" />
          </div>
        </div>
      </div>

      {/* Follow-up skeleton */}
      <div className="flex gap-2">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-8 w-40 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-8 w-52 bg-gray-200 dark:bg-gray-700 rounded-full" />
      </div>
    </div>
  );
}
