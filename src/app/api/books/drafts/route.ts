import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/book";

export async function GET() {
  await connectDB();

  const books = await Book.find({ status: "draft" });

  return NextResponse.json({ books });
}