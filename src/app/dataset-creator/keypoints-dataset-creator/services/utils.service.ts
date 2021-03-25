import {Keypoint} from '../models/keypoint';
import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable()
export class UtilsService {

  allKeypointsIds = environment.templateKeyPoints.map((keypoint) => keypoint.id);

  static deleteElementFromList(list, elementToDelete) {
    const elementIdx = list.findIndex(listElement => listElement === elementToDelete);
    list.splice(elementIdx, 1);
    return list;
  }

  static count2dElements(array: any[][]): number {
    let size = 0;
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < array.length; i++) {
      size += array[i].length;
    }
    return size;
  }

  static countKeyPointsTypes(keyPoints: Keypoint[][]) {
    const allKeypointsIds = environment.templateKeyPoints.map((keypoint) => keypoint.id);
    const counts = {};

    for (const keyPointId in allKeypointsIds) {
      counts[keyPointId] = 0;
    }

    for (let i = 0; i < keyPoints.length; i++) {
      for (let j = 0; j < keyPoints[i].length; j++) {
        counts[keyPoints[i][j].id] = 1 + counts[keyPoints[i][j].id];
      }
    }

    return counts;
  }
}
