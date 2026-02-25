'use client';

import { useState, useRef, useEffect } from 'react';
import type { QueryHistoryItem } from '@/lib/ai/types';

const EXAMPLE_QUERIES = [
  'What\'s happening with inflation?',
  'Show me unemployment vs wage growth',
  'How are interest rates trending?',
  'Is the yield curve inverted?',
  'Compare housing starts to mortgage rates',
  'What does the jobs market look like?',
  'Show me GDP growth over the last 10 years',
  'How is consumer sentiment doing?',
];

interface QuerySearchBarProps {
  onSubmit: (query: string) => void;
  loading: boolean;
  history: QueryHistoryItem[];
  onSelectHistory: (item: QueryHistoryItem) => void;
}

export function QuerySearchBar({ onSubmit, loading, history, onSelectHistory }: QuerySearchBarProps) {
  const [value, setValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() && !loading) {
      onSubmit(value.trim());
      setShowDropdown(false);
    }
  };

  const handleExampleClick = (query: string) => {
    setValue(query);
    onSubmit(query);
    setShowDropdown(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          {/* Search icon */}
          <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {loading ? (
              <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" className="opacity-75" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setShowDropdown(true)}
            placeholder="Ask about the economy in plain English..."
            className="w-full pl-10 sm:pl-12 pr-16 sm:pr-24 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
            disabled={loading}
          />

          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Thinking...' : 'Ask'}
          </button>
        </div>
      </form>

      {/* Dropdown: history + examples */}
      {showDropdown && !loading && (
        <div className="absolute z-50 top-full mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {/* Recent queries */}
          {history.length > 0 && (
            <div className="p-3 border-b border-gray-100 dark:border-gray-800">
              <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                Recent
              </p>
              {history.slice(0, 5).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectHistory(item);
                    setValue(item.query);
                    setShowDropdown(false);
                  }}
                  className="w-full text-left px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  <span className="truncate">{item.query}</span>
                </button>
              ))}
            </div>
          )}

          {/* Example queries */}
          <div className="p-3">
            <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
              Try asking
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => handleExampleClick(q)}
                  className="text-left px-2 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md truncate"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
