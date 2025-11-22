import * as fs from "node:fs";
import path from "node:path";

const inputFile = process.argv[2];

if (!inputFile) {
  console.error("Usage: bun run scripts/svg2json.js <input.svg>");
  process.exit(1);
}

try {
  const content = fs.readFileSync(inputFile, "utf8");

  // Helper to extract attribute value
  const getAttr = (tag, attr) => {
    const match = tag.match(new RegExp(`${attr}=["']([^"']+)["']`));
    return match ? match[1] : null;
  };

  // Parse SVG dimensions
  const svgMatch = content.match(/<svg[^>]*>/);
  if (!svgMatch) throw new Error("No <svg> tag found");

  const width = parseInt(getAttr(svgMatch[0], "width") || "800", 10);
  const height = parseInt(getAttr(svgMatch[0], "height") || "600", 10);

  const level = {
    id: path.basename(inputFile, ".svg"),
    name: path.basename(inputFile, ".svg"),
    size: { width, height },
    start: { x: 50, y: 50, radius: 20 }, // Default
    end: { x: width - 100, y: height - 100, width: 50, height: 50 }, // Default
    walls: [],
  };

  // Find all rects
  const rectRegex = /<rect[^>]*>/g;
  let match;
  while ((match = rectRegex.exec(content)) !== null) {
    const tag = match[0];
    const x = parseFloat(getAttr(tag, "x") || "0");
    const y = parseFloat(getAttr(tag, "y") || "0");
    const w = parseFloat(getAttr(tag, "width") || "0");
    const h = parseFloat(getAttr(tag, "height") || "0");
    const id = getAttr(tag, "id");
    const fill = getAttr(tag, "fill");

    if (id === "end" || fill === "#ff0000" || fill === "red") {
      level.end = { x, y, width: w, height: h };
    } else if (id !== "start") {
      // Assume it's a wall if it's not start/end
      // Note: Start is usually a circle, but if someone uses a rect for start, we might need to handle it.
      // For now, let's assume rects are walls unless marked as end.
      level.walls.push({ x, y, width: w, height: h });
    }
  }

  // Find all lines (convert to walls)
  const lineRegex = /<line[^>]*>/g;
  while ((match = lineRegex.exec(content)) !== null) {
    const tag = match[0];
    const x1 = parseFloat(getAttr(tag, "x1") || "0");
    const y1 = parseFloat(getAttr(tag, "y1") || "0");
    const x2 = parseFloat(getAttr(tag, "x2") || "0");
    const y2 = parseFloat(getAttr(tag, "y2") || "0");
    const strokeWidth = parseFloat(getAttr(tag, "stroke-width") || "1");

    // Normalize coordinates
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);

    let wall = null;

    if (y1 === y2) {
      // Horizontal line
      wall = {
        x: minX,
        y: y1 - strokeWidth / 2,
        width: maxX - minX,
        height: strokeWidth,
      };
    } else if (x1 === x2) {
      // Vertical line
      wall = {
        x: x1 - strokeWidth / 2,
        y: minY,
        width: strokeWidth,
        height: maxY - minY,
      };
    } else {
      // Diagonal line - approximate with bounding box or ignore?
      // For now, let's use bounding box but warn
      // console.warn('Diagonal line detected, approximating with bounding box');
      wall = {
        x: minX,
        y: minY,
        width: Math.max(strokeWidth, maxX - minX),
        height: Math.max(strokeWidth, maxY - minY),
      };
    }

    if (wall) {
      // Ensure positive dimensions
      if (wall.width === 0) wall.width = strokeWidth;
      if (wall.height === 0) wall.height = strokeWidth;
      level.walls.push(wall);
    }
  }

  // Find all circles (usually Start)
  const circleRegex = /<circle[^>]*>/g;
  while ((match = circleRegex.exec(content)) !== null) {
    const tag = match[0];
    const cx = parseFloat(getAttr(tag, "cx") || "0");
    const cy = parseFloat(getAttr(tag, "cy") || "0");
    const r = parseFloat(getAttr(tag, "r") || "0");
    const id = getAttr(tag, "id");
    const fill = getAttr(tag, "fill");

    if (id === "start" || fill === "#00ff00" || fill === "green" || fill === "lime") {
      level.start = { x: cx, y: cy, radius: r };
    }
  }

  console.log(JSON.stringify(level, null, 2));
} catch (error) {
  console.error("Error:", error.message);
  process.exit(1);
}
