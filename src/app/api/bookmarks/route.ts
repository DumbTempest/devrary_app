import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/Users";
import { getServerSession } from "next-auth";
import { options } from "../auth/[...nextauth]/options";

export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { bookId, action } = await req.json();

    if (!bookId || !action) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (action === "add") {
      if (!user.bookmarks.includes(bookId)) {
        user.bookmarks.push(bookId);
      }
    }

    if (action === "remove") {
      user.bookmarks = user.bookmarks.filter(
        (id: string) => id !== bookId
      );
    }

    await user.save();

    return NextResponse.json({
      success: true,
      bookmarks: user.bookmarks,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}