import { HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

export class ImageServiceMock {
  handleError: (message: string) => any;
  showSuccessfulDownload: () => any;
  getUploadProgress: () => number;
  setUploadProgress: (uploadProgress: number) => void;
  getDownloadProgress: () => number;
  setDownloadProgress: (downloadProgress: number) => void;
  resetProgress: () => void;
  getLoadingElement: () => any;
  setLoadingElement: (element: any) => any;
  buildUrl: (url: string) => string;
  uploadImage: (src: any, string, fileName: string) => any;
  getOutlinedImages: (segmentColor: string, outlineColor: string, outlineThickness: string) => any;
  downloadImages: (formData: any) => any;

  constructor() {
    this.handleError = jest.fn(() => Promise.resolve());
    this.showSuccessfulDownload = jest.fn(() => Promise.resolve());
    this.getUploadProgress = jest.fn(() => 50);
    this.setUploadProgress = jest.fn();
    this.getDownloadProgress = jest.fn(() => 75);
    this.setDownloadProgress = jest.fn();
    this.resetProgress = jest.fn();
    this.getLoadingElement = jest.fn(() => {});
    this.setLoadingElement = jest.fn();
    this.buildUrl = jest.fn();
    this.uploadImage = jest.fn((src, fileName) => {
      const response: HttpResponse<any> = new HttpResponse({
        body: { segmentedImage: 'b64String' }
      });

      return of(response);
    });

    this.getOutlinedImages = jest.fn(() => {
      const response: HttpResponse<any> = new HttpResponse({
        body: { originalOutline: 'outlined1', segmentedOutline: 'outlined2' }
      });

      return of(response);
    });

    this.downloadImages = jest.fn(() => of('mockZipBlob'));
  }
}
