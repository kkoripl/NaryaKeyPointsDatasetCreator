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
  private bboxTransformerConfig = {id: this.bboxTransformerName, rotateEnabled: false, anchorSize: 6};
  private coordsTextConfig = environment.draw.texts.coordsConfig;
  private coordslabelConfig = environment.draw.shapes.coordslabelConfig;
  private userBboxConfig = environment.draw.shapes.userBboxConfig;
  private bboxHelperLinesConfig = environment.draw.shapes.bboxHelperLinesConfig;

  private mainLayer: Konva.Layer;
  private selectionLayer: Konva.Layer;
  private bboxesLayer: Konva.Layer;

  private scaleFactors: ScaleFactors;

  constructor() {
    super();
  }

  drawPicture(stageData: KonvaStageData, bboxDataCallback: BoundingBoxDataTaker): Promise<any> {
    return new Promise(resolve => {
      if (this.imageStage) {
        this.imageStage.destroyChildren();
        this.imageStage.destroy();
      }

      this.imageStage = this.createStage(stageData.containerName, stageData.imageDimension);
      this.mainLayer = this.createLayer(this.mainLayerConfig);
      this.selectionLayer = this.createLayer(this.selectionLayerConfig);
      this.scaleFactors = stageData.scaleFactors;

      const text = this.createText(this.coordsTextConfig);
      const label = this.createLabel(text, this.coordslabelConfig);
      const helperHorizontalLine = this.createLine([0, 0, 0, 0], this.bboxHelperLinesConfig);
      const helperVerticalLine = this.createLine([0, 0, 0, 0], this.bboxHelperLinesConfig);

      this.loadImage(stageData.imageUrl, stageData.imageDimension, (image: Konva.Image) => {
        // updating position of a mouse and drawing helper lines on image
        image.on(KonvaEvent.MOUSE_MOVE, () => {
          if (!this.existAtLeastOneOfTypeAt(this.selectionLayer, KonvaShapeType.TRANSFORMER)) {
            this.updateHelperLinesPositions(helperHorizontalLine, helperVerticalLine);
          }
          this.showMappedMousePosition(this.imageStage, this.mainLayer, text, this.scaleFactors);
        });

        // removing position of a mouse and helper lines from image
        image.on(KonvaEvent.MOUSE_OUT, () => {
          this.hideHelperLines([helperVerticalLine, helperHorizontalLine]);
          this.clearMousePosition(this.mainLayer, text);
        });
        const bboxSelectionRect = this.setupCreatingBoundingBoxOnImage(image, this.selectionLayer, this.userBboxConfig,
          stageData.scaleFactors, bboxDataCallback);

        // all shapes above image need to be 'transient' and let events fired on them being transported to image itself
        bboxSelectionRect.on(KonvaEvent.MOUSE_MOVE, () => image.fire(KonvaEvent.MOUSE_MOVE));
        helperHorizontalLine.on(KonvaEvent.MOUSE_MOVE, () => image.fire(KonvaEvent.MOUSE_MOVE));
        helperVerticalLine.on(KonvaEvent.MOUSE_MOVE, () => image.fire(KonvaEvent.MOUSE_MOVE));

        this.addElementsToLayer(this.mainLayer, [image, helperVerticalLine, helperHorizontalLine, label]);
        this.addToLayer(this.selectionLayer, bboxSelectionRect);
        this.mainLayer.batchDraw();
        this.selectionLayer.batchDraw();
        this.addElementsToStage(this.imageStage, [this.mainLayer, this.selectionLayer]);
        resolve();
      });
    });

  }

  drawBoundingBoxes(bboxes: BoundingBox[]): void {
    const bboxesRects: Konva.Rect[] = [];
    const mainImage: Konva.Image = this.findOneByType(this.mainLayer, KonvaShapeType.IMAGE);
    const selectionRect: Konva.Rect = this.findOneById(this.selectionLayer, this.selectionBboxName);

    if (this.bboxesLayer) {
      this.bboxesLayer.destroyChildren();
      this.bboxesLayer.destroy();
    }
    this.bboxesLayer = this.createLayer(this.bboxLayerConfig);

    bboxes.filter((bbox: BoundingBox) => bbox.visible).forEach((bbox: BoundingBox) => {
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


    this.addElementsToLayer(this.bboxesLayer, bboxesRects);
    this.addToStage(this.imageStage, this.bboxesLayer);

    // Layer with bounding boxes transformer need to be on top, otherwise transformer would be not able to be modified
    this.selectionLayer.moveToTop();

    this.selectionLayer.draw();
    this.bboxesLayer.draw();
  }

  private setupCreatingBoundingBoxOnImage(image: Konva.Image, layer: Konva.Layer,
                                          bboxConfig: any, scaleFactors: ScaleFactors,
                                          bboxDataCallback: BoundingBoxDataTaker): Konva.Rect {

    const bboxLeftUpper = {x: 0, y: 0};
    const bboxRightLower = {x: 0, y: 0};

    const bboxSelectionRect = this.createRect(bboxConfig);
    bboxSelectionRect.id(this.selectionBboxName);
    bboxSelectionRect.visible(false);

    // bbox drawing start after mousedown
    image.on(KonvaEvent.MOUSE_DOWN, () => {
      // if we're making another bounding box right now, do nothing
      if (bboxSelectionRect.visible() || this.existAtLeastOneOfTypeAt(layer, KonvaShapeType.TRANSFORMER)) {
        return;
      }

      this.initiateBboxPosition(bboxLeftUpper, bboxRightLower);
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

      this.resizeSelectionBbox(bboxSelectionRect, bboxLeftUpper, bboxRightLower);
      layer.batchDraw();
    });

    // needed to be able to make bounding smaller when moving mouse inside right now created bounding box
    bboxSelectionRect.on(KonvaEvent.MOUSE_MOVE, () => {
      // bbox needs to be seen, so it means last event was mousedown!
      // made, cause konva don't accepts multiple events chained by AND
      if (!bboxSelectionRect.visible()) {
        return;
      }

      this.resizeSelectionBbox(bboxSelectionRect, bboxLeftUpper, bboxRightLower);
      layer.batchDraw();
    });

    // bbox is under mouse after mousemove, so mouseup is occurring on it!
    bboxSelectionRect.on(KonvaEvent.MOUSE_UP, () => {
      // we haven't made any bboxes lately (selection rect invisible), so mouseup means nothing
      if (!bboxSelectionRect.visible()) {
        return;
      }

      // second bbox (later with transformer) is needed to secure finish of bbox resizing by mouse moving process
      // we would hide selection rectangle and on its visibility check if resizing finished (then selection rect is not visible)
      const bboxVisibleRect = this.createActualTransformableBbox(layer, bboxSelectionRect, bboxConfig);
      this.addTransformerToBbox(layer, bboxVisibleRect);

      bboxSelectionRect.visible(false);
      layer.batchDraw();
    });


    // clicks should deselect bounding box
    image.on(KonvaEvent.CLICK, () => {
      // there is no need to finish bbox creation process, as we are not in one - transformer not exists
      if (!this.existAtLeastOneOfTypeAt(layer, KonvaShapeType.TRANSFORMER)) {
        return;
      }

      this.finishCreatingBbox(layer, scaleFactors, bboxDataCallback);
      layer.draw();
    });

    return bboxSelectionRect;
  }

  private resizeSelectionBbox(bbox: Konva.Rect, bboxLeftUpper: any, bboxRightLower: any): void {
    this.updateRightLowerPosition(bboxRightLower);
    this.updateRectSize(bbox, bboxLeftUpper, bboxRightLower);
  }

  private createActualTransformableBbox(layer: Konva.Layer, selectionBbox: Konva.Rect, bboxConfig: any): Konva.Rect {
    this.setupSelectionRectToVisibleRectConfig(bboxConfig, selectionBbox);
    const bboxVisibleRect = this.createRect(bboxConfig);
    this.addToLayer(layer, bboxVisibleRect);
    return bboxVisibleRect;
  }

  private addTransformerToBbox(layer: Konva.Layer, bbox: Konva.Rect) {
    const bboxTransformer = this.createTransformerForElement(this.bboxTransformerConfig, bbox);
    this.addToLayer(layer, bboxTransformer);
  }

  finishCreatingBbox(layer: Konva.Layer, scaleFactors: ScaleFactors, bboxDataCallback: BoundingBoxDataTaker) {
    const bboxVisibleRect: Konva.Rect = this.findOneById(layer, this.visibleBboxName);
    if (bboxVisibleRect) {

      // transformer is not resizing width and height, but their scales - respectively: x and y
      // that's why at the end we need to multiply width and height by their scales
      bboxDataCallback(new BoundingBox(NumbersUtilsService.backToOriginal(bboxVisibleRect.x(), scaleFactors.width),
        NumbersUtilsService.backToOriginal(bboxVisibleRect.y(), scaleFactors.height),
        NumbersUtilsService.backToOriginal(bboxVisibleRect.width() * bboxVisibleRect.scaleX(), scaleFactors.width),
        NumbersUtilsService.backToOriginal(bboxVisibleRect.height() * bboxVisibleRect.scaleY(), scaleFactors.height),
        scaleFactors));

      this.cleanAfterCreatingBbox(layer);
    }
  }

  private cleanAfterCreatingBbox(layer: Konva.Layer) {
    const bboxTransformer = this.findOneByType(layer, KonvaShapeType.TRANSFORMER);
    this.resetTransformer(bboxTransformer);
    this.deleteElementFromLayer(layer, bboxTransformer);
    this.deleteFromLayerById(layer, this.visibleBboxName);
  }

  private updateHelperLinesPositions(horizontalLine: Konva.Line, verticalLine: Konva.Line): void {
    this.updateHorizontalLinePosition(horizontalLine, this.getMousePosition(this.imageStage), this.imageStage.width());
    this.updateVerticalLinePosition(verticalLine, this.getMousePosition(this.imageStage), this.imageStage.height());
  }

  private updateHorizontalLinePosition(line: Konva.Line, mousePosition: MousePosition, endX: number): void {
    line.points([0, mousePosition.y, mousePosition.x, mousePosition.y, endX, mousePosition.y]);
    line.visible(true);
  }

  private updateVerticalLinePosition(line: Konva.Line, mousePosition: MousePosition, endY: number): void {
    line.points([mousePosition.x, 0, mousePosition.x, mousePosition.y, mousePosition.x, endY]);
    line.visible(true);
  }

  private hideHelperLines(lines: Konva.Line[]): void {
    lines.forEach((line: Konva.Line) => line.visible(false));
  }

  private makeVisibleButOfZeroSize(rect: Konva.Rect): void {
    rect.visible(true);
    rect.width(0);
    rect.height(0);
  }

  private updateRectSize(rect: Konva.Rect, leftUpper: any, rightLower: any): void {
    rect.setAttrs({
      x: Math.min(leftUpper.x, rightLower.x),
      y: Math.min(leftUpper.y, rightLower.y),
      width: Math.abs(rightLower.x - leftUpper.x),
      height: Math.abs(rightLower.y - leftUpper.y),
    });
  }

  private initiateBboxPosition(upperLeft: any, rightLower: any): void {
    const mousePosition = this.getMousePosition(this.imageStage);
    upperLeft.x = mousePosition.x;
    upperLeft.y = mousePosition.y;
    rightLower.x = mousePosition.x;
    rightLower.y = mousePosition.y;
  }

  private updateRightLowerPosition(rightLower: any): void {
    const mousePosition = this.getMousePosition(this.imageStage);
    rightLower.x = mousePosition.x;
    rightLower.y = mousePosition.y;
  }

  private createTransformerForElement(config: any, element: any): Konva.Transformer {
    const transformer = this.createTransformer(config);
    transformer.nodes([element]);
    return transformer;
  }

  private resetTransformer(transformer: Konva.Transformer): void {
    transformer.nodes([]);
    transformer.visible(false);
  }

  private setupSelectionRectToVisibleRectConfig(config: any, selectionRect: Konva.Rect): void {
    config.id = this.visibleBboxName;
    config.x = selectionRect.x();
    config.y = selectionRect.y();
    config.width = selectionRect.width();
    config.height = selectionRect.height();
  }

  private setupConfigForFinishedBboxes(config: any, bbox: BoundingBox): void {
    config.x = bbox.getVisibleX();
    config.y = bbox.getVisibleY();
    config.width = bbox.getVisibleWidth();
    config.height = bbox.getVisibleHeight();
  }

  public getSelectionLayer(): Konva.Layer {
    return this.selectionLayer;
  }

  public getScaleFactors(): ScaleFactors {
    return this.scaleFactors;
  }
}
