import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  constructor(private http: HttpClient) {}

  buildUrl(url: string) {
    return environment.API_URL + url;
  }

  public uploadImage(image: File): Observable<any> {
    const formData = new FormData();

    formData.append('image', image);
    const url = this.buildUrl('/upload');

    return this.http.post(url, formData, { responseType: 'blob' }).pipe(
      map((response) => {
        return response;
      })
    );
  }
}
