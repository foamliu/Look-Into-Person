import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
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

    jest.spyOn(service, 'buildUrl').mockImplementation((url) => url);
  });

  afterEach(() => httpTestingController.verify());

  test('Should accept an image to upload and return a response', () => {
    const expectedResponse = { segmentedImage: 'mockSrc' };
    const src = 'mockSrc';

    const expectedForm = new FormData();
    expectedForm.append('image', src);
    expectedForm.append('fileName', file.name);

    service.uploadImage(src, file.name).subscribe((response) => expect(response).toEqual(expectedResponse));

    const req = httpTestingController.expectOne('/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedForm);

    req.flush(expectedResponse);
  });

  test('Should request outlined images with segment color, outline color, and outline thickness', () => {
    const expectedResponse = {
      originalOutline: '123',
      segmentedOutline: '456'
    };

    const segmentColor = 'rgba(255,255,255,1';
    const outlineColor = '55,55,55';
    const outlineThickness = '1';

    const expectedForm = new FormData();

    expectedForm.append('segmentColor', segmentColor);
    expectedForm.append('outlineColor', outlineColor);
    expectedForm.append('outlineThickness', outlineThickness);

    service
      .getOutlinedImages(segmentColor, outlineColor, outlineThickness)
      .subscribe((response) => expect(response).toEqual(expectedResponse));

    const req = httpTestingController.expectOne('/segment');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(expectedForm);
    req.flush(expectedResponse);
  });
});
