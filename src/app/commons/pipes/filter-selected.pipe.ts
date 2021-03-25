import {Injectable, Pipe, PipeTransform} from '@angular/core';
import {UtilsModule} from '../utils.module';

@Pipe({
  name: 'filterSelected'
})
export class FilterSelectedPipe implements PipeTransform {
  transform(items: any[], selectedItems: any[]): any {
    if (!items || !selectedItems) {
      return items;
    }
    return items.filter(item => selectedItems.indexOf(item) === -1);
  }
}
