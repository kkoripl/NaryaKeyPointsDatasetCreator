export class ImgFile {
  name: string;
  blob: Blob;

  constructor(name: string, blob: Blob) {
    this.name = name;
    this.blob = blob;
  }
}
