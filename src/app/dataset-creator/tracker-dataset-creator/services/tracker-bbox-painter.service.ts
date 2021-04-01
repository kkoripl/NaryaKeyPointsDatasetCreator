import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import Konva from 'konva';

import {KonvaService} from '../../../commons/services/konva.service';
import {NumbersUtilsService} from '../../../commons/services/utils/numbers-utils.service';
import {BoundingBoxDataTaker} from '../callbacks/bounding-box-data-taker';
import {BoundingBox} from '../models/bounding-box';
import {KonvaStageData} from '../../../commons/models/interfaces/konva-stage-data';
import {ScaleFactors} from '../../../commons/models/interfaces/scale-factors';
import {MousePosition} from '../../../commons/models/interfaces/mouse-position';
import {KonvaShapeType} from '../../../commons/models/enums/konva-shape-type';
import {KonvaEvent} from '../../../commons/models/enums/konva-event';

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
  private bboxHelperLinesConfig = environment.draw.shapes.bboxHelperLinesConfig;

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
    const horizontalLine = this.createLine([0, 0, 0, 0], this.bboxHelperLinesConfig);
    const verticalLine = this.createLine([0, 0, 0, 0], this.bboxHelperLinesConfig);

    this.loadImage(stageData.imageUrl, stageData.imageDimension, (image: Konva.Image) => {
      // updating position of a mouse and drawing helper lines on image
      image.on(KonvaEvent.MOUSE_MOVE, () => {
        if (!this.existAtLeastOneOfTypeAt(selectionLayer, KonvaShapeType.TRANSFORMER)) {
          this.updateHorizontalLinePosition(horizontalLine, this.getMousePosition(this.imageStage), this.imageStage.width());
          this.updateVerticalLinePosition(verticalLine, this.getMousePosition(this.imageStage), this.imageStage.height());
        }
        this.showMappedMousePosition(this.imageStage, mainLayer, text, stageData.scaleFactors);
      });

      // removing position of a mouse and helper lines from image
      image.on(KonvaEvent.MOUSE_OUT, () => {
        this.hideLines([verticalLine, horizontalLine]);
        this.clearMousePosition(mainLayer, text);
      });
      const bboxSelectionRect = this.setupCreatingBoundingBoxOnImage(image, this.imageStage, selectionLayer,
                                                                     this.userBboxConfig, stageData.scaleFactors,
                                                                     bboxDataCallback);

      // all shapes above image need to be 'transient' and let events fired on them being transported to image itself
      bboxSelectionRect.on(KonvaEvent.MOUSE_MOVE, () => image.fire(KonvaEvent.MOUSE_MOVE));
      horizontalLine.on(KonvaEvent.MOUSE_MOVE, () => image.fire(KonvaEvent.MOUSE_MOVE));
      verticalLine.on(KonvaEvent.MOUSE_MOVE, () => image.fire(KonvaEvent.MOUSE_MOVE));

      this.addElementsToLayer(mainLayer, [image, verticalLine, horizontalLine, label]);
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
    const mainImage: Konva.Image = this.findOneByType(mainLayer, KonvaShapeType.IMAGE);
    const selectionRect: Konva.Rect = this.findOneById(selectionLayer, this.selectionBboxName);

    this.deleteLayerFromStage(this.bboxLayerName, this.imageStage);
    const newBboxLayer = this.createLayer(this.bboxLayerConfig);

    bboxes.forEach((bbox: BoundingBox) => {
      this.setupConfigForFinishedBboxes(this.userBboxConfig, bbox);
      const bboxRect = this.createRect(this.userBboxConfig);

      // Bounding box rectangles are on separate layer from main image, but they need to be 'transient' for user actions
      // Konva can't do so, that's why we propagate rectangle events to image
      bboxRect.on(KonvaEvent.MOUSE_DOWN, () => mainImage.fire(KonvaEvent.MOUSE_DOWN));
      bboxRect.on(KonvaEvent.MOUSE_MOVE, () => mainImage.fire(KonvaEvent.MOUSE_MOVE));
      bboxRect.on(KonvaEvent.CLICK, () => mainImage.fire(KonvaEvent.CLICK));
      bboxRect.on(KonvaEvent.MOUSE_UP, () => selectionRect.fire(KonvaEvent.MOUSE_UP));
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
    image.on(KonvaEvent.MOUSE_DOWN, () => {
      // if we're making another bounding box right now, do nothing
      if (bboxSelectionRect.visible() || this.existAtLeastOneOfTypeAt(layer, KonvaShapeType.TRANSFORMER)) {
        return;
      }

      this.initiateBboxPosition(this.imageStage, bboxLeftUpper, bboxRightLower);
      this.makeVisibleButOfZeroSize(bboxSelectionRect);
      layer.draw();
    });

    // drawing / updating bbox
    image.on(KonvaEvent.MOUSE_MOVE, () => {
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
    bboxSelectionRect.on(KonvaEvent.MOUSE_MOVE, () => {
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
    bboxSelectionRect.on(KonvaEvent.MOUSE_UP, () => {
      // we haven't made any bboxes lately, so mouseup means nothing
      if (!bboxSelectionRect.visible()) {
        return;
      }

      this.setupSelectionRectToVisibleRectConfig(bboxConfig, bboxSelectionRect);
      bboxVisibleRect = this.createRect(bboxConfig);
      this.addToLayer(layer, bboxVisibleRect);

      // actual transformer need to be added to layer after shape, which is connected to
      this.deleteFromLayerById(layer, this.bboxTransformerName);
      bboxTransformer = this.createTransformerForElement(this.bboxTransformerConfig, bboxVisibleRect);
      this.addToLayer(layer, bboxTransformer);

      bboxSelectionRect.visible(false);
      layer.batchDraw();
    });


    // clicks should deselect bounding box
    image.on(KonvaEvent.CLICK, () => {
      // there's no need to remove transformer from bbox, when it not exists
      if (!this.existAtLeastOneOfTypeAt(layer, KonvaShapeType.TRANSFORMER)) {
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
      this.deleteElementFromLayer(layer, bboxTransformer);
      this.deleteFromLayerById(layer, this.visibleBboxName);
      layer.draw();
    });

    return bboxSelectionRect;
  }

  private updateHorizontalLinePosition(line: Konva.Line, mousePosition: MousePosition, endX: number): void {
    line.points([0, mousePosition.y, mousePosition.x, mousePosition.y, endX, mousePosition.y]);
    line.visible(true);
  }

  private updateVerticalLinePosition(line: Konva.Line, mousePosition: MousePosition, endY: number): void {
    line.points([mousePosition.x, 0, mousePosition.x, mousePosition.y, mousePosition.x, endY]);
    line.visible(true);
  }

  private hideLines(lines: Konva.Line[]): void {
    lines.forEach((line: Konva.Line) => line.visible(false));
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

  setupConfigForFinishedBboxes(config: any, bbox: BoundingBox): void {
    config.x = bbox.getVisibleX();
    config.y = bbox.getVisibleY();
    config.width = bbox.getVisibleWidth();
    config.height = bbox.getVisibleHeight();
  }
}
