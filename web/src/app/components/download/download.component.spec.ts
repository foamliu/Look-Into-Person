import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { LoadingController, ModalController } from '@ionic/angular';
import { throwError } from 'rxjs';
import { ImageService } from 'src/app/services/image/image.service';
import { DownloadErrorMessage } from 'src/assets/constants';
import { ImageServiceMock } from 'src/jest-mocks/image.service';
import { LoadingControllerMock } from 'src/jest-mocks/loading-controller';
import { ModalControllerMock } from 'src/jest-mocks/modal-controller';
import { DownloadComponent } from './download.component';

describe('DownloadComponent', () => {
  let component: DownloadComponent;
  let fixture: ComponentFixture<DownloadComponent>;
  let imageService: ImageService;
  let modalCtrl: ModalController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [DownloadComponent],
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

    fixture = TestBed.createComponent(DownloadComponent);
    component = fixture.componentInstance;
    imageService = TestBed.inject(ImageService);
    modalCtrl = TestBed.inject(ModalController);

    component.serialID = 'CookieCrisp';
    component.form = component['formBuilder'].group({
      options: component['formBuilder'].array([])
    });
  }));

  // This test checks that we have the right download options available when the download modal is opened
  test('Should initialize the form on page initialization', () => {
    component.initializeForm();
    expect(component.formArr.value).toEqual(
      component.downloadOptions.map((option) => {
        return {
          [option.name]: false
        };
      })
    );
  });

  // These tests check that clicking on a download option either checks or unchecks the box
  describe('Keeping track of how many options are selected', () => {
    beforeEach(() => (component.numberChecked = 1));

    test('Should increase the number of checked boxes', () => {
      component.onCheckboxChange({ detail: { checked: true } });

      expect(component.numberChecked).toBe(2);
    });

    test('Should increase the number of checked boxes', () => {
      component.onCheckboxChange({ detail: { checked: false } });

      expect(component.numberChecked).toBe(0);
    });
  });

  // These tests check the flow for constructing the request form for downloading the image ZIP
  // as well as error handling for a failed download
  describe('Downloading images', () => {
    let expectedForm;
    beforeEach(() => {
      jest.spyOn(component, 'showLoading').mockImplementation();
      jest.spyOn(component, 'handleDownloadResponse').mockImplementation();
      component.downloadOptions.map((option) => component.formArr.push(new FormControl({ [option.name]: false })));
      component.formArr.controls[0].setValue({ orig: true });

      expectedForm = new FormData();
      expectedForm.append('orig', 'true');
      expectedForm.append('origOutline', 'false');
      expectedForm.append('seg', 'false');
      expectedForm.append('segOutline', 'false');
      expectedForm.append('serialID', 'CookieCrisp');
    });

    test('Should pass in the arguments from the Form as well as the serialID to request a download', () => {
      component.download();

      expect(component.showLoading).toHaveBeenCalled();
      expect(component.handleDownloadResponse).toHaveBeenCalledWith('mockZipBlob');
      expect(imageService.downloadImages).toHaveBeenCalledWith(expectedForm);
      expect(imageService.handleError).not.toHaveBeenCalled();
    });

    test('Should handle a Download error', () => {
      jest.spyOn(imageService, 'downloadImages').mockReturnValue(throwError('error'));

      component.download();
      expect(component.showLoading).toHaveBeenCalled();
      expect(component.handleDownloadResponse).not.toHaveBeenCalled();
      expect(imageService.downloadImages).toHaveBeenCalledWith(expectedForm);
      expect(imageService.handleError).toHaveBeenCalledWith(DownloadErrorMessage);
    });
  });

  // These tests check the flow for handling the response from the /download API
  describe('Handling the response for calling the download API', () => {
    beforeEach(() => jest.spyOn(component, 'promptForDownload').mockImplementation());

    test('Should handle a DownloadProgress event when downloading a ZIP', () => {
      const httpEvent: HttpEvent<HttpEventType.DownloadProgress> = {
        type: HttpEventType.DownloadProgress,
        loaded: 87,
        total: 100
      };

      component.handleDownloadResponse(httpEvent);
      expect(imageService.setDownloadProgress).toHaveBeenCalledWith(87);
      expect(component.promptForDownload).not.toHaveBeenCalled();
      expect(modalCtrl.dismiss).not.toHaveBeenCalled();
    });

    test('Should prompt the user to download the ZIP once it is fetched from the server', () => {
      const response = new HttpResponse({
        body: 'zipArrayBuffer'
      });

      const expectedZip = new Blob(['zipArrayBuffer'], { type: 'application/zip' });

      component.handleDownloadResponse(response);
      expect(component.promptForDownload).toHaveBeenCalledWith(expectedZip);
      expect(modalCtrl.dismiss).toHaveBeenCalledWith(true);
    });

    test('Should handle an error if the HttpResponse is not in the expected format', () => {
      const response = new HttpResponse({
        body: null
      });

      component.handleDownloadResponse(response);

      expect(imageService.handleError).toHaveBeenCalledWith(DownloadErrorMessage);
      expect(component.promptForDownload).not.toHaveBeenCalled();
      expect(modalCtrl.dismiss).not.toHaveBeenCalled();
    });
  });
});
