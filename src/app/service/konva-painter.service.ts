import {Injectable} from '@angular/core';
import Konva from 'konva';
import Vector2d = Konva.Vector2d;
import {Keypoint} from '../model/keypoint';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KonvaPainterService {
  private keyPointsLayer = 'keyPointsLayer';
  private templateKeyPointsLayer = 'templateKeyPointsLayer';
  private imageStage: Konva.Stage;
  private templateStage: Konva.Stage;
  private resizeStage: Konva.Stage;

  private templateKeyPoints = environment.templateKeyPoints;
  private coordsTextConfig = environment.draw.texts.coordsConfig;
  private templateKpSelectedTextConfig = environment.draw.texts.keyPointSelectedConfig;
  private templateKpAvailableTextConfig = environment.draw.texts.keyPointAvailableConfig;

  private userKeyPointConfig = environment.draw.shapes.userKeyPointConfig;
  private templateSelectedConfig = environment.draw.shapes.templateSelectedConfig;
  private templateAvailableConfig = environment.draw.shapes.templateAvailableConfig;

  getResizedDataUrl(containerName: string, imageUrl: string, width: number, height: number): Promise<string>{
    return new Promise(resolve => {
      this.resizeStage = this.createStage(containerName, width, height);
      const layer = new Konva.Layer();
      this.loadImage(imageUrl, width, height, (image: Konva.Image) => {
        this.addToLayer(layer, [image]);
        layer.batchDraw();
        this.resizeStage.add(layer);
        resolve(this.resizeStage.toDataURL({mimeType: 'image/jpeg', quality: 1}));
      });
    });
  }

  drawPicture(containerName: string, imageUrl: string, width: number, height: number, clickCallback) {
    this.imageStage = this.createStage(containerName, width, height);
    const layer = new Konva.Layer();
    const text = this.createText(this.coordsTextConfig);
    const label = this.createLabel(text);
    this.loadImage(imageUrl, width, height, (image: Konva.Image) => {
      image.on('mousemove', () => this.showMousePosition(this.imageStage, layer, text));
      image.on('mouseout', () => this.clearMousePosition(layer, text));
      image.on('click', () => clickCallback(this.getMousePosition(this.imageStage)));
      this.addToLayer(layer, [image, label]);
      layer.batchDraw();
    });
    this.imageStage.add(layer);
  }

  drawKeyPoints(keypoints: Keypoint[]) {
    const keyPointsCircles: Konva.Circle[] = [];

    this.deleteLayerFromStage(this.keyPointsLayer, this.imageStage);
    const newKeyPointsLayer = new Konva.Layer({id: this.keyPointsLayer});

    keypoints.forEach((keypoint: Keypoint) => {
      const circleConfig = this.userKeyPointConfig;
      circleConfig.x = keypoint.x;
      circleConfig.y = keypoint.y;
      keyPointsCircles.push(this.createCircle(circleConfig));
    });

    this.addToLayer(newKeyPointsLayer, keyPointsCircles);
    newKeyPointsLayer.draw();
    this.imageStage.add(newKeyPointsLayer);
  }

  drawTemplate(containerName: string, templateUrl: string, width: number, height: number) {
    this.templateStage = this.createStage(containerName, width, height);
    const layer = new Konva.Layer();
    this.loadImage(templateUrl, width, height, (image: Konva.Image) => {
      this.addToLayer(layer, [image]);
      layer.batchDraw();
    });
    this.templateStage.add(layer);
  }

  drawTemplateKeyPoints(keypoints: Keypoint[], callback) {
    const selectedKeyPointsIds = keypoints.map((keypoint) => keypoint.id);
    const selectedKeyPoints = this.templateKeyPoints.filter((keypoint) => selectedKeyPointsIds.indexOf(keypoint.id) !== -1);
    const availableKeyPoints = this.templateKeyPoints.filter((keypoint) => selectedKeyPointsIds.indexOf(keypoint.id) === -1);

    this.deleteLayerFromStage(this.templateKeyPointsLayer, this.templateStage);
    const keyPointsLayer = new Konva.Layer({id: this.templateKeyPointsLayer});

    this.drawSelectedTemplateKeyPoints(keyPointsLayer, selectedKeyPoints);
    this.drawAvailableTemplateKeyPoints(keyPointsLayer, availableKeyPoints, callback);

    this.templateStage.add(keyPointsLayer);
  }

  private drawSelectedTemplateKeyPoints(layer: Konva.Layer, points: any[]) {
    const keyPointsCircles = [];
    points.forEach((point: any) => {
      const selectedConfig = this.createKeyPointTemplateConfig(point, this.templateSelectedConfig);
      const textConfig = this.createKeyPointIdTextConfig(point, this.templateKpSelectedTextConfig, selectedConfig);
      keyPointsCircles.push(this.createCircle(selectedConfig));
      keyPointsCircles.push(this.createText(textConfig));
    });

    this.addToLayer(layer, keyPointsCircles);
    layer.draw();
  }

  private drawAvailableTemplateKeyPoints(layer: Konva.Layer, points: any[], callback) {
    const keyPointsCircles = [];
    points.forEach((point: any) => {
      const availableConfig = this.createKeyPointTemplateConfig(point, this.templateAvailableConfig);
      const textConfig = this.createKeyPointIdTextConfig(point, this.templateKpAvailableTextConfig, availableConfig);
      keyPointsCircles.push(this.createCircleReturningIdOnClick(availableConfig, callback));
      keyPointsCircles.push(this.createTextReturningValueOnClick(textConfig, callback));
    });

    this.addToLayer(layer, keyPointsCircles);
    layer.draw();
  }


  private createStage(containterName: string, width: number, height: number): Konva.Stage {
    return new Konva.Stage({
      container: containterName,
      width,
      height,
    });
  }

  private loadImage(source, width, height, callback) {
    const image = new Image();
    image.onload = () => {
      callback(this.createImage(image, width, height));
    };
    image.src = source;
  }

  private createImage(imageObj: HTMLImageElement, width: number, height: number) {
    return new Konva.Image({
      image: imageObj,
      x: 0,
      y: 0,
      width,
      height
    });
  }

  private createTextReturningValueOnClick(config, callback): Konva.Text {
    const text = this.createText(config);
    text.on('click', () => callback(+text.getAttr('text')));
    return text;
  }

  private createText(config): Konva.Text {
    return new Konva.Text(config);
  }

  private createLabel(text: Konva.Text): Konva.Label {
    const label = new Konva.Label({
      x: 0,
      y: 0,
      opacity: 0.75,
    });

    label.add(
      new Konva.Tag({
        fill: 'black',
      })
    );

    label.add(text);
    return label;
  }

  private createCircleReturningIdOnClick(config, callback): Konva.Circle {
    const circle = this.createCircle(config);
    circle.on('click', () => callback(+circle.getAttr('id')));
    return circle;
  }

  private createCircle(config): Konva.Circle {
    return new Konva.Circle(config);
  }

  private createRect(config): Konva.Rect {
    return new Konva.Rect(config);
  }
  private getMousePosition(stage: Konva.Stage) {
    const position = stage.getPointerPosition();
    return {x: Math.round(position.x), y: Math.round(position.y)};
  }

  private showMousePosition(stage: Konva.Stage, layer: Konva.Layer, text: Konva.Text) {
    const mousePosition = this.getMousePosition(stage);
    this.writeMessage(layer, text, 'x: ' + mousePosition.x + ', y: ' + mousePosition.y);
  }

  private clearMousePosition(layer: Konva.Layer, text: Konva.Text) {
    this.writeMessage(layer, text, '');
  }

  private writeMessage(layer: Konva.Layer, text: Konva.Text, message: string) {
    text.text(message);
    layer.draw();
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

  private addToLayer(layer: Konva.Layer, elements) {
    for (const element of elements) {
      layer.add(element);
    }
  }

  private deleteLayerFromStage(layerId: string, stage: Konva.Stage){
    const layer = stage.findOne('#' + layerId);
    if (layer) {
      layer.destroy();
    }
  }
}
