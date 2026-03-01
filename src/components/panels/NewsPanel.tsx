"use client";

import { useEffect, useState, useCallback } from "react";

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  datetime: string;
  description?: string;
}

const CRISIS_KEYWORDS = [
  "iran",
  "iraq",
  "israel",
  "dubai",
  "uae",
  "gulf",
  "missile",
  "drone",
  "strike",
  "bomb",
  "military",
  "war",
  "attack",
  "nuclear",
  "tehran",
  "khamenei",
  "irgc",
  "hormuz",
  "airspace",
  "sanctions",
  "pentagon",
  "centcom",
  "hezbollah",
  "houthi",
  "defense",
  "defence",
  "conflict",
  "crisis",
  "retaliation",
  "escalation",
  "humanitarian",
  "refugee",
  "displacement",
  "navy",
  "naval",
];

function isRelevant(article: NewsArticle): boolean {
  const haystack = article.title.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => haystack.includes(kw));
}

function timeAgo(dateString: string): string {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function SkeletonRow() {
  return (
    <div className="py-3 border-b border-[#1e293b] animate-pulse">
      <div className="h-4 bg-[#1e293b] rounded w-3/4 mb-2" />
      <div className="h-3 bg-[#1e293b] rounded w-1/2" />
    </div>
  );
}

interface NewsPanelProps {
  onRefresh?: () => void;
}

export default function NewsPanel({ onRefresh }: NewsPanelProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchNews = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch("/api/news");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const raw: NewsArticle[] = data.articles ?? data ?? [];
      const filtered = raw.filter(isRelevant);
      setArticles(filtered);
      setLastFetched(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(fetchNews, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchNews]);

  const handleRefresh = () => {
    setLoading(true);
    fetchNews();
    onRefresh?.();
  };

  const last24hCount = articles.filter((a) => {
    const then = new Date(a.datetime).getTime();
    return Date.now() - then < 86400 * 1000;
  }).length;

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8]">
            {loading ? "Loading..." : `${last24hCount} articles in last 24h`}
          </span>
          {lastFetched && !loading && (
            <span className="text-xs text-[#475569]">
              · updated {timeAgo(lastFetched.toISOString())}
            </span>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          title="Refresh news"
          className="flex items-center justify-center w-6 h-6 rounded text-[#94a3b8] hover:text-[#06b6d4] hover:bg-[#1e293b] transition-colors disabled:opacity-40"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
          >
            <path
              fillRule="evenodd"
              d="M13.836 2.477a.75.75 0 0 1 .75.75v3.182a.75.75 0 0 1-.75.75h-3.182a.75.75 0 0 1 0-1.5h1.37l-.84-.841a4.5 4.5 0 0 0-7.08.932.75.75 0 0 1-1.3-.75 6 6 0 0 1 9.44-1.242l.842.84V3.227a.75.75 0 0 1 .75-.75Zm-.911 7.5A.75.75 0 0 1 13.199 11a6 6 0 0 1-9.44 1.241l-.84-.84v1.371a.75.75 0 0 1-1.5 0V9.591a.75.75 0 0 1 .75-.75H5.35a.75.75 0 0 1 0 1.5H3.98l.841.841a4.5 4.5 0 0 0 7.08-.932.75.75 0 0 1 1.025-.273Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-2 px-3 py-2 rounded bg-red-950/40 border border-red-900/50 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : articles.length === 0
          ? (
            <p className="text-sm text-[#475569] text-center py-8">
              No relevant crisis articles found.
            </p>
          )
          : articles.map((article, i) => (
            <a
              key={`${article.url}-${i}`}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-3 border-b border-[#1e293b] hover:bg-[#1a2234] -mx-1 px-1 rounded transition-colors group"
            >
              <p className="text-sm text-[#f1f5f9] leading-snug line-clamp-2 group-hover:text-white transition-colors">
                {article.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs font-medium text-[#06b6d4]">
                  {article.source ?? "Unknown"}
                </span>
                <span className="text-xs text-[#475569]">·</span>
                <span className="text-xs text-[#475569]">
                  {timeAgo(article.datetime)}
                </span>
              </div>
            </a>
          ))}
      </div>
    </div>
  );
}
