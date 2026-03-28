import React from "react";
import Image from "next/image";
const DEFAULT_COVER = "/covers/default-cover.png";


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
        {author && (
          <p className="text-base text-amber-300 font-medium mt-2">by {author}</p>
        )}
        <div className="w-12 h-[2px] bg-amber-400 mt-2" />
        {subtitle && (
          <div className="mt-4 text-xs tracking-widest uppercase text-white/50">
            {subtitle}
          </div>
        )}
      </div>
    </div>
  )
);
Cover.displayName = "Cover";
export { Cover };
