import { NextResponse } from "next/server";

export const revalidate = 120; // ISR: one upstream call per 2min shared across all users

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  datetime: string;
  description: string;
}

// RSS feeds from major outlets covering Middle East
const RSS_FEEDS = [
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews" },
  { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
  { name: "AP News", url: "https://rsshub.app/apnews/topics/world-news" },
];

// Simple XML tag extractor (avoids needing an XML parser dependency)
function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[(.+?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`, "s");
  const match = xml.match(regex);
  return (match?.[1] || match?.[2] || "").trim();
}

function extractItems(xml: string): string[] {
  const items: string[] = [];
  let pos = 0;
  while (true) {
    const start = xml.indexOf("<item", pos);
    if (start === -1) break;
    const end = xml.indexOf("</item>", start);
    if (end === -1) break;
    items.push(xml.substring(start, end + 7));
    pos = end + 7;
  }
  return items;
}

async function fetchRSS(feedUrl: string, sourceName: string): Promise<NewsArticle[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);
    const res = await fetch(feedUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "CrisisMonitor/1.0" },
    });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const xml = await res.text();
    const items = extractItems(xml);

    return items.slice(0, 10).map((item) => ({
      title: extractTag(item, "title"),
      url: extractTag(item, "link"),
      source: sourceName,
      datetime: extractTag(item, "pubDate"),
      description: extractTag(item, "description").replace(/<[^>]+>/g, "").slice(0, 200),
    })).filter((a) => a.title && a.url);
  } catch {
    return [];
  }
}

// GDELT as backup/supplement
async function fetchGDELT(): Promise<NewsArticle[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const url = "https://api.gdeltproject.org/api/v2/doc/doc?query=iran+dubai+gulf&mode=ArtList&maxrecords=15&format=json&sort=DateDesc&timespan=24h";
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    return (data.articles ?? []).map((a: { title?: string; url?: string; source?: string; seendate?: string }) => ({
      title: a.title ?? "",
      url: a.url ?? "",
      source: a.source ?? "GDELT",
      datetime: a.seendate ?? "",
      description: "",
    })).filter((a: NewsArticle) => a.title && a.url);
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    // Fetch all sources in parallel
    const results = await Promise.allSettled([
      ...RSS_FEEDS.map((f) => fetchRSS(f.url, f.name)),
      fetchGDELT(),
    ]);

    const allArticles: NewsArticle[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allArticles.push(...result.value);
      }
    }

    // Sort by date (newest first), deduplicate by URL
    const seen = new Set<string>();
    const unique = allArticles.filter((a) => {
      if (seen.has(a.url)) return false;
      seen.add(a.url);
      return true;
    });

    unique.sort((a, b) => {
      const da = new Date(a.datetime).getTime() || 0;
      const db = new Date(b.datetime).getTime() || 0;
      return db - da;
    });

    return NextResponse.json({ articles: unique.slice(0, 50) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch news", details: message },
      { status: 500 }
    );
  }
}
