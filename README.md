# NaryaKeyPointsDatasetCreator

Pitch key points dataset creator for Narya, player and pitch tracking model: https://github.com/DonsetPG/narya.

## Instruction

- Setup final dimension of images - dimension, which would you use to train model on. Max: 512x512
- Setup name of directory, where you'd put created by this generator images in.
- Upload football game match frames pictures
- Pick one of images, extend it's row and start adding key points:
  - Click particular point on your picture.
  - Pick one of 29 points on the template below, to add key point it's id.
  - To change wrong id, finish adding next key point and then change selection of the key point row, then pick another point on the template.
  - Do it for every of your pictures.
- When ready, click 'Generate Data' button, to produce .zip file, which will contain resized (to given dimension) images and xml files of picked key points.
  - Images would land in given directory name, xml's directory would be 'Annotations' and those files names will be corresponding to images, which they were built from.

## Demo
Project is available on github pages: https://kkoripl.github.io/NaryaKeyPointsDatasetCreator/

## Info
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.7.
