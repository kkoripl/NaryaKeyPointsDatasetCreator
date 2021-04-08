import {Injectable} from '@angular/core';

import {BaseFilesService} from '../../../commons/services/base-files.service';
import {Keypoint} from '../models/keypoint';
import {XmlImageData} from '../../../commons/models/classes/xml-image-data';
import {XmlFile} from '../../../commons/models/classes/xml-file';
import {KeypointsUtilsService} from './keypoints-utils.service';
import {KeypointsXmlFileCreatorService} from './keypoints-xml-file-creator.service';
import {ZipFileCreatorService} from '../../../commons/services/zip-file-creator.service';

@Injectable()
export class KeypointsFileService extends BaseFilesService {
  private xmlCreator: KeypointsXmlFileCreatorService;

  constructor(xmlFileCreatorService: KeypointsXmlFileCreatorService) {
    super();
    this.fileReader = new FileReader();
    this.xmlCreator = xmlFileCreatorService;
  }

  generateDataFiles(imgDatas: XmlImageData[], keyPoints: Keypoint[][], zipFileName: string, imgDirectoryName: string): Promise<any> {
    return new Promise(resolve => {
      const xmlFiles = this.createXmlFiles(imgDatas, keyPoints);
      const imgFiles = this.createImageFiles(imgDatas);
      const statsFileContent = this.createStatsFileContent(keyPoints);
      ZipFileCreatorService.generateZip(xmlFiles, imgFiles, statsFileContent, zipFileName, imgDirectoryName, 'stats.txt')
        .then(() => resolve());
    });
  }

  protected createXmlFiles(imgDatas: XmlImageData[], keyPoints: Keypoint[][]): XmlFile[] {
    const files = [];
    for (let i = 0; i < imgDatas.length ; i++) {
      files.push(this.createXmlFile(imgDatas[i], keyPoints[i]));
    }
    return files;
  }

  protected createXmlFile(imgData: XmlImageData, keyPoints: Keypoint[]): XmlFile {
    return this.xmlCreator.createXmlFile(imgData, keyPoints);
  }

  private createStatsFileContent(keyPoints: Keypoint[][]): string {
    const counts = KeypointsUtilsService.countKeyPointsTypes(keyPoints);
    return this.statsFileHeader + JSON.stringify(counts)
      .replace(/:/gi, '\t - \t')
      .replace(/,/gi, '\n')
      .replace(/{/gi, '')
      .replace(/}/gi, '')
      .replace(/\"/gi, '');
  }
}
