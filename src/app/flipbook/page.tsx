"use client";

import React, { useRef, useState, useEffect } from "react";
import HTMLFlipBookBase from "react-pageflip";
import Image from "next/image";
import booksData from "../../../config.json"

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

// Default cover image (you can change this)
const DEFAULT_COVER = "/covers/default-cover.png";

const Cover = React.forwardRef<HTMLDivElement, any>(
  ({ title, author, coverImage = DEFAULT_COVER }, ref) => {
    return (
      <div
        ref={ref}
        data-density="hard"
        className="w-[600px] h-[700px] flex flex-col items-center justify-center relative overflow-hidden"
        style={{
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        }}
      >
        <Image
          src={coverImage}
          alt="Book Cover"
          fill
          className="object-cover"
        />
        <div className="bg-black/50 absolute inset-0" />

        <div className="relative z-10 text-center px-10 text-white">
          <h1 className="text-5xl font-bold mb-6 tracking-tight">{title}</h1>
          {author && (
            <p className="text-xl opacity-90">by {author}</p>
          )}
          <div className="mt-12 text-sm opacity-75">Web Development Library</div>
        </div>
      </div>
    );
  }
);

Cover.displayName = "Cover";

const Page = React.forwardRef<HTMLDivElement, any>(
  ({ number, title, sections }, ref) => {
    return (
      <div
        ref={ref}
        className="w-[600px] h-[700px] bg-[#faf8f2] text-neutral-900 flex flex-col relative overflow-hidden"
      >
        {/* Page decoration */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#f0ece2]" />

        <div className="flex-1 pl-16 pr-12 pt-16 pb-12 text-[15.5px] leading-relaxed font-serif">
          <h2 className="text-2xl font-semibold mb-8 border-b border-neutral-300 pb-3">
            {title}
          </h2>

          {sections.map((section: PageSection, idx: number) => {
            switch (section.type) {
              case "text":
                return (
                  <p key={idx} className="mb-5 text-neutral-800">
                    {section.content}
                  </p>
                );

              case "list":
                return (
                  <ul key={idx} className="list-disc pl-6 mb-6 space-y-1.5 text-neutral-800">
                    {section.content.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                );

              case "highlight":
                return (
                  <pre
                    key={idx}
                    className="bg-neutral-900 text-emerald-400 p-5 rounded-lg mb-6 text-sm overflow-auto font-mono border border-neutral-700"
                  >
                    {section.content}
                  </pre>
                );

              default:
                return null;
            }
          })}
        </div>

        {/* Page Number */}
        <div className="absolute bottom-6 right-8 text-xs text-neutral-500 font-medium">
          {number}
        </div>
      </div>
    );
  }
);

Page.displayName = "Page";

export default function Flipbook({ bookId }: { bookId: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const flipBookRef = useRef<any>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [bookMeta, setBookData] = useState<BookData | null>(null);

  // FETCH
  useEffect(() => {
    const fetchBookData = async () => {
      const res = await fetch(`/api/books/${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setBookData(data);
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
      <div className="h-screen w-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  const toggleBookmark = () => {
    const stored = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    let updated;

    if (stored.includes(bookId)) {
      updated = stored.filter((id: string) => id !== bookId);
      setIsBookmarked(false);
    } else {
      updated = [...stored, bookId];
      setIsBookmarked(true);
    }

    localStorage.setItem("bookmarks", JSON.stringify(updated));
  };

  const speakCurrentPage = () => {
    if (!flipBookRef.current) return;

    const pageFlip = flipBookRef.current.pageFlip();
    const current = pageFlip.getCurrentPageIndex();

    // This is a simplified version - you can improve text extraction
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
    <main className="h-screen w-screen bg-black flex items-center justify-center p-4 relative">

      {/* Top Controls */}
      <div className="absolute top-6 right-6 z-50 flex gap-3">
        {!speaking ? (
          <button
            onClick={speakCurrentPage}
            className="px-5 py-2.5 bg-yellow-400 hover:bg-yellow-300 text-black rounded-xl font-semibold transition"
          >
            🔊 Read Aloud
          </button>
        ) : (
          <button
            onClick={stopSpeaking}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      <div className="absolute top-6 left-6 z-50">
        <button
          onClick={toggleBookmark}
          className={`px-5 py-2.5 rounded-xl font-semibold transition ${isBookmarked
            ? "bg-green-500 text-white"
            : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
        >
          {isBookmarked ? "✅ Bookmarked" : "🔖 Bookmark"}
        </button>
      </div>

      {/* Flipbook */}
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
        {/* Front Cover */}
        <Cover
          title={bookMeta.name}
          author={bookMeta.author}
          coverImage="/covers/default-cover.png"
        />

        {/* Dynamic Pages from your data */}
        {bookMeta.pages.map((page, index) => (
          <Page
            key={index}
            number={index + 1}
            title={page.title}
            sections={page.sections}
          />
        ))}

        {/* Back Cover */}
        <Cover
          title="The End"
          subtitle={`Thank you for reading ${bookMeta.name}`}
          author={bookMeta.author}
          coverImage="/covers/default-cover.png"
        />
      </HTMLFlipBook>
    </main>
  );
}