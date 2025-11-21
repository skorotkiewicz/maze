import type { Point, Rect } from '../types';

// Check if point is inside rect
export function isPointInRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// Check if point is inside circle
export function isPointInCircle(point: Point, center: Point, radius: number): boolean {
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  return dx * dx + dy * dy <= radius * radius;
}

// Line segment intersection with rectangle
// Returns true if the line segment from p1 to p2 intersects the rectangle
export function lineIntersectsRect(p1: Point, p2: Point, rect: Rect): boolean {
  // 1. Check if either point is inside (fast fail/success)
  if (isPointInRect(p1, rect) || isPointInRect(p2, rect)) return true;

  // 2. Check intersection with each of the 4 sides
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  return (
    lineIntersectsLine(p1, p2, { x: left, y: top }, { x: right, y: top }) || // Top
    lineIntersectsLine(p1, p2, { x: right, y: top }, { x: right, y: bottom }) || // Right
    lineIntersectsLine(p1, p2, { x: right, y: bottom }, { x: left, y: bottom }) || // Bottom
    lineIntersectsLine(p1, p2, { x: left, y: bottom }, { x: left, y: top }) // Left
  );
}

// Helper: Line segment intersection
function lineIntersectsLine(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
  const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
  if (det === 0) return false; // Parallel

  const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
  const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

  return 0 < lambda && lambda < 1 && 0 < gamma && gamma < 1;
}
