export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Level {
  id: string;
  name: string;
  start: {
    x: number;
    y: number;
    radius: number;
  };
  end: Rect;
  walls: Rect[];
  size: {
    width: number;
    height: number;
  };
}
