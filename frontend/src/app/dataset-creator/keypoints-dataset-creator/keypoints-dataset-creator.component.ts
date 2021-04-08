import {Component, HostListener, OnInit} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {environment} from '../../../environments/environment';
import {MatTableDataSource} from '@angular/material/table';

import {NotificationService} from '../../commons/services/notification.service';
import {SpinnerService} from '../../commons/dialogs/spinner/spinner.service';
import {PathsGeneratorService} from '../../commons/services/paths.generator.service';
import {KeypointsPainterService} from './services/keypoints-painter.service';
import {KeypointsFileService} from './services/keypoints-file-service';
import {ArraysUtilsService} from '../../commons/services/utils/arrays-utils.service';
import {XmlImageData} from '../../commons/models/classes/xml-image-data';
import {Keypoint} from './models/keypoint';
import {ImageDimension} from '../../commons/models/interfaces/image-dimension';
import {ScaleFactors} from '../../commons/models/interfaces/scale-factors';
import {KonvaStageData} from '../../commons/models/interfaces/konva-stage-data';
import {DatasetCreatorComponent} from '../dataset-creator.component';
import {MousePosition} from '../../commons/models/interfaces/mouse-position';
import {MatTableUtilsService} from '../../commons/services/utils/mat-table-utils.service';
import {KeysUtilsService} from '../../commons/services/utils/keys-utils.service';


@Component({
  selector: 'app-keypoints-dataset',
  templateUrl: './keypoints-dataset-creator.component.html',
  styleUrls: ['./keypoints-dataset-creator.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('450ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class KeyPointsDatasetCreatorComponent extends DatasetCreatorComponent implements OnInit {
  fileService: KeypointsFileService;
  keyPointsPainter: KeypointsPainterService;
  notifications: NotificationService;
  spinnerService: SpinnerService;

  resizedImgDimension: ImageDimension = environment.defaults.resizedImgSize.keypoints;
  templateImgDimension: ImageDimension = {width: environment.templateImg.width, height: environment.templateImg.height};
  templateContainer = environment.containers.template;
  instructionUrl = environment.instructionUrls.keypoints;


  keyPointsDisplayedColumns: string[] = ['id', 'x', 'y', 'actions'];
  imagesDisplayedColumns: string[] = ['Image file name' , 'Actions'];
  keyPointsTableData: MatTableDataSource<any>[] = [];

  keyPoints: Keypoint[][] = [];
  selectedKeyPoint: Keypoint;

  @HostListener('document:keypress', ['$event']) keyboardEventsHandler($event: KeyboardEvent): void {
    const key = $event.key;
    if (KeysUtilsService.is(key, 's')) { this.expandNextImage(); }
    if (KeysUtilsService.is(key, 'w')) { this.expandPreviousImage(); }
  }

  constructor(fileUploaderService: KeypointsFileService,
              keyPointsPainter: KeypointsPainterService,
              notificationService: NotificationService,
              spinnerService: SpinnerService) {
    super();
    this.fileService = fileUploaderService;
    this.keyPointsPainter = keyPointsPainter;
    this.notifications = notificationService;
    this.spinnerService = spinnerService;
  }

  ngOnInit(): void {
    this.keyPoints = [];
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

  protected uploadImages($event): void {
    const spinnerRef = this.spinnerService.start('Loading pictures...');
    this.fileService.uploadFiles($event);
    const newImagesNames = this.fileService.getNewFilesNames($event);
    this.enlargeImageTableData(newImagesNames, this.imagesTableData);
    this.enlargeElementsArray(newImagesNames.length, this.keyPoints);
    this.enlargeElementsTableData(newImagesNames.length, this.keyPointsTableData);
    this.enlargeImageData(newImagesNames).then(() => {
      this.spinnerService.stop(spinnerRef);
    });
  }

  protected enlargeElementsArray(imagesCnt: number, keyPoints: Keypoint[][]): void {
    for (let i = 0; i < imagesCnt; i++) {
      keyPoints.push([]);
    }
  }

  protected enlargeElementsTableData(newImages: number, keyPointsTableSource: MatTableDataSource<any>[]): void {
    for (let i = this.keyPoints.length - newImages; i < this.keyPoints.length; i++) {
      const matTableData = new MatTableDataSource;
      MatTableUtilsService.setData(this.keyPoints[i], matTableData);
      keyPointsTableSource.push(matTableData);
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

        this.keyPointsPainter.getResizedDataUrl(resizedStageData)
          .then((dataUrl: string) => {
            resolve(new XmlImageData(this.imgDirectory, imageName, dataUrl, this.resizedImgDimension));
          });
      });
    });
  }

  getKeyPointData(imageIdx: number): MatTableDataSource<any> {
    return this.keyPointsTableData[imageIdx];
  }

  deleteImage(imageIdx: number): void {
    if (this.keyPoints && this.keyPoints[imageIdx].indexOf(this.selectedKeyPoint) !== -1) {
      this.resetSelection();
    }

    ArraysUtilsService.deleteElementsByIdx(this.imgData, imageIdx, 1);
    ArraysUtilsService.deleteElementsByIdx(this.keyPointsTableData, imageIdx, 1);
    ArraysUtilsService.deleteElementsByIdx(this.keyPoints, imageIdx, 1);
    MatTableUtilsService.removeElementsByIdx(this.imagesTableData, imageIdx, 1);
    this.fileService.removeFile(imageIdx);
    this.resetExpanded();
  }

  addNewKeyPoint(point: MousePosition, imageIdx: number): void {
    if (this.selectedKeyPoint && this.selectedKeyPoint.id === undefined) {
      this.notifications.showError('Pick keypoint id', 'Before adding new keypoint, add to existing one, id from pitch template below.');
    } else {
      const keypoint = new Keypoint(point);
      this.keyPoints[imageIdx].push(keypoint);
      MatTableUtilsService.setData(this.keyPoints[imageIdx], this.keyPointsTableData[imageIdx]);
      this.selectedKeyPoint = keypoint;
      this.drawUserKeyPoints(this.keyPoints[imageIdx]);
    }
  }

  deleteKeypoint(keypointToDelete: Keypoint, imageIdx: number): void {
    this.keyPoints[imageIdx] = ArraysUtilsService.findAndDeleteElement(this.keyPoints[imageIdx], keypointToDelete);
    if (keypointToDelete === this.selectedKeyPoint) {
      this.resetSelection();
    }
    MatTableUtilsService.setData(this.keyPoints[imageIdx], this.keyPointsTableData[imageIdx]);
    this.drawUserKeyPoints(this.keyPoints[imageIdx]);
    this.drawTemplateKeyPoints(this.keyPoints[imageIdx]);
  }

  generateData(): void {
    const spinnerRef = this.spinnerService.start('Generating data...');
    this.fileService.generateDataFiles(this.imgData, this.keyPoints, this.zipFileName, this.imgDirectory)
      .then(() => {
        this.spinnerService.stop(spinnerRef);
      });
  }

  missingData(): boolean {
    return (this.imgData.length === 0
      || this.resizedImgDimension.height === undefined || this.resizedImgDimension.width === undefined
      || this.imgDirectory === undefined || ArraysUtilsService.count2dElements(this.keyPoints) === 0
      || this.keyPoints.filter((keyPoints1d: []) =>
        keyPoints1d.filter((keyPoint: Keypoint) => (keyPoint.id === undefined || keyPoint.id === null)).length !== 0
      ).length !== 0);
  }

  expandAndDrawImages(imageRowData: any, imageRowIdx: number): void {
    this.setExpandedImage(imageRowData, imageRowIdx);
    if (this.expandedImageId !== undefined) {
      this.fileService.getDataUrl(imageRowIdx).then((url: string) => {
        this.drawPicture((this.imageContainer + imageRowIdx), url, this.visibleImgDimension, this.resizedImgDimension);
        this.drawUserKeyPoints(this.keyPoints[imageRowIdx]);
      });
      this.drawTemplate((this.templateContainer + imageRowIdx), this.templateImgDimension);
      this.drawTemplateKeyPoints(this.keyPoints[imageRowIdx]);
    }
  }

  protected drawPicture(containerName: string, imageUrl: string, visibleImgDim: ImageDimension, resizedImgDim: ImageDimension): void {
    const scaleFactors: ScaleFactors = {
      width: visibleImgDim.width / resizedImgDim.width, height: visibleImgDim.height / resizedImgDim.height
    };

    const stageData: KonvaStageData = {
      containerName,
      imageUrl,
      imageDimension: visibleImgDim,
      scaleFactors
    };

    this.keyPointsPainter.drawPicture(stageData, (point: MousePosition) => this.addNewKeyPoint(point, this.expandedImageId));
  }

  private drawTemplate(containerName: string, imageDimension: ImageDimension): void {
    const templateUrl = PathsGeneratorService.getIdsTemplatePath();
    const stageData: KonvaStageData = {
      containerName,
      imageUrl: templateUrl,
      imageDimension,
      scaleFactors: null
    };
    this.keyPointsPainter.drawTemplate(stageData);
  }

  private drawUserKeyPoints(keyPoints: Keypoint[]): void {
    this.keyPointsPainter.drawKeyPoints(keyPoints);
  }

  private drawTemplateKeyPoints(keyPoints: Keypoint[]): void {
    this.keyPointsPainter.drawTemplateKeyPoints(keyPoints, (keyPointId) => {
      if (this.selectedKeyPoint) {
        this.selectedKeyPoint.id = keyPointId;
        this.drawTemplateKeyPoints(keyPoints);
      }
    });
  }

  animationDone($event) {
    if ($event.toState === 'expanded' && this.expandedImageId !== undefined) {
      this.scrollToExpanded();
    }
  }

  protected scrollToExpanded(): void {
    const expandedElement = document.getElementById(this.imageContainer + this.expandedImageId);
    expandedElement.scrollIntoView(true);
  }

  changeSelection(keyPoint: Keypoint): void {
    if (this.selectedKeyPoint && this.selectedKeyPoint.id === undefined) {
      this.notifications.showError('Finish declaring keypoint', 'Before changing to other keypoint, pick this one spot on template picture.');
      return;
    }
    if (this.selectedKeyPoint === keyPoint) {
      this.resetSelection();
    } else {
      this.selectedKeyPoint = keyPoint;
    }
  }

  protected resetSelection(): void {
    this.selectedKeyPoint = undefined;
  }

  navigateToInstruction(): void {
    window.open(this.instructionUrl, '_blank');
  }
}
