"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="w-full px-10 pb-10 mt-20 font-tektur">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="
          bg-[#F5E7C6]
          border-4 border-[#222222]
          rounded-[30px]
          shadow-[10px_10px_0px_0px_#222222]
          px-8 py-6
          flex flex-col md:flex-row
          justify-between items-center
          gap-6
        "
      >
        {/* LEFT */}
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold text-[#222222]">
            Devrary
          </h2>
          <p className="text-sm text-[#222222] mt-1">
            A virtual library for structured coding knowledge.
          </p>
        </div>

        {/* CENTER LINKS */}
        <div className="flex gap-6 text-sm font-semibold text-[#222222]">
          <Link href="/room" className="hover:underline">
            Explore
          </Link>
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/contact" className="hover:underline">
            Contact
          </Link>
        </div>

        {/* RIGHT CTA */}
        <motion.div
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.15 }}
        >
          <Link href="/room">
            <button
              className="
                bg-[#FF6D1F]
                text-white
                border-4 border-[#222222]
                rounded-xl
                shadow-[5px_5px_0px_0px_#222222]
                px-5 py-2
                font-bold
                active:translate-x-1 active:translate-y-1 active:shadow-none
                transition-all
              "
            >
              Start Learning
            </button>
          </Link>
        </motion.div>
      </motion.div>

      {/* BOTTOM NOTE */}
      <p className="text-center text-xs text-[#222222] mt-6">
        © {new Date().getFullYear()} Devrary — Built for learners.
      </p>
    </footer>
  );
}