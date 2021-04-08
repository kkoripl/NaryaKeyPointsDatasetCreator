## Instruction
- Setup final dimension of images - dimension, which would you use to train model on. Max: 512x512
- Setup name of directory, where you'd put created by this generator images in.
- Setup name of data .zip file (without .zip extension), which you'd generate later on.
- Upload football game match frames pictures
- Pick one of images, extend its row and start adding bounding boxes:
  - Click particular point on your picture. It would be starting point for your bounding box.
  - With right mouse button still holden, start moving your mouse to adjust size of your bounding box.
  - To finish adjusting size, release holden button - on your bounding box would appear 9 points of a transformer. Use them to make final modifications to bounding box.
  - When you would be satisfied with created box, click wherever on the image (or push button 'A' on a keyboard) to close transformer and finish creation process.
  - In bounding boxes data table on the right-hand side, automatically box would be labeled as player, if you would like to change it, click on this column.
  - Do same steps for each of your pictures!
  - Tip: You can go straight to the next picture by pushing button 'S' on your keyboard - for the previous one - push 'W'.
  - (If you would be unsatisfied with your bounding box after closing transformer, you need to delete it using button in data table and create new bounding box).
- When ready, click 'Generate data file' button, to produce .zip file, which will contain resized (to given dimension) images and xml files of picked key points.
  - Images would land in given directory name, xml's directory would be 'Annotations', and those files names will be corresponding to images, which they were built from.
  - In the main directory would be additional text file: set.txt file, in which every annotated image name is listed.

**Info!**

Creator is not tested for images loaded at once limits. All usage of big datasets is is made on the risk of a user. If you would pick to use trained model in backend for bounding boxes predictions, browser can have little problems with smoothly showing images when there would be about 60 of them.
