import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/book";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

const LANGUAGE_MAP: Record<string, number> = {
  javascript: 0,
  typescript: 1,
  go: 2,
  "c++": 3,
  rust: 4,
  python: 5,
};

export async function POST(req: Request) {
    try {
        await connectDB();

        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        const {
            name,
            description,
            author,
            duration,
            variant,
            tags,
            pages,
            difficulty,
            domain,
            language,
        } = body;

        const langCode = LANGUAGE_MAP[language?.toLowerCase() || "javascript"] ?? 0;

        const randomNum = Math.floor(Math.random() * 1000); // prevents collisions

        const _id = `draft_${difficulty}b${randomNum}-${domain}-${langCode}`.toLowerCase();

        // create book
        const newBook = await Book.create({
            _id,
            name,
            description,
            author,
            duration,
            variant,
            tags,
            pages,
            creator: session.user.email,
            status: "draft",
        });

        return NextResponse.json({
            success: true,
            book: newBook,
        });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}