export const GRID_WIDTH = 80;
export const GRID_HEIGHT = 60;
export const TILE_SIZE = 16;
export const CANVAS_WIDTH = GRID_WIDTH * TILE_SIZE; // 1280
export const CANVAS_HEIGHT = GRID_HEIGHT * TILE_SIZE; // 960

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

  // Grid overlay
  gridLine: 0x3a3a3a,

  // UI
  background: 0x0a0a1a,
  buildZone: 0x2a2a2a,
};
