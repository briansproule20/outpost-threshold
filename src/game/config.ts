export const GRID_WIDTH = 40;
export const GRID_HEIGHT = 30;
export const TILE_SIZE = 32;
export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE; // 1280
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE; // 960

export const COLORS = {
  // Terrain
  ground: 0x1a1a2e,
  groundAlt: 0x16213e,
  canyon: 0x3d2d4a,
  canyonHighlight: 0x4a3658,

  // Structures
  commandHub: 0xd4a937,
  commandHubBorder: 0xb8912d,
  commandHubCore: 0xf0c040,

  // Spawn
  spawnPoint: 0xe74c3c,
  spawnGlow: 0xff6b5a,

  // Grid overlay
  gridLine: 0x2a2a4a,

  // UI
  background: 0x0a0a1a,
  buildZone: 0x1a1a2e,
};
