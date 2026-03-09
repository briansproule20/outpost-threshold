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
import { generateMapData } from "../mapData";
import { findPath } from "../pathfinding";

interface Enemy {
  sprite: Phaser.GameObjects.Arc;
  path: { col: number; row: number }[];
  pathIndex: number;
  speed: number; // pixels per second
}

export class MainScene extends Phaser.Scene {
  private mapData: number[][] = [];
  private enemies: Enemy[] = [];
  private hubTarget = { col: 0, row: 0 }; // center of hub, set in create

  constructor() {
    super({ key: "MainScene" });
  }

  preload() {
    this.generateTileset();
  }

  create() {
    this.mapData = generateMapData();

    // Hub target = center of the 6x6 hub
    const hubSize = 6;
    const hubStartCol = 1;
    const hubStartRow = Math.floor(GRID_HEIGHT / 2) - Math.floor(hubSize / 2);
    this.hubTarget = {
      col: hubStartCol + Math.floor(hubSize / 2),
      row: hubStartRow + Math.floor(hubSize / 2),
    };

    // Create tilemap
    const map = this.make.tilemap({
      data: this.mapData.map((row) => row.map((t) => t)),
      tileWidth: TILE_SIZE,
      tileHeight: TILE_SIZE,
      width: GRID_WIDTH,
      height: GRID_HEIGHT,
    });

    const tileset = map.addTilesetImage("tiles", "tileset", TILE_SIZE, TILE_SIZE, 0, 0);
    if (!tileset) return;
    map.createLayer(0, tileset, 0, 0);

    this.drawGridOverlay();
    this.drawSpawnEffects();
    this.drawHubLabel();
    this.drawHUD();
    this.setupSpawnClick();
  }

  update(_time: number, delta: number) {
    this.updateEnemies(delta);
  }

  private updateEnemies(delta: number) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const target = enemy.path[enemy.pathIndex];
      if (!target) {
        // Reached the hub
        enemy.sprite.destroy();
        this.enemies.splice(i, 1);
        continue;
      }

      const targetX = target.col * TILE_SIZE + TILE_SIZE / 2;
      const targetY = target.row * TILE_SIZE + TILE_SIZE / 2;
      const dx = targetX - enemy.sprite.x;
      const dy = targetY - enemy.sprite.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const step = enemy.speed * (delta / 1000);

      if (dist <= step) {
        enemy.sprite.x = targetX;
        enemy.sprite.y = targetY;
        enemy.pathIndex++;
      } else {
        enemy.sprite.x += (dx / dist) * step;
        enemy.sprite.y += (dy / dist) * step;
      }
    }
  }

  private spawnEnemy(spawnCol: number, spawnRow: number) {
    const path = findPath(
      this.mapData,
      spawnCol,
      spawnRow,
      this.hubTarget.col,
      this.hubTarget.row
    );

    if (!path) return;

    const x = spawnCol * TILE_SIZE + TILE_SIZE / 2;
    const y = spawnRow * TILE_SIZE + TILE_SIZE / 2;

    const sprite = this.add.circle(x, y, TILE_SIZE / 2 - 2, 0x9b59b6).setDepth(10);

    // Outline
    const outline = this.add.circle(x, y, TILE_SIZE / 2 - 1).setDepth(10);
    outline.setStrokeStyle(1, 0xc39bd3);

    // Make outline follow sprite
    this.tweens.add({
      targets: outline,
      alpha: 0.5,
      duration: 400,
      yoyo: true,
      repeat: -1,
    });

    const enemy: Enemy = {
      sprite,
      path,
      pathIndex: 1, // skip the starting tile
      speed: 80,
    };

    this.enemies.push(enemy);

    // Sync outline position in update
    const updateOutline = () => {
      if (sprite.active) {
        outline.x = sprite.x;
        outline.y = sprite.y;
      } else {
        outline.destroy();
      }
    };
    this.events.on("update", updateOutline);
    sprite.on("destroy", () => {
      this.events.off("update", updateOutline);
      outline.destroy();
    });
  }

  private setupSpawnClick() {
    const spawnRows = [6, Math.floor(GRID_HEIGHT / 2), GRID_HEIGHT - 7];
    const spawnCol = GRID_WIDTH - 1;

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (!pointer.leftButtonDown()) return;

      const col = Math.floor(pointer.x / TILE_SIZE);
      const row = Math.floor(pointer.y / TILE_SIZE);

      // Check if click is on or near a spawn point (within 1 tile)
      for (const spawnRow of spawnRows) {
        if (Math.abs(col - spawnCol) <= 1 && Math.abs(row - spawnRow) <= 1) {
          this.spawnEnemy(spawnCol, spawnRow);
          return;
        }
      }
    });
  }

  // --- Tileset generation ---

  private generateTileset() {
    const tileCount = Object.keys(TileType).length / 2;
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
      const colors = tileColors[i] || { fill: "#ff00ff" };

      ctx.fillStyle = colors.fill;
      ctx.fillRect(0, y, TILE_SIZE, TILE_SIZE);

      if (colors.detail) {
        ctx.fillStyle = colors.detail;
        ctx.fillRect(2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
      }

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

  // --- Visual effects ---

  private drawSpawnEffects() {
    const spawnRows = [6, Math.floor(GRID_HEIGHT / 2), GRID_HEIGHT - 7];
    const col = GRID_WIDTH - 1;

    for (const row of spawnRows) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const y = row * TILE_SIZE + TILE_SIZE / 2;

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

    this.add.text(CANVAS_WIDTH - 10, CANVAS_HEIGHT - 22, `${GRID_WIDTH}x${GRID_HEIGHT} | ${TILE_SIZE}px | CLICK SPAWN TO SEND ENEMY`, {
      fontSize: "11px",
      color: "#4a4a6a",
      fontFamily: "monospace",
    }).setOrigin(1, 0).setDepth(100);
  }
}
