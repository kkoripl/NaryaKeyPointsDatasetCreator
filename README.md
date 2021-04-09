# NaryaKeyPointsDatasetCreator
Pitch keypoints and tracking dataset creator for [Narya](https://github.com/DonsetPG/narya), player and pitch tracking model.

## Demo
Project is available at [Github Pages](https://kkoripl.github.io/NaryaKeyPointsDatasetCreator/).

## Instructions
All needed instructions are placed in docs directory.

## Before one would use creators
**Creators are not working on Safari!**

**Remember!** Sizes of images on the left side of a panel would be always 1024x1024 to make it easier to pick particular spots on the graphic. But the dimension, you see in upper left corner is mapped to the size your image would be resized to, which you picked in first point of this instruction (below). Due to calculations on dimensions, points you'd pick (keypoints or bounding boxes) can be misplaced on the preview a little (by pixel, two etc.) on the picture. They are 100% good in files though.

**Trackings creator** 
VOCDetection, which is used underneath TrackerModel in Narya project, is setup to look only for .jpg images during training process! 
This dataset creator is not changing extensions of loaded files, so one need to do it him or herself beforehand! 

## Other sports
It looks like a generator is useful also for other sports than football. You just need to modify it slightly.

**Keypoints creator:**
- Change keypoints template file in assets (pitch.png) for your one. If you have change its file name, then also in environments file change value of variable: idTemplateImage. Would be the best if new file would be in same size as original template, otherwise there can be a need to adjust .css file to let it properly being rendered on site.
- In environments change variable: templateKeyPoints to create keypoints suitable for your sport.

**Tracker creator:**
- Change labels in bounding-box-label.ts file. All values there are automatically used as an array, so don't worry to completely change them as you wish.

## Info
This project fronted was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.7.
