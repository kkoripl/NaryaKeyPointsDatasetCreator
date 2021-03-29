import {Injectable} from '@angular/core';

import {BaseFilesService} from '../../../commons/services/base-files.service';
import {ZipFileCreatorService} from '../../../commons/services/zip-file-creator.service';
import {TrackerXmlFileCreatorService} from './tracker-xml-file-creator.service';
import {ImageData} from '../../../commons/models/image-data';
import {BoundingBox} from '../models/bounding-box';
import {XmlFile} from '../../../commons/models/xml-file';

@Injectable()
export class TrackerFileService extends BaseFilesService {
  private xmlCreator: TrackerXmlFileCreatorService;

  constructor(xmlFileCreatorService: TrackerXmlFileCreatorService) {
    super();
    this.fileReader = new FileReader();
    this.xmlCreator = xmlFileCreatorService;
  }

  generateDataFiles(imgDatas: ImageData[], bboxes: BoundingBox[][], zipFileName: string, imgDirectoryName: string): Promise<any> {
    return new Promise(resolve => {
      const xmlFiles = this.createXmlFiles(imgDatas, bboxes);
      const imgFiles = this.createImageFiles(imgDatas);
      const setFileContent = this.createSetFileContent(imgDatas);
      ZipFileCreatorService.generateZip(xmlFiles, imgFiles, setFileContent, zipFileName, imgDirectoryName, 'set.txt')
        .then(() => resolve());
    });
  }

  protected createXmlFiles(imgDatas: ImageData[], bboxes: BoundingBox[][]): XmlFile[] {
    const files = [];
    for (let i = 0; i < imgDatas.length ; i++) {
      files.push(this.createXmlFile(imgDatas[i], bboxes[i]));
    }
    return files;
  }

  protected createXmlFile(imgData: ImageData, bboxes: BoundingBox[]): XmlFile {
    return this.xmlCreator.createXmlFile(imgData, bboxes);
  }

  private createSetFileContent(imgDatas: ImageData[]): string {
    return imgDatas.map(imgData => imgData.filename).join('\n');
  }
}
