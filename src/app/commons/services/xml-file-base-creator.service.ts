import {environment} from '../../../environments/environment';
import XMLWriter from 'xml-writer';

import {XmlImageData} from '../models/classes/xml-image-data';
import {XmlFile} from '../models/classes/xml-file';
import {DatasetElement} from '../models/classes/dataset-element';

export abstract class XmlFileBaseCreatorService {
  mainTag = environment.xmlTags.mainTag;
  imgDataTags = environment.xmlTags.imgData;

  protected abstract createElement(xmlWriter: any, elements: DatasetElement): void;

  createXmlFile(imageData: XmlImageData, elements: DatasetElement[]): XmlFile {
    return new XmlFile(imageData.getFilenameWoExtension(), this.createXmlContent(imageData, elements));
  }

  private createXmlContent(imageData: XmlImageData, elements: DatasetElement[]): string {
    const xmlWriter = new XMLWriter;
    xmlWriter.startElement(this.mainTag);
    this.createImageData(xmlWriter, imageData);
    this.createElements(xmlWriter, elements);
    xmlWriter.endElement();
    return xmlWriter.toString();
  }

  private createImageData(xmlWriter: any, imageData: XmlImageData): void {
    xmlWriter
      .writeElement(this.imgDataTags.directory, imageData.directory)
      .writeElement(this.imgDataTags.filename, imageData.filename)
      .startElement(this.imgDataTags.size)
      .writeElement(this.imgDataTags.width, imageData.dimension.width)
      .writeElement(this.imgDataTags.height, imageData.dimension.height)
      .writeElement(this.imgDataTags.depth, imageData.depth)
      .endElement();
  }

  private createElements(xmlWriter: any, elements: DatasetElement[]): void {
    for (const elementData of elements) {
      this.createElement(xmlWriter, elementData);
    }
  }
}
