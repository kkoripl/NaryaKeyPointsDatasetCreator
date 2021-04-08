import {DatasetElement} from '../../../commons/models/classes/dataset-element';
import {ScaleFactors} from '../../../commons/models/interfaces/scale-factors';
import {NumbersUtilsService} from '../../../commons/services/utils/numbers-utils.service';

export class Keypoint extends DatasetElement {
  id: number;
  x: number;
  y: number;
  scaleFactors: ScaleFactors;
  heightFactor: number;

  constructor(point) {
    super();
    this.x = point.x;
    this.y = point.y;
    this.scaleFactors = point.scaleFactors;
  }

  getVisibleX(): number {
    return NumbersUtilsService.scale(this.x, this.scaleFactors.width);
  }

  getVisibleY(): number {
    return NumbersUtilsService.scale(this.y, this.scaleFactors.height);
  }
}
