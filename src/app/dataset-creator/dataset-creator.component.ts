import {environment} from '../../environments/environment';
import {MatTableDataSource} from '@angular/material/table';

import {XmlImageData} from '../commons/models/classes/xml-image-data';
import {ImageDimension} from '../commons/models/interfaces/image-dimension';
import {DatasetElement} from '../commons/models/classes/dataset-element';

export abstract class DatasetCreatorComponent {
  resizedImgDimension: ImageDimension = {width: environment.defaults.resizedImgWidth, height: environment.defaults.resizedImgHeight};
  visibleImgDimension: ImageDimension = {width: environment.defaults.visibleImgWidth, height: environment.defaults.visibleImgHeight};
  expandedImage: any;
  expandedImageId: number;

  imgData: XmlImageData[] = [];
  imagesTableData = new MatTableDataSource;

  imgDirectory = environment.defaults.imgDirectory;
  zipFileName = environment.defaults.zipFile;
  imageContainer = environment.containers.image;
  resizeContainer = environment.containers.resize;

  instructionUrl = environment.instructionUrl;

  abstract validateAndUpload($event): void;
  protected abstract uploadImages($event): void;
  protected abstract makeImgData(imageName: string, imageIdx: number): Promise<XmlImageData>;
  protected abstract deleteImage(imageIdx: number): void;
  abstract generateData(): void;
  abstract missingData(): boolean;
  abstract expandAndDrawImages(imageRowData: any, imageRowIdx: number): void;
  protected abstract drawPicture(containerName: string, imageUrl: string, visibleImgDim: ImageDimension, resizedImgDim: ImageDimension): void;
  protected abstract scrollToExpanded(): void;
  abstract changeSelection(element: DatasetElement): void;
  protected abstract resetSelection(): void;
  protected abstract enlargeElementsArray(imagesCnt: number, elements: DatasetElement[][]): void;
  protected abstract enlargeElementsTableData(imagesNames: string[], elementsTableSource: MatTableDataSource<any>[]): void;
  protected abstract async enlargeImageData(imagesNames: string[]);

  protected enlargeImageTableData(imagesNames: string[], imageTableData: MatTableDataSource<any>): void {
    const imgDetails = imageTableData.data;
    const newDetailStartIdx = imgDetails.length;
    for (let i = 0; i < imagesNames.length; i++) {
      imgDetails.push({id: newDetailStartIdx + i, name: imagesNames[i]});
    }
    imageTableData.data = imgDetails;
  }

  imagesLoadedAlready(): boolean {
    return (this.imgData.length !== 0);
  }

  protected setExpandedImage(imageRowData: any, imageRowId: number): void {
    this.expandedImage = this.expandedImage === imageRowData ? undefined : imageRowData;
    this.expandedImageId = this.expandedImageId === imageRowId ? undefined : imageRowId;
  }

  protected expandNextImage(): void {
    if (this.imagesTableData.data === undefined || this.imagesTableData.data.length === 0) { return; }
    if (this.expandedImageId === undefined) {
      this.expandAndDrawImages(this.imagesTableData.data[0], 0);
    }
    else {
      const nextExpandedImageId = this.expandedImageId + 1;
      if (nextExpandedImageId >= this.imagesTableData.data.length) {
        this.resetExpanded();
      }
      else {
        this.expandAndDrawImages(this.imagesTableData.data[nextExpandedImageId], nextExpandedImageId);
      }
    }
  }

  protected expandPreviousImage(): void {
    if (this.expandedImageId === undefined || this.imagesTableData.data === undefined || this.imagesTableData.data.length === 0) { return; }
    const previousExpandedImageId = this.expandedImageId - 1;
    if (previousExpandedImageId < 0) {
      this.resetExpanded();
    } else {
      this.expandAndDrawImages(this.imagesTableData.data[previousExpandedImageId], previousExpandedImageId);
    }
  }

  animationDone($event) {
    if ($event.toState === 'expanded' && this.expandedImageId !== undefined) {
      this.scrollToExpanded();
    }
  }

  protected resetExpanded(): void {
    this.expandedImage = undefined;
    this.expandedImageId = undefined;
  }

  navigateToInstruction(): void {
    window.open(this.instructionUrl, '_blank');
  }
}
