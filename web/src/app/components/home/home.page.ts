import { HttpEvent, HttpEventType } from '@angular/common/http';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular';
import { ImageService } from 'src/app/services/image/image.service';

@Component({
  selector: 'home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomePage {
  constructor(private imageService: ImageService, private loadingCtrl: LoadingController, private toastCtrl: ToastController) {}
  @ViewChild('file') file: any;
  originalImage = '';
  processedImage = '';
  selectedColor = 'rgb(255,255,255)';
  outlineThickness: '0' | '1' | '2' = '0';
  segmentColor: string;

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
        if (event.body && event.body.segmentedImage) {
          this.originalImage = src;
          this.processedImage = event.body.segmentedImage;
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
    const pixelData = this.getPixelData(event);
    this.segmentColor = `rgba(${pixelData[0]},${pixelData[1]},${pixelData[2]},${pixelData[3]})`;
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

  getOutlineColor(): string {
    // color returns from color picker like "rgb(xx,xx,xx)"
    // Pull the RGB numbers from the string
    return this.selectedColor.substring(4, this.selectedColor.length - 1);
  }

  readyToOutline(): boolean {
    return !!this.selectedColor && !!this.outlineThickness && !!this.segmentColor;
  }

  getSegmentColorLabel(): string {
    return `You selected ${this.segmentColor}, which looks like this:`;
  }

  async getOutlinedImages() {
    await this.showLoading();

    this.imageService.getOutlinedImages(this.segmentColor, this.outlineThickness, this.getOutlineColor()).subscribe(
      (event: HttpEvent<any>) => {
        this.handleResponseForOutlinedImages(event);
      },
      () => this.handleError()
    );
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
          this.originalImage = event.body.originalOutline;
          this.processedImage = event.body.segmentedOutline;
          this.dismissLoading();
        } else {
          this.handleError();
        }
        break;
      }
    }
  }
}
