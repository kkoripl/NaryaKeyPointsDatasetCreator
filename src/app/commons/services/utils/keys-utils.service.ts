import {Injectable} from '@angular/core';

@Injectable()
export class KeysUtilsService {
  static is(key: string, char: string): boolean {
    return key.toLowerCase() === char;
  }
}
