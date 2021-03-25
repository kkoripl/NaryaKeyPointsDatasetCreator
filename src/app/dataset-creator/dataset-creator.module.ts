import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {MatTableModule} from '@angular/material/table';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {ToastrModule} from 'ngx-toastr';
import {MatToolbarModule} from '@angular/material/toolbar';

import {UtilsModule} from '../commons/utils.module';
import {KeyPointsDatasetCreatorComponent} from './keypoints-dataset-creator/keypoints-dataset-creator.component';
import {KeyPointsPainterService} from './keypoints-dataset-creator/services/key-points-painter.service';
import {XmlFileCreatorService} from './keypoints-dataset-creator/services/xml-file-creator.service';
import {ZipFileCreatorService} from './keypoints-dataset-creator/services/zip-file-creator.service';
import {UtilsService} from './keypoints-dataset-creator/services/utils.service';
import {MatFormFieldModule} from '@angular/material/form-field';

@NgModule({
  declarations: [
    KeyPointsDatasetCreatorComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    UtilsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatTableModule,
    MatInputModule,
    MatButtonModule,
    MatTooltipModule,
    MatIconModule,
    FormsModule
  ],
  providers: [
    KeyPointsPainterService,
    XmlFileCreatorService,
    ZipFileCreatorService,
    UtilsService
  ],
  bootstrap: []
})
export class DatasetCreatorModule { }
