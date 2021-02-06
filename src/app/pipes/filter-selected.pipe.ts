import { Pipe, PipeTransform } from '@angular/core';

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
