'use client';

import type { DatePreset } from '@/lib/chart/types';

const PRESETS: DatePreset[] = ['1M', '3M', '6M', '1Y', '2Y', '5Y', '10Y', 'MAX'];

interface DateRangeSelectorProps {
  selected: DatePreset;
  onChange: (preset: DatePreset) => void;
}

export function DateRangeSelector({ selected, onChange }: DateRangeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => onChange(preset)}
          className="px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-medium rounded-md transition-colors"
          style={
            selected === preset
              ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
              : { background: 'var(--surface-secondary)', color: 'var(--text-secondary)' }
          }
        >
          {preset}
        </button>
      ))}
    </div>
  );
}
