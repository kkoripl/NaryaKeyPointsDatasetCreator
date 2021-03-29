import {ImageDimension} from '../interfaces/image-dimension';

export class XmlImageData {
  directory: string;
  filename: string;
  dataUrl: string;
  dimension: ImageDimension;
  depth = 3;

  constructor(directory: string, filename: string, dataUrl: string, dimension: ImageDimension) {
    this.directory = directory;
    this.filename = filename;
    this.dataUrl = dataUrl;
    this.dimension = dimension;
  }

  getFilenameWoExtension(): string {
    return this.filename.split('.').slice(0, -1).join('.');
  }

  getDataUrlWoBase64(): string {
    return this.dataUrl.split(',')[1];
  }
}
