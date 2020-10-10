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

    jest.spyOn(service, 'buildUrl').mockImplementation((url) => url);
  });

  describe('HTTP calls', () => {
    beforeEach(() => (httpTestingController = TestBed.inject(HttpTestingController)));
    afterEach(() => httpTestingController.verify());

    test('Should make an HTTP POST request', () => {
      const expectedResponse = { mockResponse: 'mockResponse' };
      const url = '/upload';

      const formData = new FormData();
      formData.append('image', 'mockSrc');
      formData.append('fileName', file.name);

      service.post(url, formData).subscribe((response) => expect(response).toEqual(expectedResponse));

      const req = httpTestingController.expectOne(url);

      expect(req.request.url).toEqual(url);
      expect(req.request.body).toEqual(formData);
      expect(req.request.method).toBe('POST');

      req.flush(expectedResponse);
    });
  });

  test('Should reset the upload and download progress to 0', () => {
    jest.spyOn(service, 'getUploadProgress');
    jest.spyOn(service, 'getDownloadProgress');
    service['uploadProgress'] = 100;
    service['downloadProgress'] = 100;

    service.resetProgress();

    expect(service['uploadProgress']).toEqual(0);
    expect(service['downloadProgress']).toEqual(0);
  });

  test('Should show a message that the image is being processed when upload is 100%', () => {
    jest.spyOn(service, 'setLoadingText').mockImplementation();
    service.setUploadProgress(100);

    expect(service['uploadProgress']).toEqual(100);
    expect(service.setLoadingText).toHaveBeenCalledWith('Processing Image...');
  });

  test('Should show the upload progress when an upload is in progress', () => {
    jest.spyOn(service, 'setLoadingText').mockImplementation();
    service.setUploadProgress(50);

    expect(service['uploadProgress']).toEqual(50);
    expect(service.setLoadingText).toHaveBeenCalledWith('Uploading... 50%');
  });

  test('Should show the download progress when a download is in progress', () => {
    jest.spyOn(service, 'setLoadingText').mockImplementation();
    service.setDownloadProgress(78);

    expect(service['downloadProgress']).toEqual(78);
    expect(service.setLoadingText).toHaveBeenCalledWith('Downloading... 78%');
  });

  test('Should accept an image to upload and make a POST request', () => {
    jest.spyOn(service, 'post').mockImplementation();

    const src = 'mockSrc';

    const expectedForm = new FormData();
    expectedForm.append('image', src);
    expectedForm.append('fileName', file.name);

    service.uploadImage(src, file.name);

    expect(service.post).toHaveBeenCalledWith('/upload', expectedForm, { observe: 'events', reportProgress: true });
  });

  test('Should request outlined images with segment color, outline color, outline thickness, and serial ID', () => {
    jest.spyOn(service, 'post').mockImplementation();

    const segmentColor = '255,255,255,1';
    const outlineColor = '55,55,55';
    const outlineThickness = '1';
    const serialID = 'CornFlakes';

    const expectedForm = new FormData();

    expectedForm.append('segmentColor', segmentColor);
    expectedForm.append('outlineColor', outlineColor);
    expectedForm.append('outlineThickness', outlineThickness);
    expectedForm.append('serialID', serialID);

    service.getOutlinedImages(segmentColor, outlineThickness, outlineColor, serialID);

    expect(service.post).toHaveBeenCalledWith('/outline', expectedForm, { observe: 'events', reportProgress: true });
  });
});
