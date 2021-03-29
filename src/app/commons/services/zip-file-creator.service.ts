import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import {XmlFile} from '../models/classes/xml-file';
import {ImgFile} from '../models/classes/img-file';
import {Injectable} from '@angular/core';

@Injectable()
export class ZipFileCreatorService {
  static xmlDirectoryName = 'Annotations';

  static generateZip(xmls: XmlFile[], imgs: ImgFile[], txtFileContent: string, zipFileName: string,
                     imgDirectoryName: string, txtFileName: string): Promise<any> {
    return new Promise(resolve => {
      const zip = new JSZip();
      const xmlDirectory = this.addDirectory(zip, this.xmlDirectoryName);
      const imagesDirectory = this.addDirectory(zip, imgDirectoryName);
      this.addXmls(xmls, xmlDirectory);
      this.addImages(imgs, imagesDirectory);
      this.addFile(txtFileName, txtFileContent, zip);
      zip.generateAsync({type: 'blob'})
        .then((content) => {
          FileSaver.saveAs(content, zipFileName + '.zip');
          resolve();
        });
    });
  }

  private static addDirectory(zip: JSZip, directoryName: string): JSZip {
    return zip.folder(directoryName);
  }

  private static addImages(images: ImgFile[], imagesDirectory): void {
    images.forEach((image) => {
      imagesDirectory.file(image.name, image.blob, {binary: true});
    });
  }

  private static addXmls(xmls: XmlFile[], xmlDirectory): void {
    xmls.forEach((xml) => {
      xmlDirectory.file(xml.name, xml.content);
    });
  }

  private static addFile(filename: string, statsFileContent: string, zip): void {
    zip.file(filename, statsFileContent);
  }
}
