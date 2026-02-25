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
      className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-full border transition-all"
      style={active
        ? { backgroundColor: color, borderColor: 'transparent', color: 'white' }
        : { borderColor: 'var(--border)', color: 'var(--text-placeholder)', background: 'transparent' }
      }
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
    crisis: 'var(--error)',
    policy: 'var(--primary)',
    milestone: 'var(--success)',
  };

  const categoryLabels: Record<string, string> = {
    crisis: 'Crisis',
    policy: 'Policy',
    milestone: 'Milestone',
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-medium uppercase tracking-wide mr-1" style={{ color: 'var(--text-placeholder)' }}>
          Overlays
        </span>
        <ToggleButton
          active={showRecessions}
          onClick={onToggleRecessions}
          label="Recessions"
          color="#D35D6E"
        />
        <ToggleButton
          active={showAverage}
          onClick={onToggleAverage}
          label="Average"
          color="#6B7A8D"
        />
        <ToggleButton
          active={showStdDev}
          onClick={onToggleStdDev}
          label="±1 Std Dev"
          color="#8B6CC1"
        />
        <ToggleButton
          active={showEvents}
          onClick={onToggleEvents}
          label="Events"
          color="#5B7FA4"
        />
      </div>

      {/* Expanded event explanation */}
      {expandedEvent && (
        <div className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-200" style={{ background: 'var(--surface-secondary)', border: '1px solid var(--border)' }}>
          <div
            className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
            style={{ backgroundColor: categoryColors[expandedEvent.category] }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-1.5 sm:gap-2">
              <span className="text-xs sm:text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                {expandedEvent.label}
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{
                backgroundColor: `${categoryColors[expandedEvent.category]}15`,
                color: categoryColors[expandedEvent.category],
              }}>
                {categoryLabels[expandedEvent.category]}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-placeholder)' }}>
                {new Date(expandedEvent.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {expandedEvent.description}
            </p>
          </div>
          <button
            onClick={() => setExpandedEvent(null)}
            className="p-0.5 shrink-0 transition-colors"
            style={{ color: 'var(--text-placeholder)' }}
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
