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

  addFiles() {
    this.file.nativeElement.click();
  }

  async onFilesAdded() {
    const file: File = this.file.nativeElement.files[0];
    const reader = new FileReader();
    const loading = await this.loadingCtrl.create();

    loading.present();

    reader.addEventListener('load', (event: any) => this.uploadImage(event.target.result, file));

    reader.readAsDataURL(file);
  }

  uploadImage(src: string, file: File) {
    this.imageService.uploadImage(src, file.name).subscribe(
      (response: any) => {
        if (response && response.segmentedImage) {
          this.originalImage = src;
          this.processedImage = response.segmentedImage;
          this.loadingCtrl.dismiss();
        } else {
          this.handleError();
        }
      },
      () => this.handleError()
    );
  }

  async handleError() {
    const toast = await this.toastCtrl.create({
      message: 'Something went wrong trying to upload your image. Please try again',
      duration: 5000,
      position: 'top',
      color: 'warning'
    });

    toast.present();
    this.loadingCtrl.dismiss();
  }

  clickImage(event: any) {
    const id = event.target.id;
    const img: any = document.getElementById(id);
    const canvas: any = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
    const pixelData = canvas.getContext('2d').getImageData(event.offsetX, event.offsetY, 1, 1).data;
    console.log(pixelData);
  }
}
