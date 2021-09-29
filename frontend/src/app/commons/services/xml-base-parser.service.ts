import {Injectable} from '@angular/core';

@Injectable()

export class XmlBaseParserService {
  parser = require('fast-xml-parser');
  options = {};

  parseToJson(xmlData: string): any {
    try {
      return this.parser.parse(xmlData, this.options, true);
    } catch (error) {
      console.log(error.message);
    }
  }

  readXmlFile(file) {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const xmlContent = fileReader.result;
        resolve(xmlContent);
      };
      fileReader.readAsText(file);
    });
  }
}
