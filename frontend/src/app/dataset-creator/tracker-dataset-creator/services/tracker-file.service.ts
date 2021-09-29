import {Injectable} from '@angular/core';

import {BaseFilesService} from '../../../commons/services/base-files.service';
import {ZipFileCreatorService} from '../../../commons/services/zip-file-creator.service';
import {TrackerXmlFileCreatorService} from './tracker-xml-file-creator.service';
import {XmlImageData} from '../../../commons/models/classes/xml-image-data';
import {BoundingBox} from '../models/bounding-box';
import {XmlFile} from '../../../commons/models/classes/xml-file';
import {TrackerXmlParserService} from './tracker-xml-parser.service';
import {ImageDimension} from '../../../commons/models/interfaces/image-dimension';

@Injectable()
export class TrackerFileService extends BaseFilesService {
  private xmlCreator: TrackerXmlFileCreatorService;


  constructor(xmlFileCreatorService: TrackerXmlFileCreatorService,
              private xmlParser: TrackerXmlParserService) {
    super();
    this.fileReader = new FileReader();
    this.xmlCreator = xmlFileCreatorService;
  }

  uploadAnnotations($event, visibleImgDimension: ImageDimension, resizedImgDimension: ImageDimension) {
    const annotations = $event.target.files;
    const promises = [];
    for (const annotation of annotations) {
      const promise = new Promise((resolve => {
        this.xmlParser.readXmlFile(annotation)
          .then((content) => {
            resolve(this.xmlParser.parseImageBboxes(content, visibleImgDimension, resizedImgDimension));
          });
      }));
      promises.push(promise);
    }
    return Promise.all(promises);
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
    this.xmlParser.parseToJson(this.xmlCreator.createXmlFile(imgData, bboxes).content);
    return this.xmlCreator.createXmlFile(imgData, bboxes);
  }

  private createSetFileContent(imgDatas: XmlImageData[]): string {
    return imgDatas.map(imgData => imgData.getFilenameWoExtension()).join('\n');
  }
}
