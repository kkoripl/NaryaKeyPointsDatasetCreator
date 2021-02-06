export class ImageData {
  directory: string;
  filename: string;
  dataUrl: string;
  width: number;
  height: number;
  depth = 3;

  constructor(directory: string, filename: string, dataUrl: string, width: number, height: number) {
    this.directory = directory;
    this.filename = filename;
    this.dataUrl = dataUrl;
    this.width = width;
    this.height = height;
  }

  getFilenameWoExtension(): string {
    return this.filename.split('.')[0];
  }

  getDataUrlWoBase64(): string {
    return this.dataUrl.split(',')[1];
  }
}
