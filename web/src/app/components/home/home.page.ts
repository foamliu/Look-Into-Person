import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { ImageService } from 'src/app/services/image/image.service';
import { DefaultOutlineThickness, ImageLabel, White } from '../../../assets/constants';
import { DownloadComponent } from '../download/download.component';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage {
  constructor(
    private imageService: ImageService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController
  ) {}
  @ViewChild('file') file: any;
  originalImage = '';
  segmentedImage = '';
  originalImageWithOutline = '';
  segmentedImageWithOutline = '';
  outlineColor = White;
  outlineThickness: '0' | '1' | '2' = DefaultOutlineThickness;
  segnetSectionColor: string;
  serialID: string;

  addFiles() {
    this.file.nativeElement.click();
  }

  async showLoading(): Promise<void> {
    const loading = await this.loadingCtrl.create({
      message: `Uploading... ${this.imageService.getUploadProgress()}%`
    });

    await loading.present();
    this.imageService.setLoadingElement(document.querySelector('div.loading-wrapper div.loading-content'));
  }

  dismissLoading(): void {
    this.loadingCtrl.dismiss();
    this.imageService.resetProgress();
  }

  handleUploadEvent(loaded: number, total: number) {
    this.imageService.setUploadProgress(Math.round((loaded / total) * 100));
  }

  handleDownloadEvent(loaded: number, total: number) {
    this.imageService.setDownloadProgress(Math.round((loaded / total) * 100));
  }

  async onFilesAdded() {
    const file: File = this.file.nativeElement.files[0];
    const reader = new FileReader();
    await this.showLoading();

    reader.addEventListener('load', (event: any) => this.uploadImage(event.target.result, file));

    reader.readAsDataURL(file);
  }

  uploadImage(src: string, file: File) {
    this.imageService.uploadImage(src, file.name).subscribe(
      (event: HttpEvent<any>) => {
        this.handleResponseForUploadImage(event, src);
      },
      () => this.handleError()
    );
  }

  handleResponseForUploadImage(event: HttpEvent<any>, src: string) {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        this.handleUploadEvent(event.loaded, event.total);
        break;
      }
      case HttpEventType.DownloadProgress: {
        this.handleDownloadEvent(event.loaded, event.total);
        break;
      }
      case HttpEventType.Response: {
        if (event.body && event.body.segmentedImage && event.body.serialID) {
          this.originalImage = src;
          this.segmentedImage = event.body.segmentedImage;
          this.serialID = event.body.serialID;
          this.dismissLoading();
        } else {
          this.handleError();
        }

        break;
      }
    }
  }

  async handleError(): Promise<void> {
    const toast = await this.toastCtrl.create({
      message: 'Something went wrong trying to upload your image. Please try again',
      duration: 5000,
      position: 'top',
      color: 'warning'
    });

    toast.present();
    this.loadingCtrl.dismiss();
  }

  onProcessedImageClick(event: any): void {
    if (!this.segmentedImageWithOutline) {
      const pixelData = this.getPixelData(event);
      this.segnetSectionColor = this.convertFromRGBAToHex(pixelData);
    }
  }

  /*
    When the processed image is clicked, create a canvas object.
    Then get the ImageData from the fired event.
  */
  getPixelData(event: any) {
    const id = event.target.id;
    const img: any = document.getElementById(id);
    const canvas: any = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    return canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;
  }

  convertFromRGBAToHex(rgb: any[]) {
    let [r, g, b] = rgb;

    r = r.toString(16);
    g = g.toString(16);
    b = b.toString(16);

    if (r.length === 1) {
      r = '0' + r;
    }

    if (g.length === 1) {
      g = '0' + g;
    }

    if (b.length === 1) {
      b = '0' + b;
    }

    return '#' + r + g + b;
  }

  readyToOutline(): boolean {
    return !!this.outlineColor && !!this.outlineThickness && !!this.segnetSectionColor;
  }

  getSegmentColorLabel(): string {
    return `You selected ${this.segnetSectionColor}, which looks like this:`;
  }

  getLabelForOriginalImage(): string {
    return !!this.originalImageWithOutline ? ImageLabel.OutlinedOriginal : ImageLabel.Original;
  }

  getLabelForSegmentedImage(): string {
    return !!this.segmentedImageWithOutline ? ImageLabel.OutlinedSegmented : ImageLabel.Segmented;
  }

  getImageStringForOriginalImage(): string {
    if (!!this.originalImage) {
      return !!this.originalImageWithOutline ? this.originalImageWithOutline : this.originalImage;
    }
  }

  getImageStringForSegmentedImage(): string {
    if (!!this.segmentedImage) {
      return !!this.segmentedImageWithOutline ? this.segmentedImageWithOutline : this.segmentedImage;
    }
  }

  changeThickness(event: any) {
    this.outlineThickness = event.detail.value;
  }

  async getOutlinedImages() {
    await this.showLoading();

    this.imageService.getOutlinedImages(this.segnetSectionColor, this.outlineThickness, this.outlineColor, this.serialID).subscribe(
      (event: HttpEvent<any>) => {
        this.handleResponseForOutlinedImages(event);
      },
      () => this.handleError()
    );
  }

  clearOutline(): void {
    this.segmentedImageWithOutline = '';
    this.originalImageWithOutline = '';
  }

  handleResponseForOutlinedImages(event: HttpEvent<any>) {
    switch (event.type) {
      case HttpEventType.UploadProgress: {
        this.handleUploadEvent(event.loaded, event.total);
        break;
      }
      case HttpEventType.DownloadProgress: {
        this.handleDownloadEvent(event.loaded, event.total);
        break;
      }
      case HttpEventType.Response: {
        if (event.body && event.body.originalOutline && event.body.segmentedOutline) {
          this.originalImageWithOutline = event.body.originalOutline;
          this.segmentedImageWithOutline = event.body.segmentedOutline;
          this.dismissLoading();
        } else {
          this.handleError();
        }
        break;
      }
    }
  }

  async download(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: DownloadComponent,
      componentProps: { serialID: this.serialID }
    });

    modal.onDidDismiss().then((response) => {
      if (response && response.data) {
        this.outlineColor = White;
        this.outlineThickness = DefaultOutlineThickness;
        this.segnetSectionColor = undefined;
        this.serialID = undefined;
        this.originalImage = '';
        this.segmentedImage = '';
        this.originalImageWithOutline = '';
        this.segmentedImageWithOutline = '';
      }
    });

    return await modal.present();
  }
}
