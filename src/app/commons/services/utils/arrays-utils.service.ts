import {Injectable} from '@angular/core';

@Injectable()
export class ArraysUtilsService {
  static findAndDeleteElement(list: any[], elementToDelete: any): any[] {
    const elementIdx = list.findIndex(listElement => listElement === elementToDelete);
    list.splice(elementIdx, 1);
    return list;
  }

  static count2dElements(array: any[][]): number {
    let size = 0;
    for (let i = 0; i < array.length; i++) {
      size += array[i].length;
    }
    return size;
  }

  static deleteElementsByIdx(source: any[], startElementIdx: number, elementsCount: number) {
    source.splice(startElementIdx, elementsCount);
  }
}
