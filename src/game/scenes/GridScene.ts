import * as Phaser from "phaser";

const COLS = 40;
const ROWS = 30;
const TILE_SIZE = 20;

export class GridScene extends Phaser.Scene {
  constructor() {
    super({ key: "GridScene" });
  }

  create() {
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const x = col * TILE_SIZE;
        const y = row * TILE_SIZE;

        // Alternate colors in a checkerboard to prove the grid is working
        const isDark = (row + col) % 2 === 0;
        const color = isDark ? 0x1a1a2e : 0x16213e;

        this.add.rectangle(
          x + TILE_SIZE / 2,
          y + TILE_SIZE / 2,
          TILE_SIZE - 1,
          TILE_SIZE - 1,
          color
        );
      }
    }
  }
}
