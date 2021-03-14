# NaryaKeyPointsDatasetCreator

Pitch key points dataset creator for [Narya](https://github.com/DonsetPG/narya), player and pitch tracking model.

## Instruction
**Remember! Sizes of images on the left side of a panel would be always 1024x1024 to make it easier to pick particular spots on the graphic. But the dimension, you see in upper left corner is mapped to the size your image would be resized to, which you picked in first point of this instruction (below). Due to calculations on dimensions, circles of points clicked can be a little misplaced (pixel, two etc.) on the picture. They are 100% good in files though.**


- Setup final dimension of images - dimension, which would you use to train model on. Max: 512x512
- Setup name of directory, where you'd put created by this generator images in.
- Setup name of data .zip file (without .zip extension), which you'd generate later on.
- Upload football game match frames pictures
- Pick one of images, extend it's row and start adding key points:
  - Click particular point on your picture.
  - Pick one of 29 points on the template below, to add key point it's id.
  - To change wrong id, finish adding next key point and then change selection of the key point row, then pick another point on the template.
  - Do it for every of your pictures.
- When ready, click 'Generate data file' button, to produce .zip file, which will contain resized (to given dimension) images and xml files of picked key points.
  - Images would land in given directory name, xml's directory would be 'Annotations' and those files names will be corresponding to images, which they were built from.
  - In main directory would be stats.txt file, in which each key point id'd be accompanied with it's occurances number in created dataset.

## Demo
Project is available at [Github Pages](https://kkoripl.github.io/NaryaKeyPointsDatasetCreator/).

## Info
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.7.
