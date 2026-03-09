import { GRID_WIDTH, GRID_HEIGHT, TileType } from "./config";

/**
 * Generate the map data as a 2D array of TileType values.
 * This can later be replaced with a Tiled JSON import.
 */
export function generateMapData(): number[][] {
  const map: number[][] = [];

  for (let row = 0; row < GRID_HEIGHT; row++) {
    const rowData: number[] = [];
    for (let col = 0; col < GRID_WIDTH; col++) {
      rowData.push(getTileAt(col, row));
    }
    map.push(rowData);
  }

  return map;
}

function getTileAt(col: number, row: number): number {
  // Left edge wall
  if (col === 0) return TileType.WALL;

  // Command Hub — 6x6, centered vertically, at left
  const hubSize = 6;
  const hubStartCol = 1;
  const hubStartRow = Math.floor(GRID_HEIGHT / 2) - Math.floor(hubSize / 2);
  if (
    col >= hubStartCol && col < hubStartCol + hubSize &&
    row >= hubStartRow && row < hubStartRow + hubSize
  ) {
    // Inner 4x4 core
    if (
      col >= hubStartCol + 1 && col < hubStartCol + hubSize - 1 &&
      row >= hubStartRow + 1 && row < hubStartRow + hubSize - 1
    ) {
      return TileType.HUB_CORE;
    }
    return TileType.HUB;
  }

  // Spawn points — 3 on the right edge
  const spawnRows = [6, Math.floor(GRID_HEIGHT / 2), GRID_HEIGHT - 7];
  if (col === GRID_WIDTH - 1 && spawnRows.includes(row)) {
    return TileType.SPAWN;
  }

  // Default: alternating ground
  return (row + col) % 2 === 0 ? TileType.GROUND_A : TileType.GROUND_B;
}

/**
 * Flatten the 2D map into the 1D array Phaser tilemaps expect.
 * Tiled uses 1-based indices, so we add 1 to each value.
 */
export function flattenForPhaser(map: number[][]): number[] {
  return map.flat().map((t) => t + 1);
}
