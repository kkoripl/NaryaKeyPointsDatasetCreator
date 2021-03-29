import {environment} from '../../../environments/environment';
import XMLWriter from 'xml-writer';

import {ImageData} from '../models/image-data';
import {XmlFile} from '../models/xml-file';
import {DatasetElement} from '../models/dataset-element';

export abstract class XmlFileBaseCreatorService {
  mainTag = environment.xmlTags.mainTag;
  imgDataTags = environment.xmlTags.imgData;

  createXmlFile(imageData: ImageData, elements: DatasetElement[]): XmlFile {
    return new XmlFile(imageData.getFilenameWoExtension(), this.createXmlContent(imageData, elements));
  }

  private createXmlContent(imageData: ImageData, elements: DatasetElement[]): string {
    const xmlWriter = new XMLWriter;
    xmlWriter.startElement(this.mainTag);
    this.createImageData(xmlWriter, imageData);
    this.createElements(xmlWriter, elements);
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

  private createElements(xmlWriter: any, elements: DatasetElement[]) {
    for (const elementData of elements) {
      this.createElement(xmlWriter, elementData);
    }
  }

  protected abstract createElement(xmlWriter: any, elements: DatasetElement): void;
}
