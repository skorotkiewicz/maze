import type { Level, Point } from "../types";
import { lineIntersectsRect } from "./collision";

// Grid size for pathfinding (smaller = more accurate but slower)
const GRID_SIZE = 10;

interface Node {
  x: number;
  y: number;
  g: number; // Cost from start
  h: number; // Heuristic to end
  f: number; // Total cost
  parent: Node | null;
}

export function findOptimalPath(level: Level): Point[] {
  const startNode: Node = {
    x: Math.floor(level.start.x / GRID_SIZE) * GRID_SIZE,
    y: Math.floor(level.start.y / GRID_SIZE) * GRID_SIZE,
    g: 0,
    h: 0,
    f: 0,
    parent: null,
  };

  const endNode: Node = {
    x: Math.floor(level.end.x / GRID_SIZE) * GRID_SIZE,
    y: Math.floor(level.end.y / GRID_SIZE) * GRID_SIZE,
    g: 0,
    h: 0,
    f: 0,
    parent: null,
  };

  const openList: Node[] = [startNode];
  const closedList: Set<string> = new Set();

  // Safety break to prevent infinite loops
  let iterations = 0;
  const MAX_ITERATIONS = 10000;

  while (openList.length > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    // Find node with lowest f cost
    let currentNode = openList[0];
    let currentIndex = 0;

    for (let i = 1; i < openList.length; i++) {
      if (openList[i].f < currentNode.f) {
        currentNode = openList[i];
        currentIndex = i;
      }
    }

    // Remove current from open, add to closed
    openList.splice(currentIndex, 1);
    closedList.add(`${currentNode.x},${currentNode.y}`);

    // Check if we reached the end (within a reasonable distance)
    const distToEnd = Math.sqrt(
      (currentNode.x - endNode.x) ** 2 + (currentNode.y - endNode.y) ** 2,
    );

    if (distToEnd < GRID_SIZE * 2) {
      // Reconstruct path
      const path: Point[] = [];
      let curr: Node | null = currentNode;
      while (curr) {
        path.push({ x: curr.x, y: curr.y });
        curr = curr.parent;
      }
      return path.reverse();
    }

    // Generate neighbors
    const neighbors: Point[] = [
      { x: 0, y: -GRID_SIZE }, // Up
      { x: 0, y: GRID_SIZE }, // Down
      { x: -GRID_SIZE, y: 0 }, // Left
      { x: GRID_SIZE, y: 0 }, // Right
      { x: -GRID_SIZE, y: -GRID_SIZE }, // Up-Left
      { x: GRID_SIZE, y: -GRID_SIZE }, // Up-Right
      { x: -GRID_SIZE, y: GRID_SIZE }, // Down-Left
      { x: GRID_SIZE, y: GRID_SIZE }, // Down-Right
    ];

    for (const offset of neighbors) {
      const neighborPos = {
        x: currentNode.x + offset.x,
        y: currentNode.y + offset.y,
      };

      // Check bounds
      if (
        neighborPos.x < 0 ||
        neighborPos.x > level.size.width ||
        neighborPos.y < 0 ||
        neighborPos.y > level.size.height
      ) {
        continue;
      }

      // Check collision
      // We check if the line from current to neighbor hits any wall
      // We expand walls slightly to account for cursor radius (approx 6px)
      const CURSOR_RADIUS = 6;
      const hitWall = level.walls.some((wall) => {
        const expandedWall = {
          x: wall.x - CURSOR_RADIUS,
          y: wall.y - CURSOR_RADIUS,
          width: wall.width + CURSOR_RADIUS * 2,
          height: wall.height + CURSOR_RADIUS * 2,
        };
        return lineIntersectsRect(
          { x: currentNode.x, y: currentNode.y },
          neighborPos,
          expandedWall,
        );
      });

      if (hitWall) continue;

      // Check if in closed list
      if (closedList.has(`${neighborPos.x},${neighborPos.y}`)) continue;

      // Calculate costs
      // Diagonal movement cost is ~1.414, straight is 1
      const moveCost = offset.x !== 0 && offset.y !== 0 ? Math.SQRT2 : 1;
      const gScore = currentNode.g + moveCost;
      const hScore =
        Math.sqrt((neighborPos.x - endNode.x) ** 2 + (neighborPos.y - endNode.y) ** 2) / GRID_SIZE; // Heuristic scaled to grid steps

      // Check if neighbor is already in open list with lower g
      const existingNeighbor = openList.find((n) => n.x === neighborPos.x && n.y === neighborPos.y);
      if (existingNeighbor && gScore >= existingNeighbor.g) continue;

      const neighborNode: Node = {
        x: neighborPos.x,
        y: neighborPos.y,
        g: gScore,
        h: hScore,
        f: gScore + hScore,
        parent: currentNode,
      };

      if (!existingNeighbor) {
        openList.push(neighborNode);
      } else {
        // Update existing
        existingNeighbor.g = gScore;
        existingNeighbor.f = gScore + hScore;
        existingNeighbor.parent = currentNode;
      }
    }
  }

  // No path found
  return [];
}

export function calculatePathLength(path: Point[]): number {
  let length = 0;
  for (let i = 0; i < path.length - 1; i++) {
    length += Math.sqrt((path[i + 1].x - path[i].x) ** 2 + (path[i + 1].y - path[i].y) ** 2);
  }
  return length;
}
