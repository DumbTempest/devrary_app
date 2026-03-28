import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/book";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

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
      pages
    } = body;

    const _id = `draft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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