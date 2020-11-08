import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { LoadingController, ModalController } from '@ionic/angular';
import { throwError } from 'rxjs';
import { DefaultOutlineThickness, ImageLabel, OutlineErrorMessage, UploadErrorMessage, White } from 'src/assets/constants';
import { ImageServiceMock } from '../../../jest-mocks/image.service';
import { ModalControllerMock } from '../../../jest-mocks/modal-controller';
import { ImageService } from '../../services/image/image.service';
import { DownloadComponent } from '../download/download.component';
import { LoadingControllerMock } from './../../../jest-mocks/loading-controller';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let imageService: ImageService;
  let loadingCtrl: LoadingController;
  let modalCtrl: ModalController;

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
          provide: ModalController,
          useClass: ModalControllerMock
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    imageService = TestBed.inject(ImageService);
    loadingCtrl = TestBed.inject(LoadingController);
    modalCtrl = TestBed.inject(ModalController);

    jest.spyOn(component, 'showLoading').mockImplementation();
    jest.spyOn(component, 'dismissLoading').mockImplementation();
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
    expect(imageService.handleError).toHaveBeenCalledWith(UploadErrorMessage);
  });

  test('Should call the handleError() method when upload fails', () => {
    jest.spyOn(imageService, 'uploadImage').mockReturnValue(throwError('error'));

    component.uploadImage(event.target.result, file);

    expect(imageService.handleError).toHaveBeenCalledWith(UploadErrorMessage);
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
      expect(imageService.handleError).toHaveBeenCalledWith(OutlineErrorMessage);
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
      expect(imageService.handleError).toHaveBeenCalledWith(OutlineErrorMessage);
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

  test('Should open a download modal and then reset all class variables after download', fakeAsync(() => {
    component.outlineColor = 'mockOutlineColor';
    component.outlineThickness = '1';
    component.segnetSectionColor = 'mockSegnetSectionColor';
    component.serialID = 'Trix';
    component.originalImage = 'original';
    component.segmentedImage = 'segment';
    component.originalImageWithOutline = 'originalOutline';
    component.segmentedImageWithOutline = 'segmentOutline';

    component.download();
    tick();

    expect(modalCtrl.create).toHaveBeenCalledWith({
      component: DownloadComponent,
      componentProps: { serialID: 'Trix' }
    });

    expect(component.outlineColor).toEqual(White);
    expect(component.outlineThickness).toEqual(DefaultOutlineThickness);
    expect(component.segnetSectionColor).toBeUndefined();
    expect(component.serialID).toBeUndefined();
    expect(component.originalImage).toEqual('');
    expect(component.segmentedImage).toEqual('');
    expect(component.originalImageWithOutline).toEqual('');
    expect(component.segmentedImageWithOutline).toEqual('');
  }));
});
