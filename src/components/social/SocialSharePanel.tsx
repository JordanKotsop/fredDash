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
    <div className="bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Share to Social</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* Tone Selector */}
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Tone</p>
          <div className="flex flex-col sm:flex-row gap-2">
            {TONES.map((t) => (
              <button
                key={t.value}
                onClick={() => { setTone(t.value); setPost(null); }}
                className={`flex-1 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs rounded-lg border transition-all ${
                  tone === t.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                }`}
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
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-600 dark:text-gray-400">Generate thread (3-5 tweets)</span>
        </label>

        {/* Generate button */}
        {!post && (
          <button
            onClick={generate}
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Generate Post'}
          </button>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
        )}

        {/* Post Preview */}
        {post && (
          <div className="space-y-3">
            {/* Single tweet preview */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-2.5 sm:p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 dark:bg-gray-700 rounded-full" />
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-gray-100">You</p>
                  <p className="text-[10px] text-gray-500">@yourusername</p>
                </div>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                {post.single_tweet}
              </p>
              <p className="text-sm text-blue-500 mt-1">
                {post.hashtags.join(' ')}
              </p>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                <span className={`text-[10px] ${charCount > 280 ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                  {charCount}/280
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => copyText(fullTweet, 'tweet')}
                    className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded transition-colors"
                  >
                    {copied === 'tweet' ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => openInTwitter(fullTweet)}
                    className="px-2 py-1 text-[10px] font-medium text-white bg-black rounded hover:bg-gray-800 transition-colors"
                  >
                    Post on X
                  </button>
                </div>
              </div>
            </div>

            {/* Thread preview */}
            {post.thread && post.thread.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Thread Preview</p>
                <div className="space-y-2">
                  {post.thread.map((tweet, i) => (
                    <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex gap-2">
                      <span className="text-[10px] font-bold text-blue-500 shrink-0 mt-0.5">{i + 1}/</span>
                      <div className="min-w-0">
                        <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">{tweet}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] ${tweet.length > 280 ? 'text-red-500' : 'text-gray-400'}`}>
                            {tweet.length}/280
                          </span>
                          <button
                            onClick={() => copyText(tweet, `thread-${i}`)}
                            className="text-[10px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                  className="mt-2 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {copied === 'full-thread' ? 'Copied!' : 'Copy Full Thread'}
                </button>
              </div>
            )}

            {/* LinkedIn post */}
            {post.linkedin_post && (
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">LinkedIn</p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                  <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {post.linkedin_post}
                  </p>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={() => copyText(post.linkedin_post!, 'linkedin')}
                      className="px-2 py-1 text-[10px] font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded transition-colors"
                    >
                      {copied === 'linkedin' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Chart image */}
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Chart Image (1200x675)</p>
              {chartImageUrl ? (
                <div>
                  <img src={chartImageUrl} alt="Chart preview" className="w-full rounded-lg border border-gray-200 dark:border-gray-800" />
                  <button
                    onClick={() => downloadImage(chartImageUrl, `fredDash-${chartTitle.toLowerCase().replace(/\s+/g, '-').slice(0, 30)}.png`)}
                    className="mt-2 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    Download Image
                  </button>
                </div>
              ) : (
                <button
                  onClick={captureImage}
                  disabled={capturingImage}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors"
                >
                  {capturingImage ? 'Capturing...' : 'Capture Chart Image'}
                </button>
              )}
              <p className="text-[10px] text-gray-400 mt-1">
                Tip: Download the image and attach it to your tweet for maximum engagement.
              </p>
            </div>

            {/* Regenerate */}
            <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={generate}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-blue-600 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 disabled:opacity-50 transition-colors"
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
