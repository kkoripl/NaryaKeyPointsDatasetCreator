// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  idTemplateImage: 'pitch.png',

  defaults: {
    imgWidth: 512,
    imgHeight: 512,
    imgDirectory: 'JPEGImages'
  },

  containers: {
    image: 'imageContainer',
    template: 'templateContainer',
    resize: 'resizeContainer',
  },

  instructionUrl: 'https://github.com/kkoripl/NaryaKeyPointsDatasetCreator/blob/master/README.md',

  validImageMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/pjpeg', 'image/bmp'],


  xmlTags: {
    mainTag: 'annotation',
    keyPoint: {
      object: 'object',
      id: 'name',
      difficult: 'difficult',
      difficultDefault: 0,
      cords: 'keypoints',
      x: 'x1',
      y: 'y1',
      v: 'v1',
      vDefault: 2,
      boundingBox: 'bndbox',
      xmin: 'xmin',
      ymin: 'ymin',
      xmax: 'xmax',
      ymax: 'ymax'
    },
    imgData: {
      directory: 'folder',
      filename: 'filename',
      size: 'size',
      width: 'width',
      height: 'height',
      depth: 'depth'
    }
  },
  templateImg : {
    width: 512,
    height: 397
  },
  draw : {
    texts: {
      picturePlaceholderConfig: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fontFamily: 'Calibri',
        fontSize: 24,
        text: 'Football photo placeholder',
        fill: 'black',
        verticalAlign: 'middle',
        align: 'center'
      },
      coordsConfig: {
        padding: 2,
        fontFamily: 'Calibri',
        fontSize: 24,
        text: '',
        fill: 'white',
      },
      keyPointSelectedConfig: {
        x: 0,
        y: 0,
        padding: 2,
        fontFamily: 'Calibri',
        fontSize: 14,
        text: '',
        fill: 'black',
      },
      keyPointAvailableConfig: {
        x: 0,
        y: 0,
        padding: 2,
        fontFamily: 'Calibri',
        fontSize: 14,
        text: '',
        fill: 'white',
      }
    },
    shapes: {
      picturePlaceholderConfig: {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        fill: 'grey'
      },
      userKeyPointConfig: {
        x: -1,
        y: -1,
        radius: 3,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 1,
      },
      templateSelectedConfig: {
        id: -1,
        x: 0,
        y: 0,
        radius: 12,
        fill: 'grey',
        stroke: 'black',
        strokeWidth: 2
      },
      templateAvailableConfig: {
        id: -1,
        x: 0,
        y: 0,
        radius: 12,
        fill: 'green',
        stroke: 'black',
        strokeWidth: 2
      }
    }
  },

  templateKeyPoints: [
    {
      id: 0,
      x: 14,
      y: 13
    },
    {
      id: 1,
      x: 14,
      y: 116
    },
    {
      id: 2,
      x: 91,
      y: 116
    },
    {
      id: 3,
      x: 14,
      y: 156
    },
    {
      id: 4,
      x: 56,
      y: 156
    },
    {
      id: 5,
      x: 14,
      y: 246
    },
    {
      id: 6,
      x: 56,
      y: 246
    },
    {
      id: 7,
      x: 14,
      y: 284
    },
    {
      id: 8,
      x: 91,
      y: 284
    },
    {
      id: 9,
      x: 14,
      y: 385
    },
    {
      id: 10,
      x: 258,
      y: 13
    },
    {
      id: 11,
      x: 258,
      y: 198
    },
    {
      id: 12,
      x: 258,
      y: 385
    },
    {
      id: 13,
      x: 501,
      y: 13
    },
    {
      id: 14,
      x: 501,
      y: 116
    },
    {
      id: 15,
      x: 421,
      y: 116
    },
    {
      id: 16,
      x: 501,
      y: 156
    },
    {
      id: 17,
      x: 459,
      y: 156
    },
    {
      id: 18,
      x: 501,
      y: 246
    },
    {
      id: 19,
      x: 459,
      y: 246
    },
    {
      id: 20,
      x: 501,
      y: 284
    },
    {
      id: 21,
      x: 421,
      y: 284
    },
    {
      id: 22,
      x: 501,
      y: 385
    },
    {
      id: 23,
      x: 91,
      y: 167
    },
    {
      id: 24,
      x: 91,
      y: 235
    },
    {
      id: 25,
      x: 258,
      y: 147
    },
    {
      id: 26,
      x: 258,
      y: 251
    },
    {
      id: 27,
      x: 421,
      y: 167
    },
    {
      id: 28,
      x: 421,
      y: 235
    },
  ]
};
