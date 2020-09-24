import { of } from 'rxjs';

export class ImageServiceMock {
  buildUrl: (url: string) => string;
  uploadImage: (src: any, string, fileName: string) => any;
  getOutlinedImages: (segmentColor: string, outlineColor: string, outlineThickness: string) => any;

  constructor() {
    this.buildUrl = jest.fn();
    this.uploadImage = jest.fn((src, fileName) => of({ segmentedImage: 'b64String' }));
    this.getOutlinedImages = jest.fn(() => of({ originalOutline: 'outlined1', segmentedOutline: 'outlined2' }));
  }
}
