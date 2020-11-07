import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingController, ToastController } from '@ionic/angular';
import { throwError } from 'rxjs';
import { ImageLabel } from 'src/assets/constants';
import { ToastControllerMock } from 'src/jest-mocks/toast-controller';
import { ImageServiceMock } from '../../../jest-mocks/image.service';
import { ImageService } from '../../services/image/image.service';
import { LoadingControllerMock } from './../../../jest-mocks/loading-controller';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let imageService: ImageService;
  let loadingCtrl: LoadingController;
  let toastCtrl: ToastController;

  const blob = new Blob([''], { type: 'image/png' });
  blob['name'] = 'mockFileName';

  const file = <File>blob;
  const event = {
    target: {
      result: 'mockFileSrc'
    }
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomePage],
      providers: [
        {
          provide: ImageService,
          useClass: ImageServiceMock
        },
        {
          provide: LoadingController,
          useClass: LoadingControllerMock
        },
        {
          provide: ToastController,
          useClass: ToastControllerMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    imageService = TestBed.inject(ImageService);
    loadingCtrl = TestBed.inject(LoadingController);
    toastCtrl = TestBed.inject(ToastController);

    jest.spyOn(component, 'showLoading').mockImplementation();
    jest.spyOn(component, 'dismissLoading').mockImplementation();
    jest.spyOn(component, 'handleError').mockImplementation();
  }));

  test('Should upload an image and handle the response', () => {
    jest.spyOn(component, 'handleResponseForUploadImage');

    component.uploadImage(event.target.result, file);
    expect(component.handleResponseForUploadImage).toHaveBeenCalledWith(
      new HttpResponse({
        body: { segmentedImage: 'b64String' }
      }),
      'mockFileSrc'
    );
  });

  test('Should handle an upload event when uploading an image', () => {
    jest.spyOn(component, 'handleUploadEvent').mockImplementation();

    const httpEvent: HttpEvent<HttpEventType.UploadProgress> = {
      type: HttpEventType.UploadProgress,
      loaded: 25,
      total: 100
    };

    component.handleResponseForUploadImage(httpEvent, 'mockSrc');
    expect(component.handleUploadEvent).toHaveBeenCalledWith(25, 100);
  });

  test('Should handle a download event when uploading an image', () => {
    jest.spyOn(component, 'handleDownloadEvent').mockImplementation();

    const httpEvent: HttpEvent<HttpEventType.DownloadProgress> = {
      type: HttpEventType.DownloadProgress,
      loaded: 87,
      total: 100
    };

    component.handleResponseForUploadImage(httpEvent, 'mockSrc');
    expect(component.handleDownloadEvent).toHaveBeenCalledWith(87, 100);
  });

  test('Should handle an HttpResponse when uploading an image', () => {
    const response = new HttpResponse({
      body: { segmentedImage: 'b64String', serialID: 'FrostedFlakes' }
    });

    component.handleResponseForUploadImage(response, 'mockFileSrc');
    expect(component.originalImage).toEqual('mockFileSrc');
    expect(component.segmentedImage).toEqual('b64String');
    expect(component.serialID).toEqual('FrostedFlakes');
    expect(component.dismissLoading).toHaveBeenCalled();
  });

  test('Should handle an error on upload when we do not get the expected response', () => {
    const response = new HttpResponse({
      body: { finalImage: 'b64String' }
    });

    component.handleResponseForUploadImage(response, 'mockFileSrc');
    expect(component.originalImage).toBe('');
    expect(component.segmentedImage).toBe('');
    expect(component.handleError).toHaveBeenCalled();
  });

  test('Should call the handleError() method when upload fails', () => {
    jest.spyOn(imageService, 'uploadImage').mockReturnValue(throwError('error'));

    component.uploadImage(event.target.result, file);

    expect(component.handleError).toHaveBeenCalled();
  });

  describe('requesting outlined images', () => {
    beforeEach(() => {
      component.segnetSectionColor = '#ff0099';
      component.outlineThickness = '1';
      component.outlineColor = '#000154';
      component.originalImage = 'original1';
      component.segmentedImage = 'processed1';
      component.serialID = 'FrostedFlakes';
    });

    test('Should request outlined images and handle the response', fakeAsync(() => {
      jest.spyOn(component, 'handleResponseForOutlinedImages').mockImplementation();

      component.getOutlinedImages();
      tick();

      expect(component.handleResponseForOutlinedImages).toHaveBeenCalledWith(
        new HttpResponse({
          body: { originalOutline: 'outlined1', segmentedOutline: 'outlined2' }
        })
      );
    }));

    test('Should handle an upload event when uploading an image', () => {
      jest.spyOn(component, 'handleUploadEvent').mockImplementation();

      const httpEvent: HttpEvent<HttpEventType.UploadProgress> = {
        type: HttpEventType.UploadProgress,
        loaded: 33,
        total: 100
      };

      component.handleResponseForOutlinedImages(httpEvent);
      expect(component.handleUploadEvent).toHaveBeenCalledWith(33, 100);
    });

    test('Should handle a download event when uploading an image', () => {
      jest.spyOn(component, 'handleDownloadEvent').mockImplementation();

      const httpEvent: HttpEvent<HttpEventType.DownloadProgress> = {
        type: HttpEventType.DownloadProgress,
        loaded: 100,
        total: 100
      };

      component.handleResponseForOutlinedImages(httpEvent);
      expect(component.handleDownloadEvent).toHaveBeenCalledWith(100, 100);
    });

    test('Should handle an HttpResponse with the expected body when requesting outlined images', () => {
      const response = new HttpResponse({
        body: { originalOutline: 'outlined1', segmentedOutline: 'outlined2' }
      });

      component.handleResponseForOutlinedImages(response);

      expect(component.originalImage).toEqual('original1');
      expect(component.segmentedImage).toEqual('processed1');
      expect(component.originalImageWithOutline).toEqual('outlined1');
      expect(component.segmentedImageWithOutline).toEqual('outlined2');
      expect(component.dismissLoading).toHaveBeenCalled();
    });

    test('Should request outlined images and handle an error and not change the images if the expected data is not returned', () => {
      const response = new HttpResponse({
        body: { badOriginal: 'outlined1', badOutline: 'outlined2' }
      });

      component.handleResponseForOutlinedImages(response);

      expect(component.originalImage).toEqual('original1');
      expect(component.segmentedImage).toEqual('processed1');
      expect(component.originalImageWithOutline).toEqual('');
      expect(component.segmentedImageWithOutline).toEqual('');
      expect(component.handleError).toHaveBeenCalled();
    });

    test('Should request outlined images and handle an error and not change the images if there is an Http error', fakeAsync(() => {
      jest.spyOn(imageService, 'getOutlinedImages').mockReturnValue(throwError('error'));

      component.getOutlinedImages();
      tick();

      expect(imageService.getOutlinedImages).toHaveBeenCalledWith('#ff0099', '1', '#000154', 'FrostedFlakes');
      expect(component.originalImage).toEqual('original1');
      expect(component.segmentedImage).toEqual('processed1');
      expect(component.originalImageWithOutline).toEqual('');
      expect(component.segmentedImageWithOutline).toEqual('');
      expect(component.handleError).toHaveBeenCalled();
    }));
  });

  test("Should show a label of 'Outlined Original Image' when there is an outline on the original", () => {
    component.originalImage = 'original';
    component.originalImageWithOutline = 'originalWithOutline';

    jest.spyOn(component, 'getLabelForOriginalImage');

    component.getLabelForOriginalImage();

    expect(component.getLabelForOriginalImage).toReturnWith(ImageLabel.OutlinedOriginal);
  });

  test("Should show a label of 'Original Image' when there is not an outline on the original", () => {
    component.originalImage = 'original';
    component.originalImageWithOutline = '';

    jest.spyOn(component, 'getLabelForOriginalImage');

    component.getLabelForOriginalImage();

    expect(component.getLabelForOriginalImage).toReturnWith(ImageLabel.Original);
  });

  test("Should show a label of 'Outlined Segmented Image' when there is an outline on the segmented", () => {
    component.segmentedImage = 'segmented';
    component.segmentedImageWithOutline = 'segmentedOutlined';

    jest.spyOn(component, 'getLabelForSegmentedImage');

    component.getLabelForSegmentedImage();

    expect(component.getLabelForSegmentedImage).toReturnWith(ImageLabel.OutlinedSegmented);
  });

  test("Should show a label of 'Segmented Image' when there is not an outline on the segmented", () => {
    component.segmentedImage = 'segmented';
    component.segmentedImageWithOutline = '';

    jest.spyOn(component, 'getLabelForSegmentedImage');

    component.getLabelForSegmentedImage();

    expect(component.getLabelForSegmentedImage).toReturnWith(ImageLabel.Segmented);
  });

  describe('Getting image string to display', () => {
    beforeEach(() => {
      (component.originalImage = 'original'), (component.segmentedImage = 'segmented');
    });

    test('Should return the original image with outline when present', () => {
      component.originalImageWithOutline = 'outlinedOriginal';

      jest.spyOn(component, 'getImageStringForOriginalImage');

      component.getImageStringForOriginalImage();

      expect(component.getImageStringForOriginalImage).toReturnWith('outlinedOriginal');
    });

    test('Should return the unoutlined original image when no outline is present', () => {
      component.originalImageWithOutline = '';

      jest.spyOn(component, 'getImageStringForOriginalImage');

      component.getImageStringForOriginalImage();

      expect(component.getImageStringForOriginalImage).toReturnWith('original');
    });

    test('Should return the segmented image with outline when present', () => {
      component.segmentedImageWithOutline = 'outlinedSegmented';

      jest.spyOn(component, 'getImageStringForSegmentedImage');

      component.getImageStringForSegmentedImage();

      expect(component.getImageStringForSegmentedImage).toReturnWith('outlinedSegmented');
    });

    test('Should return the unoutlined segmented image when no outline is present', () => {
      component.segmentedImageWithOutline = '';

      jest.spyOn(component, 'getImageStringForSegmentedImage');

      component.getImageStringForSegmentedImage();

      expect(component.getImageStringForSegmentedImage).toReturnWith('segmented');
    });
  });
});
