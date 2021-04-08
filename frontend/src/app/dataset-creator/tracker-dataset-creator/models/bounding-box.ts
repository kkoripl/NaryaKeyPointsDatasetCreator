import {DatasetElement} from '../../../commons/models/classes/dataset-element';
import {NumbersUtilsService} from '../../../commons/services/utils/numbers-utils.service';
import {ScaleFactors} from '../../../commons/models/interfaces/scale-factors';
import {BoundingBoxLabel} from '../enums/bounding-box-label';

export class BoundingBox extends DatasetElement {
  x: number;
  y: number;
  width: number;
  height: number;
  scaleFactors: ScaleFactors;
  label: string = BoundingBoxLabel.PLAYER;

  constructor(x: number, y: number, width: number, height: number, scaleFactors: ScaleFactors) {
    super();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.scaleFactors = scaleFactors;
  }

  getXmax(): number {
    return this.x + this.width;
  }

  getYmax(): number {
    return this.y + this.height;
  }

  getVisibleX(): number {
    return NumbersUtilsService.scale(this.x, this.scaleFactors.width);
  }

  getVisibleY(): number {
    return NumbersUtilsService.scale(this.y, this.scaleFactors.height);
  }

  getVisibleWidth(): number {
    return NumbersUtilsService.scale(this.width, this.scaleFactors.width);
  }

  getVisibleHeight(): number {
    return NumbersUtilsService.scale(this.height, this.scaleFactors.height);
  }
}
