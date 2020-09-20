import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingController, ToastController } from '@ionic/angular';
import { throwError } from 'rxjs';
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
  }));

  test('Should sucessfully upload an image', () => {
    component.uploadImage(event.target.result, file);

    expect(component.originalImage.getSrc()).toEqual('mockFileSrc');
    expect(component.originalImage.getFile()).toEqual(file);

    expect(imageService.uploadImage).toHaveBeenCalledWith(file);
    expect(component.processedImage.getSrc()).toEqual('mockFileSrc');
    expect(component.processedImage.getFile()).toEqual(file);
    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });

  test('Should dismiss loading when upload fails', () => {
    jest.spyOn(imageService, 'uploadImage').mockReturnValue(throwError('error'));

    component.uploadImage(event.target.result, file);

    expect(imageService.uploadImage).toHaveBeenCalledWith(file);
    expect(component.processedImage.getSrc()).toBeUndefined();
    expect(component.processedImage.getFile()).toBeUndefined();
    expect(loadingCtrl.dismiss).toHaveBeenCalled();
  });
});
