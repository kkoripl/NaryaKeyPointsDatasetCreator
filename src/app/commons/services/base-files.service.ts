import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';

import {XmlImageData} from '../models/classes/xml-image-data';
import {ImgFile} from '../models/classes/img-file';
import {XmlFile} from '../models/classes/xml-file';
import {DatasetElement} from '../models/classes/dataset-element';

@Injectable()
export abstract class BaseFilesService {
  protected imageFiles: FileList;
  protected fileReader: FileReader;

  protected validImageTypes = environment.validImageMimeTypes;
  protected statsFileHeader = environment.defaults.statsFileHeader;

  protected abstract generateDataFiles(imgDatas: XmlImageData[], elements: DatasetElement[][],
                                       zipFileName: string, imgDirectoryName: string): Promise<any>;
  protected abstract createXmlFiles(imgDatas: XmlImageData[], datasetElements: DatasetElement[][]): XmlFile[];
  protected abstract createXmlFile(imgData: XmlImageData, datasetElements: DatasetElement[]): XmlFile;

  validFileTypes($event): boolean {
    const files = $event.target.files;
    let valid = false;
    for (let i = 0; i < files.length; i++) {
      valid = this.validImageTypes.indexOf(files[i].type) > -1;
    }
    return valid;
  }

  uploadFiles($event): void {
    if (this.imageFiles === undefined) {
      this.imageFiles = this.mergeFileLists((new DataTransfer()).files, $event.target.files);
    } else {
      this.imageFiles = this.mergeFileLists(this.imageFiles, $event.target.files);
    }
  }

  removeFile(fileIdx: number): void {
    this.imageFiles = this.removeFromFileList(fileIdx, this.imageFiles);
  }

  protected removeFromFileList(fileIdx: number, fileList: FileList): FileList {
    const df = new DataTransfer();
    for (let i = 0; i < fileList.length; i++) {
      if (i !== fileIdx) {
        df.items.add(fileList.item(i));
      }
    }
    return df.files;
  }

  protected mergeFileLists(existingFiles: FileList, newFiles: FileList): FileList {
    const df = new DataTransfer();
    for (let i = 0; i < existingFiles.length; i++) {
      df.items.add(existingFiles.item(i));
    }
    for (let j = 0; j < newFiles.length; j++) {
      df.items.add(newFiles.item(j));
    }
    return df.files;
  }

  getDataUrl(idx: number) {
    return new Promise((resolve) => {
      this.fileReader.readAsDataURL(this.imageFiles.item(idx));
      this.fileReader.onload = event => {
        const imageUrl = this.fileReader.result;
        resolve(imageUrl);
      };
    });
  }

  getNewFilesNames(event: any): string[] {
    const filenames = [];
    for (let i = 0; i < event.target.files.length; i++) {
      filenames.push(event.target.files.item(i).name);
    }
    return filenames;
  }

  getNewFiles(event: any): FileList {
    return event.target.files;
  }

  getFileNames(): string[] {
    const filenames = [];
    if (this.imageFiles === undefined) {
      return filenames;
    }

    for (let i = 0; i < this.imageFiles.length; i++) {
      filenames.push(this.imageFiles.item(i).name);
    }
    return filenames;
  }

  protected createImageFiles(imageDatas: XmlImageData[]): ImgFile[] {
    const imageFiles = [];
    for (const imageData of imageDatas) {
      imageFiles.push(new ImgFile(imageData.filename, this.fromDataUrlToBlob(imageData.dataUrl)));
    }

    return imageFiles;
  }

  protected fromDataUrlToBlob(dataUrl: string): Blob {
    const byteString = atob(dataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab]);
  }
}
