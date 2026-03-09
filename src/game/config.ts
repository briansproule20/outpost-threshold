export const GRID_WIDTH = 80;
export const GRID_HEIGHT = 60;
export const TILE_SIZE = 16;
export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE; // 1280
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE; // 960

// Tile indices in the tileset (each tile is a row in the generated spritesheet)
export enum TileType {
  GROUND_A = 0,
  GROUND_B = 1,
  WALL = 2,
  HUB = 3,
  HUB_CORE = 4,
  SPAWN = 5,
  PATH = 6,
  BUILDABLE = 7,
}

export const COLORS = {
  // Terrain
  ground: 0x2a2a2a,
  groundAlt: 0x252525,
  canyon: 0x4a4a4a,
  canyonHighlight: 0x5a5a5a,

  // Structures
  commandHub: 0xd4a937,
  commandHubBorder: 0xb8912d,
  commandHubCore: 0xf0c040,

  // Spawn
  spawnPoint: 0xe74c3c,
  spawnGlow: 0xff6b5a,

  // Path
  path: 0x3a3a2a,

  // Buildable
  buildable: 0x2a3a2a,

  // Grid overlay
  gridLine: 0x3a3a3a,

  // UI
  background: 0x0a0a1a,
};
