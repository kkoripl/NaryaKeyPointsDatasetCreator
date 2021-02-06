export class Keypoint {
  id: number;
  x: number;
  y: number;

  constructor(point) {
    this.x = point.x;
    this.y = point.y;
  }
}
