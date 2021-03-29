import {DatasetElement} from '../../../commons/models/dataset-element';

export class Keypoint extends DatasetElement {
  id: number;
  x: number;
  y: number;
  widthFactor: number;
  heightFactor: number;

  constructor(point) {
    super();
    this.x = point.x;
    this.y = point.y;
    this.widthFactor = point.widthFactor;
    this.heightFactor = point.heightFactor;
  }

  getVisibleX(): number {
    if (this.widthFactor > 1) {
      return Math.round(this.x * this.widthFactor);
    } else {
      return Math.round(this.x / this.widthFactor);
    }
  }

  getVisibleY(): number {
    if (this.heightFactor > 1) {
      return Math.round(this.y * this.heightFactor);
    } else {
      return Math.round(this.y / this.heightFactor);
    }
  }
}
