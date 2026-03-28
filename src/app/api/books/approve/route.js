import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/book";
import User from "@/lib/models/Users";
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

async function getNextBookNumber(prefix: string) {
    const books = await Book.find({
        _id: { $regex: `^${prefix}` },
    }).select("_id");

    let max = 0;

    books.forEach((b) => {
        const match = b._id.match(/b(\d+)/);
        if (match) {
            const num = parseInt(match[1]);
            if (num > max) max = num;
        }
    });

    return max + 1;
}

export async function POST(req: Request) {
    try {
        await connectDB();

        const session = await getServerSession(options);

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 🔥 check admin role
        const user = await User.findOne({ email: session.user.email });

        if (!user || user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { draftId } = await req.json();

        if (!draftId) {
            return NextResponse.json({ error: "Missing draftId" }, { status: 400 });
        }

        // 🔥 get draft
        const draft = await Book.findById(draftId);

        if (!draft || draft.status !== "draft") {
            return NextResponse.json({ error: "Invalid draft" }, { status: 400 });
        }

        const difficulty = draft.difficulty;
        const domain = draft.domain;
        const language = draft.language || "javascript";

        const langCode = LANGUAGE_MAP[language.toLowerCase()] ?? 0;

        const prefix = `${difficulty}-${domain}`;

        const nextNumber = await getNextBookNumber(prefix);

        const newId = `${difficulty}b${nextNumber}-${domain}-${langCode}`.toLowerCase();

        // 🔥 create new published book
        const newBook = await Book.create({
            ...draft.toObject(),
            _id: newId,
            status: "published",
        });

        // 🔥 delete draft
        await Book.findByIdAndDelete(draftId);

        return NextResponse.json({
            success: true,
            book: newBook,
        });
    } catch (error) {
        console.error("Approve error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}