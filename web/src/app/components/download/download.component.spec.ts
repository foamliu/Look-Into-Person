import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ImageService } from 'src/app/services/image/image.service';
import { ImageServiceMock } from 'src/jest-mocks/image.service';
import { LoadingControllerMock } from 'src/jest-mocks/loading-controller';
import { ModalControllerMock } from 'src/jest-mocks/modal-controller';
import { ToastControllerMock } from 'src/jest-mocks/toast-controller';
import { DownloadComponent } from './download.component';

describe('DownloadComponent', () => {
  let component: DownloadComponent;
  let fixture: ComponentFixture<DownloadComponent>;

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
          provide: ToastController,
          useClass: ToastControllerMock
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
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
