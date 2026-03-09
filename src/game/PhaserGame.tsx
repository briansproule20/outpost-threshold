"use client";

import { useEffect, useRef, useState } from "react";

export default function PhaserGame() {
  const gameRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    async function initPhaser() {
      const Phaser = await import("phaser");
      const { GridScene } = await import("./scenes/GridScene");

      if (gameRef.current || !containerRef.current) return;

      gameRef.current = new Phaser.Game({
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: containerRef.current,
        backgroundColor: "#0f0f23",
        scene: [GridScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
    }

    initPhaser();

    return () => {
      const game = gameRef.current as Phaser.Game | null;
      if (game) {
        game.destroy(true);
        gameRef.current = null;
      }
    };
  }, [mounted]);

  if (!mounted) return null;

  return <div ref={containerRef} className="w-full max-w-[800px] aspect-[4/3]" />;
}
