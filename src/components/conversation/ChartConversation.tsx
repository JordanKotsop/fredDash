'use client';

import { useState, useRef, useEffect } from 'react';
import type { QueryInterpretation } from '@/lib/ai/types';
import { useChartConversation } from '@/hooks/use-chart-conversation';
import { FredMultiChart } from '@/components/charts';
import { ExportPDFButton } from '@/components/pdf';
import { SocialSharePanel } from '@/components/social';
import { ConversationThread } from './ConversationThread';

interface ChartConversationProps {
  interpretation: QueryInterpretation;
  onFollowUp: (query: string) => void;
}

export function ChartConversation({ interpretation, onFollowUp }: ChartConversationProps) {
  const {
    chartState,
    seriesConfigs,
    messages,
    loading,
    error,
    sendMessage,
    undo,
    redo,
    reset,
    canUndo,
    canRedo,
  } = useChartConversation(interpretation);

  const [input, setInput] = useState('');
  const [showSharePanel, setShowSharePanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    sendMessage(input);
    setInput('');
  };

  const handleSuggestion = (text: string) => {
    sendMessage(text);
  };

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-4">
      {/* Chart with controls */}
      <div className="relative" ref={chartContainerRef}>
        <FredMultiChart
          title={chartState.title}
          subtitle={chartState.subtitle}
          series={seriesConfigs}
          defaultPreset={chartState.dateRange}
          showRecessions
          /* height auto-determined by EconChart responsive hook */
        />

        {/* Undo / Redo / Reset controls */}
        <div className="flex items-center gap-1 mt-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: 'var(--text-placeholder)' }}
            title="Undo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: 'var(--text-placeholder)' }}
            title="Redo"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 15 6-6m0 0-6-6m6 6H9a6 6 0 0 0 0 12h3" />
            </svg>
          </button>
          <button
            onClick={reset}
            disabled={!canUndo}
            className="ml-1 px-2 py-1 text-[10px] font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            style={{ color: 'var(--text-placeholder)' }}
            title="Reset to original"
          >
            Reset
          </button>

          <div className="ml-auto flex items-center gap-1">
            {chartState.units !== 'lin' && (
              <span className="text-[10px] mr-2" style={{ color: 'var(--text-placeholder)' }}>
                Units: {chartState.units}
              </span>
            )}
            <ExportPDFButton
              chartRef={chartContainerRef}
              compact
              options={{
                title: chartState.title,
                subtitle: chartState.subtitle,
                explanation: interpretation.explanation,
                conversationExcerpts: messages.length > 0
                  ? messages.map((m) => ({ role: m.role, content: m.content }))
                  : undefined,
                seriesLabels: chartState.series.map((s) => s.label),
                dateRange: chartState.dateRange,
              }}
            />
            <button
              onClick={() => setShowSharePanel(!showSharePanel)}
              title="Share to social"
              className="p-1.5 transition-colors"
              style={{ color: 'var(--text-placeholder)' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Social share panel */}
      {showSharePanel && (
        <SocialSharePanel
          chartRef={chartContainerRef}
          chartTitle={chartState.title}
          chartSubtitle={chartState.subtitle}
          seriesLabels={chartState.series.map((s) => s.label)}
          dateRange={chartState.dateRange}
          explanation={interpretation.explanation}
          onClose={() => setShowSharePanel(false)}
        />
      )}

      {/* Initial explanation */}
      {interpretation.explanation && messages.length === 0 && (
        <div className="rounded-xl p-3 sm:p-4" style={{ background: 'var(--primary-muted)', border: '1px solid var(--border)' }}>
          <div className="flex items-start gap-2 sm:gap-3">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'var(--primary)' }}>
              <svg className="w-3.5 h-3.5" style={{ color: 'var(--primary-foreground)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {interpretation.explanation}
            </p>
          </div>
        </div>
      )}

      {/* Conversation thread */}
      {messages.length > 0 && (
        <ConversationThread messages={messages} loading={loading} />
      )}

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg" style={{ background: 'var(--error-muted)', border: '1px solid var(--border)' }}>
          <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>
        </div>
      )}

      {/* Chat input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={messages.length === 0
            ? 'Ask about this chart: "What caused the spike?" or "Add unemployment rate"'
            : 'Continue the conversation...'
          }
          disabled={loading}
          maxLength={500}
          className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-10 sm:pr-12 text-sm rounded-xl focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-primary)', outlineColor: 'var(--primary)' }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 disabled:opacity-30 transition-colors"
          style={{ color: 'var(--primary)' }}
        >
          {loading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
            </svg>
          )}
        </button>
      </form>

      {/* Suggestions */}
      {messages.length === 0 && interpretation.follow_up_queries?.length > 0 && (
        <div>
          <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-placeholder)' }}>
            Try asking
          </p>
          <div className="flex flex-wrap gap-2">
            {interpretation.follow_up_queries.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                className="px-3 py-1.5 text-sm rounded-full transition-colors"
                style={{ color: 'var(--text-secondary)', background: 'var(--surface-secondary)' }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up suggestions from conversation */}
      {messages.length > 0 && !loading && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFollowUp('')}
            className="px-3 py-1.5 text-xs rounded-full transition-colors"
            style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
          >
            New query
          </button>
        </div>
      )}
    </div>
  );
}
