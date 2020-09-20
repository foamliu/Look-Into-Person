import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingController } from '@ionic/angular';
import { throwError } from 'rxjs';
import { ImageServiceMock } from '../../../jest-mocks/image.service';
import { ImageService } from '../../services/image/image.service';
import { LoadingControllerMock } from './../../../jest-mocks/loading-controller';
import { UploadStatus } from './../../shared/image-snippet.model';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let imageService: ImageService;
  let loadingCtrl: LoadingController;

  const blob = new Blob([''], { type: 'image/png' });
  blob['lastModifiedDate'] = '';
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
        }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    imageService = TestBed.inject(ImageService);
    loadingCtrl = TestBed.inject(LoadingController);
  }));

  test('Should sucessfully upload an image', () => {
    jest.spyOn(component, 'tryToSetSkeletonTextHeight').mockImplementation();

    component.processedImage.status = UploadStatus.InProgress;
    component.uploadImage(event, file);

    expect(component.tryToSetSkeletonTextHeight).toHaveBeenCalled();

    expect(component.uploadedFile.src).toEqual('mockFileSrc');
    expect(component.uploadedFile.file).toEqual(file);

    expect(imageService.uploadImage).toHaveBeenCalledWith(file);
    expect(component.fileAdded).toBe(true);
    expect(component.processedImage.src).toEqual('mockFileSrc');
    expect(component.processedImage.file).toEqual(file);
    expect(component.processedImage.status).toEqual(UploadStatus.Completed);
    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });

  test('Should dismiss loading when upload fails', () => {
    jest.spyOn(component, 'tryToSetSkeletonTextHeight').mockImplementation();
    jest.spyOn(imageService, 'uploadImage').mockReturnValue(throwError('error'));

    component.uploadImage(event, file);

    expect(component.tryToSetSkeletonTextHeight).toHaveBeenCalled();
    expect(imageService.uploadImage).toHaveBeenCalledWith(file);
    expect(component.fileAdded).toBe(false);
    expect(component.processedImage.src).toEqual('/assets/icon/favicon.png');
    expect(component.processedImage.file).toBeUndefined();
    expect(component.processedImage.status).toEqual(UploadStatus.NotStarted);
    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });
});
