import {MatTableDataSource} from '@angular/material/table';
import {ArraysUtilsService} from './arrays-utils.service';

export class MatTableUtilsService {
  // MatTableDataSource do not updates itself after splice invoke straight on it
  static removeElementsByIdx(source: MatTableDataSource<any>, startElementIdx: number, elementsCount: number): void {
    const sourceData = source.data;
    ArraysUtilsService.deleteElementsByIdx(sourceData, startElementIdx, elementsCount);
    this.setData(sourceData, source);
  }

  static getData(source: MatTableDataSource<any>): any[] {
    return source.data;
  }

  static setData(source: any[], target: MatTableDataSource<any>): void {
    target.data = source;
  }
}
