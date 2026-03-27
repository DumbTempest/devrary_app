import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/book";
export async function GET(req: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.trim() === "") {
      return NextResponse.json([]);
    }

    const results = await Book.aggregate([
      {
        $search: {
          index: "search",
          compound: {
            should: [
              {
                autocomplete: {
                  query,
                  path: "name",
                  fuzzy: { maxEdits: 1 }
                }
              },
              {
                autocomplete: {
                  query,
                  path: "description",
                  fuzzy: { maxEdits: 1 }
                }
              },
              {
                autocomplete: {
                  query,
                  path: "author",
                  fuzzy: { maxEdits: 1 }
                }
              }
            ]
          }
        }
      },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          name: 1,
          author: 1,
          description: 1,
          score: { $meta: "searchScore" }
        }
      }
    ]);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}