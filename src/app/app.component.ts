import {Component, OnInit} from '@angular/core';
import {FilesService} from './service/files.service';
import {environment} from '../environments/environment';
import {PathsGeneratorService} from './service/paths.generator.service';
import {Keypoint} from './model/keypoint';
import {ImageData} from './model/image-data';
import {KonvaPainterService} from './service/konva-painter.service';
import {MatTableDataSource} from '@angular/material/table';
import {NotificationService} from './service/notification.service';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {SpinnerService} from './service/spinner.service';
import {UtilsService} from './service/utils.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('300ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ]
})
export class AppComponent implements OnInit{
  fileService: FilesService;
  konvaPainter: KonvaPainterService;
  notifications: NotificationService;
  spinnerService: SpinnerService;

  imgHeight = environment.defaults.imgHeight;
  imgWidth = environment.defaults.imgWidth;
  imgDirectory = environment.defaults.imgDirectory;
  zipFileName = environment.defaults.zipFile;
  templateConfig = environment.templateImg;
  imageContainer = environment.containers.image;
  templateContainer = environment.containers.template;
  resizeContainer = environment.containers.resize;
  instructionUrl = environment.instructionUrl;

  keyPointsDisplayedColumns: string[] = ['id', 'x', 'y', 'actions'];
  imagesDisplayedColumns: string[] = ['Image file name' , 'Actions'];
  keyPointsTableData: MatTableDataSource<any>[] = [];
  imagesTableData = new MatTableDataSource;

  expandedImage: any;
  expandedImageId: number;
  keyPoints: Keypoint[][] = [];
  imgData: ImageData[] = [];

  selectedKeyPoint: Keypoint;

  constructor(fileUploaderService: FilesService,
              konvaPainterService: KonvaPainterService,
              notificationService: NotificationService,
              spinnerService: SpinnerService) {
    this.fileService = fileUploaderService;
    this.konvaPainter = konvaPainterService;
    this.notifications = notificationService;
    this.spinnerService = spinnerService;
  }

  ngOnInit(): void {
    this.keyPoints = [];
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
    this.enlargeKeyPointsArray(newImagesNames.length, this.keyPoints);
    this.enlargeKeyPointsTableData(newImagesNames, this.keyPointsTableData);
    this.enlargeImageData(newImagesNames).then(() => {
      this.spinnerService.stop(spinnerRef);
    });
  }

  private makeImgData(imageName: string, imageIdx: number): Promise<ImageData> {
    return new Promise(resolve => {
      this.fileService.getDataUrl(imageIdx).then((url: string) => {
        this.konvaPainter.getResizedDataUrl(this.resizeContainer, url, this.imgWidth, this.imgHeight)
          .then((dataUrl: string) => {
            resolve(new ImageData(this.imgDirectory, imageName, dataUrl, this.imgWidth, this.imgHeight));
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

  private enlargeKeyPointsArray(imagesCnt: number, keyPoints: Keypoint[][]) {
    for (let i = 0; i < imagesCnt; i++) {
      keyPoints.push([]);
    }
  }

  private enlargeKeyPointsTableData(imagesNames: string[], keyPointsTableSource: MatTableDataSource<any>[]) {
    for (let i = this.keyPoints.length - imagesNames.length; i < this.keyPoints.length; i++) {
      const data = new MatTableDataSource;
      data.data = this.keyPoints[i];
      keyPointsTableSource.push(data);
    }
  }

  private async enlargeImageData(imagesNames: string[]) {
    const startIdx = this.imgData.length;
    for (let i = 0; i < imagesNames.length; i++) {
      const data = await this.makeImgData(imagesNames[i], (startIdx + i));
      this.imgData.push(data);
    }
  }

  getKeyPointData(imageIdx: number): MatTableDataSource<any> {
    return this.keyPointsTableData[imageIdx];
  }

  deleteImage(imageIdx: number) {
    if (this.keyPoints && this.keyPoints[imageIdx].indexOf(this.selectedKeyPoint) !== -1) {
      this.resetSelection();
    }
    this.imgData.splice(imageIdx, 1);
    this.keyPointsTableData.splice(imageIdx, 1);
    this.keyPoints.splice(imageIdx, 1);
    const imagesTableData = this.imagesTableData.data;
    imagesTableData.splice(imageIdx, 1);
    this.imagesTableData.data = imagesTableData;
    this.fileService.removeFile(imageIdx);
    this.resetExpanded();
  }

  addNewKeyPoint(point: any, imageIdx: number) {
    if (this.selectedKeyPoint && this.selectedKeyPoint.id === undefined) {
      this.notifications.showError('Pick keypoint id', 'Before adding new keypoint, add to existing one, id from pitch template below.');
    } else {
      const keypoint = new Keypoint(point);
      this.keyPoints[imageIdx].push(keypoint);
      this.keyPointsTableData[imageIdx].data = this.keyPoints[imageIdx];
      this.selectedKeyPoint = keypoint;
      this.drawUserKeyPoints(this.keyPoints[imageIdx]);
    }
  }

  deleteKeypoint(keypointToDelete: Keypoint, imageIdx: number) {
    this.keyPoints[imageIdx] = UtilsService.deleteElementFromList(this.keyPoints[imageIdx], keypointToDelete);
    if (keypointToDelete === this.selectedKeyPoint) {
      this.resetSelection();
    }
    this.keyPointsTableData[imageIdx].data = this.keyPoints[imageIdx];
    this.drawUserKeyPoints(this.keyPoints[imageIdx]);
    this.drawTemplateKeyPoints(this.keyPoints[imageIdx]);
  }

  generateData() {
    const spinnerRef = this.spinnerService.start('Generating data...');
    this.fileService.generateDataFiles(this.imgData, this.keyPoints, this.zipFileName, this.imgDirectory)
      .then(() => {
        this.spinnerService.stop(spinnerRef);
      });
  }

  imagesLoadedAlready(): boolean {
    return this.imgData.length !== 0;
  }

  missingData(): boolean {
    return (this.imgData.length === 0 || this.imgHeight === undefined || this.imgWidth === undefined || this.imgDirectory === undefined ||
      UtilsService.count2dElements(this.keyPoints) === 0 || this.keyPoints.filter((keyPoints1d: []) =>
        keyPoints1d.filter((keyPoint: Keypoint) => (keyPoint.id === undefined || keyPoint.id === null)).length !== 0
      ).length !== 0);
  }

  expandAndDrawImages(imageRowData: any, imageRowIdx: number) {
    this.fileService.getDataUrl(imageRowIdx)
      .then((url: string) => {
        this.drawPicture((this.imageContainer + imageRowIdx), url, this.imgWidth, this.imgHeight);
        this.drawUserKeyPoints(this.keyPoints[imageRowIdx]);
      });
    this.drawTemplate((this.templateContainer + imageRowIdx), this.templateConfig.width, this.templateConfig.height);
    this.drawTemplateKeyPoints(this.keyPoints[imageRowIdx]);
    this.setExpandedImage(imageRowData, imageRowIdx);
  }

  private drawPicture(containerName: string, imageUrl: string, width: number, height: number) {
    this.konvaPainter.drawPicture(containerName, imageUrl, width, height, (point) => this.addNewKeyPoint(point, this.expandedImageId));
  }

  private drawTemplate(containerName: string, width: number, height: number) {
    const templateUrl = PathsGeneratorService.getIdsTemplatePath();
    this.konvaPainter.drawTemplate(containerName, templateUrl, width, height);
  }

  private drawUserKeyPoints(keyPoints: Keypoint[]) {
    this.konvaPainter.drawKeyPoints(keyPoints);
  }

  private drawTemplateKeyPoints(keyPoints: Keypoint[]) {
    this.konvaPainter.drawTemplateKeyPoints(keyPoints, (keyPointId) => {
      if (this.selectedKeyPoint) {
        this.selectedKeyPoint.id = keyPointId;
        this.drawTemplateKeyPoints(keyPoints);
      }
    });
  }

  changeSelection(keyPoint: Keypoint) {
    if (this.selectedKeyPoint && this.selectedKeyPoint.id === undefined) {
      // tslint:disable-next-line:max-line-length
      this.notifications.showError('Finish declaring keypoint', 'Before changing to other keypoint, pick this one spot on template picture.');
      return;
    }
    if (this.selectedKeyPoint === keyPoint) {
      this.resetSelection();
    } else {
      this.selectedKeyPoint = keyPoint;
    }
  }

  private resetSelection() {
    this.selectedKeyPoint = undefined;
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
