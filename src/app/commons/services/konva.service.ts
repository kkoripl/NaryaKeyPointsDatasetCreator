import {Injectable} from '@angular/core';
import Konva from 'konva';

@Injectable()
export class KonvaService {
  protected mainLayerName = 'mainLayer';
  protected mainLayerConfig = {id: this.mainLayerName};

  protected imageStage: Konva.Stage;
  protected resizeStage: Konva.Stage;

  public getResizedDataUrl(containerName: string, imageUrl: string, width: number, height: number): Promise<string>{
    return new Promise(resolve => {
      this.resizeStage = this.createStage(containerName, width, height);
      const layer = this.createLayer(this.mainLayerConfig);
      this.loadImage(imageUrl, width, height, (image: Konva.Image) => {
        this.addElementsToLayer(layer, [image]);
        layer.batchDraw();
        this.addElementsToStage(this.resizeStage, [layer]);
        resolve(this.resizeStage.toDataURL({mimeType: 'image/jpeg', quality: 1}));
      });
    });
  }

  protected loadImage(source, width, height, callback) {
    const image = new Image();
    image.onload = () => {
      callback(this.createImage(image, width, height));
    };
    image.src = source;
  }

  protected addElementsToStage(stage: Konva.Stage, elements: any[]) {
    for (const element of elements) {
      this.addToStage(stage, element);
    }
  }

  protected addToStage(stage: Konva.Stage, element: any) {
      stage.add(element);
  }

  protected addElementsToLayer(layer: Konva.Layer, elements: any[]) {
    for (const element of elements) {
      this.addToLayer(layer, element);
    }
  }

  protected addToLayer(layer: Konva.Layer, element: any) {
    layer.add(element);
  }

  protected deleteLayerFromStage(layerId: string, stage: Konva.Stage){
    const layer = this.findOneById(stage, layerId);
    if (layer) {
      layer.destroy();
    }
  }

  protected deleteFromLayer(layer: Konva.Layer, elementId: string) {
    const element = this.findOneById(layer, elementId);
    if (element) {
      element.destroy();
    }
    layer.batchDraw();
  }

  protected findOneById(parentElement: any, elementId: string) {
    return parentElement.findOne('#' + elementId);
  }

  protected findOneByType(parentElement: any, typeName: string) {
    return parentElement.findOne(typeName);
  }

  protected showMousePosition(stage: Konva.Stage, layer: Konva.Layer, text: Konva.Text, widthFactor: number, heightFactor: number) {
    const mousePosition = this.getMousePosition(stage);
    this.writeMessage(layer, text, 'x: ' + mousePosition.x + ', y: ' + mousePosition.y);
  }

  protected showMappedMousePosition(stage: Konva.Stage, layer: Konva.Layer, text: Konva.Text, widthFactor: number, heightFactor: number) {
    let mousePosition = this.getMousePosition(stage);
    mousePosition = this.mapMousePosition(mousePosition, widthFactor, heightFactor);
    this.writeMessage(layer, text, 'x: ' + mousePosition.x + ', y: ' + mousePosition.y);
  }

  protected clearMousePosition(layer: Konva.Layer, text: Konva.Text) {
    this.writeMessage(layer, text, '');
  }

  protected getMousePosition(stage: Konva.Stage) {
    const position = stage.getPointerPosition();
    return {x: Math.round(position.x), y: Math.round(position.y)};
  }

  protected mapMousePosition(mousePosition, widthFactor: number, heightFactor: number) {
    if (widthFactor > 1) {
      mousePosition.x = Math.round(mousePosition.x / widthFactor);
    } else {
      mousePosition.x = Math.round(mousePosition.x * widthFactor);
    }

    if (heightFactor > 1) {
      mousePosition.y = Math.round(mousePosition.y / heightFactor);
    } else {
      mousePosition.y = Math.round(mousePosition.y * heightFactor);
    }

    mousePosition.widthFactor = widthFactor;
    mousePosition.heightFactor = heightFactor;

    return mousePosition;
  }

  protected writeMessage(layer: Konva.Layer, text: Konva.Text, message: string) {
    text.text(message);
    layer.draw();
  }

  protected hasNodes(transformer: Konva.Transformer): boolean {
    return (transformer.nodes().length !== 0);
  }

  protected createStage(containerName: string, width: number, height: number): Konva.Stage {
    return new Konva.Stage({
      container: containerName,
      width,
      height,
    });
  }

  protected createLayer(config) {
    return new Konva.Layer(config);
  }

  protected createImage(imageObj: HTMLImageElement, width: number, height: number) {
    return new Konva.Image({
      image: imageObj,
      x: 0,
      y: 0,
      width,
      height
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
}
