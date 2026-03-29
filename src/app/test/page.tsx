"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/custom/navbar";
import Link from "next/link";
import AnimatedSkyNoBirds from "@/components/custom/animated-sky-no-birds";

export default function BookmarksPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <AnimatedSkyNoBirds />
    </div>
  );
}