import { connectDB } from "../../../lib/mongodb";
import Book from "@/lib/models/book";
import { NextResponse } from "next/server";


export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const shelf = searchParams.get("shelf"); 
        console.log(shelf);
        
        if (shelf) {
            const books = await Book.find({
                _id: { $regex: `-${parseInt(shelf) - 1}$` } // match ending "-0", "-1", etc
            }).lean();

            return NextResponse.json(books);
        }

        return NextResponse.json({ error: "No shelf provided" }, { status: 400 });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}