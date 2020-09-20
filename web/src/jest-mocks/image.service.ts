import { of } from 'rxjs';

export class ImageServiceMock {
  buildUrl: (url: string) => string;
  uploadImage: (image: any) => any;

  constructor() {
    this.buildUrl = jest.fn();
    this.uploadImage = jest.fn((image) => of(image));
  }
}
