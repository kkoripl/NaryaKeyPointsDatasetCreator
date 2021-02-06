import {environment} from '../../environments/environment';

export class PathsGeneratorService {

  private static assetsDir = './assets/';
  private static imagesDir = PathsGeneratorService.assetsDir + 'images/';

  public static getIdsTemplatePath(): string {
    return this.imagesDir + environment.idTemplateImage;
  }
}
