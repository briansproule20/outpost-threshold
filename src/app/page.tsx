"use client";

import dynamic from "next/dynamic";

const PhaserGame = dynamic(() => import("@/game/PhaserGame"), {
  ssr: false,
  loading: () => (
    <div className="w-full max-w-[1280px] aspect-[4/3] bg-[#0a0a1a] flex items-center justify-center text-zinc-600 font-mono">
      Loading...
    </div>
  ),
});

export default function Home() {
  return (
    <div className="flex h-screen flex-col items-center bg-gray-950 p-4">
      <div className="mb-3 text-center">
        <h1 className="text-2xl font-bold tracking-widest text-zinc-200 font-mono">
          OUTPOST: THRESHOLD
        </h1>
        <p className="text-xs text-zinc-600 font-mono mt-1">
          Phase 1 &mdash; Canvas Integration
        </p>
      </div>
      <div className="flex-1 w-full flex items-center justify-center">
        <PhaserGame />
      </div>
    </div>
  );
}
