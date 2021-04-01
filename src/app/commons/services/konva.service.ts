import {Injectable} from '@angular/core';
import Konva from 'konva';
import {KonvaStageData} from '../models/interfaces/konva-stage-data';
import {ImageDimension} from '../models/interfaces/image-dimension';
import {ScaleFactors} from '../models/interfaces/scale-factors';
import {NumbersUtilsService} from './utils/numbers-utils.service';
import {MousePosition} from '../models/interfaces/mouse-position';

@Injectable()
export class KonvaService {
  protected mainLayerName = 'mainLayer';
  protected mainLayerConfig = {id: this.mainLayerName};

  protected imageStage: Konva.Stage;
  protected resizeStage: Konva.Stage;

  public getResizedDataUrl(pictureData: KonvaStageData): Promise<string> {
    return new Promise(resolve => {
      this.resizeStage = this.createStage(pictureData.containerName, pictureData.imageDimension);
      const layer = this.createLayer(this.mainLayerConfig);
      this.loadImage(pictureData.imageUrl, pictureData.imageDimension, (image: Konva.Image) => {
        this.addToLayer(layer, image);
        this.addToStage(this.resizeStage, layer);
        layer.batchDraw();
        resolve(this.resizeStage.toDataURL({mimeType: 'image/jpeg', quality: 1}));
      });
    });
  }

  protected loadImage(source: string, dimension: ImageDimension, callback): void {
    const image = new Image();
    image.onload = () => {
      callback(this.createImage(image, dimension));
    };
    image.src = source;
  }

  protected addElementsToStage(stage: Konva.Stage, elements: any[]): void {
    for (const element of elements) {
      this.addToStage(stage, element);
    }
  }

  protected addToStage(stage: Konva.Stage, element: any): void  {
      stage.add(element);
  }

  protected addElementsToLayer(layer: Konva.Layer, elements: any[]): void {
    for (const element of elements) {
      this.addToLayer(layer, element);
    }
  }

  protected addToLayer(layer: Konva.Layer, element: any): void  {
    layer.add(element);
  }

  protected deleteLayerFromStage(layerId: string, stage: Konva.Stage){
    const layer = this.findOneById(stage, layerId);
    if (layer) {
      layer.destroy();
    }
  }

  protected deleteFromLayerById(layer: Konva.Layer, elementId: string): void {
    this.deleteElementFromLayer(layer, this.findOneById(layer, elementId));
  }

  protected deleteElementFromLayer(layer: Konva.Layer, element: Konva.Node): void {
    if (element) {
      element.destroy();
    }
    layer.batchDraw();
  }

  protected existAtLeastOneOfTypeAt(layer: Konva.Layer, typeName: string): boolean {
    return this.findOneByType(layer, typeName) !== undefined;
  }

  protected findOneById(parentElement: any, elementId: string) {
    return parentElement.findOne('#' + elementId);
  }

  protected findOneByType(parentElement: any, typeName: string) {
    return parentElement.findOne(typeName);
  }

  protected showMousePosition(stage: Konva.Stage, layer: Konva.Layer, text: Konva.Text): void {
    const mousePosition = this.getMousePosition(stage);
    this.writeMessage(layer, text, 'x: ' + mousePosition.x + ', y: ' + mousePosition.y);
  }

  protected showMappedMousePosition(stage: Konva.Stage, layer: Konva.Layer, text: Konva.Text, scaleFactors: ScaleFactors): void {
    let mousePosition = this.getMousePosition(stage);
    mousePosition = this.mapMousePosition(mousePosition, scaleFactors);
    this.writeMessage(layer, text, 'x: ' + mousePosition.x + ', y: ' + mousePosition.y);
  }

  protected clearMousePosition(layer: Konva.Layer, text: Konva.Text): void {
    this.writeMessage(layer, text, '');
  }

  protected getMousePosition(stage: Konva.Stage): MousePosition {
    const position = stage.getPointerPosition();
    return {
      x: NumbersUtilsService.round(position.x),
      y: NumbersUtilsService.round(position.y),
      scaleFactors: null
    };
  }

  protected mapMousePosition(mousePosition: MousePosition, scaleFactors: ScaleFactors): MousePosition {
    mousePosition.x = NumbersUtilsService.round(NumbersUtilsService.backToOriginal(mousePosition.x, scaleFactors.width));
    mousePosition.y = NumbersUtilsService.round(NumbersUtilsService.backToOriginal(mousePosition.y, scaleFactors.height));
    mousePosition.scaleFactors = scaleFactors;

    return mousePosition;
  }

  protected writeMessage(layer: Konva.Layer, text: Konva.Text, message: string): void {
    text.text(message);
    layer.draw();
  }

  protected hasNodes(transformer: Konva.Transformer): boolean {
    return (transformer.nodes().length !== 0);
  }

  protected createStage(containerName: string, dimension: ImageDimension): Konva.Stage {
    return new Konva.Stage({
      container: containerName,
      width: dimension.width,
      height: dimension.height,
    });
  }

  protected createLayer(config): Konva.Layer {
    return new Konva.Layer(config);
  }

  protected createImage(imageObj: HTMLImageElement, dimension: ImageDimension): Konva.Image {
    return new Konva.Image({
      image: imageObj,
      x: 0,
      y: 0,
      width: dimension.width,
      height: dimension.height
    });
  }

  protected createCircle(config): Konva.Circle {
    return new Konva.Circle(config);
  }

  protected createRect(config): Konva.Rect {
    return new Konva.Rect(config);
  }

  protected createText(config): Konva.Text {
    return new Konva.Text(config);
  }

  protected createTransformer(config): Konva.Transformer {
    return new Konva.Transformer(config);
  }

  protected createLabel(text: Konva.Text, config): Konva.Label {
    const label = new Konva.Label({
      x: config.x,
      y: config.y,
      opacity: config.opacity
    });

    label.add(
      new Konva.Tag({
        fill: config.fill
      })
    );

    label.add(text);
    return label;
  }

  protected createLine(points: number[], config): Konva.Line {
    config.points = points;
    return new Konva.Line(config);
  }
}
