import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Book from "@/lib/models/book";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";
import User from "@/lib/models/Users";

export async function POST(req: Request) {
    await connectDB();

    const session = await getServerSession(options);

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user || user.role !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { draftId } = await req.json();

    await Book.findByIdAndDelete(draftId);

    return NextResponse.json({ success: true });
}