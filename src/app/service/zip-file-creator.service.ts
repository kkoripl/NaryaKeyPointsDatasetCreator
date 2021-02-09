import * as JSZip from 'jszip';
import * as FileSaver from 'file-saver';
import {XmlFile} from '../model/xml-file';
import {ImgFile} from '../model/img-file';

export class ZipFileCreatorService {
  static xmlDirectoryName = 'Annotations';

  static generateZip(xmls: XmlFile[], imgs: ImgFile[], statsFileContent: string, zipFileName: string, imgDirectoryName: string) {
    const zip = new JSZip();
    const xmlDirectory = zip.folder(this.xmlDirectoryName);
    const imagesDirectory = zip.folder(imgDirectoryName);
    this.addXmls(xmls, xmlDirectory);
    this.addImages(imgs, imagesDirectory);
    this.addStats(statsFileContent, zip);
    zip.generateAsync({type: 'blob'})
      .then((content) => {
        FileSaver.saveAs(content, zipFileName + '.zip');
      });
  }

  private static addImages(images: ImgFile[], imagesDirectory) {
    images.forEach((image) => {
      imagesDirectory.file(image.name, image.blob, {binary: true});
    });
  }

  private static addXmls(xmls: XmlFile[], xmlDirectory) {
    xmls.forEach((xml) => {
      xmlDirectory.file(xml.name, xml.content);
    });
  }

  private static addStats(statsFileContent: string, zip) {
    zip.file('stats.txt', statsFileContent);
  }
}
