import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import Konva from 'konva';

import {KonvaService} from '../../../commons/services/konva.service';
import {NumbersUtilsService} from '../../../commons/services/utils/numbers-utils.service';
import {BoundingBoxDataTaker} from '../callbacks/bounding-box-data-taker';
import {BoundingBox} from '../models/bounding-box';
import {KonvaStageData} from '../../../commons/models/interfaces/konva-stage-data';
import {ScaleFactors} from '../../../commons/models/interfaces/scale-factors';

@Injectable()
export class TrackerBboxPainterService extends KonvaService {
  private bboxLayerName = 'bboxLayer';
  private selectionLayerName = 'selectionLayer';
  private bboxTransformerName = 'bboxTransformer';
  private visibleBboxName = 'visibleBbox';
  private selectionBboxName = 'selectionBbox';
  private bboxLayerConfig = {id: this.bboxLayerName};
  private selectionLayerConfig = {id: this.selectionLayerName};
  private bboxTransformerConfig = {id: this.bboxTransformerName, rotateEnabled: false};
  private coordsTextConfig = environment.draw.texts.coordsConfig;
  private coordslabelConfig = environment.draw.shapes.coordslabelConfig;
  private userBboxConfig = environment.draw.shapes.userBboxConfig;

  constructor() {
    super();
  }

  drawPicture(stageData: KonvaStageData,
              bboxDataCallback: BoundingBoxDataTaker): void {
    this.imageStage = this.createStage(stageData.containerName, stageData.imageDimension);
    const mainLayer = this.createLayer(this.mainLayerConfig);
    const selectionLayer = this.createLayer(this.selectionLayerConfig);
    const text = this.createText(this.coordsTextConfig);
    const label = this.createLabel(text, this.coordslabelConfig);
    this.loadImage(stageData.imageUrl, stageData.imageDimension, (image: Konva.Image) => {
      image.on('mousemove', () => this.showMappedMousePosition(this.imageStage, mainLayer, text, stageData.scaleFactors));
      image.on('mouseout', () => this.clearMousePosition(mainLayer, text));
      const bboxSelectionRect = this.setupCreatingBoundingBoxOnImage(image, this.imageStage, selectionLayer,
                                                                     this.userBboxConfig, stageData.scaleFactors,
                                                                     bboxDataCallback);
      bboxSelectionRect.on('mousemove', () => this.showMappedMousePosition(this.imageStage, mainLayer, text, stageData.scaleFactors));
      this.addElementsToLayer(mainLayer, [image, label]);
      this.addToLayer(selectionLayer, bboxSelectionRect);
      mainLayer.batchDraw();
      selectionLayer.batchDraw();
    });
    this.addElementsToStage(this.imageStage, [mainLayer, selectionLayer]);
  }

  drawBoundingBoxes(bboxes: BoundingBox[]): void {
    const bboxesRects: Konva.Rect[] = [];
    const mainLayer: Konva.Layer = this.findOneById(this.imageStage, this.mainLayerConfig.id);
    const selectionLayer: Konva.Layer = this.findOneById(this.imageStage, this.selectionLayerConfig.id);
    const mainImage: Konva.Image = this.findOneByType(mainLayer, 'Image');
    const selectionRect: Konva.Rect = this.findOneById(selectionLayer, this.selectionBboxName);

    this.deleteLayerFromStage(this.bboxLayerName, this.imageStage);
    const newBboxLayer = this.createLayer(this.bboxLayerConfig);

    bboxes.forEach((bbox: BoundingBox) => {
      this.updateBboxConfigForFinishedBboxes(this.userBboxConfig, bbox);
      const bboxRect = this.createRect(this.userBboxConfig);

      // Bounding box rectangles are on separate layer from main image, but they need to be 'transient' for user actions
      // Konva can't do so, that's why we propagate rectangle events to image
      bboxRect.on('mousedown', () => mainImage.fire('mousedown'));
      bboxRect.on('mousemove', () => mainImage.fire('mousemove'));
      bboxRect.on('click', () => mainImage.fire('click'));
      bboxRect.on('mouseup', () => selectionRect.fire('mouseup'));
      bboxesRects.push(bboxRect);
    });

    this.addElementsToLayer(newBboxLayer, bboxesRects);
    this.addToStage(this.imageStage, newBboxLayer);

    // Layer with bounding boxes transformer need to be on top, otherwise transformer would be not able to be modified
    selectionLayer.moveToTop();

    selectionLayer.draw();
    newBboxLayer.draw();
  }

  setupCreatingBoundingBoxOnImage(image: Konva.Image, stage: Konva.Stage, layer: Konva.Layer,
                                  bboxConfig: any, scaleFactors: ScaleFactors,
                                  bboxDataCallback: BoundingBoxDataTaker): Konva.Rect {

    let bboxTransformer = this.createTransformer(this.bboxTransformerConfig);

    const bboxLeftUpper = {x: 0, y: 0};
    const bboxRightLower = {x: 0, y: 0};

    const bboxSelectionRect = this.createRect(bboxConfig);
    bboxSelectionRect.id(this.selectionBboxName);
    let bboxVisibleRect = this.createRect({});
    bboxVisibleRect.visible(false);
    bboxSelectionRect.visible(false);

    // bbox drawing start after mousedown
    image.on('mousedown', () => {
      // if we're making another bounding box right now, do nothing
      if (bboxSelectionRect.visible() || this.hasNodes(bboxTransformer)) {
        return;
      }

      this.initiateBboxPosition(this.imageStage, bboxLeftUpper, bboxRightLower);
      this.makeVisibleButOfZeroSize(bboxSelectionRect);
      layer.draw();
    });

    // drawing / updating bbox
    image.on('mousemove', () => {
      // bbox needs to be seen, so it means last event was mousedown!
      // made, cause konva don't accepts multiple events chained by AND
      if (!bboxSelectionRect.visible()) {
        return;
      }

      this.updateRightLowerPosition(this.imageStage, bboxRightLower);
      this.updateRectSize(bboxSelectionRect, bboxLeftUpper, bboxRightLower);
      layer.batchDraw();
    });

    // needed to be able to make bounding smaller when moving mouse inside right now created bounding box
    bboxSelectionRect.on('mousemove', () => {
      // bbox needs to be seen, so it means last event was mousedown!
      // made, cause konva don't accepts multiple events chained by AND
      if (!bboxSelectionRect.visible()) {
        return;
      }

      this.updateRightLowerPosition(this.imageStage, bboxRightLower);
      this.updateRectSize(bboxSelectionRect, bboxLeftUpper, bboxRightLower);
      layer.batchDraw();
    });

    // bbox is under mouse after mousemove, so mouseup is occuring on it!
    bboxSelectionRect.on('mouseup', () => {
      // we haven't made any bboxes lately, so mouseup means nothing
      if (!bboxSelectionRect.visible()) {
        return;
      }

      this.setupSelectionRectToVisibleRectConfig(bboxConfig, bboxSelectionRect);
      bboxVisibleRect = this.createRect(bboxConfig);
      this.addToLayer(layer, bboxVisibleRect);

      // actual transformer need to be added to layer after shape, which is connected to
      this.deleteFromLayer(layer, this.bboxTransformerName);
      bboxTransformer = this.createTransformerForElement(this.bboxTransformerConfig, bboxVisibleRect);
      this.addToLayer(layer, bboxTransformer);

      bboxSelectionRect.visible(false);
      layer.batchDraw();
    });


    // clicks should deselect bounding box
    image.on('click', () => {
      // there's no need to remove transformer from bbox, when it not exists
      if (!this.hasNodes(bboxTransformer)) {
        return;
      }

      // transformer is not resizing width and height, but their scales - respectively: x and y
      // that's why at the end we need to multiply width and height by their scales
      bboxDataCallback(new BoundingBox(NumbersUtilsService.backToOriginal(bboxVisibleRect.x(), scaleFactors.width),
                                       NumbersUtilsService.backToOriginal(bboxVisibleRect.y(), scaleFactors.height),
                                       NumbersUtilsService.backToOriginal(bboxVisibleRect.width() * bboxVisibleRect.scaleX(), scaleFactors.width),
                                       NumbersUtilsService.backToOriginal(bboxVisibleRect.height() * bboxVisibleRect.scaleY(), scaleFactors.height),
                                       scaleFactors));
      this.resetTransformer(bboxTransformer);
      this.deleteFromLayer(layer, this.visibleBboxName);
      layer.draw();
    });

    return bboxSelectionRect;
  }

  makeVisibleButOfZeroSize(rect: Konva.Rect): void {
    rect.visible(true);
    rect.width(0);
    rect.height(0);
  }

  updateRectSize(rect: Konva.Rect, leftUpper: any, rightLower: any): void {
    rect.setAttrs({
      x: Math.min(leftUpper.x, rightLower.x),
      y: Math.min(leftUpper.y, rightLower.y),
      width: Math.abs(rightLower.x - leftUpper.x),
      height: Math.abs(rightLower.y - leftUpper.y),
    });
  }

  initiateBboxPosition(stage: Konva.Stage, upperLeft: any, rightLower: any): void {
    const mousePosition = this.getMousePosition(this.imageStage);
    upperLeft.x = mousePosition.x;
    upperLeft.y = mousePosition.y;
    rightLower.x = mousePosition.x;
    rightLower.y = mousePosition.y;
  }

  updateRightLowerPosition(stage: Konva.Stage, rightLower: any): void {
    const mousePosition = this.getMousePosition(this.imageStage);
    rightLower.x = mousePosition.x;
    rightLower.y = mousePosition.y;
  }

  createTransformerForElement(config: any, element: any): Konva.Transformer {
    const transformer = this.createTransformer(config);
    transformer.nodes([element]);
    return transformer;
  }

  resetTransformer(transformer: Konva.Transformer): void {
    transformer.nodes([]);
    transformer.visible(false);
  }

  setupSelectionRectToVisibleRectConfig(config: any, selectionRect: Konva.Rect): void {
    config.id = this.visibleBboxName;
    config.x = selectionRect.x();
    config.y = selectionRect.y();
    config.width = selectionRect.width();
    config.height = selectionRect.height();
  }

  updateBboxConfigForFinishedBboxes(config: any, bbox: BoundingBox): void {
    config.x = bbox.getVisibleX();
    config.y = bbox.getVisibleY();
    config.width = bbox.getVisibleWidth();
    config.height = bbox.getVisibleHeight();
  }
}
