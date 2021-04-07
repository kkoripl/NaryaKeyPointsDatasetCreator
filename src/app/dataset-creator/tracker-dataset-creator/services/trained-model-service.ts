import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {environment} from '../../../../environments/environment';
import {Observable} from 'rxjs';
import {ImageDimension} from '../../../commons/models/interfaces/image-dimension';

@Injectable()
export class TrainedModelService {

  private apiUrl: string = environment.apiUrl;

  constructor(private http: HttpClient) {
  }

  sendImageToPrediction(images: FileList, resizedImgDim: ImageDimension): Observable<any> {
    const uploadData = new FormData();
    for (let i = 0; i < images.length; i++) {
      const image = images.item(i);
      uploadData.append(image.name, image, image.name);
    }
    const httpOptions = {
      params: new HttpParams().set('targetImgSize', JSON.stringify(resizedImgDim))
    };

    return this.http.post(this.apiUrl + '/get-bboxes', uploadData, httpOptions);
  }
}
