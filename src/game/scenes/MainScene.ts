import * as Phaser from "phaser";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
} from "../config";

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  create() {
    this.drawTerrain();
    this.drawCanyonWalls();
    this.drawCommandHub();
    this.drawSpawnPoints();
    this.drawGridOverlay();
    this.drawHUD();
  }

  private drawTerrain() {
    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < GRID_WIDTH; col++) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;

        // Subtle checkerboard variation
        const hash = ((col * 7 + row * 13) * 2654435761) >>> 0;
        const variation = (hash % 5) - 2;
        const baseColor = (row + col) % 2 === 0 ? COLORS.ground : COLORS.groundAlt;
        const r = ((baseColor >> 16) & 0xff) + variation;
        const g = ((baseColor >> 8) & 0xff) + variation;
        const b = (baseColor & 0xff) + variation;
        const color = (Phaser.Math.Clamp(r, 0, 255) << 16) |
                      (Phaser.Math.Clamp(g, 0, 255) << 8) |
                      Phaser.Math.Clamp(b, 0, 255);

        this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, color);
      }
    }
  }

  private drawCanyonWalls() {
    const canyonTiles: [number, number][] = [];

    // Left edge wall
    for (let row = 0; row < GRID_HEIGHT; row++) {
      canyonTiles.push([0, row]);
    }

    // Fortification walls around Hub
    for (let col = 1; col <= 4; col++) {
      canyonTiles.push([col, 11]);
      canyonTiles.push([col, 16]);
    }
    canyonTiles.push([1, 12], [1, 15], [5, 11], [5, 16]);
    // Scattered rocks
    canyonTiles.push([8, 5], [8, 6], [12, 22], [12, 23], [20, 2], [25, 27]);

    for (const [col, row] of canyonTiles) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;
      this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLORS.canyon);
      this.add.rectangle(x - 1, y - 1, TILE_SIZE - 6, TILE_SIZE - 6, COLORS.canyonHighlight);
    }
  }

  private drawCommandHub() {
    const hubCenterX = 2 * TILE_SIZE + TILE_SIZE / 2;
    const hubCenterY = 14 * TILE_SIZE + TILE_SIZE / 2;
    const hubW = 3 * TILE_SIZE;
    const hubH = 3 * TILE_SIZE;

    // Glow
    this.add.rectangle(hubCenterX, hubCenterY, hubW + 6, hubH + 6, COLORS.commandHubBorder, 0.4);

    // Tiles
    for (let row = 13; row <= 15; row++) {
      for (let col = 1; col <= 3; col++) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        this.add.rectangle(x, y, TILE_SIZE - 1, TILE_SIZE - 1, COLORS.commandHub);
        this.add.rectangle(x, y, TILE_SIZE - 6, TILE_SIZE - 6, COLORS.commandHubCore, 0.3);
      }
    }

    this.add.text(hubCenterX, hubCenterY - 10, "COMMAND", {
      fontSize: "11px",
      color: "#0a0a1a",
      fontStyle: "bold",
      fontFamily: "monospace",
    }).setOrigin(0.5);
    this.add.text(hubCenterX, hubCenterY + 6, "HUB", {
      fontSize: "16px",
      color: "#0a0a1a",
      fontStyle: "bold",
      fontFamily: "monospace",
    }).setOrigin(0.5);
  }

  private drawSpawnPoints() {
    const spawns = [
      { row: 3, label: "SPAWN 1" },
      { row: 14, label: "SPAWN 2" },
      { row: 25, label: "SPAWN 3" },
    ];

    for (const spawn of spawns) {
      const col = GRID_WIDTH - 1;
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = spawn.row * TILE_SIZE + TILE_SIZE / 2;

      // Danger zone glow
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 0; dc++) {
          const glowX = (col + dc) * TILE_SIZE + TILE_SIZE / 2;
          const glowY = (spawn.row + dr) * TILE_SIZE + TILE_SIZE / 2;
          const alpha = (Math.abs(dr) + Math.abs(dc)) === 0 ? 0.3 : 0.1;
          this.add.rectangle(glowX, glowY, TILE_SIZE, TILE_SIZE, COLORS.spawnPoint, alpha);
        }
      }

      this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLORS.spawnPoint);
      this.add.rectangle(x, y, TILE_SIZE - 8, TILE_SIZE - 8, COLORS.spawnGlow, 0.5);

      this.add.text(x - TILE_SIZE * 1.5, y, spawn.label, {
        fontSize: "10px",
        color: "#e74c3c",
        fontStyle: "bold",
        fontFamily: "monospace",
      }).setOrigin(0.5);

      // Pulse animation
      const pulse = this.add.rectangle(x, y, TILE_SIZE - 4, TILE_SIZE - 4, COLORS.spawnGlow, 0.6);
      this.tweens.add({
        targets: pulse,
        alpha: 0.1,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  private drawGridOverlay() {
    const gfx = this.add.graphics();
    gfx.lineStyle(1, COLORS.gridLine, 0.15);
    for (let col = 0; col <= GRID_WIDTH; col++) {
      gfx.moveTo(col * TILE_SIZE, 0);
      gfx.lineTo(col * TILE_SIZE, CANVAS_HEIGHT);
    }
    for (let row = 0; row <= GRID_HEIGHT; row++) {
      gfx.moveTo(0, row * TILE_SIZE);
      gfx.lineTo(CANVAS_WIDTH, row * TILE_SIZE);
    }
    gfx.strokePath();
  }

  private drawHUD() {
    const mouseText = this.add.text(10, CANVAS_HEIGHT - 24, "CURSOR: --", {
      fontSize: "11px",
      color: "#4a4a6a",
      fontFamily: "monospace",
    }).setDepth(100);

    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      const col = Math.floor(pointer.x / TILE_SIZE);
      const row = Math.floor(pointer.y / TILE_SIZE);
      if (col >= 0 && col < GRID_WIDTH && row >= 0 && row < GRID_HEIGHT) {
        mouseText.setText(`CURSOR: [${col}, ${row}]`);
      }
    });

    this.add.text(CANVAS_WIDTH - 10, CANVAS_HEIGHT - 24, `GRID: ${GRID_WIDTH}x${GRID_HEIGHT} | TILE: ${TILE_SIZE}px`, {
      fontSize: "11px",
      color: "#4a4a6a",
      fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(100);
  }
}
