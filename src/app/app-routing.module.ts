import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {KeyPointsDatasetCreatorComponent} from './dataset-creator/keypoints-dataset-creator/keypoints-dataset-creator.component';
import {MainPageComponent} from './main-page-component/main-page.component';


const routes: Routes = [
  {
    path: '', component: MainPageComponent, pathMatch: 'full'
  },
  {
    path: 'keypoints-dataset', component: KeyPointsDatasetCreatorComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
