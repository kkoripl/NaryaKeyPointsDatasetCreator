## Instruction
- Setup final dimension of images - dimension, which would you use to train model on. Max: 512x512
- Setup name of directory, where you'd put created by this generator images in.
- Setup name of data .zip file (without .zip extension), which you'd generate later on.
- Upload football game match frames pictures
- Pick one of images, extend its row and start adding key points:
  - Click particular point on your picture.
  - Pick one of 29 points on the template below, to add key point it's id.
  - To change wrong id, finish adding next key point and then change selection of the key point row, then pick another point on the template.
  - Do same steps for each of your pictures!
  - Tip: You can go straight to the next picture by pushing button 'S' on your keyboard - for the previous one - push 'W'.
- When ready, click 'Generate data file' button, to produce .zip file, which will contain resized (to given dimension) images and xml files of picked key points.
  - Images would land in given directory name, xml's directory would be 'Annotations', and those files names will be corresponding to images, which they were built from.
  - In the main directory would be additional text file: stats.txt file, in which each key point id would be accompanied by its number of occurrences in created dataset;

**Info!**

Creator is tested for 120-150 images loaded at once and it works well (except from Safari browser). Loading more of them into the app is made on the risk of a user.
