import {Component, HostListener, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {MatTableDataSource} from '@angular/material/table';

import {NotificationService} from '../../commons/services/notification.service';
import {SpinnerService} from '../../commons/dialogs/spinner/spinner.service';
import {TrackerBboxPainterService} from './services/tracker-bbox-painter.service';
import {TrackerFileService} from './services/tracker-file.service';
import {ArraysUtilsService} from '../../commons/services/utils/arrays-utils.service';
import {BoundingBoxLabel} from './enums/bounding-box-label';
import {XmlImageData} from '../../commons/models/classes/xml-image-data';
import {BoundingBox} from './models/bounding-box';
import {ImageDimension} from '../../commons/models/interfaces/image-dimension';
import {DatasetCreatorComponent} from '../dataset-creator.component';
import {ScaleFactors} from '../../commons/models/interfaces/scale-factors';
import {KonvaStageData} from '../../commons/models/interfaces/konva-stage-data';
import {MatTableUtilsService} from '../../commons/services/utils/mat-table-utils.service';
import {KeysUtilsService} from '../../commons/services/utils/keys-utils.service';
import {TrainedModelService} from './services/trained-model-service';
import {environment} from '../../../environments/environment';

@Component({
  selector: 'app-tracker-dataset-creator',
  templateUrl: './tracker-dataset-creator.component.html',
  styleUrls: ['./tracker-dataset-creator.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('450ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TrackerDatasetCreatorComponent extends DatasetCreatorComponent implements OnInit {
  boundingBoxLabels = Object.values(BoundingBoxLabel);

  fileService: TrackerFileService;
  bboxPainter: TrackerBboxPainterService;
  notifications: NotificationService;
  spinnerService: SpinnerService;
  trainedModelService: TrainedModelService;

  imageContainer = 'tracking-test-container';
  resizedImgDimension: ImageDimension = environment.defaults.resizedImgSize.tracker;
  enableBboxPrediction = environment.enableBboxPrediction;
  instructionUrl = environment.instructionUrls.tracker;

  bboxDisplayedColumns: string[] = ['x', 'y', 'width', 'height', 'label', 'actions'];
  imagesDisplayedColumns: string[] = ['Image file name' , 'Actions'];
  bboxesTableData: MatTableDataSource<any>[] = [];

  bboxes: BoundingBox[][] = [];
  selectedBbox: BoundingBox;

  @HostListener('document:keypress', ['$event']) keyboardEventsHandler($event: KeyboardEvent): void {
    const key = $event.key;
    if (KeysUtilsService.is(key, 's')) { this.expandNextImage(); }
    if (KeysUtilsService.is(key, 'w')) { this.expandPreviousImage(); }
    if (KeysUtilsService.is(key, 'a') && this.expandedImageId !== undefined) {
      this.finishAddingBbox(); }
  }

  constructor(fileService: TrackerFileService,
              bboxPainter: TrackerBboxPainterService,
              notifications: NotificationService,
              spinnerService: SpinnerService,
              trainedModelService: TrainedModelService) {
    super();
    this.fileService = fileService;
    this.bboxPainter = bboxPainter;
    this.notifications = notifications;
    this.spinnerService = spinnerService;
    this.trainedModelService = trainedModelService;
  }

  ngOnInit(): void {
    this.bboxes = [];
    this.imgData = [];
    this.resetSelection();
  }

  validateAndUpload($event): void {
    if (this.fileService.validFileTypes($event)) {
      this.uploadImages($event);
    } else {
      this.notifications.showError('Wrong file type', 'Upload of files other than images is forbidden');
    }
  }

  protected uploadImages(event): void {
    const spinnerRef = this.spinnerService.start('Loading pictures...');
    this.fileService.uploadFiles(event);
    const newImagesNames = this.fileService.getNewFilesNames(event);
    this.enlargeImageTableData(newImagesNames, this.imagesTableData);
    this.enlargeElementsArray(newImagesNames.length, this.bboxes);
    this.enlargeElementsTableData(newImagesNames.length, this.bboxesTableData);
    if (this.enableBboxPrediction) {
      this.getPredictedBboxes(event)
        .then(() => this.spinnerService.stop(spinnerRef));
    } else {
      this.spinnerService.stop(spinnerRef);
    }
  }

  protected enlargeElementsArray(imagesCnt: number, bboxes: BoundingBox[][]): void {
    for (let i = 0; i < imagesCnt; i++) {
      bboxes.push([]);
    }
  }

  protected enlargeElementsTableData(newImages: number, bboxesTableSource: MatTableDataSource<any>[]): void {
    for (let i = this.bboxes.length - newImages; i < this.bboxes.length; i++) {
      const matTableData = new MatTableDataSource;
      MatTableUtilsService.setData(this.bboxes[i], matTableData);
      bboxesTableSource.push(matTableData);
    }
  }

  protected async enlargeImageData(imagesNames: string[]) {
    const startIdx = this.imgData.length;
    for (let i = 0; i < imagesNames.length; i++) {
      const data = await this.makeImgData(imagesNames[i], (startIdx + i));
      this.imgData.push(data);
    }
  }

  protected makeImgData(imageName: string, imageIdx: number): Promise<XmlImageData> {
    return new Promise(resolve => {
      this.fileService.getDataUrl(imageIdx).then((url: string) => {
        const resizedStageData: KonvaStageData = {
          containerName: this.resizeContainer,
          imageUrl: url,
          imageDimension: this.resizedImgDimension,
          scaleFactors: null
        };

        this.bboxPainter.getResizedDataUrl(resizedStageData)
          .then((dataUrl: string) => {
            resolve(new XmlImageData(this.imgDirectory, imageName, dataUrl, this.resizedImgDimension));
          });
      });
    });
  }

  private getPredictedBboxes(event): Promise<any> {
    return new Promise((resolve => {
      this.trainedModelService.sendImageToPrediction(this.fileService.getNewFiles(event), this.resizedImgDimension)
        .subscribe((imgsBboxes) => {
          this.addPredictedBboxes(imgsBboxes);
          resolve();
        }, error => {
          this.notifications.showError('Error getting predictions', 'Look into console for details');
          console.log('ERROR DURING PREDICTIONS:');
          console.log(error);
          resolve();
        });
    }));
  }

  private addPredictedBboxes(imgsBboxes: any) {
    const scaleFactors: ScaleFactors = {
      width: this.visibleImgDimension.width / this.resizedImgDimension.width, height: this.visibleImgDimension.height / this.resizedImgDimension.height
    };
    const imgTableData = this.imagesTableData.data;
    imgsBboxes.forEach(imgBboxes => {
      const imgId = imgTableData.findIndex((data: any) => data.name === imgBboxes.image);
      imgBboxes.bboxes.forEach(bbox => {
        const newBbox = new BoundingBox(bbox.x, bbox.y, bbox.width, bbox.height, scaleFactors);
        newBbox.label = bbox.label[0].toUpperCase() + bbox.label.substr(1).toLowerCase();
        this.addNewBbox(newBbox, imgId);
      });
    });
  }

  getBboxData(imageIdx: number): MatTableDataSource<any> {
    return this.bboxesTableData[imageIdx];
  }

  deleteImage(imageIdx: number): void {
    if (this.bboxes && this.bboxes[imageIdx].indexOf(this.selectedBbox) !== -1) {
      this.resetSelection();
    }

    ArraysUtilsService.deleteElementsByIdx(this.imgData, imageIdx, 1);
    ArraysUtilsService.deleteElementsByIdx(this.bboxesTableData, imageIdx, 1);
    ArraysUtilsService.deleteElementsByIdx(this.bboxes, imageIdx, 1);
    MatTableUtilsService.removeElementsByIdx(this.imagesTableData, imageIdx, 1);
    this.fileService.removeFile(imageIdx);
    this.resetExpanded();
  }

  private addNewBbox(bbox: BoundingBox, imageIdx: number): void {
    if (this.selectedBbox && this.selectedBbox.label === undefined) {
      this.notifications.showError('Finish creating bounding box', 'Before changing to other bounding box, add label to last one.');
    } else {
      this.bboxes[imageIdx].push(bbox);
      MatTableUtilsService.setData(this.bboxes[imageIdx], this.bboxesTableData[imageIdx]);
      this.selectedBbox = bbox;
    }
  }

  addNewBboxAndDrawIt(bbox: BoundingBox, imageIdx: number) {
    this.addNewBbox(bbox, imageIdx);
    this.drawUserBboxes(this.bboxes[imageIdx]);
  }

  private finishAddingBbox(){
    if (this.bboxPainter.getSelectionLayer()) {
      this.bboxPainter.finishCreatingBbox(this.bboxPainter.getSelectionLayer(),
                                          this.bboxPainter.getScaleFactors(),
                            (bbox: BoundingBox) => {if (bbox) {this.addNewBboxAndDrawIt(bbox, this.expandedImageId); }});
    }
  }

  deleteBbox(bboxToDelete: BoundingBox, imageIdx: number): void {
    this.bboxes[imageIdx] = ArraysUtilsService.findAndDeleteElement(this.bboxes[imageIdx], bboxToDelete);
    if (bboxToDelete === this.selectedBbox) {
      this.resetSelection();
    }
    MatTableUtilsService.setData(this.bboxes[imageIdx], this.bboxesTableData[imageIdx]);
    this.drawUserBboxes(this.bboxes[imageIdx]);
  }

  generateData(): void {
    const spinnerRef = this.spinnerService.start('Generating data...');
    this.enlargeImageData(this.fileService.getFileNames())
      .then(() => {
            this.fileService.generateDataFiles(this.imgData, this.bboxes, this.zipFileName, this.imgDirectory)
              .then(() => {
                    this.spinnerService.stop(spinnerRef);
              });
    });
  }

  missingData(): boolean {
    return (this.imgData.length === 0
      || this.resizedImgDimension.width === undefined || this.resizedImgDimension.height === undefined
      || this.imgDirectory === undefined || ArraysUtilsService.count2dElements(this.bboxes) === 0
      || this.bboxes.filter((bboxes1d: []) =>
        bboxes1d.filter((bbox: BoundingBox) => (bbox.label === undefined || bbox.label === null)).length !== 0
      ).length !== 0);
  }

  expandAndDrawImages(imageRowData: any, imageRowIdx: number): void {
    this.fileService.getDataUrl(imageRowIdx)
      .then((url: string) => {
        this.drawPicture((this.imageContainer + imageRowIdx), url, this.visibleImgDimension, this.resizedImgDimension)
          .then(() => {
            this.drawUserBboxes(this.bboxes[imageRowIdx]);
            this.scrollToExpanded();
          });
      });
    this.setExpandedImage(imageRowData, imageRowIdx);
  }

  protected drawPicture(containerName: string, imageUrl: string, visibleImgDim: ImageDimension, resizedImgDim: ImageDimension): Promise<any> {
    const scaleFactors: ScaleFactors = {
      width: visibleImgDim.width / resizedImgDim.width, height: visibleImgDim.height / resizedImgDim.height
    };

    const stageData: KonvaStageData = {
      containerName,
      imageUrl,
      imageDimension: visibleImgDim,
      scaleFactors
    };

    return new Promise((resolve => {
      this.bboxPainter.drawPicture(stageData, (bbox: BoundingBox) => this.addNewBboxAndDrawIt(bbox, this.expandedImageId))
        .then(() => resolve());
    }));
  }

  private drawUserBboxes(bboxes: BoundingBox[]): void {
    this.bboxPainter.drawBoundingBoxes(bboxes);
  }

  protected scrollToExpanded(): void {
    const expandedElement = document.getElementById(this.imageContainer + this.expandedImageId);
    expandedElement.scrollIntoView();
  }

  changeSelection(bbox: BoundingBox): void {
    if (this.selectedBbox && this.selectedBbox !== bbox && this.selectedBbox.label === undefined) {
      // tslint:disable-next-line:max-line-length
      this.notifications.showError('Finish creating bounding box', 'Before changing to other bounding box, add label to last one.');
      return;
    }
    if (this.selectedBbox !== bbox) {
      this.selectedBbox = bbox;
    }
  }

  protected resetSelection(): void {
    this.selectedBbox = undefined;
  }

  navigateToInstruction(): void {
    window.open(this.instructionUrl, '_blank');
  }
}
