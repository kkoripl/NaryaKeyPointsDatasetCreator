import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';

import XMLWriter from 'xml-writer';
import {Keypoint} from '../model/keypoint';
import {ImageData} from '../model/image-data';
import {XmlFile} from '../model/xml-file';

@Injectable({
  providedIn: 'root'
})
export class XmlFileCreatorService {
  mainTag = environment.xmlTags.mainTag;
  keyPointTags = environment.xmlTags.keyPoint;
  imgDataTags = environment.xmlTags.imgData;

  createXmlFile(imageData: ImageData, keypoints: Keypoint[]): XmlFile {
    return new XmlFile(imageData.getFilenameWoExtension(), this.createXmlContent(imageData, keypoints));
  }

  private createXmlContent(imageData: ImageData, keypoints: Keypoint[]): string {
    const xmlWriter = new XMLWriter;
    xmlWriter.startElement(this.mainTag);
    this.createImageData(xmlWriter, imageData);
    this.createKeyPoints(xmlWriter, keypoints);
    xmlWriter.endElement();
    return xmlWriter.toString();
  }

  private createImageData(xmlWriter: any, imageData: ImageData) {
    xmlWriter
      .writeElement(this.imgDataTags.directory, imageData.directory)
      .writeElement(this.imgDataTags.filename, imageData.filename)
      .startElement(this.imgDataTags.size)
        .writeElement(this.imgDataTags.width, imageData.width)
        .writeElement(this.imgDataTags.height, imageData.height)
        .writeElement(this.imgDataTags.depth, imageData.depth)
      .endElement();
  }

  private createKeyPoints(xmlWriter: any, keyPointsData: Keypoint[]) {
    for (const keyPointData of keyPointsData) {
      this.createKeyPoint(xmlWriter, keyPointData);
    }
  }

  private createKeyPoint(xmlWriter: any, keyPointData: Keypoint) {
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
