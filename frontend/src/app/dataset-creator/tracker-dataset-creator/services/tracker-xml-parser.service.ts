import {XmlBaseParserService} from '../../../commons/services/xml-base-parser.service';
import {Injectable} from '@angular/core';
import {BoundingBox} from '../models/bounding-box';
import {ImageDimension} from '../../../commons/models/interfaces/image-dimension';

@Injectable()
export class TrackerXmlParserService extends XmlBaseParserService {
    parseImageBboxes(xml: any, visibleImgDimension: ImageDimension, resizedImgDimension: ImageDimension) {
      const bboxes = [];
      const jsonBboxes = this.parseToJson(xml).annotation;
      const imgName = jsonBboxes.filename;
      const annotatedImgDim = jsonBboxes.size;
      console.log('jsonBboxes.object');
      console.log(jsonBboxes.object);
      console.log(jsonBboxes);
      for (let jsonBbox of jsonBboxes.object) {
        jsonBbox = jsonBbox.bndbox;
        bboxes.push(new BoundingBox(jsonBbox.xmin,
          jsonBbox.ymin,
          Math.abs(jsonBbox.xmin - jsonBbox.xmax),
          Math.abs(jsonBbox.ymin - jsonBbox.ymax),
          {width: (visibleImgDimension.width / resizedImgDimension.width) * (annotatedImgDim.width / resizedImgDimension.width),
                     height: (visibleImgDimension.width / resizedImgDimension.width) * (annotatedImgDim.width / resizedImgDimension.width)}));
      }

      return {imgName, bboxes};
    }
}
