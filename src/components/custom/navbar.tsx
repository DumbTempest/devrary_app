"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Navbar() {
  const { status, data: session } = useSession();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="flex justify-end gap-6 mb-6 mr-20">
      <Link href="/">
        <Button
          className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
        >
          Home
        </Button>
      </Link>
      <Link href="/bookmarks">
        <Button
          className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
        >
          Bookmarks
        </Button>
      </Link>
      <Link href="/search">
        <Button
          className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
        >
          Search
        </Button>
      </Link>
      <Link href="/room">
        <Button
          className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-2xl
                shadow-[6px_6px_0px_0px_#222222]
                font-bold
                px-10 py-5
                active:translate-x-1
                active:translate-y-1
                active:shadow-none
                transition-all
              "
        >
          Rooms
        </Button>
      </Link>

      {status === "authenticated" && (
        <div className="relative" ref={dropdownRef}>
          {/* Profile Button */}
          <Button
            onClick={() => setOpen(!open)}
            className="
              flex items-center gap-2
              bg-[#FF6D1F]
              text-white
              border-4 border-[#222222]
              rounded-2xl
              shadow-[6px_6px_0px_0px_#222222]
              font-bold
              px-6 py-5
              active:translate-x-1
              active:translate-y-1
              active:shadow-none
              transition-all
            "
          >
            {session?.user?.image ? (
              <Image
                src={session.user.image}
                alt="Profile"
                width={30}
                height={30}
                className="rounded-full object-cover border-2 border-[#222222]"
              />
            ) : (
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-black font-bold border-2 border-[#222222]">
                {session?.user?.name?.[0]}
              </div>
            )}

            <span className="whitespace-nowrap">
              {session?.user?.name?.split(" ")[0]}
            </span>
          </Button>

          {/* Dropdown */}
          {open && (
            <div
              className="
              absolute right-0 mt-2 w-40
              bg-white
              border-4 border-[#222222]
              rounded-2xl
              shadow-[6px_6px_0px_0px_#222222]
              overflow-hidden
              z-50
            "
            >
              <button
                onClick={() => router.push("/create")}
                className="
                  w-full text-left px-4 py-3
                  font-bold
                  hover:bg-[#FF6D1F] hover:text-white
                  transition-all
                "
              >
                Create Books
              </button>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="
                  w-full text-left px-4 py-3
                  font-bold
                  hover:bg-[#FF6D1F] hover:text-white
                  transition-all
                "
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}

      {status === "unauthenticated" && (
        <>
          <Button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="
              bg-[#FF6D1F]
              text-white
              border-4 border-[#222222]
              rounded-2xl
              shadow-[6px_6px_0px_0px_#222222]
              font-bold
              px-10 py-5
              active:translate-x-1
              active:translate-y-1
              active:shadow-none
              transition-all
            "
          >
            Login/Signup
          </Button>
        </>
      )}
    </div>
  );
}