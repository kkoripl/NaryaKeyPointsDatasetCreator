import {environment} from '../../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable()
export class PathsGeneratorService {

  private static assetsDir = './assets/';
  private static imagesDir = PathsGeneratorService.assetsDir + 'images/';

  public static getIdsTemplatePath(): string {
    return this.imagesDir + environment.idTemplateImage;
  }
}
