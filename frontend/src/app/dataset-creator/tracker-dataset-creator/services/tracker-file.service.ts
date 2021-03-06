import {Injectable} from '@angular/core';

import {BaseFilesService} from '../../../commons/services/base-files.service';
import {ZipFileCreatorService} from '../../../commons/services/zip-file-creator.service';
import {TrackerXmlFileCreatorService} from './tracker-xml-file-creator.service';
import {XmlImageData} from '../../../commons/models/classes/xml-image-data';
import {BoundingBox} from '../models/bounding-box';
import {XmlFile} from '../../../commons/models/classes/xml-file';

@Injectable()
export class TrackerFileService extends BaseFilesService {
  private xmlCreator: TrackerXmlFileCreatorService;

  constructor(xmlFileCreatorService: TrackerXmlFileCreatorService) {
    super();
    this.fileReader = new FileReader();
    this.xmlCreator = xmlFileCreatorService;
  }

  uploadFiles($event) {
    super.uploadFiles($event);
  }

  generateDataFiles(imgDatas: XmlImageData[], bboxes: BoundingBox[][], zipFileName: string, imgDirectoryName: string): Promise<any> {
    return new Promise(resolve => {
      const xmlFiles = this.createXmlFiles(imgDatas, bboxes, 'jpg');
      const imgFiles = this.createImageFiles(imgDatas, 'jpg');
      const setFileContent = this.createSetFileContent(imgDatas);
      ZipFileCreatorService.generateZip(xmlFiles, imgFiles, setFileContent, zipFileName, imgDirectoryName, 'set.txt')
        .then(() => resolve());
    });
  }

  protected createXmlFiles(imgDatas: XmlImageData[], bboxes: BoundingBox[][], imgExtension: string = ''): XmlFile[] {
    const files = [];
    for (let i = 0; i < imgDatas.length ; i++) {
      if (imgExtension) {
        imgDatas[i].filename = imgDatas[i].getFilenameWoExtension() + '.' + imgExtension;
      }
      files.push(this.createXmlFile(imgDatas[i], bboxes[i]));
    }
    return files;
  }

  protected createXmlFile(imgData: XmlImageData, bboxes: BoundingBox[]): XmlFile {
    return this.xmlCreator.createXmlFile(imgData, bboxes);
  }

  private createSetFileContent(imgDatas: XmlImageData[]): string {
    return imgDatas.map(imgData => imgData.getFilenameWoExtension()).join('\n');
  }
}
