import { connectDB } from "../../../../lib/mongodb";
import Book from "@/lib/models/book";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { bookID } = await params;
        const book = await Book.findOne({ _id: bookID }).lean();
        if (!book) {
            return NextResponse.json({ error: "Book not found" }, { status: 404 });
        }
        console.log(book);
        return NextResponse.json(book);
    } catch (error) {
        console.error("Error fetching book:", error);
        return NextResponse.json({ error: "Failed to fetch book data" }, { status: 500 });
    }
}