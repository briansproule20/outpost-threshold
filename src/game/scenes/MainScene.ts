import * as Phaser from "phaser";
import {
  GRID_WIDTH,
  GRID_HEIGHT,
  TILE_SIZE,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  COLORS,
  TileType,
} from "../config";
import { generateMapData, flattenForPhaser } from "../mapData";

export class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.generateTileset();
  }

  create() {
    const mapData = generateMapData();
    const flatData = flattenForPhaser(mapData);

    // Create tilemap from data
    const map = this.make.tilemap({
      data: mapData.map((row) => row.map((t) => t)), // Phaser wants raw indices for data maps
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
    });

    const tileset = map.addTilesetImage("tiles", "tileset", TILE_SIZE, TILE_SIZE, 0, 0);
    if (!tileset) return;

    const layer = map.createLayer(0, tileset, 0, 0);
    if (!layer) return;

    // Draw grid overlay on top
    this.drawGridOverlay();

    // Spawn point pulse animations
    this.drawSpawnEffects(mapData);

    // HUB label
    this.drawHubLabel();

    // HUD
    this.drawHUD();
  }

  /**
   * Generate a tileset texture at runtime.
   * Each tile type gets a TILE_SIZE x TILE_SIZE frame in a vertical spritesheet.
   * Replace this with a real PNG tileset later.
   */
  private generateTileset() {
    const tileCount = Object.keys(TileType).length / 2; // enum has both keys and values
    const canvas = this.textures.createCanvas("tileset", TILE_SIZE, TILE_SIZE * tileCount);
    if (!canvas) return;

    const ctx = canvas.context;

    const tileColors: Record<number, { fill: string; detail?: string }> = {
      [TileType.GROUND_A]: { fill: "#2a2a2a" },
      [TileType.GROUND_B]: { fill: "#252525" },
      [TileType.WALL]: { fill: "#4a4a4a", detail: "#5a5a5a" },
      [TileType.HUB]: { fill: "#d4a937", detail: "#b8912d" },
      [TileType.HUB_CORE]: { fill: "#f0c040", detail: "#d4a937" },
      [TileType.SPAWN]: { fill: "#e74c3c", detail: "#ff6b5a" },
      [TileType.PATH]: { fill: "#3a3a2a" },
      [TileType.BUILDABLE]: { fill: "#2a3a2a", detail: "#2e3e2e" },
    };

    for (let i = 0; i < tileCount; i++) {
      const y = i * TILE_SIZE;
      const colors = tileColors[i] || { fill: "#ff00ff" }; // magenta = missing

      // Fill
      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, y, TILE_SIZE, TILE_SIZE);

      // Inner detail/highlight
      if (colors.detail) {
        ctx.fillStyle = colors.detail;
        ctx.fillRect(2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }

      // Subtle noise for ground tiles
      if (i === TileType.GROUND_A || i === TileType.GROUND_B) {
        for (let px = 0; px < TILE_SIZE; px += 4) {
          for (let py = 0; py < TILE_SIZE; py += 4) {
            const noise = Math.random() * 8 - 4;
            const base = i === TileType.GROUND_A ? 42 : 37;
            const v = Math.max(0, Math.min(255, base + noise));
            ctx.fillStyle = `rgb(${v},${v},${v})`;
            ctx.fillRect(px, y + py, 4, 4);
          }
        }
      }
    }

    canvas.refresh();
  }

  private drawSpawnEffects(mapData: number[][]) {
    const spawnRows = [6, Math.floor(GRID_HEIGHT / 2), GRID_HEIGHT - 7];
    const col = GRID_WIDTH - 1;

    for (const row of spawnRows) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;

      // Glow around spawn
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 0; dc++) {
          const alpha = (Math.abs(dr) + Math.abs(dc)) === 0 ? 0.25 : 0.08;
          this.add.rectangle(
            (col + dc) * TILE_SIZE + TILE_SIZE / 2,
            (row + dr) * TILE_SIZE + TILE_SIZE / 2,
            TILE_SIZE, TILE_SIZE, COLORS.spawnPoint, alpha
          ).setDepth(1);
        }
      }

      // Pulse
      const pulse = this.add.rectangle(x, y, TILE_SIZE - 2, TILE_SIZE - 2, COLORS.spawnGlow, 0.6).setDepth(2);
      this.tweens.add({
        targets: pulse,
        alpha: 0.1,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 1200,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });

      // Label
      const labelIndex = spawnRows.indexOf(row) + 1;
      this.add.text(x - TILE_SIZE * 2, y, `S${labelIndex}`, {
        fontSize: "10px",
        color: "#e74c3c",
        fontStyle: "bold",
        fontFamily: "monospace",
      }).setOrigin(0.5).setDepth(2);
    }
  }

  private drawHubLabel() {
    const hubSize = 6;
    const hubStartCol = 1;
    const hubStartRow = Math.floor(GRID_HEIGHT / 2) - Math.floor(hubSize / 2);
    const cx = (hubStartCol + hubSize / 2) * TILE_SIZE;
    const cy = (hubStartRow + hubSize / 2) * TILE_SIZE;

    this.add.text(cx, cy - 6, "COMMAND", {
      fontSize: "11px",
      color: "#0a0a1a",
      fontStyle: "bold",
      fontFamily: "monospace",
    }).setOrigin(0.5).setDepth(3);
    this.add.text(cx, cy + 8, "HUB", {
      fontSize: "14px",
      color: "#0a0a1a",
      fontStyle: "bold",
      fontFamily: "monospace",
    }).setOrigin(0.5).setDepth(3);
  }

  private drawGridOverlay() {
    const gfx = this.add.graphics().setDepth(1);
    gfx.lineStyle(1, COLORS.gridLine, 0.12);
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
    const mouseText = this.add.text(10, CANVAS_HEIGHT - 22, "CURSOR: --", {
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

    this.add.text(CANVAS_WIDTH - 10, CANVAS_HEIGHT - 22, `${GRID_WIDTH}x${GRID_HEIGHT} | ${TILE_SIZE}px`, {
      fontSize: "11px",
      color: "#4a4a6a",
      fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(100);
  }
}
