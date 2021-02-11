import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {XmlFileCreatorService} from './xml-file-creator.service';
import {Keypoint} from '../model/keypoint';
import {ImageData} from '../model/image-data';
import {XmlFile} from '../model/xml-file';
import {ImgFile} from '../model/img-file';
import {ZipFileCreatorService} from './zip-file-creator.service';
import {environment} from '../../environments/environment';
import {UtilsService} from './utils.service';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
  private imageFiles: FileList;
  private fileReader: FileReader;
  private xmlCreator: XmlFileCreatorService;

  private validImageTypes = environment.validImageMimeTypes;
  private statsFileHeader = environment.defaults.statsFileHeader;

  constructor(xmlFileCreatorService: XmlFileCreatorService) {
    this.fileReader = new FileReader();
    this.xmlCreator = xmlFileCreatorService;
  }

  validFileTypes($event): boolean {
    const files = $event.target.files;
    let valid = false;
    for (let i = 0; i < files.length; i++) {
      valid = this.validImageTypes.indexOf(files[i].type) > -1;
    }
    return valid;
  }

  uploadFiles(event) {
    if (this.imageFiles === undefined) {
      this.imageFiles = event.target.files;
    } else {
      this.imageFiles = this.mergeFileLists(this.imageFiles, event.target.files);
    }
  }

  removeFile(fileIdx: number) {
    this.imageFiles = this.removeFromFileList(fileIdx, this.imageFiles);
  }

  private removeFromFileList(fileIdx: number, fileList: FileList) {
    const df = new DataTransfer();
    for (let i = 0; i < fileList.length; i++) {
      if (i !== fileIdx) {
        df.items.add(fileList.item(i));
      }
    }
    return df.files;
  }

  private mergeFileLists(existingFiles: FileList, newFiles: FileList): FileList {
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

  generateDataFiles(imgDatas: ImageData[], keyPoints: Keypoint[][], zipFileName: string, imgDirectoryName: string) {
    const xmlFiles = this.createXmlFiles(imgDatas, keyPoints);
    const imgFiles = this.createImageFiles(imgDatas);
    const statsFileContent = this.createStatsFileContent(keyPoints);
    ZipFileCreatorService.generateZip(xmlFiles, imgFiles, statsFileContent, zipFileName, imgDirectoryName);
  }

  private createImageFiles(imageDatas: ImageData[]): ImgFile[] {
    const imageFiles = [];
    for (const imageData of imageDatas) {
        imageFiles.push(new ImgFile(imageData.getFilenameWithJpgExtension(), this.fromDataUrlToBlob(imageData.dataUrl)));
    }

    return imageFiles;
  }

  private createXmlFiles(imgDatas: ImageData[], keyPoints: Keypoint[][]): XmlFile[] {
    const files = [];
    for (let i = 0; i < imgDatas.length ; i++) {
      files.push(this.createXmlFile(imgDatas[i], keyPoints[i]));
    }
    return files;
  }

  private createXmlFile(imgData: ImageData, keyPoints: Keypoint[]): XmlFile {
    return this.xmlCreator.createXmlFile(imgData, keyPoints);
  }

  private createStatsFileContent(keyPoints: Keypoint[][]): string {
    const counts = UtilsService.countKeyPointsTypes(keyPoints);
    const header = 'Key point ID / Count\n';
    return this.statsFileHeader + JSON.stringify(counts)
      .replace(/:/gi, '\t - \t')
      .replace(/,/gi, '\n')
      .replace(/{/gi, '')
      .replace(/}/gi, '')
      .replace(/\"/gi, '');
  }

  private fromDataUrlToBlob(dataUrl: string): Blob {
      const byteString = atob(dataUrl.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const bb = new Blob([ab]);
      return bb;
    }
}
