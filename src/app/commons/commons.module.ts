import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';

import {NotificationService} from './services/notification.service';
import {PathsGeneratorService} from './services/paths.generator.service';
import {KonvaService} from './services/konva.service';
import {NumbersUtilsService} from './services/numbers-utils.service';
import {SpinnerService} from './dialogs/spinner/spinner.service';
import {SpinnerComponent} from './dialogs/spinner/spinner.component';
import {FilterSelectedPipe} from './pipes/filter-selected.pipe';
import {ArraysUtilsService} from './services/arrays-utils.service';

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
    NumbersUtilsService,
    ArraysUtilsService
  ]
})
export class CommonsModule { }
