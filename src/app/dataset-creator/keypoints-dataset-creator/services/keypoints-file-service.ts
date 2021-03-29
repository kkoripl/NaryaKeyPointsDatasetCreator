import {Injectable} from '@angular/core';

import {BaseFilesService} from '../../../commons/services/base-files.service';
import {Keypoint} from '../models/keypoint';
import {ImageData} from '../../../commons/models/image-data';
import {XmlFile} from '../../../commons/models/xml-file';
import {KeypointsUtilsService} from './keypoints-utils.service';
import {XmlFileCreatorService} from './xml-file-creator.service';
import {ZipFileCreatorService} from '../../../commons/services/zip-file-creator.service';

@Injectable()
export class KeypointsFileService extends BaseFilesService {
  private xmlCreator: XmlFileCreatorService;

  generateDataFiles(imgDatas: ImageData[], keyPoints: Keypoint[][], zipFileName: string, imgDirectoryName: string): Promise<any> {
    return new Promise(resolve => {
      const xmlFiles = this.createXmlFiles(imgDatas, keyPoints);
      const imgFiles = this.createImageFiles(imgDatas);
      const statsFileContent = this.createStatsFileContent(keyPoints);
      ZipFileCreatorService.generateZip(xmlFiles, imgFiles, statsFileContent, zipFileName, imgDirectoryName, 'stats.txt')
        .then(() => resolve());
    });
  }

  protected createXmlFiles(imgDatas: ImageData[], keyPoints: Keypoint[][]): XmlFile[] {
    const files = [];
    for (let i = 0; i < imgDatas.length ; i++) {
      files.push(this.createXmlFile(imgDatas[i], keyPoints[i]));
    }
    return files;
  }

  protected createXmlFile(imgData: ImageData, keyPoints: Keypoint[]): XmlFile {
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
