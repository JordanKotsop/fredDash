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
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}>
        <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center gap-3 sm:gap-4">
          <Link href="/" className="transition-colors" style={{ color: 'var(--text-tertiary)' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-heading-2" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <p className="text-body-small" style={{ color: 'var(--text-tertiary)' }}>Configure your API keys</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Current status */}
        {status && (
          <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h2 className="text-heading-4 mb-3" style={{ color: 'var(--text-primary)' }}>Current Status</h2>
            <div className="grid gap-2">
              <StatusRow label="FRED API Key" configured={status.fred} />
              <StatusRow label="OpenAI API Key" configured={status.openai} />
            </div>
          </div>
        )}

        {/* FRED API Key */}
        <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-heading-3 mb-1" style={{ color: 'var(--text-primary)' }}>
            FRED API Key
          </h2>
          <p className="text-body-small mb-4" style={{ color: 'var(--text-secondary)' }}>
            Free key from the Federal Reserve Economic Data service. Required for all economic data.
          </p>

          <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--surface-secondary)' }}>
            <p className="text-body-small font-medium mb-2" style={{ color: 'var(--text-primary)' }}>How to get your key:</p>
            <ol className="text-body-small space-y-1.5 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
              <li>
                Go to{' '}
                <a href="https://fred.stlouisfed.org/docs/api/api_key.html" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--primary)' }}>
                  fred.stlouisfed.org/docs/api/api_key.html
                </a>
              </li>
              <li>Click &ldquo;Request API Key&rdquo; (you&apos;ll need to create a free account)</li>
              <li>Fill in your name and email — the key is generated instantly</li>
              <li>Copy the 32-character key and paste it below</li>
            </ol>
            <p className="text-caption mt-2" style={{ color: 'var(--text-tertiary)' }}>
              It&apos;s completely free — no credit card needed.
            </p>
          </div>

          <label htmlFor="fred-key" className="block text-body-small font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            API Key
          </label>
          <input
            id="fred-key"
            type="password"
            value={fredKey}
            onChange={(e) => setFredKey(e.target.value)}
            placeholder="Paste your 32-character FRED API key"
            className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:border-transparent font-mono"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--primary)',
            } as React.CSSProperties}
          />
          {validation.fred && (
            <p className="text-sm mt-2" style={{ color: validation.fred.valid ? 'var(--success)' : 'var(--error)' }}>
              {validation.fred.valid ? 'Key is valid!' : validation.fred.error}
            </p>
          )}
        </div>

        {/* OpenAI API Key */}
        <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-heading-3 mb-1" style={{ color: 'var(--text-primary)' }}>
            OpenAI API Key
          </h2>
          <p className="text-body-small mb-4" style={{ color: 'var(--text-secondary)' }}>
            Required for natural language queries and AI-generated explanations. Uses GPT-4o.
          </p>

          <div className="rounded-lg p-4 mb-4" style={{ background: 'var(--surface-secondary)' }}>
            <p className="text-body-small font-medium mb-2" style={{ color: 'var(--text-primary)' }}>How to get your key:</p>
            <ol className="text-body-small space-y-1.5 list-decimal list-inside" style={{ color: 'var(--text-secondary)' }}>
              <li>
                Go to{' '}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: 'var(--primary)' }}>
                  platform.openai.com/api-keys
                </a>
              </li>
              <li>Sign in or create an OpenAI account</li>
              <li>Click &ldquo;Create new secret key&rdquo;</li>
              <li>Give it a name like &ldquo;FredDash&rdquo; and click Create</li>
              <li>Copy the key immediately (it won&apos;t be shown again)</li>
            </ol>
            <p className="text-caption mt-2" style={{ color: 'var(--text-tertiary)' }}>
              Requires a paid OpenAI account. Typical usage costs $1-5/month.
            </p>
          </div>

          <label htmlFor="openai-key" className="block text-body-small font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            API Key
          </label>
          <input
            id="openai-key"
            type="password"
            value={openaiKey}
            onChange={(e) => setOpenaiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 focus:border-transparent font-mono"
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              '--tw-ring-color': 'var(--primary)',
            } as React.CSSProperties}
          />
          {validation.openai && (
            <p className="text-sm mt-2" style={{ color: validation.openai.valid ? 'var(--success)' : 'var(--error)' }}>
              {validation.openai.valid ? 'Key is valid!' : validation.openai.error}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleValidate}
            disabled={(!fredKey && !openaiKey) || validating}
            className="w-full py-3 text-sm font-medium rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {validating ? 'Validating...' : 'Test Keys'}
          </button>

          {/* Instructions for .env.local */}
          <div className="rounded-xl p-4 sm:p-5" style={{ background: 'var(--surface-secondary)' }}>
            <h3 className="text-heading-4 mb-2" style={{ color: 'var(--text-primary)' }}>
              Save keys to your project
            </h3>
            <p className="text-body-small mb-3" style={{ color: 'var(--text-secondary)' }}>
              After validating, add your keys to the <code className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'var(--border)' }}>.env.local</code> file in your project root:
            </p>
            <pre className="text-[11px] sm:text-xs p-3 sm:p-4 rounded-lg overflow-x-auto font-mono" style={{ background: '#1A1625', color: '#A78BFA' }}>
{`FRED_API_KEY=${fredKey || 'your_fred_key_here'}
OPENAI_API_KEY=${openaiKey || 'your_openai_key_here'}`}
            </pre>
            <p className="text-caption mt-2" style={{ color: 'var(--text-tertiary)' }}>
              After updating .env.local, restart your dev server (<code className="px-1 rounded font-mono" style={{ background: 'var(--border)' }}>npm run dev</code>).
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
        <svg className="w-4 h-4" style={{ color: 'var(--success)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ) : (
        <svg className="w-4 h-4" style={{ color: 'var(--error)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      )}
      <span className="text-body-small" style={{ color: configured ? 'var(--success)' : 'var(--error)' }}>
        {label}: {configured ? 'Configured' : 'Not configured'}
      </span>
    </div>
  );
}
