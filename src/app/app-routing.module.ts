import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {KeyPointsDatasetCreatorComponent} from './dataset-creator/keypoints-dataset-creator/keypoints-dataset-creator.component';
import {MainPageComponent} from './main-page-component/main-page.component';
import {TrackerDatasetCreatorComponent} from './dataset-creator/tracker-dataset-creator/tracker-dataset-creator.component';


const routes: Routes = [
  {
    path: '', component: MainPageComponent, pathMatch: 'full'
  },
  {
    path: 'keypoints-dataset', component: KeyPointsDatasetCreatorComponent
  },
  {
    path: 'tracker-dataset', component: TrackerDatasetCreatorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
