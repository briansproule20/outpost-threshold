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
  // Track canyon wall game objects by "col,row" key for deletion
  private canyonObjects = new Map<string, Phaser.GameObjects.GameObject[]>();

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
    this.setupClickToDelete();
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


    for (const [col, row] of canyonTiles) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;
      const base = this.add.rectangle(x, y, TILE_SIZE, TILE_SIZE, COLORS.canyon);
      const highlight = this.add.rectangle(x - 1, y - 1, TILE_SIZE - 6, TILE_SIZE - 6, COLORS.canyonHighlight);
      this.canyonObjects.set(`${col},${row}`, [base, highlight]);
    }
  }

  private drawCommandHub() {
    // 6x6 tile hub, vertically centered, against left wall
    const hubSize = 6;
    const hubStartCol = 1;
    const hubEndCol = hubStartCol + hubSize - 1;
    const hubStartRow = Math.floor(GRID_HEIGHT / 2) - Math.floor(hubSize / 2);
    const hubEndRow = hubStartRow + hubSize - 1;

    const hubCenterX = ((hubStartCol + hubEndCol) / 2) * TILE_SIZE + TILE_SIZE / 2;
    const hubCenterY = ((hubStartRow + hubEndRow) / 2) * TILE_SIZE + TILE_SIZE / 2;
    const hubW = hubSize * TILE_SIZE;
    const hubH = hubSize * TILE_SIZE;

    // Glow
    this.add.rectangle(hubCenterX, hubCenterY, hubW + 6, hubH + 6, COLORS.commandHubBorder, 0.4);

    // Tiles
    for (let row = hubStartRow; row <= hubEndRow; row++) {
      for (let col = hubStartCol; col <= hubEndCol; col++) {
        const x = col * TILE_SIZE + TILE_SIZE / 2;
        const y = row * TILE_SIZE + TILE_SIZE / 2;
        this.add.rectangle(x, y, TILE_SIZE - 1, TILE_SIZE - 1, COLORS.commandHub);
        this.add.rectangle(x, y, TILE_SIZE - 4, TILE_SIZE - 4, COLORS.commandHubCore, 0.3);
      }
    }

    this.add.text(hubCenterX, hubCenterY - 6, "COMMAND", {
      fontSize: "11px",
      color: "#0a0a1a",
      fontStyle: "bold",
      fontFamily: "monospace",
    }).setOrigin(0.5);
    this.add.text(hubCenterX, hubCenterY + 8, "HUB", {
      fontSize: "14px",
      color: "#0a0a1a",
      fontStyle: "bold",
      fontFamily: "monospace",
    }).setOrigin(0.5);
  }

  private drawSpawnPoints() {
    const spawns = [
      { row: 6, label: "SPAWN 1" },
      { row: Math.floor(GRID_HEIGHT / 2), label: "SPAWN 2" },
      { row: GRID_HEIGHT - 7, label: "SPAWN 3" },
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

  private setupClickToDelete() {
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;

      const col = Math.floor(pointer.x / TILE_SIZE);
      const row = Math.floor(pointer.y / TILE_SIZE);
      const key = `${col},${row}`;

      const objects = this.canyonObjects.get(key);
      if (objects) {
        for (const obj of objects) obj.destroy();
        this.canyonObjects.delete(key);
      }
    });
  }
}
