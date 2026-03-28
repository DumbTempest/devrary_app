"use client";

import { useSearchParams } from "next/navigation";
import defautBook from "../../app/api/books/[bookID]/defaultBook.json";
import { motion } from "framer-motion";


type Book = {
  _id: string;
  name?: string;
  author?: string;
}

interface BookIndexPanelProps {
  books: Book[] | null;
  onBookOpen: (bookId: string, color: string) => void;
}

export default function BookIndexPanel({
  books,
  onBookOpen,
}: BookIndexPanelProps) {
  const searchParams = useSearchParams();
  //const router = useRouter();
  //const pathname = usePathname();

  const currentBookId = searchParams.get("bookId");
  const shelf = searchParams.get("shelf");

  if (!shelf) return null;

  const shelfBooks =
    books && books.length > 0
      ? books.map((book) => [book._id, book] as const)
      : Object.entries(defautBook)
          .filter(([id]) => {
            const parts = id.split("-");
            const shelfId = parts[parts.length - 1]; // last part = shelf index
            return Number(shelfId) + 1 === Number(shelf);
          })
          .sort((a, b) => {
            const aIndex = Number(a[0].split("-").pop());
            const bIndex = Number(b[0].split("-").pop());
            return aIndex - bIndex;
          });

  if (shelfBooks.length === 0) return null;

  // handlers
  const handleOpenBook = (id: string) => {
    const color = "#FF6D1F";
    onBookOpen(id, color);
  };

  //ui
  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="
        absolute right-10 top-28
        w-[400px] max-h-[66vh] overflow-y-auto
        bg-[#F5E7C6]
        border-4 border-[#222222]
        rounded-[30px]
        shadow-[10px_10px_0px_0px_#222222]
        p-6
        z-50
      "
    >
      <h2 className="text-xl font-bold text-[#222222] mb-5 text-center">
        Shelf {shelf} Index
      </h2>

      <div className="space-y-3">
        {shelfBooks.map(([id, data], index) => {
          const isActive = id === currentBookId;

          return (
            <div
              key={id}
              onClick={() => handleOpenBook(id)}
              className={`
                p-3
                rounded-2xl
                border-4 border-[#222222]
                transition-all
                ${
                  isActive
                    ? "bg-[#FF6D1F] text-white shadow-[6px_6px_0px_0px_#222222]"
                    : "bg-white shadow-[6px_6px_0px_0px_#222222] hover:translate-x-1 hover:translate-y-1 hover:shadow-none cursor-pointer"
                }
              `}
            >
              <div className="font-bold text-base">
                {index + 1}. {data?.name || id}
              </div>

              <div
                className={`text-sm mt-1 ${
                  isActive ? "text-white/90" : "text-gray-600"
                }`}
              >
                {data?.author || "Unknown Author"}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}