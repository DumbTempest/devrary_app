import { connectDB } from "../../../../lib/mongodb";
import Book from "@/lib/models/book";
import { NextResponse } from "next/server";
import defaultBook from "./defaultBook.json";

const LANGUAGE_CODE_MAP: Record<string, string> = {
  "0": "javascript",
  "1": "typescript",
  "2": "go",
  "3": "c++",
  "4": "rust",
  "5": "python",
};

const BACK_COVER_COLOR_MAP: Record<string, string> = {
  javascript: "/covers/back-js-yellow.svg",
  js: "/covers/back-js-yellow.svg",
  typescript: "/covers/back-ts-blue.svg",
  ts: "/covers/back-ts-blue.svg",
    go: "/covers/go.png",
  rust: "/covers/back-rust-orange.svg",
  java: "/covers/back-java-offwhite.svg",
  "c++": "/covers/back-cpp-lightblue.svg",
  cpp: "/covers/back-cpp-lightblue.svg",
  python: "/covers/default-cover.png",
};

type NormalizableBook = {
    name?: string;
    description?: string;
    author?: string;
    duration?: string;
    variant?: string;
    tags?: unknown;
    pages?: unknown;
    CoverImage?: string;
    BackcoverImage?: string;
    language?: string;
};

function normalizeBookPayload(input: NormalizableBook, bookID: string) {
    const parts = bookID.split("-");
    const langCode = parts[parts.length - 1];
    const language = LANGUAGE_CODE_MAP[langCode] || null;
    const resolvedCover = language ? BACK_COVER_COLOR_MAP[language] : "/covers/default-cover.png";
    return {
        _id: bookID,
        name: input?.name || "Untitled Book",
        description: input?.description || "No description available.",
        author: input?.author || "Unknown Author",
        duration: input?.duration || "N/A",
        variant: input?.variant || "medium",
        tags: Array.isArray(input?.tags) ? input.tags : [],
        pages: Array.isArray(input?.pages) ? input.pages : [],
        CoverImage: resolvedCover || "/covers/default-back.png",
        BackcoverImage: resolvedCover || "/covers/default-back.png",
        language,
    };
}

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { bookID } = await params;
        const book = await Book.findOne({ _id: bookID }).lean();
        if (!book) {
            const fallbackBook = (defaultBook as NormalizableBook);

            if (!fallbackBook) {
                return NextResponse.json({ error: "Book not found" }, { status: 404 });
            }

            return NextResponse.json(normalizeBookPayload(fallbackBook, bookID));
        }
        // console.log(book);
        return NextResponse.json(normalizeBookPayload(book as unknown as NormalizableBook, bookID));
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json({ error: "Failed to fetch book data" }, { status: 500 });
    }
}