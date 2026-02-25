'use client';

import { useState, useCallback } from 'react';
import type { PostTone, SocialPostResult, SocialPostResponse } from '@/lib/ai/social-types';
import { captureChartImage, downloadImage } from '@/lib/social/chart-image';

interface SocialSharePanelProps {
  chartRef: React.RefObject<HTMLElement | null>;
  chartTitle: string;
  chartSubtitle?: string;
  seriesLabels: string[];
  dateRange: string;
  explanation?: string;
  onClose: () => void;
}

const TONES: { value: PostTone; label: string; desc: string }[] = [
  { value: 'professional', label: 'Professional', desc: 'Analytical and precise' },
  { value: 'casual', label: 'Casual', desc: 'Friendly and approachable' },
  { value: 'educational', label: 'Educational', desc: 'Teach and explain' },
];

export function SocialSharePanel({
  chartRef,
  chartTitle,
  chartSubtitle,
  seriesLabels,
  dateRange,
  explanation,
  onClose,
}: SocialSharePanelProps) {
  const [tone, setTone] = useState<PostTone>('professional');
  const [includeThread, setIncludeThread] = useState(false);
  const [post, setPost] = useState<SocialPostResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [chartImageUrl, setChartImageUrl] = useState<string | null>(null);
  const [capturingImage, setCapturingImage] = useState(false);

  const generate = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/social-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chartTitle, chartSubtitle, seriesLabels, dateRange, explanation, tone, includeThread }),
      });
      const data = (await res.json()) as SocialPostResponse;
      if (data.error) {
        setError(data.error);
      } else {
        setPost(data.post);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate post');
    } finally {
      setLoading(false);
    }
  }, [chartTitle, chartSubtitle, seriesLabels, dateRange, explanation, tone, includeThread]);

  const captureImage = useCallback(async () => {
    if (!chartRef.current) return;
    setCapturingImage(true);
    try {
      const dataUrl = await captureChartImage(chartRef.current);
      setChartImageUrl(dataUrl);
    } catch (err) {
      console.error('Image capture failed:', err);
    } finally {
      setCapturingImage(false);
    }
  }, [chartRef]);

  const copyText = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    });
  }, []);

  const openInTwitter = useCallback((text: string) => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  const fullTweet = post ? `${post.single_tweet}\n\n${post.hashtags.join(' ')}` : '';
  const charCount = fullTweet.length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Share to Social</h3>
        <button onClick={onClose} className="transition-colors" style={{ color: 'var(--text-placeholder)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Tone Selector */}
        <div>
          <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Tone</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTone(t.value); setPost(null); }}
                className="flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs rounded-lg transition-all"
                style={tone === t.value
                  ? { borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--primary)', background: 'var(--primary-muted)', color: 'var(--primary)' }
                  : { borderWidth: '1px', borderStyle: 'solid', borderColor: 'var(--border)', color: 'var(--text-secondary)' }
                }
              >
                <span className="font-medium">{t.label}</span>
                <br />
                <span className="text-[10px] opacity-70">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Thread toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeThread}
            onChange={(e) => { setIncludeThread(e.target.checked); setPost(null); }}
            className="rounded"
            style={{ borderColor: 'var(--border)', accentColor: 'var(--primary)' }}
          />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Generate thread (3-5 tweets)</span>
        </label>

        {/* Generate button */}
        {!post && (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium rounded-lg disabled:opacity-50 transition-colors"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {loading ? 'Generating...' : 'Generate Post'}
          </button>
        )}

        {error && (
          <p className="text-xs" style={{ color: 'var(--error)' }}>{error}</p>
        )}

        {/* Post Preview */}
        {post && (
          <div className="space-y-3">
            {/* Single tweet preview */}
            <div className="rounded-lg p-2.5 sm:p-3" style={{ background: 'var(--surface-secondary)' }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" style={{ background: 'var(--border)' }} />
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>You</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-placeholder)' }}>@yourusername</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                {post.single_tweet}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--primary)' }}>
                {post.hashtags.join(' ')}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                <span className="text-[10px]" style={{ color: charCount > 280 ? 'var(--error)' : 'var(--text-placeholder)', fontWeight: charCount > 280 ? 700 : 400 }}>
                  {charCount}/280
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyText(fullTweet, 'tweet')}
                    className="px-2 py-1 text-[10px] font-medium rounded transition-colors"
                    style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
                  >
                    {copied === 'tweet' ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => openInTwitter(fullTweet)}
                    className="px-2 py-1 text-[10px] font-medium rounded transition-colors"
                    style={{ background: 'var(--text-primary)', color: 'var(--background)' }}
                  >
                    Post on X
                  </button>
                </div>
              </div>
            </div>

            {/* Thread preview */}
            {post.thread && post.thread.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Thread Preview</p>
                <div className="space-y-2">
                  {post.thread.map((tweet, i) => (
                    <div key={i} className="rounded-lg p-3 flex gap-2" style={{ background: 'var(--surface-secondary)' }}>
                      <span className="text-[10px] font-bold shrink-0 mt-0.5" style={{ color: 'var(--primary)' }}>{i + 1}/</span>
                      <div className="min-w-0">
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-primary)' }}>{tweet}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px]" style={{ color: tweet.length > 280 ? 'var(--error)' : 'var(--text-placeholder)' }}>
                            {tweet.length}/280
                          </span>
                          <button
                            onClick={() => copyText(tweet, `thread-${i}`)}
                            className="text-[10px]"
                            style={{ color: 'var(--text-placeholder)' }}
                          >
                            {copied === `thread-${i}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => copyText(post.thread!.map((t, i) => `${i + 1}/ ${t}`).join('\n\n'), 'full-thread')}
                  className="mt-2 px-3 py-1.5 text-xs rounded-lg transition-colors"
                  style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
                >
                  {copied === 'full-thread' ? 'Copied!' : 'Copy Full Thread'}
                </button>
              </div>
            )}

            {/* LinkedIn post */}
            {post.linkedin_post && (
              <div>
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>LinkedIn</p>
                <div className="rounded-lg p-3" style={{ background: 'var(--surface-secondary)' }}>
                  <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                    {post.linkedin_post}
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => copyText(post.linkedin_post!, 'linkedin')}
                      className="px-2 py-1 text-[10px] font-medium rounded transition-colors"
                      style={{ color: 'var(--text-tertiary)', border: '1px solid var(--border)' }}
                    >
                      {copied === 'linkedin' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chart image */}
            <div>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-tertiary)' }}>Chart Image (1200x675)</p>
              {chartImageUrl ? (
                <div>
                  <img src={chartImageUrl} alt="Chart preview" className="w-full rounded-lg" style={{ border: '1px solid var(--border)' }} />
                  <button
                    onClick={() => downloadImage(chartImageUrl, `fredDash-${chartTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.png`)}
                    className="mt-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                  >
                    Download Image
                  </button>
                </div>
              ) : (
                <button
                  onClick={captureImage}
                  disabled={capturingImage}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border)' }}
                >
                  {capturingImage ? 'Capturing...' : 'Capture Chart Image'}
                </button>
              )}
              <p className="text-[10px] mt-1" style={{ color: 'var(--text-placeholder)' }}>
                Tip: Download the image and attach it to your tweet for maximum engagement.
              </p>
            </div>

            {/* Regenerate */}
            <div className="flex gap-2 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <button
                onClick={generate}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium rounded-lg disabled:opacity-50 transition-colors"
                style={{ color: 'var(--primary)', border: '1px solid var(--primary)' }}
              >
                {loading ? 'Regenerating...' : 'Regenerate'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
