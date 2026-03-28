import React from "react";

type PageSection = {
  type: "text" | "list" | "highlight";
  content: any;
};

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
export { Page };