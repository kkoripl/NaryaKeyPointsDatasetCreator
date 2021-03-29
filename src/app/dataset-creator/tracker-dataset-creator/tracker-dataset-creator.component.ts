import { Component, OnInit } from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {environment} from '../../../environments/environment';
import {MatTableDataSource} from '@angular/material/table';

import {NotificationService} from '../../commons/services/notification.service';
import {SpinnerService} from '../../commons/dialogs/spinner/spinner.service';
import {TrackerBboxPainterService} from './services/tracker-bbox-painter.service';
import {TrackerFileService} from './services/tracker-file.service';
import {ArraysUtilsService} from '../../commons/services/arrays-utils.service';
import {BoundingBoxLabel} from './enums/bounding-box-label';
import {ImageData} from '../../commons/models/image-data';
import {BoundingBox} from './models/bounding-box';

@Component({
  selector: 'app-tracker-dataset-creator',
  templateUrl: './tracker-dataset-creator.component.html',
  styleUrls: ['./tracker-dataset-creator.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class TrackerDatasetCreatorComponent implements OnInit {
  boundingBoxLabels = Object.values(BoundingBoxLabel);

  fileService: TrackerFileService;
  bboxPainter: TrackerBboxPainterService;
  notifications: NotificationService;
  spinnerService: SpinnerService;

  resizedImgHeight = environment.defaults.resizedImgHeight;
  resizedImgWidth = environment.defaults.resizedImgWidth;
  visibleImgHeight = environment.defaults.visibleImgHeight;
  visibleImgWidth = environment.defaults.visibleImgWidth;
  imgDirectory = environment.defaults.imgDirectory;
  zipFileName = environment.defaults.zipFile;
  imageContainer = 'tracking-test-container';
  resizeContainer = environment.containers.resize;
  instructionUrl = environment.instructionUrl;

  bboxDisplayedColumns: string[] = ['x', 'y', 'width', 'height', 'label', 'actions'];
  imagesDisplayedColumns: string[] = ['Image file name' , 'Actions'];
  bboxesTableData: MatTableDataSource<any>[] = [];
  imagesTableData = new MatTableDataSource;

  expandedImage: any;
  expandedImageId: number;
  bboxes: BoundingBox[][] = [];
  imgData: ImageData[] = [];

  selectedBbox: BoundingBox;

  constructor(fileService: TrackerFileService,
              bboxPainter: TrackerBboxPainterService,
              notifications: NotificationService,
              spinnerService: SpinnerService) {
    this.fileService = fileService;
    this.bboxPainter = bboxPainter;
    this.notifications = notifications;
    this.spinnerService = spinnerService;
  }

  ngOnInit(): void {
    this.bboxes = [];
    this.imgData = [];
    this.resetSelection();
  }

  validateAndUpload($event) {
    if (this.fileService.validFileTypes($event)) {
      this.uploadImages($event);
    } else {
      this.notifications.showError('Wrong file type', 'Upload of files other than images is forbidden');
    }
  }

  private uploadImages(event) {
    const spinnerRef = this.spinnerService.start('Loading pictures...');
    this.fileService.uploadFiles(event);
    const newImagesNames = this.fileService.getNewFilesNames(event);
    this.enlargeImageTableData(newImagesNames, this.imagesTableData);
    this.enlargeBboxArray(newImagesNames.length, this.bboxes);
    this.enlargeBboxTableData(newImagesNames, this.bboxesTableData);
    this.enlargeImageData(newImagesNames).then(() => {
      this.spinnerService.stop(spinnerRef);
    });
  }

  private makeImgData(imageName: string, imageIdx: number): Promise<ImageData> {
    return new Promise(resolve => {
      this.fileService.getDataUrl(imageIdx).then((url: string) => {
        this.bboxPainter.getResizedDataUrl(this.resizeContainer, url, this.resizedImgWidth, this.resizedImgHeight)
          .then((dataUrl: string) => {
            resolve(new ImageData(this.imgDirectory, imageName, dataUrl, this.resizedImgWidth, this.resizedImgHeight));
          });
      });
    });
  }

  private enlargeImageTableData(imagesNames: string[], imageTableData: MatTableDataSource<any>) {
    const imgDetails = imageTableData.data;
    const newDetailStartIdx = imgDetails.length;
    for (let i = 0; i < imagesNames.length; i++) {
      imgDetails.push({id: newDetailStartIdx + i, name: imagesNames[i]});
    }
    imageTableData.data = imgDetails;
  }

  private enlargeBboxArray(imagesCnt: number, bboxes: BoundingBox[][]) {
    for (let i = 0; i < imagesCnt; i++) {
      bboxes.push([]);
    }
  }

  private enlargeBboxTableData(imagesNames: string[], bboxesTableSource: MatTableDataSource<any>[]) {
    for (let i = this.bboxes.length - imagesNames.length; i < this.bboxes.length; i++) {
      const data = new MatTableDataSource;
      data.data = this.bboxes[i];
      bboxesTableSource.push(data);
    }
  }

  private async enlargeImageData(imagesNames: string[]) {
    const startIdx = this.imgData.length;
    for (let i = 0; i < imagesNames.length; i++) {
      const data = await this.makeImgData(imagesNames[i], (startIdx + i));
      this.imgData.push(data);
    }
  }

  getBboxData(imageIdx: number): MatTableDataSource<any> {
    return this.bboxesTableData[imageIdx];
  }

  deleteImage(imageIdx: number) {
    if (this.bboxes && this.bboxes[imageIdx].indexOf(this.selectedBbox) !== -1) {
      this.resetSelection();
    }
    this.imgData.splice(imageIdx, 1);
    this.bboxesTableData.splice(imageIdx, 1);
    this.bboxes.splice(imageIdx, 1);
    const imagesTableData = this.imagesTableData.data;
    imagesTableData.splice(imageIdx, 1);
    this.imagesTableData.data = imagesTableData;
    this.fileService.removeFile(imageIdx);
    this.resetExpanded();
  }

  addNewBbox(bbox: BoundingBox, imageIdx: number) {
    if (this.selectedBbox && this.selectedBbox.label === undefined) {
      this.notifications.showError('Finish creating bounding box', 'Before changing to other bounding box, add label to last one.');
    } else {
      this.bboxes[imageIdx].push(bbox);
      this.bboxesTableData[imageIdx].data = this.bboxes[imageIdx];
      this.selectedBbox = bbox;
      this.drawUserBboxes(this.bboxes[imageIdx]);
    }
  }

  deleteBbox(bboxToDelete: BoundingBox, imageIdx: number) {
    this.bboxes[imageIdx] = ArraysUtilsService.deleteElementFromList(this.bboxes[imageIdx], bboxToDelete);
    if (bboxToDelete === this.selectedBbox) {
      this.resetSelection();
    }
    this.bboxesTableData[imageIdx].data = this.bboxes[imageIdx];
    this.drawUserBboxes(this.bboxes[imageIdx]);
  }

  generateData() {
    const spinnerRef = this.spinnerService.start('Generating data...');
    this.fileService.generateDataFiles(this.imgData, this.bboxes, this.zipFileName, this.imgDirectory)
      .then(() => {
        this.spinnerService.stop(spinnerRef);
      });
  }

  imagesLoadedAlready(): boolean {
    return this.imgData.length !== 0;
  }

  missingData(): boolean {
    return (this.imgData.length === 0
      || this.resizedImgHeight === undefined || this.resizedImgWidth === undefined
      || this.imgDirectory === undefined || ArraysUtilsService.count2dElements(this.bboxes) === 0
      || this.bboxes.filter((bboxes1d: []) =>
        bboxes1d.filter((bbox: BoundingBox) => (bbox.label === undefined || bbox.label === null)).length !== 0
      ).length !== 0);
  }

  expandAndDrawImages(imageRowData: any, imageRowIdx: number) {
    this.fileService.getDataUrl(imageRowIdx)
      .then((url: string) => {
        this.drawPicture((this.imageContainer + imageRowIdx), url, this.visibleImgWidth, this.visibleImgHeight);
        this.drawUserBboxes(this.bboxes[imageRowIdx]);
      });
    this.setExpandedImage(imageRowData, imageRowIdx);
  }

  private drawPicture(containerName: string, imageUrl: string, width: number, height: number) {
    const widthFactor = width / this.resizedImgWidth;
    const heightFactor = height / this.resizedImgHeight;
    this.bboxPainter.drawPicture(containerName,
      imageUrl,
      width,
      height,
      widthFactor,
      heightFactor,
      (bbox) => this.addNewBbox(bbox, this.expandedImageId));
  }


  private drawUserBboxes(bboxes: BoundingBox[]) {
    this.bboxPainter.drawBoundingBoxes(bboxes);
  }

  changeSelection(bbox: BoundingBox) {
    if (this.selectedBbox && this.selectedBbox !== bbox && this.selectedBbox.label === undefined) {
      // tslint:disable-next-line:max-line-length
      this.notifications.showError('Finish creating bounding box', 'Before changing to other bounding box, add label to last one.');
      return;
    }
    if (this.selectedBbox !== bbox) {
      this.selectedBbox = bbox;
    }
  }

  private resetSelection() {
    this.selectedBbox = undefined;
  }

  private setExpandedImage(imageRowData: any, imageRowId: number) {
    this.expandedImage = this.expandedImage === imageRowData ? null : imageRowData;
    this.expandedImageId = this.expandedImageId === imageRowId ? null : imageRowId;
  }

  private resetExpanded() {
    this.expandedImage = undefined;
    this.expandedImageId = undefined;
  }

  navigateToInstruction(){
    window.open(this.instructionUrl, '_blank');
  }

}
