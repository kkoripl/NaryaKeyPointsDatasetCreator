# NaryaKeyPointsDatasetCreator
Pitch keypoints and tracking dataset creator for [Narya](https://github.com/DonsetPG/narya), player and pitch tracking model.

## Demo
Project is available at [Github Pages](https://kkoripl.github.io/NaryaKeyPointsDatasetCreator/).


## Instruction
**Remember! Sizes of images on the left side of a panel would be always 1024x1024 to make it easier to pick particular spots on the graphic. But the dimension, you see in upper left corner is mapped to the size your image would be resized to, which you picked in first point of this instruction (below). Due to calculations on dimensions, points you'd pick (keypoints or bounding boxes) can be misplaced on the preview a little (by pixel, two etc.) on the picture. They are 100% good in files though.**

**Page is not tested for unlimited number of pictures! It works well on about 100-120 images at once for data generation. Keep that in mind if generating process would last for some time.**

**Creator is not working on Safari!**

**BOTH CREATORS**
- Setup final dimension of images - dimension, which would you use to train model on. Max: 512x512
- Setup name of directory, where you'd put created by this generator images in.
- Setup name of data .zip file (without .zip extension), which you'd generate later on.
- Upload football game match frames pictures
- **Different steps for each creator, listed below**
- When ready, click 'Generate data file' button, to produce .zip file, which will contain resized (to given dimension) images and xml files of picked key points.
  - Images would land in given directory name, xml's directory would be 'Annotations', and those files names will be corresponding to images, which they were built from.
  - In the main directory would be additional text file:
    - **Keypoints creator:** stats.txt file, in which each key point id would be accompanied by its number of occurrences in created dataset;
    - **Tracker creator:** set.txt file, in which every annotated image name is listed.


**STEPS FOR KEYPOINTS CREATOR**
- Pick one of images, extend its row and start adding key points:
  - Click particular point on your picture.
  - Pick one of 29 points on the template below, to add key point it's id.
  - To change wrong id, finish adding next key point and then change selection of the key point row, then pick another point on the template.
  - Do same steps for each of your pictures!
  - Tip: You can go straight to the next picture by pushing button 'S' on your keyboard - for the previous one - push 'W'.
  
**STEPS FOR TRACKER CREATOR**
- Pick one of images, extend its row and start adding bounding boxes:
  - Click particular point on your picture. It would be starting point for your bounding box.
  - With right mouse button still holden, start moving your mouse to adjust size of your bounding box.
  - To finish adjusting size, release holden button - on your bounding box would appear 9 points of a transformer. Use them to make final modifications to bounding box.
  - When you would be satisfied with created box, click wherever on the image (or push button 'A' on a keyboard) to close transformer and finish creation process.
  - In bounding boxes data table on the right-hand side, automatically box would be labeled as player, if you would like to change it, click on this column.
  - Do same steps for each of your pictures!
  - Tip: You can go straight to the next picture by pushing button 'S' on your keyboard - for the previous one - push 'W'.
  - (If you would be unsatisfied with your bounding box after closing transformer, you need to delete it using button in data table and create new bounding box).
  

## Other sports
It looks like a generator is useful also for other sports than football. You just need to modify it slightly.

**Keypoints creator:**
- Change keypoints template file in assets (pitch.png) for your one. If you have change its file name, then also in environments file change value of variable: idTemplateImage. Would be the best if new file would be in same size as original template, otherwise there can be a need to adjust .css file to let it properly being rendered on site.
- In environments change variable: templateKeyPoints to create keypoints suitable for your sport.

**Tracker creator:**
- Change labels in bounding-box-label.ts file. All values there are automatically used as an array, so don't worry to completely change them as you wish.

## Info
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.7.
