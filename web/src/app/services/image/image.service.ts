import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  constructor(private http: HttpClient) {}

  buildUrl(url: string) {
    return environment.API_URL + url;
  }

  public uploadImage(src: string, fileName: string): Observable<any> {
    const formData = new FormData();

    formData.append('image', src);
    formData.append('fileName', fileName);
    const url = this.buildUrl('/upload');

    return this.http.post(url, formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  getOutlinedImages(segmentColor: string, outlineColor: string, outlineThickness: string) {
    const formData = new FormData();
    formData.append('segmentColor', segmentColor);
    formData.append('outlineColor', outlineColor);
    formData.append('outlineThickness', outlineThickness);

    return this.http.post(this.buildUrl('/segment'), formData).pipe(map((response) => response));
  }
}
