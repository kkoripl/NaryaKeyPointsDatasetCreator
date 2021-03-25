import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {SpinnerComponent} from './spinner.component';

@Injectable()
export class SpinnerService {

  constructor(private router: Router, private dialog: MatDialog) {}

  start(message?): MatDialogRef<SpinnerComponent> {
    return this.dialog.open(SpinnerComponent, {
      disableClose: true ,
      data: message === '' || message === undefined ? 'Loading...' : message
    });
  }

  stop(ref: MatDialogRef<SpinnerComponent>){
    ref.close();
  }
}
