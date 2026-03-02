"use client";

import { useSmartPoll } from "@/lib/useSmartPoll";

/* Lightweight Twitter/X trending posts panel.
   Fetches crisis news and displays them styled as social-media-style posts
   with trending hashtags. */

interface TrendingPost {
  text: string;
  source: string;
  url: string;
  time: string;
  hashtags: string[];
}

const HASHTAGS = [
  "#Iran", "#IranWar", "#Tehran", "#OperationEpicFury",
  "#StraitOfHormuz", "#IRGC", "#MiddleEast", "#Dubai",
];

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function extractHashtags(title: string): string[] {
  const tags: string[] = [];
  const lower = title.toLowerCase();
  if (lower.includes("iran")) tags.push("#Iran");
  if (lower.includes("tehran")) tags.push("#Tehran");
  if (lower.includes("missile") || lower.includes("strike")) tags.push("#IranWar");
  if (lower.includes("dubai") || lower.includes("uae")) tags.push("#Dubai");
  if (lower.includes("hormuz")) tags.push("#StraitOfHormuz");
  if (lower.includes("irgc")) tags.push("#IRGC");
  if (lower.includes("nuclear")) tags.push("#Nuclear");
  if (lower.includes("drone")) tags.push("#Drones");
  return tags.slice(0, 3);
}

const transformPosts = (raw: unknown): TrendingPost[] => {
  const data = raw as { articles?: { title: string; source: string; url: string; datetime: string }[] };
  return (data.articles ?? []).slice(0, 12).map((a) => ({
    text: a.title,
    source: a.source,
    url: a.url,
    time: a.datetime,
    hashtags: extractHashtags(a.title),
  }));
};

export default function TwitterPanel() {
  const { data, loading } = useSmartPoll<TrendingPost[]>(
    "/api/news",
    10000,
    transformPosts
  );

  const posts = data ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable posts */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-3 bg-[#1e293b] rounded w-1/3 mb-2" />
                <div className="h-3 bg-[#1e293b] rounded w-full mb-1" />
                <div className="h-3 bg-[#1e293b] rounded w-4/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-[#1e293b]">
            {posts.map((post, i) => (
              <a
                key={`${post.url}-${i}`}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2.5 hover:bg-[#1a2234] transition-colors group"
              >
                {/* Source + time */}
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-5 h-5 rounded-full bg-[#1e293b] flex items-center justify-center flex-shrink-0">
                    <span className="text-[8px] font-bold text-[#64748b]">
                      {post.source[0]}
                    </span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#e2e8f0] truncate">
                    {post.source}
                  </span>
                  <span className="text-[10px] text-[#475569]">
                    · {timeAgo(post.time)}
                  </span>
                </div>
                {/* Post text */}
                <p className="text-[11px] text-[#c8d1dc] leading-relaxed line-clamp-2 group-hover:text-white transition-colors">
                  {post.text}
                </p>
                {/* Hashtags */}
                {post.hashtags.length > 0 && (
                  <div className="flex gap-1.5 mt-1.5">
                    {post.hashtags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] text-[#3b82f6] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Trending hashtags bar */}
      <div className="flex-shrink-0 border-t border-[#1e293b] px-3 py-2">
        <div className="text-[9px] uppercase tracking-wider text-[#64748b] mb-1.5">
          Trending on X
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HASHTAGS.map((tag) => (
            <a
              key={tag}
              href={`https://x.com/search?q=${encodeURIComponent(tag)}&f=live`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded-full text-[10px] font-medium
                         bg-[#1e293b] text-[#3b82f6] hover:bg-[#263348] hover:text-[#60a5fa]
                         border border-[#2d3f57] transition-colors"
            >
              {tag}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
