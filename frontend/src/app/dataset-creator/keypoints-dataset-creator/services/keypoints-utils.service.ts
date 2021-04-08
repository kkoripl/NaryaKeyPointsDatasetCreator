import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';

import {Keypoint} from '../models/keypoint';

@Injectable()
export class KeypointsUtilsService {

  allKeypointsIds = environment.templateKeyPoints.map((keypoint) => keypoint.id);

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
