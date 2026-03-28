import { useEffect, useRef, useState } from "react";
import HTMLFlipBookBase from "react-pageflip";
import { Cover } from "./cover";
import { Page } from "./page";

const HTMLFlipBook = HTMLFlipBookBase as any;

const BOOK_W = 1200;
const BOOK_H = 700;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 2.0;

type PageSection =
  | { type: "text"; content: string }
  | { type: "list"; content: string[] }
  | { type: "highlight"; content: string }
  | { type: "video"; content: string }
  | {
    type: "audio";
    content: string | { src: string; title?: string };
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
  CoverImage?: string;
  BackcoverImage?: string;
};

export function FlipbookPreview({
  data
}: {
  data: BookData;
}) {
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
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    setBookData(data);
    setTotalPages(data.pages.length + 2); // cover + pages + back cover 
  }, [data]);

  if (!bookMeta) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center gap-3 bg-neutral-950">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400 text-sm tracking-wide">Loading book…</p>
      </div>
    );
  }

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

            // ✅ stop all audio when flipping
            document.querySelectorAll("audio").forEach((a) => {
              a.pause();
              a.currentTime = 0;
            });
          }}
        >
          <Cover
            title={bookMeta.name}
            author={bookMeta.author}
            subtitle={bookMeta.description}
            coverImage={bookMeta.CoverImage || "/covers/default-cover.png"}
          />

          {bookMeta.pages.map((page, index) => (
            <Page
              key={index}
              number={index + 1}
              title={page.title}
              sections={page.sections || []}
            />
          ))}

          <Cover
            title="The End"
            subtitle={`Thank you for reading ${bookMeta.name}`}
            author={bookMeta.author}
            coverImage={bookMeta.BackcoverImage || "/covers/default-cover.png"}
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