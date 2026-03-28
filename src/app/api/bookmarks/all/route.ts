import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/Users";
import { getServerSession } from "next-auth";
import { options } from "../../auth/[...nextauth]/options";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(options);

    if (!session?.user?.email) {
      return NextResponse.json({ bookmarks: [] });
    }

    const user = await User.findOne({ email: session.user.email });

    return NextResponse.json({
      bookmarks: user?.bookmarks || [],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ bookmarks: [] });
  }
}