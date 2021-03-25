import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {NotificationService} from './services/notification.service';
import {PathsGeneratorService} from './services/paths.generator.service';
import {SpinnerService} from './dialogs/spinner/spinner.service';
import {SpinnerComponent} from './dialogs/spinner/spinner.component';
import {FilterSelectedPipe} from './pipes/filter-selected.pipe';
import {FilesService} from './services/files.service';
import {ImageData} from './models/image-data';
import {XmlFile} from './models/xml-file';
import {ImgFile} from './models/img-file';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatDialogModule} from '@angular/material/dialog';

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
    FilesService,
    SpinnerService
  ]
})
export class UtilsModule { }
