import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ImageService } from './image.service';

describe('ImageService', () => {
  let service: ImageService;
  let httpTestingController: HttpTestingController;

  const blob = new Blob([''], { type: 'image/png' });
  blob['lastModifiedDate'] = '';
  blob['name'] = 'mockFileName';
  const file = <File>blob;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ImageService]
    });
    service = TestBed.inject(ImageService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTestingController.verify());

  test('Should accept an image to upload and return a response', fakeAsync(() => {
    const body = new Blob();

    jest.spyOn(service, 'buildUrl').mockImplementation((url) => url);

    const expectedForm = new FormData();
    expectedForm.append('image', file);

    service.uploadImage(file).subscribe((response) => expect(response).toEqual(body));
    tick();

    const req = httpTestingController.expectOne('/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedForm);

    req.flush(body);
  }));
});
