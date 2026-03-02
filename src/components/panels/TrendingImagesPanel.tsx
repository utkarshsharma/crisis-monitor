"use client";

import { useEffect, useState, useCallback, useRef } from "react";

interface NewsImage {
  imageUrl: string;
  title: string;
  source: string;
  url: string;
  datetime: string;
}

export default function TrendingImagesPanel() {
  const [images, setImages] = useState<NewsImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set());
  const [offset, setOffset] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchImages = useCallback(async () => {
    try {
      const res = await fetch("/api/images");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setImages(data.images ?? []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchImages();
    const interval = setInterval(fetchImages, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchImages]);

  const handleImageError = (url: string) => {
    setFailedUrls((prev) => new Set(prev).add(url));
  };

  const visibleImages = images.filter((img) => !failedUrls.has(img.imageUrl)).slice(0, 10);
  const count = visibleImages.length;

  // Auto-advance by 1 image every 4 seconds
  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (count <= 2) return;
    timerRef.current = setInterval(() => {
      setOffset((prev) => (prev + 1) % count);
    }, 4000);
  }, [count]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const goNext = () => {
    if (count <= 2) return;
    setOffset((prev) => (prev + 1) % count);
    resetTimer();
  };

  const goPrev = () => {
    if (count <= 2) return;
    setOffset((prev) => (prev - 1 + count) % count);
    resetTimer();
  };

  // Get the two images currently visible
  const safeOffset = count > 0 ? offset % count : 0;
  const leftImage = visibleImages[safeOffset];
  const rightImage = count > 1 ? visibleImages[(safeOffset + 1) % count] : null;

  const ImageCard = ({ img, side }: { img: NewsImage; side: "left" | "right" }) => (
    <a
      href={img.url}
      target="_blank"
      rel="noopener noreferrer"
      className="relative block w-1/2 h-full overflow-hidden group"
      style={{ borderRight: side === "left" ? "1px solid #1e293b" : undefined }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={img.imageUrl}
        alt={img.title}
        onError={() => handleImageError(img.imageUrl)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Gradient + title */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 flex flex-col justify-end p-2">
        <p className="text-[10px] leading-snug text-white font-medium line-clamp-2 drop-shadow-lg">
          {img.title}
        </p>
        <p className="text-[8px] text-[#94a3b8] mt-0.5">
          {img.source}
        </p>
      </div>
      {/* Source badge */}
      <div className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded bg-black/70 text-[7px] text-[#94a3b8] uppercase tracking-wider font-medium">
        {img.source}
      </div>
    </a>
  );

  return (
    <div className="flex flex-col h-full">
      {loading ? (
        <div className="flex-1 flex gap-0.5 m-2">
          <div className="w-1/2 bg-[#1a2234] animate-pulse rounded" />
          <div className="w-1/2 bg-[#1a2234] animate-pulse rounded" />
        </div>
      ) : count === 0 ? (
        <div className="flex-1 flex items-center justify-center text-[#475569] text-xs">
          No images available
        </div>
      ) : (
        <>
          {/* Two images side by side */}
          <div className="relative flex-1 min-h-0 flex overflow-hidden">
            {leftImage && <ImageCard img={leftImage} side="left" />}
            {rightImage && <ImageCard img={rightImage} side="right" />}

            {/* Prev / Next arrows */}
            {count > 2 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); goPrev(); }}
                  className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors z-10"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); goNext(); }}
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-colors z-10"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              </>
            )}

            {/* Slide counter */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-black/70 text-[8px] text-white font-mono tabular-nums z-10">
              {safeOffset + 1}–{((safeOffset + 1) % count) + 1} / {count}
            </div>
          </div>

          {/* Dot indicators */}
          <div className="flex items-center justify-center gap-1 py-1.5 border-t border-[#1e293b]">
            {visibleImages.map((_, i) => (
              <button
                key={i}
                onClick={() => { setOffset(i); resetTimer(); }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === safeOffset || i === (safeOffset + 1) % count
                    ? "bg-[#06b6d4] w-3"
                    : "bg-[#334155] hover:bg-[#475569] w-1.5"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
