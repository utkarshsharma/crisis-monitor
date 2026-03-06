import { NextResponse } from "next/server";

export const revalidate = 120; // ISR: one upstream call per 2min shared across all users

// Extract images from RSS feeds (same sources as news API but focused on media)
const RSS_FEEDS = [
  { name: "BBC Middle East", url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml" },
  { name: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { name: "Reuters World", url: "https://feeds.reuters.com/Reuters/worldNews" },
];

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(
    `<${tag}[^>]*><!\\[CDATA\\[(.+?)\\]\\]></${tag}>|<${tag}[^>]*>([^<]*)</${tag}>`,
    "s"
  );
  const match = xml.match(regex);
  return (match?.[1] || match?.[2] || "").trim();
}

function extractImageUrl(itemXml: string): string {
  // Try media:content
  const mediaMatch = itemXml.match(/<media:content[^>]+url="([^"]+)"/);
  if (mediaMatch) return mediaMatch[1];

  // Try media:thumbnail
  const thumbMatch = itemXml.match(/<media:thumbnail[^>]+url="([^"]+)"/);
  if (thumbMatch) return thumbMatch[1];

  // Try enclosure
  const encMatch = itemXml.match(/<enclosure[^>]+url="([^"]+)"[^>]+type="image/);
  if (encMatch) return encMatch[1];

  // Try image tag in description
  const descImgMatch = itemXml.match(/<description[^>]*>[\s\S]*?<img[^>]+src="([^"]+)"/);
  if (descImgMatch) return descImgMatch[1];

  // Try og:image style or any img src in content
  const contentImgMatch = itemXml.match(/src="(https?:\/\/[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
  if (contentImgMatch) return contentImgMatch[1];

  return "";
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

const CRISIS_KEYWORDS = [
  "iran", "iraq", "israel", "dubai", "uae", "gulf", "missile", "drone",
  "strike", "bomb", "military", "war", "attack", "nuclear", "tehran",
  "hormuz", "navy", "explosion", "conflict",
];

async function fetchFeedImages(
  feedUrl: string,
  sourceName: string
): Promise<{ imageUrl: string; title: string; source: string; url: string; datetime: string }[]> {
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

    return items
      .map((item) => {
        const title = extractTag(item, "title");
        const url = extractTag(item, "link");
        const imageUrl = extractImageUrl(item);
        const datetime = extractTag(item, "pubDate");
        return { imageUrl, title, source: sourceName, url, datetime };
      })
      .filter((item) => {
        if (!item.imageUrl || !item.title) return false;
        const lower = item.title.toLowerCase();
        return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
      });
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const results = await Promise.allSettled(
      RSS_FEEDS.map((f) => fetchFeedImages(f.url, f.name))
    );

    const allImages: { imageUrl: string; title: string; source: string; url: string; datetime: string }[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") {
        allImages.push(...result.value);
      }
    }

    // Deduplicate by image URL
    const seen = new Set<string>();
    const unique = allImages.filter((img) => {
      if (seen.has(img.imageUrl)) return false;
      seen.add(img.imageUrl);
      return true;
    });

    return NextResponse.json({ images: unique.slice(0, 12) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to fetch images", details: message },
      { status: 500 }
    );
  }
}
