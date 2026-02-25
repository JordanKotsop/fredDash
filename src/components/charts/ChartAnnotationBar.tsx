'use client';

import { useState, useEffect, useCallback } from 'react';
import type { HistoricalEvent } from '@/lib/chart/types';

interface ChartAnnotationBarProps {
  showRecessions: boolean;
  showAverage: boolean;
  showStdDev: boolean;
  showEvents: boolean;
  onToggleRecessions: () => void;
  onToggleAverage: () => void;
  onToggleStdDev: () => void;
  onToggleEvents: () => void;
}

function ToggleButton({
  active,
  onClick,
  label,
  color,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all ${
        active
          ? 'border-transparent text-white'
          : 'border-gray-200 dark:border-gray-700 text-gray-400 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
      style={active ? { backgroundColor: color } : undefined}
    >
      {label}
    </button>
  );
}

export function ChartAnnotationBar({
  showRecessions,
  showAverage,
  showStdDev,
  showEvents,
  onToggleRecessions,
  onToggleAverage,
  onToggleStdDev,
  onToggleEvents,
}: ChartAnnotationBarProps) {
  const [expandedEvent, setExpandedEvent] = useState<HistoricalEvent | null>(null);

  const handleEventClick = useCallback((e: Event) => {
    const event = (e as CustomEvent<HistoricalEvent>).detail;
    setExpandedEvent((prev) =>
      prev?.date === event.date ? null : event
    );
  }, []);

  useEffect(() => {
    window.addEventListener('chart-event-click', handleEventClick);
    return () => window.removeEventListener('chart-event-click', handleEventClick);
  }, [handleEventClick]);

  // Close popover when events are turned off
  useEffect(() => {
    if (!showEvents) setExpandedEvent(null);
  }, [showEvents]);

  const categoryColors: Record<string, string> = {
    crisis: '#dc2626',
    policy: '#2563eb',
    milestone: '#16a34a',
  };

  const categoryLabels: Record<string, string> = {
    crisis: 'Crisis',
    policy: 'Policy',
    milestone: 'Milestone',
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mr-1">
          Overlays
        </span>
        <ToggleButton
          active={showRecessions}
          onClick={onToggleRecessions}
          label="Recessions"
          color="#dc2626"
        />
        <ToggleButton
          active={showAverage}
          onClick={onToggleAverage}
          label="Average"
          color="#6b7280"
        />
        <ToggleButton
          active={showStdDev}
          onClick={onToggleStdDev}
          label="±1 Std Dev"
          color="#8b5cf6"
        />
        <ToggleButton
          active={showEvents}
          onClick={onToggleEvents}
          label="Events"
          color="#2563eb"
        />
      </div>

      {/* Expanded event explanation */}
      {expandedEvent && (
        <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200">
          <div
            className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
            style={{ backgroundColor: categoryColors[expandedEvent.category] }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {expandedEvent.label}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{
                backgroundColor: `${categoryColors[expandedEvent.category]}15`,
                color: categoryColors[expandedEvent.category],
              }}>
                {categoryLabels[expandedEvent.category]}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(expandedEvent.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
              {expandedEvent.description}
            </p>
          </div>
          <button
            onClick={() => setExpandedEvent(null)}
            className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
