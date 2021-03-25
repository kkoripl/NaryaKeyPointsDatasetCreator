export class XmlFile {
  name: string;
  content: string;

  constructor(name: string, content: string) {
    this.name = name + '.xml';
    this.content = content;
  }
}
