import { GRID_WIDTH, GRID_HEIGHT, TileType } from "./config";

interface Node {
  col: number;
  row: number;
  g: number;
  h: number;
  f: number;
  parent: Node | null;
}

const WALKABLE = new Set([
  TileType.GROUND_A,
  TileType.GROUND_B,
  TileType.SPAWN,
  TileType.PATH,
  TileType.BUILDABLE,
  TileType.HUB,
  TileType.HUB_CORE,
]);

const SQRT2 = Math.SQRT2;

function heuristic(col: number, row: number, goalCol: number, goalRow: number): number {
  // Octile distance — correct for 8-directional movement
  const dx = Math.abs(col - goalCol);
  const dy = Math.abs(row - goalRow);
  return (dx + dy) + (SQRT2 - 2) * Math.min(dx, dy);
}

/**
 * A* pathfinding on the tile grid.
 * Returns an array of {col, row} from start to goal, or null if no path.
 */
export function findPath(
  mapData: number[][],
  startCol: number,
  startRow: number,
  goalCol: number,
  goalRow: number
): { col: number; row: number }[] | null {
  const open: Node[] = [];
  const closed = new Set<string>();

  const key = (c: number, r: number) => `${c},${r}`;

  const startNode: Node = {
    col: startCol,
    row: startRow,
    g: 0,
    h: heuristic(startCol, startRow, goalCol, goalRow),
    f: heuristic(startCol, startRow, goalCol, goalRow),
    parent: null,
  };
  open.push(startNode);

  while (open.length > 0) {
    // Find lowest f
    let bestIdx = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bestIdx].f) bestIdx = i;
    }
    const current = open.splice(bestIdx, 1)[0];

    if (current.col === goalCol && current.row === goalRow) {
      // Reconstruct path
      const path: { col: number; row: number }[] = [];
      let node: Node | null = current;
      while (node) {
        path.unshift({ col: node.col, row: node.row });
        node = node.parent;
      }
      return path;
    }

    closed.add(key(current.col, current.row));

    // 8-directional neighbors
    const dirs = [
      [0, -1], [0, 1], [-1, 0], [1, 0],
      [-1, -1], [-1, 1], [1, -1], [1, 1],
    ];

    for (const [dc, dr] of dirs) {
      const nc = current.col + dc;
      const nr = current.row + dr;

      if (nc < 0 || nc >= GRID_WIDTH || nr < 0 || nr >= GRID_HEIGHT) continue;
      if (closed.has(key(nc, nr))) continue;
      if (!WALKABLE.has(mapData[nr][nc])) continue;

      const isDiagonal = dc !== 0 && dr !== 0;

      // Don't cut corners — both adjacent cardinal tiles must be walkable
      if (isDiagonal) {
        if (!WALKABLE.has(mapData[current.row + dr][current.col]) ||
            !WALKABLE.has(mapData[current.row][current.col + dc])) {
          continue;
        }
      }

      const g = current.g + (isDiagonal ? SQRT2 : 1);
      const h = heuristic(nc, nr, goalCol, goalRow);
      const f = g + h;

      // Check if already in open with better g
      const existing = open.find((n) => n.col === nc && n.row === nr);
      if (existing) {
        if (g < existing.g) {
          existing.g = g;
          existing.f = f;
          existing.parent = current;
        }
        continue;
      }

      open.push({ col: nc, row: nr, g, h, f, parent: current });
    }
  }

  return null; // No path found
}
