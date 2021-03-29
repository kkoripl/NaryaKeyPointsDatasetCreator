import {DatasetElement} from '../../../commons/models/dataset-element';
import {NumbersUtilsService} from '../../../commons/services/numbers-utils.service';

export class BoundingBox extends DatasetElement {
  x: number;
  y: number;
  width: number;
  height: number;
  widthFactor: number;
  heightFactor: number;
  label: string;

  constructor(x: number, y: number, width: number, height: number, widthFactor: number, heightFactor: number) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.widthFactor = widthFactor;
    this.heightFactor = heightFactor;
  }

  getXmax(): number {
    return this.x + this.width;
  }

  getYmax(): number {
    return this.y + this.height;
  }

  getVisibleX(): number {
    return NumbersUtilsService.scale(this.x, this.widthFactor);
  }

  getVisibleY(): number {
    return NumbersUtilsService.scale(this.y, this.heightFactor);
  }

  getVisibleWidth(): number {
    return NumbersUtilsService.scale(this.width, this.widthFactor);
  }

  getVisibleHeight(): number {
    return NumbersUtilsService.scale(this.height, this.heightFactor);
  }
}
