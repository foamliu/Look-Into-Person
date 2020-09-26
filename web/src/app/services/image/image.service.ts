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

  private uploadProgress = 0;
  private downloadProgress = 0;
  private loadingElement: HTMLElement;

  getUploadProgress(): number {
    return this.uploadProgress;
  }

  setUploadProgress(uploadProgress: number): void {
    this.uploadProgress = uploadProgress;
    if (this.uploadProgress === 100) {
      this.setLoadingText('Processing Image...');
    } else {
      this.setLoadingText(`Uploading... ${this.uploadProgress}%`);
    }
  }

  getDownloadProgress(): number {
    return this.downloadProgress;
  }

  setDownloadProgress(downloadProgress: number): void {
    this.downloadProgress = downloadProgress;
    this.setLoadingText(`Downloading... ${this.downloadProgress}%`);
  }

  resetProgress(): void {
    this.uploadProgress = 0;
    this.downloadProgress = 0;
  }

  getLoadingElement(): HTMLElement {
    return this.loadingElement;
  }

  setLoadingElement(element: HTMLElement): void {
    this.loadingElement = element;
  }

  setLoadingText(text: string) {
    this.loadingElement.innerHTML = text;
  }

  buildUrl(url: string) {
    return environment.API_URL + url;
  }

  post(url: string, formData: FormData, options = {}): Observable<any> {
    return this.http.post(url, formData, options).pipe(map((response) => response));
  }

  public uploadImage(src: string, fileName: string): Observable<any> {
    const formData = new FormData();

    formData.append('image', src);
    formData.append('fileName', fileName);
    const url = this.buildUrl('/upload');

    return this.post(url, formData, { observe: 'events', reportProgress: true });
  }

  getOutlinedImages(segmentColor: string, outlineColor: string, outlineThickness: string): Observable<any> {
    const formData = new FormData();
    formData.append('segmentColor', segmentColor);
    formData.append('outlineColor', outlineColor);
    formData.append('outlineThickness', outlineThickness);

    return this.post(this.buildUrl('/segment'), formData, { observe: 'events', reportProgress: true });
  }
}
