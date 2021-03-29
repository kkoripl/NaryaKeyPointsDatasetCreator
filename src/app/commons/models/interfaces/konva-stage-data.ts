import {ImageDimension} from './image-dimension';
import {ScaleFactors} from './scale-factors';

export interface KonvaStageData {
  containerName: string;
  imageUrl: string;
  imageDimension: ImageDimension;
  scaleFactors: ScaleFactors;
}
