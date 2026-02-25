'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useKeyStatus } from '@/hooks/use-key-status';

interface ValidationState {
  fred: { valid: boolean; error?: string } | null;
  openai: { valid: boolean; error?: string } | null;
}

export default function SettingsPage() {
  const { status } = useKeyStatus();
  const [fredKey, setFredKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({ fred: null, openai: null });

  const handleValidate = async () => {
    if (!fredKey && !openaiKey) return;
    setValidating(true);
    setValidation({ fred: null, openai: null });

    try {
      const res = await fetch('/api/validate-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fredKey: fredKey || undefined,
          openaiKey: openaiKey || undefined,
        }),
      });
      const result = await res.json();
      setValidation(result);
    } catch {
      setValidation({
        fred: fredKey ? { valid: false, error: 'Validation request failed' } : null,
        openai: openaiKey ? { valid: false, error: 'Validation request failed' } : null,
      });
    } finally {
      setValidating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Configure your API keys</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Current status */}
        {status && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Current Status</h2>
            <div className="grid gap-2">
              <StatusRow label="FRED API Key" configured={status.fred} />
              <StatusRow label="OpenAI API Key" configured={status.openai} />
            </div>
          </div>
        )}

        {/* FRED API Key */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            FRED API Key
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Free key from the Federal Reserve Economic Data service. Required for all economic data.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How to get your key:</p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
              <li>
                Go to{' '}
                <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                  fred.stlouisfed.org/docs/api/api_key.html
                </a>
              </li>
              <li>Click &ldquo;Request API Key&rdquo; (you&apos;ll need to create a free account)</li>
              <li>Fill in your name and email — the key is generated instantly</li>
              <li>Copy the 32-character key and paste it below</li>
            </ol>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              It&apos;s completely free — no credit card needed.
            </p>
          </div>

          <label htmlFor="fred-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            API Key
          </label>
          <input
            id="fred-key"
            type="password"
            value={fredKey}
            onChange={(e) => setFredKey(e.target.value)}
            placeholder="Paste your 32-character FRED API key"
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-mono"
          />
          {validation.fred && (
            <p className={`text-sm mt-2 ${validation.fred.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {validation.fred.valid ? 'Key is valid!' : validation.fred.error}
            </p>
          )}
        </div>

        {/* OpenAI API Key */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 sm:p-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
            OpenAI API Key
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Required for natural language queries and AI-generated explanations. Uses GPT-4o.
          </p>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">How to get your key:</p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5 list-decimal list-inside">
              <li>
                Go to{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">
                  platform.openai.com/api-keys
                </a>
              </li>
              <li>Sign in or create an OpenAI account</li>
              <li>Click &ldquo;Create new secret key&rdquo;</li>
              <li>Give it a name like &ldquo;FredDash&rdquo; and click Create</li>
              <li>Copy the key immediately (it won&apos;t be shown again)</li>
            </ol>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Requires a paid OpenAI account. Typical usage costs $1-5/month.
            </p>
          </div>

          <label htmlFor="openai-key" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            API Key
          </label>
          <input
            id="openai-key"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2.5 text-sm bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100 font-mono"
          />
          {validation.openai && (
            <p className={`text-sm mt-2 ${validation.openai.valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {validation.openai.valid ? 'Key is valid!' : validation.openai.error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleValidate}
            disabled={(!fredKey && !openaiKey) || validating}
            className="w-full py-3 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {validating ? 'Validating...' : 'Test Keys'}
          </button>

          {/* Instructions for .env.local */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Save keys to your project
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              After validating, add your keys to the <code className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-xs font-mono">.env.local</code> file in your project root:
            </p>
            <pre className="bg-gray-900 dark:bg-gray-950 text-green-400 text-[11px] sm:text-xs p-3 sm:p-4 rounded-lg overflow-x-auto font-mono">
{`FRED_API_KEY=${fredKey || 'your_fred_key_here'}
OPENAI_API_KEY=${openaiKey || 'your_openai_key_here'}`}
            </pre>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              After updating .env.local, restart your dev server (<code className="bg-gray-200 dark:bg-gray-700 px-1 rounded">npm run dev</code>).
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center gap-2">
      {configured ? (
        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ) : (
        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )}
      <span className={`text-sm ${configured ? 'text-green-700 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {label}: {configured ? 'Configured' : 'Not configured'}
      </span>
    </div>
  );
}
