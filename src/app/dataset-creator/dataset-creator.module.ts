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

import {CommonsModule} from '../commons/commons.module';
import {KeyPointsDatasetCreatorComponent} from './keypoints-dataset-creator/keypoints-dataset-creator.component';
import {KeypointsPainterService} from './keypoints-dataset-creator/services/keypoints-painter.service';
import {XmlFileCreatorService} from './keypoints-dataset-creator/services/xml-file-creator.service';
import {ZipFileCreatorService} from '../commons/services/zip-file-creator.service';
import {KeypointsUtilsService} from './keypoints-dataset-creator/services/keypoints-utils.service';
import {MatFormFieldModule} from '@angular/material/form-field';
import {TrackerDatasetCreatorComponent} from './tracker-dataset-creator/tracker-dataset-creator.component';
import {TrackerBboxPainterService} from './tracker-dataset-creator/services/tracker-bbox-painter.service';
import {DatasetCreatorComponent} from './dataset-creator.component';
import {MatSelectModule} from '@angular/material/select';
import {KeypointsFileService} from './keypoints-dataset-creator/services/keypoints-file-service';
import {TrackerFileService} from './tracker-dataset-creator/services/tracker-file.service';
import {TrackerXmlFileCreatorService} from './tracker-dataset-creator/services/tracker-xml-file-creator.service';

@NgModule({
  declarations: [
    DatasetCreatorComponent,
    KeyPointsDatasetCreatorComponent,
    TrackerDatasetCreatorComponent
  ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
        CommonsModule,
        MatToolbarModule,
        MatFormFieldModule,
        MatTableModule,
        MatInputModule,
        MatButtonModule,
        MatTooltipModule,
        MatIconModule,
        FormsModule,
        MatSelectModule
    ],
  providers: [
    KeypointsPainterService,
    KeypointsFileService,
    TrackerBboxPainterService,
    TrackerXmlFileCreatorService,
    TrackerFileService,
    XmlFileCreatorService,
    ZipFileCreatorService,
    KeypointsUtilsService
  ],
  bootstrap: []
})
export class DatasetCreatorModule { }
