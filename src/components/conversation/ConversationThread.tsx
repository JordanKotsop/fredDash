'use client';

import { useRef, useEffect } from 'react';
import type { ConversationMessage } from '@/lib/ai/conversation-types';

interface ConversationThreadProps {
  messages: ConversationMessage[];
  loading: boolean;
}

export function ConversationThread({ messages, loading }: ConversationThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="max-h-[250px] sm:max-h-[300px] md:max-h-[400px] overflow-y-auto space-y-2 sm:space-y-3 scroll-smooth">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-[90%] sm:max-w-[85%] px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'rounded-br-md'
                : 'rounded-bl-md'
            }`}
            style={msg.role === 'user'
              ? { background: 'var(--primary)', color: 'var(--primary-foreground)' }
              : { background: 'var(--surface-secondary)', color: 'var(--text-primary)' }
            }
          >
            {msg.role === 'assistant' && msg.chartStateAfter && (
              <div className="flex items-center gap-1.5 mb-1.5 text-[10px] font-medium" style={{ color: 'var(--primary)' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182" />
                </svg>
                Chart updated
              </div>
            )}
            {msg.content}
          </div>
        </div>
      ))}

      {loading && (
        <div className="flex justify-start">
          <div className="rounded-xl rounded-bl-md px-4 py-3" style={{ background: 'var(--surface-secondary)' }}>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-placeholder)', animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-placeholder)', animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-placeholder)', animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
