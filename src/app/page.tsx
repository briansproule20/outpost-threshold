import PhaserGame from "@/game/PhaserGame";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f23]">
      <h1 className="mb-6 text-2xl font-bold text-zinc-200 tracking-wide">
        Outpost Threshold
      </h1>
      <PhaserGame />
    </div>
  );
}
