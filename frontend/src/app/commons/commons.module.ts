import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';

import {NotificationService} from './services/notification.service';
import {PathsGeneratorService} from './services/paths.generator.service';
import {KonvaService} from './services/konva.service';
import {NumbersUtilsService} from './services/utils/numbers-utils.service';
import {SpinnerService} from './dialogs/spinner/spinner.service';
import {SpinnerComponent} from './dialogs/spinner/spinner.component';
import {FilterSelectedPipe} from './pipes/filter-selected.pipe';
import {ArraysUtilsService} from './services/utils/arrays-utils.service';
import {ZipFileCreatorService} from './services/zip-file-creator.service';
import {MatTableUtilsService} from './services/utils/mat-table-utils.service';
import {KeysUtilsService} from './services/utils/keys-utils.service';

@NgModule({
  declarations: [
    SpinnerComponent,
    FilterSelectedPipe
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  providers: [
    NotificationService,
    PathsGeneratorService,
    SpinnerService,
    KonvaService,
    ZipFileCreatorService,
    NumbersUtilsService,
    ArraysUtilsService,
    MatTableUtilsService,
    KeysUtilsService
  ]
})
export class CommonsModule { }
