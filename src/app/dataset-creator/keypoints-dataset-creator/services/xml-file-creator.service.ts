import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';

import {XmlFileBaseCreatorService} from '../../../commons/services/xml-file-base-creator.service';
import {Keypoint} from '../models/keypoint';

@Injectable()
export class XmlFileCreatorService extends XmlFileBaseCreatorService {
  keyPointTags = environment.xmlTags.keyPoint;

  protected createElement(xmlWriter: any, keyPointData: Keypoint) {
    xmlWriter
      .startElement(this.keyPointTags.object)
        .writeElement(this.keyPointTags.id, keyPointData.id)
        .writeElement(this.keyPointTags.difficult, this.keyPointTags.difficultDefault)
        .startElement(this.keyPointTags.cords)
          .writeElement(this.keyPointTags.x, keyPointData.x)
          .writeElement(this.keyPointTags.y, keyPointData.y)
          .writeElement(this.keyPointTags.v, this.keyPointTags.vDefault)
        .endElement()
        .startElement(this.keyPointTags.boundingBox)
          .writeElement(this.keyPointTags.xmin, keyPointData.x)
          .writeElement(this.keyPointTags.ymin, keyPointData.y)
          .writeElement(this.keyPointTags.xmax, keyPointData.x)
          .writeElement(this.keyPointTags.ymax, keyPointData.y)
        .endElement()
      .endElement();
  }
}
