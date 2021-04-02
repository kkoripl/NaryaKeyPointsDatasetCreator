import {Injectable} from '@angular/core';
import {environment} from '../../../../environments/environment';
import Konva from 'konva';

import {Keypoint} from '../models/keypoint';
import {KonvaService} from '../../../commons/services/konva.service';
import {KonvaStageData} from '../../../commons/models/interfaces/konva-stage-data';
import {KeypointDataTaker} from '../callbacks/keypoint-data-taker';
import {KonvaEvent} from '../../../commons/models/enums/konva-event';

@Injectable()
export class KeypointsPainterService extends KonvaService {
  private keyPointsLayerName = 'keyPointsLayer';
  private keyPointsLayerConfig = {id: this.keyPointsLayerName};
  private templateKeyPointsLayerName = 'templateKeyPointsLayer';
  private templateKeyPointsLayerConfig = {id: this.templateKeyPointsLayerName};
  private templateStage: Konva.Stage;

  private templateKeyPoints = environment.templateKeyPoints;
  private coordsTextConfig = environment.draw.texts.coordsConfig;
  private coordslabelConfig = environment.draw.shapes.coordslabelConfig;
  private templateKpSelectedTextConfig = environment.draw.texts.keyPointSelectedConfig;
  private templateKpAvailableTextConfig = environment.draw.texts.keyPointAvailableConfig;

  private userKeyPointConfig = environment.draw.shapes.userKeyPointConfig;
  private templateSelectedConfig = environment.draw.shapes.templateSelectedConfig;
  private templateAvailableConfig = environment.draw.shapes.templateAvailableConfig;

  constructor() {
    super();
  }

  drawPicture(imageData: KonvaStageData, clickCallback: KeypointDataTaker): void {
    this.imageStage = this.createStage(imageData.containerName, imageData.imageDimension);
    const mainLayer = this.createLayer(this.mainLayerConfig);
    const text = this.createText(this.coordsTextConfig);
    const label = this.createLabel(text, this.coordslabelConfig);
    this.loadImage(imageData.imageUrl, imageData.imageDimension, (image: Konva.Image) => {
      image.on(KonvaEvent.MOUSE_MOVE, () => this.showMappedMousePosition(this.imageStage, mainLayer, text, imageData.scaleFactors));
      image.on(KonvaEvent.MOUSE_OUT, () => this.clearMousePosition(mainLayer, text));
      image.on(KonvaEvent.CLICK, () => clickCallback(this.mapMousePosition(this.getMousePosition(this.imageStage), imageData.scaleFactors)));
      this.addElementsToLayer(mainLayer, [image, label]);
      mainLayer.batchDraw();
    });
    this.addToStage(this.imageStage, mainLayer);
  }

  drawKeyPoints(keypoints: Keypoint[]): void {
    const keyPointsCircles: Konva.Circle[] = [];

    this.deleteLayerFromStage(this.keyPointsLayerName, this.imageStage);
    const newKeyPointsLayer = this.createLayer(this.keyPointsLayerConfig);

    keypoints.forEach((keypoint: Keypoint) => {
      const circleConfig = this.userKeyPointConfig;
      circleConfig.x = keypoint.getVisibleX();
      circleConfig.y = keypoint.getVisibleY();
      keyPointsCircles.push(this.createCircle(circleConfig));
    });

    this.addElementsToLayer(newKeyPointsLayer, keyPointsCircles);
    newKeyPointsLayer.draw();
    this.addToStage(this.imageStage, newKeyPointsLayer);
  }

  drawTemplate(templateData: KonvaStageData): void {
    this.templateStage = this.createStage(templateData.containerName, templateData.imageDimension);
    const layer = this.createLayer(this.templateKeyPointsLayerConfig);
    this.loadImage(templateData.imageUrl, templateData.imageDimension, (image: Konva.Image) => {
      this.addToLayer(layer, image);
      layer.batchDraw();
    });
    this.addToStage(this.templateStage, layer);
  }

  drawTemplateKeyPoints(keypoints: Keypoint[], callback): void {
    const selectedKeyPointsIds = keypoints.map((keypoint) => keypoint.id);
    const selectedKeyPoints = this.templateKeyPoints.filter((keypoint) => selectedKeyPointsIds.indexOf(keypoint.id) !== -1);
    const availableKeyPoints = this.templateKeyPoints.filter((keypoint) => selectedKeyPointsIds.indexOf(keypoint.id) === -1);

    this.deleteLayerFromStage(this.keyPointsLayerName, this.templateStage);
    const keyPointsLayer = this.createLayer(this.keyPointsLayerConfig);

    this.drawSelectedTemplateKeyPoints(keyPointsLayer, selectedKeyPoints);
    this.drawAvailableTemplateKeyPoints(keyPointsLayer, availableKeyPoints, callback);

    this.addToStage(this.templateStage, keyPointsLayer);
  }

  private drawSelectedTemplateKeyPoints(layer: Konva.Layer, points: any[]): void {
    const keyPointsCircles = [];
    points.forEach((point: any) => {
      const selectedConfig = this.createKeyPointTemplateConfig(point, this.templateSelectedConfig);
      const textConfig = this.createKeyPointIdTextConfig(point, this.templateKpSelectedTextConfig, selectedConfig);
      keyPointsCircles.push(this.createCircle(selectedConfig));
      keyPointsCircles.push(this.createText(textConfig));
    });

    this.addElementsToLayer(layer, keyPointsCircles);
    layer.draw();
  }

  private drawAvailableTemplateKeyPoints(layer: Konva.Layer, points: any[], callback): void {
    const keyPointsCircles = [];
    points.forEach((point: any) => {
      const availableConfig = this.createKeyPointTemplateConfig(point, this.templateAvailableConfig);
      const textConfig = this.createKeyPointIdTextConfig(point, this.templateKpAvailableTextConfig, availableConfig);
      keyPointsCircles.push(this.createCircleReturningIdOnClick(availableConfig, callback));
      keyPointsCircles.push(this.createTextReturningValueOnClick(textConfig, callback));
    });

    this.addElementsToLayer(layer, keyPointsCircles);
    layer.draw();
  }

  private createTextReturningValueOnClick(config, callback): Konva.Text {
    const text = this.createText(config);
    text.on(KonvaEvent.CLICK, () => callback(+text.getAttr('text')));
    return text;
  }


  private createCircleReturningIdOnClick(config, callback): Konva.Circle {
    const circle = this.createCircle(config);
    circle.on(KonvaEvent.CLICK, () => callback(+circle.getAttr('id')));
    return circle;
  }

  private createKeyPointTemplateConfig(keypoint, circleConfig) {
    const config = circleConfig;
    config.id = keypoint.id;
    config.x = keypoint.x;
    config.y = keypoint.y;

    return config;
  }

  private createKeyPointIdTextConfig(keypoint, textConfig, circleConfig) {
    const config = textConfig;
    config.text = keypoint.id;
    if (keypoint.id <= 9) {
      config.x = keypoint.x - (circleConfig.radius * 0.55);
      config.y = keypoint.y - (circleConfig.radius * 0.55);
    } else {
      config.x = keypoint.x - (circleConfig.radius * 0.8);
      config.y = keypoint.y - (circleConfig.radius * 0.65);
    }

    return config;
  }
}
