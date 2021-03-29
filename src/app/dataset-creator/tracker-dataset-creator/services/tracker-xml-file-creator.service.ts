import {environment} from '../../../../environments/environment';
import {Injectable} from '@angular/core';

import {XmlFileBaseCreatorService} from '../../../commons/services/xml-file-base-creator.service';
import {BoundingBox} from '../models/bounding-box';

@Injectable()
export class TrackerXmlFileCreatorService extends XmlFileBaseCreatorService{
  bboxesTags = environment.xmlTags.bbox;

  protected createElement(xmlWriter: any, elementData: BoundingBox): void {
    xmlWriter
      .startElement(this.bboxesTags.object)
        .writeElement(this.bboxesTags.label, elementData.label)
        .startElement(this.bboxesTags.boundingBox)
          .writeElement(this.bboxesTags.xmin, elementData.x)
          .writeElement(this.bboxesTags.ymin, elementData.y)
          .writeElement(this.bboxesTags.xmax, elementData.getXmax())
          .writeElement(this.bboxesTags.ymax, elementData.getYmax())
        .endElement()
      .endElement();
  }
}
