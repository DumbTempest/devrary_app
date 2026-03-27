"use client";

import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBookBase from "react-pageflip";
import Image from "next/image";
import booksData from "../../../config.json";

const HTMLFlipBook = HTMLFlipBookBase as any;

type PageSection = {
  type: "text" | "list" | "highlight";
  content: any;
};

type BookData = {
  name: string;
  description: string;
  author: string;
  duration: string;
  variant: string;
  tags: string[];
  pages: Array<{
    title: string;
    sections: PageSection[];
  }>;
};

const DEFAULT_COVER = "/covers/default-cover.png";

/* ───────────── COVER ───────────── */
const Cover = React.forwardRef<HTMLDivElement, any>(
  ({ title, subtitle, author, coverImage = DEFAULT_COVER }, ref) => (
    <div
      ref={ref}
      data-density="hard"
      className="w-[600px] h-[700px] flex flex-col items-center justify-center relative overflow-hidden select-none rounded-lg"
      style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.5)" }}
    >
      <Image src={coverImage} alt="Book Cover" fill className="object-cover" />
      {/* gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      <div className="relative z-10 text-center px-12 text-white flex flex-col items-center gap-4">
        <div className="w-12 h-[2px] bg-amber-400 mb-2" />
        <h1 className="text-4xl font-bold leading-tight tracking-tight font-serif">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg text-white/80 font-serif italic">{subtitle}</p>
        )}
        {author && (
          <p className="text-base text-amber-300 font-medium mt-2">by {author}</p>
        )}
        <div className="w-12 h-[2px] bg-amber-400 mt-2" />
        <div className="mt-4 text-xs tracking-widest uppercase text-white/50">
          Web Development Library
        </div>
      </div>
    </div>
  )
);
Cover.displayName = "Cover";

/* ───────────── PAGE ───────────── */
const Page = React.forwardRef<HTMLDivElement, any>(
  ({ number, title, sections }, ref) => (
    <div
      ref={ref}
      className="w-[600px] h-[700px] bg-[#faf8f2] text-neutral-900 flex flex-col relative overflow-hidden rounded-lg"
    >
      {/* Left binding strip */}
      <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-[#e8e2d4] to-[#f0ece2]" />
      {/* Subtle top rule */}
      <div className="absolute top-0 left-10 right-0 h-[3px] bg-amber-400/60" />

      <div className="flex-1 pl-16 pr-10 pt-10 pb-12 overflow-hidden flex flex-col">
        {/* Page title — centered */}
        <h2 className="text-xl font-bold mb-6 pb-3 border-b border-neutral-200 text-center font-serif tracking-wide text-neutral-800">
          {title}
        </h2>

        {/* Sections */}
        <div className="flex-1 overflow-hidden text-[14.5px] leading-relaxed font-serif space-y-4">
          {sections.map((section: PageSection, idx: number) => {
            switch (section.type) {
              case "text":
                return (
                  <p key={idx} className="text-neutral-700 text-center">
                    {section.content}
                  </p>
                );

              case "list":
                return (
                  <ul
                    key={idx}
                    className="list-none space-y-2 text-neutral-700 mx-auto w-fit max-w-full"
                  >
                    {section.content.map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1 text-amber-500 font-bold shrink-0">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );

              case "highlight":
                return (
                  <pre
                    key={idx}
                    className="bg-neutral-900 text-emerald-400 p-4 rounded-lg text-[12.5px] overflow-auto font-mono border border-neutral-700 leading-relaxed"
                  >
                    {section.content}
                  </pre>
                );

              default:
                return null;
            }
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-0 left-10 right-0 h-10 flex items-center justify-between px-4 border-t border-neutral-200">
        <span className="text-[10px] tracking-widest uppercase text-neutral-400">
          Web Dev Library
        </span>
        <span className="text-xs text-neutral-400 font-medium">{number}</span>
      </div>
    </div>
  )
);
Page.displayName = "Page";

/* ───────────── FLIPBOOK ───────────── */
const BOOK_W = 1200; // two pages side by side
const BOOK_H = 700;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.0;

export default function Flipbook({
  bookId,
  onClose,
}: {
  bookId: string;
  onClose?: () => void;
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [bookMeta, setBookData] = useState<BookData | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  // Auto-fit zoom whenever container or book changes
  const computeFit = () => {
    if (!containerRef.current) return;
    const { clientWidth: cw, clientHeight: ch } = containerRef.current;
    const padding = 96; // room for top/bottom controls
    const scaleW = cw / BOOK_W;
    const scaleH = (ch - padding) / BOOK_H;
    const fit = parseFloat(Math.min(scaleW, scaleH, 1).toFixed(3));
    setZoom(fit);
  };

  useEffect(() => {
    computeFit();
    const ro = new ResizeObserver(computeFit);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [bookMeta]); // rerun once book data arrives

  // Ctrl+Scroll wheel zoom
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      setZoom((z) =>
        parseFloat(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z + delta)).toFixed(3))
      );
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [bookMeta]);

  // ── Page navigation helpers ──
  const flipNext = () => flipBookRef.current?.pageFlip().flipNext();
  const flipPrev = () => flipBookRef.current?.pageFlip().flipPrev();

  // Keyboard: ←/→ arrows + A/D + Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") flipNext();
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") flipPrev();
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const fetchBookData = async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setBookData(data);
        setTotalPages(data.pages.length + 2); // cover + pages + back cover
      } else {
        console.error("Failed to fetch book data");
      }
    };
    fetchBookData();
  }, [bookId]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setIsBookmarked(stored.includes(bookId));
  }, [bookId]);

  if (!bookMeta) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-neutral-950">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm tracking-wide">Loading book…</p>
      </div>
    );
  }

  const toggleBookmark = () => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    const updated = stored.includes(bookId)
      ? stored.filter((id: string) => id !== bookId)
      : [...stored, bookId];
    setIsBookmarked(!stored.includes(bookId));
    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const speakCurrentPage = () => {
    if (!flipBookRef.current) return;
    const pageFlip = flipBookRef.current.pageFlip();
    const current = pageFlip.getCurrentPageIndex();
    const text = `Page ${current + 1}. ${bookMeta.name}. ${bookMeta.description}`;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onend = () => setSpeaking(false);
    setSpeaking(true);
    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setSpeaking(false);
  };

  return (
    <main
      ref={containerRef}
      className="h-full w-full bg-black flex items-center justify-center relative overflow-hidden"
    >

      {/* ── Top-right: read aloud + close ── */}
      <div className="absolute top-5 left-5 z-50 flex items-center gap-2 
  px-3 py-2 rounded-xl 
  bg-black/40 backdrop-blur-md 
  border border-white/20 
  shadow-lg shadow-black/30">

        {/* Bookmark */}
        <button
          onClick={toggleBookmark}
          className={`px-3 py-1.5 rounded-lg font-semibold text-sm transition 
      ${isBookmarked
              ? "bg-green-500 text-white"
              : "bg-white/80 text-black hover:bg-white"
            }`}
        >
          {isBookmarked ? "✅ Saved" : "Save"}
        </button>

        {/* Read aloud / Stop */}
        {!speaking ? (
          <button
            onClick={speakCurrentPage}
            className="px-3 py-1.5 rounded-lg font-semibold text-sm transition 
        bg-white/80 text-black hover:bg-white"
          >
            Read
          </button>
        ) : (
          <button
            onClick={stopSpeaking}
            className="px-3 py-1.5 rounded-lg font-semibold text-sm transition 
        bg-red-500 text-white hover:bg-red-600"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* ── Left arrow ── */}
      <button
        onClick={flipPrev}
        title="Previous page (← or A)"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-50 group 
    flex items-center justify-center 
    w-12 h-20 rounded-2xl 
    bg-black/30 backdrop-blur-md 
    border border-white/20 
    shadow-md shadow-black/30 
    hover:bg-black/50 transition-all duration-200"
      >
        <span className="text-white/70 group-hover:text-white text-2xl transition-all duration-200 group-hover:-translate-x-0.5">
          ‹
        </span>
      </button>

      {/* ── Right arrow ── */}
      <button
        onClick={flipNext}
        title="Next page (→ or D)"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-50 group 
    flex items-center justify-center 
    w-12 h-20 rounded-2xl 
    bg-black/30 backdrop-blur-md 
    border border-white/20 
    shadow-md shadow-black/30 
    hover:bg-black/50 transition-all duration-200"
      >
        <span className="text-white/70 group-hover:text-white text-2xl transition-all duration-200 group-hover:translate-x-0.5">
          ›
        </span>
      </button>

      {/* ── Scaled flipbook wrapper ── */}
      <div
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "center center",
          width: BOOK_W,
          height: BOOK_H,
          flexShrink: 0,
        }}
      >
        <HTMLFlipBook
          ref={flipBookRef}
          width={600}
          height={700}
          size="fixed"
          drawShadow
          flippingTime={900}
          showCover
          mobileScrollSupport
          onFlip={(e: any) => {
            setCurrentPage(e.data);
            speechSynthesis.cancel();
            setSpeaking(false);
          }}
        >
          <Cover
            title={bookMeta.name}
            author={bookMeta.author}
            coverImage="/covers/default-cover.png"
          />

          {bookMeta.pages.map((page, index) => (
            <Page
              key={index}
              number={index + 1}
              title={page.title}
              sections={page.sections}
            />
          ))}

          <Cover
            title="The End"
            subtitle={`Thank you for reading ${bookMeta.name}`}
            author={bookMeta.author}
            coverImage="/covers/default-cover.png"
          />
        </HTMLFlipBook>
      </div>

      {/* ── Bottom bar: zoom controls + page counter + keyboard hint ── */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 
  px-3 py-2 rounded-xl 
  bg-black/40 backdrop-blur-md 
  border border-white/20 
  shadow-lg shadow-black/30">

        {/* Zoom out */}
        <button
          onClick={() =>
            setZoom((z) =>
              parseFloat(Math.max(ZOOM_MIN, z - ZOOM_STEP).toFixed(3))
            )
          }
          disabled={zoom <= ZOOM_MIN}
          className="w-8 h-8 rounded-lg 
      bg-white/80 text-black 
      hover:bg-white 
      disabled:opacity-30 
      text-lg font-bold 
      flex items-center justify-center 
      transition"
          title="Zoom out"
        >
          −
        </button>

        {/* Zoom % / fit reset */}
        <button
          onClick={computeFit}
          className="px-3 py-1 rounded-lg 
      bg-white/10 hover:bg-white/20 
      text-white 
      text-xs font-mono 
      transition min-w-[56px] text-center 
      border border-white/20"
          title="Reset to fit"
        >
          {Math.round(zoom * 100)}%
        </button>

        {/* Zoom in */}
        <button
          onClick={() =>
            setZoom((z) =>
              parseFloat(Math.min(ZOOM_MAX, z + ZOOM_STEP).toFixed(3))
            )
          }
          disabled={zoom >= ZOOM_MAX}
          className="w-8 h-8 rounded-lg 
      bg-white/80 text-black 
      hover:bg-white 
      disabled:opacity-30 
      text-lg font-bold 
      flex items-center justify-center 
      transition"
          title="Zoom in"
        >
          +
        </button>

        <div className="w-px h-5 bg-white/30" />

        {/* Page counter */}
        <span className="text-white text-xs tracking-widest font-mono">
          {currentPage + 1} / {totalPages}
        </span>

        <div className="w-px h-5 bg-white/30" />

        {/* Keyboard hint */}
        <span className="text-white/70 text-[10px] tracking-wide hidden sm:block">
          ← → or A D · Ctrl+scroll · Esc
        </span>
      </div>
    </main>
  );
}