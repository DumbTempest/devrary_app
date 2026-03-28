import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "next-auth";

import AnimatedSkyNoBirds from "@/components/custom/animated-sky-no-birds";
import Navbar from "@/components/custom/navbar";
import { Card } from "@/components/ui/card";
import { connectDB } from "@/lib/mongodb";
import User from "@/lib/models/Users";
import Book from "@/lib/models/book";
import { options } from "@/app/api/auth/[...nextauth]/options";

type BookPreview = {
  _id: string;
  name: string;
  author: string;
  status: "draft" | "published";
};

type BookRecord = {
  _id: unknown;
  name: string;
  author: string;
  status: "draft" | "published";
};

function formatDate(value?: Date | string) {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const session = await getServerSession(options);

  if (!session?.user?.email) {
    return null;
  }

  await connectDB();

  const user = await User.findOne({ email: session.user.email }).lean();

  const createdBooksRaw = await Book.find({ creator: session.user.email })
    .sort({ updatedAt: -1 })
    .lean();

  const createdBooks: BookPreview[] = createdBooksRaw.map((book: BookRecord) => ({
    _id: String(book._id),
    name: book.name,
    author: book.author,
    status: book.status,
  }));

  const recentBooks = createdBooks.slice(0, 3);
  const bookmarks: string[] = user?.bookmarks || [];

  const bookmarkedBooksRaw =
    bookmarks.length > 0
      ? await Book.find({ _id: { $in: bookmarks } }).lean()
      : [];

  const bookmarkedMap = new Map(
    bookmarkedBooksRaw.map((book: BookRecord) => [
      String(book._id),
      {
        _id: String(book._id),
        name: book.name,
        author: book.author,
        status: book.status,
      },
    ])
  );

  const recentBookmarks: BookPreview[] = bookmarks
    .slice(0, 3)
    .map((id) => bookmarkedMap.get(id))
    .filter(Boolean) as BookPreview[];

  const draftCount = createdBooks.filter((book) => book.status === "draft").length;
  const publishedCount = createdBooks.filter(
    (book) => book.status === "published"
  ).length;

  return (
    <>
      <AnimatedSkyNoBirds />
      <main className="relative min-h-screen w-full p-10 font-tektur overflow-hidden">
        <Navbar />

        <div className="mx-auto mt-8 max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card
            className="
              lg:col-span-1
              bg-[#F5E7C6]
              border-4 border-[#222222]
              rounded-[32px]
              shadow-[10px_10px_0px_0px_#222222]
              p-8
            "
          >
            <div className="flex items-center gap-4">
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={84}
                  height={84}
                  className="rounded-full object-cover border-4 border-[#222222]"
                />
              ) : (
                <div className="h-20 w-20 rounded-full border-4 border-[#222222] bg-white flex items-center justify-center text-2xl font-bold text-[#222222]">
                  {session.user.name?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div>
                <h1 className="text-3xl font-bold text-[#222222]">{session.user.name}</h1>
                <p className="text-sm text-[#222222]/80">{session.user.email}</p>
                <p className="text-xs mt-1 uppercase tracking-wider text-[#222222]/70">
                  {session.user.role}
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-[#222222]">
              <div className="flex justify-between">
                <span>Joined</span>
                <span className="font-bold">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Bookmarks</span>
                <span className="font-bold">{bookmarks.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Created Books</span>
                <span className="font-bold">{createdBooks.length}</span>
              </div>
            </div>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white border-4 border-[#222222] rounded-2xl shadow-[6px_6px_0px_0px_#222222] p-5">
                <p className="text-sm text-[#222222]/70">Draft Books</p>
                <p className="text-3xl font-bold text-[#222222] mt-2">{draftCount}</p>
              </Card>
              <Card className="bg-white border-4 border-[#222222] rounded-2xl shadow-[6px_6px_0px_0px_#222222] p-5">
                <p className="text-sm text-[#222222]/70">Published Books</p>
                <p className="text-3xl font-bold text-[#222222] mt-2">{publishedCount}</p>
              </Card>
              <Card className="bg-white border-4 border-[#222222] rounded-2xl shadow-[6px_6px_0px_0px_#222222] p-5">
                <p className="text-sm text-[#222222]/70">Bookmarks</p>
                <p className="text-3xl font-bold text-[#222222] mt-2">{bookmarks.length}</p>
              </Card>
            </div>

            <Card className="bg-white border-4 border-[#222222] rounded-2xl shadow-[6px_6px_0px_0px_#222222] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#222222]">Recent Creations</h2>
                <Link href="/books/create" className="font-bold text-[#FF6D1F]">
                  Create New
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentBooks.length === 0 && (
                  <p className="text-[#222222]/70">No books created yet.</p>
                )}

                {recentBooks.map((book) => (
                  <div
                    key={book._id}
                    className="border-2 border-[#222222] rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[#222222]">{book.name}</p>
                      <p className="text-sm text-[#222222]/70">{book.author}</p>
                    </div>
                    <span className="text-xs uppercase font-bold px-2 py-1 rounded-md bg-[#F5E7C6] border-2 border-[#222222]">
                      {book.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="bg-white border-4 border-[#222222] rounded-2xl shadow-[6px_6px_0px_0px_#222222] p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#222222]">Recent Bookmarks</h2>
                <Link href="/books/bookmarks" className="font-bold text-[#FF6D1F]">
                  View All
                </Link>
              </div>

              <div className="mt-4 space-y-3">
                {recentBookmarks.length === 0 && (
                  <p className="text-[#222222]/70">No bookmarks yet.</p>
                )}

                {recentBookmarks.map((book) => (
                  <div
                    key={book._id}
                    className="border-2 border-[#222222] rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-bold text-[#222222]">{book.name}</p>
                      <p className="text-sm text-[#222222]/70">{book.author}</p>
                    </div>
                    <span className="text-xs uppercase font-bold px-2 py-1 rounded-md bg-[#F5E7C6] border-2 border-[#222222]">
                      {book.status}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
