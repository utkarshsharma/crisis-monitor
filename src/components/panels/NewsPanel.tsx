"use client";

import { useMemo } from "react";
import { useSmartPoll } from "@/lib/useSmartPoll";

interface NewsArticle {
  title: string;
  source: string;
  url: string;
  datetime: string;
  description?: string;
}

const CRISIS_KEYWORDS = [
  "iran","iraq","israel","dubai","uae","gulf","missile","drone","strike",
  "bomb","military","war","attack","nuclear","tehran","khamenei","irgc",
  "hormuz","airspace","sanctions","pentagon","centcom","hezbollah","houthi",
  "defense","defence","conflict","crisis","retaliation","escalation",
  "humanitarian","refugee","displacement","navy","naval",
];

function isRelevant(article: NewsArticle): boolean {
  const h = article.title.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => h.includes(kw));
}

function timeAgo(dateString: string): string {
  const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
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

const transform = (raw: unknown) => {
  const data = raw as { articles?: NewsArticle[] };
  return (data.articles ?? []).filter(isRelevant);
};

export default function NewsPanel() {
  const { data: articles, loading, error, lastUpdated } = useSmartPoll<NewsArticle[]>(
    "/api/news",
    10000,
    transform
  );

  const items = articles ?? [];

  const last24hCount = useMemo(() => {
    return items.filter((a) => Date.now() - new Date(a.datetime).getTime() < 86400_000).length;
  }, [items]);

  return (
    <div className="flex flex-col h-full p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#94a3b8]">
            {loading && items.length === 0 ? "Loading..." : `${last24hCount} articles in last 24h`}
          </span>
          {lastUpdated && (
            <span className="text-xs text-[#475569]">
              · {timeAgo(lastUpdated.toISOString())}
            </span>
          )}
        </div>
        {/* Green dot when auto-refreshing */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] animate-pulse" title="Auto-refreshing" />
          <span className="text-[9px] text-[#475569]">LIVE</span>
        </div>
      </div>

      {error && items.length === 0 && (
        <div className="mb-2 px-3 py-2 rounded bg-red-950/40 border border-red-900/50 text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b]">
        {loading && items.length === 0
          ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
          : items.length === 0
          ? (
            <p className="text-sm text-[#475569] text-center py-8">
              No relevant crisis articles found.
            </p>
          )
          : items.map((article, i) => (
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
